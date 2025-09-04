import crypto from "node:crypto";

function base64url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function generateCodeVerifier(length = 64) {
  if (length < 43 || length > 128) length = 64;
  return base64url(crypto.randomBytes(length));
}

export function generateCodeChallenge(codeVerifier: string) {
  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  return base64url(hash);
}
