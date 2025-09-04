import crypto from "node:crypto";

const DEFAULT_TTL_SECONDS = 10 * 60; // 10 minutes

export interface UploadTokenPayload {
  sid: string;
  exp: number; // epoch seconds
}

function base64url(input: Buffer | string) {
  return (typeof input === "string" ? Buffer.from(input) : input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function signUploadToken(payload: UploadTokenPayload, secret: string) {
  const json = JSON.stringify(payload);
  const data = base64url(json);
  const sig = crypto.createHmac("sha256", secret).update(data).digest();
  return `${data}.${base64url(sig)}`;
}

export function verifyUploadToken(token: string, secret: string): UploadTokenPayload | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = base64url(
    crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest(),
  );
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64").toString("utf8")) as UploadTokenPayload;
    if (!payload.sid || !payload.exp) return null;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createUploadToken(params: { sid: string; secret: string; ttlSeconds?: number }) {
  const { sid, secret, ttlSeconds = DEFAULT_TTL_SECONDS } = params;
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  return signUploadToken({ sid, exp }, secret);
}

export function buildUploadUrl(origin: string, token: string) {
  const url = new URL("/api/log-uploads/upload", origin);
  url.searchParams.set("token", token);
  return url.toString();
}
