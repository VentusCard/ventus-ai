import assert from "node:assert/strict";
import test from "node:test";
import { identityFromClaims } from "./_cognitoIdentity.ts";

const config = {
  issuer: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_example",
  clientId: "client_123",
};

test("accepts a Cognito access token with the expected client and tenant claim", () => {
  assert.deepEqual(identityFromClaims({
    sub: "cognito-subject:123",
    token_use: "access",
    client_id: config.clientId,
    tenant_id: "pilot_bank",
  }, config), {
    subject: "cognito-subject:123",
    tenantHint: "pilot_bank",
    issuer: config.issuer,
  });
});

test("rejects ID tokens, the wrong client, and absent tenant routing", () => {
  assert.equal(identityFromClaims({
    sub: "cognito-subject:123",
    token_use: "id",
    client_id: config.clientId,
    tenant_id: "pilot_bank",
  }, config), null);
  assert.equal(identityFromClaims({
    sub: "cognito-subject:123",
    token_use: "access",
    client_id: "another-client",
    tenant_id: "pilot_bank",
  }, config), null);
  assert.equal(identityFromClaims({
    sub: "cognito-subject:123",
    token_use: "access",
    client_id: config.clientId,
  }, config), null);
});

test("rejects malformed identity and tenant claims", () => {
  assert.equal(identityFromClaims({
    sub: "x",
    token_use: "access",
    client_id: config.clientId,
    tenant_id: "pilot_bank",
  }, config), null);
  assert.equal(identityFromClaims({
    sub: "cognito-subject:123",
    token_use: "access",
    client_id: config.clientId,
    tenant_id: "../another-bank",
  }, config), null);
});
