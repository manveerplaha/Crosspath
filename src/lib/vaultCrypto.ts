"use client";

/**
 * Client-side AES-256-GCM encryption for the /1303/vault rooms.
 * Passphrases used for encryption/decryption never leave the browser as
 * plaintext content — only the resulting encrypted blob (ciphertext + the
 * salt/iv needed to decrypt it) is stored remotely. Without the correct
 * passphrase, stored data is unreadable, including to whoever controls the
 * storage backend.
 *
 * (The room-selection passphrase check in /api/vault/unlock is a separate
 * concern — that one *does* reach the server briefly, to compare against
 * the three secret room passphrases. See the comment there.)
 */

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(passphrase: string, saltB64: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const salt = base64ToBytes(saltB64);
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface EncryptedPayload {
  salt: string;
  iv: string;
  ciphertext: string;
}

export async function encryptNotes(passphrase: string, plaintext: string): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const saltB64 = bytesToBase64(salt);
  const key = await deriveKey(passphrase, saltB64);
  const enc = new TextEncoder();
  const ciphertextBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));
  return {
    salt: saltB64,
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertextBuf)),
  };
}

/** Throws if the passphrase is wrong (AES-GCM authentication tag won't verify). */
export async function decryptNotes(passphrase: string, payload: EncryptedPayload): Promise<string> {
  const key = await deriveKey(passphrase, payload.salt);
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(payload.iv) },
    key,
    base64ToBytes(payload.ciphertext)
  );
  return new TextDecoder().decode(plainBuf);
}

export interface EncryptedBytesResult {
  salt: string;
  iv: string;
  ciphertext: ArrayBuffer;
}

/** For the media room — encrypts raw file bytes (images/videos) instead of text. */
export async function encryptBytes(passphrase: string, data: ArrayBuffer): Promise<EncryptedBytesResult> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const saltB64 = bytesToBase64(salt);
  const key = await deriveKey(passphrase, saltB64);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return { salt: saltB64, iv: bytesToBase64(iv), ciphertext };
}

/** Throws if the passphrase is wrong. `ciphertext` is the raw bytes fetched from Blob storage. */
export async function decryptBytes(
  passphrase: string,
  salt: string,
  iv: string,
  ciphertext: ArrayBuffer
): Promise<ArrayBuffer> {
  const key = await deriveKey(passphrase, salt);
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(iv) }, key, ciphertext);
}
