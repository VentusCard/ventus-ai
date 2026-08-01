import { UserManager, WebStorageStateStore, type User as OidcUser } from "oidc-client-ts";

export type ConsoleAuthProvider = "cognito";

export type ConsoleAuthUser = {
  id: string;
  email: string;
};

export type ConsoleAuthSession = {
  access_token: string;
  user: ConsoleAuthUser;
};

type AuthListener = (session: ConsoleAuthSession | null) => void;

const configuredProvider = String(import.meta.env.VITE_AUTH_PROVIDER || "cognito")
  .trim()
  .toLowerCase();

export const consoleAuthProvider: ConsoleAuthProvider = "cognito";

const cognitoAuthority = String(import.meta.env.VITE_COGNITO_AUTHORITY || "").trim().replace(/\/$/, "");
const cognitoClientId = String(import.meta.env.VITE_COGNITO_CLIENT_ID || "").trim();
const cognitoDomain = String(import.meta.env.VITE_COGNITO_DOMAIN || "").trim().replace(/\/$/, "");

export const isConsoleAuthConfigured = configuredProvider === "cognito"
  && Boolean(cognitoAuthority && cognitoClientId);

let cognitoManager: UserManager | null = null;

function manager(): UserManager {
  if (!isConsoleAuthConfigured || consoleAuthProvider !== "cognito") {
    throw new Error("Cognito authentication is not configured.");
  }
  if (!cognitoManager) {
    cognitoManager = new UserManager({
      authority: cognitoAuthority,
      client_id: cognitoClientId,
      redirect_uri: `${window.location.origin}/app/auth/callback`,
      post_logout_redirect_uri: `${window.location.origin}/app/login`,
      response_type: "code",
      scope: "openid email profile",
      automaticSilentRenew: true,
      loadUserInfo: false,
      monitorSession: false,
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
    });
  }
  return cognitoManager;
}

export async function currentAuthSession(): Promise<ConsoleAuthSession | null> {
  if (!isConsoleAuthConfigured) return null;
  return fromOidcUser(await manager().getUser());
}

export function subscribeToAuth(listener: AuthListener): () => void {
  if (!isConsoleAuthConfigured) return () => undefined;
  const userManager = manager();
  const loaded = (user: OidcUser) => listener(fromOidcUser(user));
  const cleared = () => listener(null);
  userManager.events.addUserLoaded(loaded);
  userManager.events.addUserUnloaded(cleared);
  userManager.events.addAccessTokenExpired(cleared);
  return () => {
    userManager.events.removeUserLoaded(loaded);
    userManager.events.removeUserUnloaded(cleared);
    userManager.events.removeAccessTokenExpired(cleared);
  };
}

export async function beginSignIn(): Promise<void> {
  await manager().signinRedirect();
}

export async function completeSignIn(): Promise<ConsoleAuthSession> {
  const session = fromOidcUser(await manager().signinRedirectCallback());
  if (!session) throw new Error("Cognito did not return a valid employee session.");
  return session;
}

export async function signOutConsole(): Promise<void> {
  if (!isConsoleAuthConfigured) return;
  await manager().removeUser();
  if (cognitoDomain) {
    const logout = new URL(`${cognitoDomain}/logout`);
    logout.searchParams.set("client_id", cognitoClientId);
    logout.searchParams.set("logout_uri", `${window.location.origin}/app/login`);
    window.location.assign(logout.toString());
  } else {
    window.location.assign("/app/login");
  }
}

function fromOidcUser(user: OidcUser | null): ConsoleAuthSession | null {
  if (!user || user.expired || !user.access_token) return null;
  const id = typeof user.profile.sub === "string" ? user.profile.sub : "";
  const email = typeof user.profile.email === "string" ? user.profile.email.toLowerCase() : "";
  return id && email
    ? { access_token: user.access_token, user: { id, email } }
    : null;
}
