import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

const DEFAULT_CALLBACK_URLS = [
  'http://127.0.0.1:5173/app/auth/callback',
  'http://localhost:5173/app/auth/callback',
  'https://ventusai.com/app/auth/callback',
];

const DEFAULT_LOGOUT_URLS = [
  'http://127.0.0.1:5173/app/login',
  'http://localhost:5173/app/login',
  'https://ventusai.com/app/login',
];

/**
 * Additive identity foundation for the Growth Console.
 *
 * This stack does not change the current Supabase login. It creates the AWS identity
 * boundary that can be validated in parallel before an explicit cutover.
 */
export class VentusIdentityStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      ...props,
      terminationProtection: true,
    });

    const callbackUrls = contextList(this, 'cognitoCallbackUrls', DEFAULT_CALLBACK_URLS);
    const logoutUrls = contextList(this, 'cognitoLogoutUrls', DEFAULT_LOGOUT_URLS);
    const domainPrefix = String(
      this.node.tryGetContext('cognitoDomainPrefix')
      ?? `ventus-growth-console-${this.account.slice(-6)}-staging`,
    ).toLowerCase();
    const samlMetadataUrl = optionalContext(this, 'enterpriseSamlMetadataUrl');
    const samlTenantClaim = optionalContext(this, 'enterpriseSamlTenantClaim');
    const samlProviderName = 'enterprise-saml';
    if (samlMetadataUrl && !samlTenantClaim) {
      throw new Error('enterpriseSamlTenantClaim is required when enterpriseSamlMetadataUrl is configured');
    }

    const userPool = new cognito.UserPool(this, 'GrowthConsoleUserPool', {
      userPoolName: 'ventus-growth-console-staging',
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      signInCaseSensitive: false,
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
      },
      customAttributes: {
        tenant_id: new cognito.StringAttribute({ minLen: 2, maxLen: 128, mutable: false }),
      },
      passwordPolicy: {
        minLength: 14,
        requireDigits: true,
        requireLowercase: true,
        requireSymbols: true,
        requireUppercase: true,
        tempPasswordValidity: cdk.Duration.days(3),
      },
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        otp: true,
        sms: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      featurePlan: cognito.FeaturePlan.ESSENTIALS,
      deletionProtection: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const identityProviders: cognito.UserPoolClientIdentityProvider[] = [
      cognito.UserPoolClientIdentityProvider.COGNITO,
    ];
    let enterpriseProvider: cognito.CfnUserPoolIdentityProvider | undefined;
    if (samlMetadataUrl) {
      enterpriseProvider = new cognito.CfnUserPoolIdentityProvider(this, 'EnterpriseSamlProvider', {
        providerName: samlProviderName,
        providerType: 'SAML',
        userPoolId: userPool.userPoolId,
        providerDetails: {
          MetadataURL: samlMetadataUrl,
          IDPSignout: 'true',
        },
        attributeMapping: {
          email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          'custom:tenant_id': samlTenantClaim!,
        },
      });
      identityProviders.push(cognito.UserPoolClientIdentityProvider.custom(samlProviderName));
    }

    const client = userPool.addClient('GrowthConsoleWebClient', {
      userPoolClientName: 'ventus-growth-console-web',
      generateSecret: false,
      authFlows: {
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls,
        logoutUrls,
      },
      supportedIdentityProviders: identityProviders,
      accessTokenValidity: cdk.Duration.minutes(15),
      idTokenValidity: cdk.Duration.minutes(15),
      refreshTokenValidity: cdk.Duration.hours(8),
      enableTokenRevocation: true,
      preventUserExistenceErrors: true,
      readAttributes: new cognito.ClientAttributes()
        .withStandardAttributes({ email: true })
        .withCustomAttributes('tenant_id'),
      writeAttributes: new cognito.ClientAttributes()
        .withStandardAttributes({ email: true }),
    });
    if (enterpriseProvider) client.node.addDependency(enterpriseProvider);

    userPool.addDomain('GrowthConsoleDomain', {
      cognitoDomain: { domainPrefix },
      managedLoginVersion: cognito.ManagedLoginVersion.NEWER_MANAGED_LOGIN,
    });

    const groups = [
      ['ventus-platform-admin', 'Ventus platform administrators', 10],
      ['institution-admin', 'Institution access administrators', 20],
      ['growth-play-owner', 'Business owners who configure and approve Growth Plays', 30],
      ['bank-operator', 'Bank employees who review and act on qualified moments', 40],
      ['risk-reviewer', 'Risk, compliance, and model-governance reviewers', 50],
    ] as const;
    for (const [groupName, description, precedence] of groups) {
      new cognito.CfnUserPoolGroup(this, `Group${groupName.replaceAll('-', '')}`, {
        userPoolId: userPool.userPoolId,
        groupName,
        description,
        precedence,
      });
    }

    new cdk.CfnOutput(this, 'CognitoUserPoolId', {
      value: userPool.userPoolId,
    });
    new cdk.CfnOutput(this, 'CognitoWebClientId', {
      value: client.userPoolClientId,
    });
    new cdk.CfnOutput(this, 'CognitoIssuer', {
      value: `https://cognito-idp.${this.region}.amazonaws.com/${userPool.userPoolId}`,
    });
    new cdk.CfnOutput(this, 'CognitoManagedLoginDomain', {
      value: `https://${domainPrefix}.auth.${this.region}.amazoncognito.com`,
    });
    new cdk.CfnOutput(this, 'EnterpriseSamlConfigured', {
      value: samlMetadataUrl ? 'true' : 'false',
    });
  }
}

function contextList(stack: cdk.Stack, name: string, fallback: string[]): string[] {
  const value = stack.node.tryGetContext(name);
  if (typeof value !== 'string' || !value.trim()) return fallback;
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function optionalContext(stack: cdk.Stack, name: string): string | undefined {
  const value = stack.node.tryGetContext(name);
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
