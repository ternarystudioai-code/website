import crypto from "crypto"

export function generateShortCode(len = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no 0/O/1/I
  let s = ""
  const bytes = crypto.randomBytes(len)
  for (let i = 0; i < len; i++) s += alphabet[bytes[i] % alphabet.length]
  return s
}

export function generatePollingToken() {
  return crypto.randomBytes(24).toString("base64url")
}
