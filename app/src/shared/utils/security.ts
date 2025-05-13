/**
 * Security utilities for the application
 */
import crypto from 'crypto';

/**
 * Generates a secure random token of the specified length
 * 
 * @param length The length of the token in bytes (output will be 2x this length as hex)
 * @returns A secure random token as a hex string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Creates an HMAC signature for the given payload using the provided secret
 * 
 * @param payload The payload to sign
 * @param secret The secret to use for signing
 * @returns The HMAC signature as a hex string
 */
export function createHmacSignature(payload: any, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  hmac.update(payloadString);
  return hmac.digest('hex');
}

/**
 * Verifies an HMAC signature for the given payload using the provided secret
 * 
 * @param payload The payload that was signed
 * @param signature The signature to verify
 * @param secret The secret used for signing
 * @returns True if the signature is valid, false otherwise
 */
export function verifyHmacSignature(payload: any, signature: string, secret: string): boolean {
  const expectedSignature = createHmacSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Hashes a string using SHA-256
 * 
 * @param data The data to hash
 * @returns The SHA-256 hash as a hex string
 */
export function sha256Hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Encrypts data using AES-256-GCM
 * 
 * @param data The data to encrypt
 * @param key The encryption key (must be 32 bytes)
 * @returns The encrypted data as a base64 string, along with the IV and auth tag
 */
export function encryptAES(data: string, key: Buffer): {
  encrypted: string;
  iv: string;
  authTag: string;
} {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag().toString('base64');
  
  return {
    encrypted,
    iv: iv.toString('base64'),
    authTag
  };
}

/**
 * Decrypts data using AES-256-GCM
 * 
 * @param encrypted The encrypted data as a base64 string
 * @param key The encryption key (must be 32 bytes)
 * @param iv The initialization vector as a base64 string
 * @param authTag The authentication tag as a base64 string
 * @returns The decrypted data as a string
 */
export function decryptAES(
  encrypted: string,
  key: Buffer,
  iv: string,
  authTag: string
): string {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'base64')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
