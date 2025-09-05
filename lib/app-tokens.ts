import crypto from "crypto"

export function generateRawToken(length = 48) {
  // URL-safe base64 string
  return (
    "ternary_app_" + crypto.randomBytes(length).toString("base64url")
  )
}

export function hashToken(token: string, salt?: string) {
  const s = salt ?? process.env.APP_TOKEN_SALT ?? "ternary-default-salt"
  return crypto.createHash("sha256").update(s + token).digest("hex")
}
