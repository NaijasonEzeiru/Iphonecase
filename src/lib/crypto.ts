import crypto from "crypto";

const SECRET_KEY = process.env.PASSWORD_SECRET!;
if (!SECRET_KEY) throw new Error("Missing PASSWORD_SECRET env variable");

//
// --- CONFIGURATION ---
//
const ALGORITHM = "aes-256-gcm"; // authenticated encryption
const IV_LENGTH = 12; // 96 bits (recommended for GCM)
const SALT = "static_salt_for_hash"; // optional: prevents rainbow tables, can be unique per app

//
// --- ENCRYPTION ---
//
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.createHash("sha256").update(SECRET_KEY).digest(); // derive 32-byte key
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // store iv + authTag + ciphertext as base64
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decrypt(encryptedText: string): string {
  const data = Buffer.from(encryptedText, "base64");
  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + 16);
  const ciphertext = data.subarray(IV_LENGTH + 16);

  const key = crypto.createHash("sha256").update(SECRET_KEY).digest();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

//
// --- HASHING ---
//
export function hashData(data: string): string {
  return crypto
    .createHash("sha256")
    .update(data + SECRET_KEY + SALT)
    .digest("hex");
}

//
// --- RANDOM GENERATORS ---
//
export function generateRandomCode(length = 6): string {
  // cryptographically secure numeric code
  const digits = "0123456789";
  let code = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += digits[bytes[i] % digits.length];
  }
  return code;
}

export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

//
// --- HASH COMPARISON (timing-safe) ---
//
export function compareHash(plain: string, storedHash: string): boolean {
  const hashedPlain = hashData(plain);
  const a = Buffer.from(hashedPlain, "hex");
  const b = Buffer.from(storedHash, "hex");

  console.log({ storedHash, a, b, hashedPlain });

  if (a.length !== b.length) {
    // Dummy comparison to mask timing difference
    const fake = Buffer.alloc(a.length, 0);
    crypto.timingSafeEqual(a, fake);
    console.log(false);
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}

//
// --- GENERIC SECURE STRING COMPARISON ---
//
export function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");

  if (bufA.length !== bufB.length) {
    const fake = Buffer.alloc(bufA.length, 0);
    crypto.timingSafeEqual(bufA, fake);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyIPNSignature(body: string, signature: string) {
  const hmac = crypto.createHmac("sha512", process.env.NOWPAYMENTS_API_KEY!);
  const calculatedSignature = hmac.update(JSON.stringify(body)).digest("hex");
  return signature === calculatedSignature;
}
