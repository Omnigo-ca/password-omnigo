/**
 * Crypto utilities for AES-256-GCM encryption using WebCrypto API
 * Works in both Node.js and browser environments
 */
/**
 * Generate a new 256-bit AES-GCM key
 */
export async function generateKey() {
    return await crypto.subtle.generateKey({
        name: "AES-GCM",
        length: 256,
    }, true, // extractable
    ["encrypt", "decrypt"]);
}
/**
 * Encrypt text using AES-256-GCM
 * @param text - The plaintext to encrypt
 * @param key - The AES-GCM key
 * @returns Object containing base64-encoded ciphertext and IV
 */
export async function encrypt(text, key) {
    // Generate a random 96-bit IV (12 bytes) for GCM
    const iv = crypto.getRandomValues(new Uint8Array(12));
    // Convert text to bytes
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt({
        name: "AES-GCM",
        iv: iv,
    }, key, data);
    // Convert to base64 for storage
    const ciphertext = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    const ivBase64 = btoa(String.fromCharCode(...iv));
    return {
        ciphertext,
        iv: ivBase64,
    };
}
/**
 * Decrypt ciphertext using AES-256-GCM
 * @param ciphertext - Base64-encoded ciphertext
 * @param iv - Base64-encoded initialization vector
 * @param key - The AES-GCM key
 * @returns The decrypted plaintext
 */
export async function decrypt(ciphertext, iv, key) {
    try {
        // Convert from base64
        const ciphertextBytes = new Uint8Array(atob(ciphertext)
            .split("")
            .map((char) => char.charCodeAt(0)));
        const ivBytes = new Uint8Array(atob(iv)
            .split("")
            .map((char) => char.charCodeAt(0)));
        // Decrypt the data
        const decrypted = await crypto.subtle.decrypt({
            name: "AES-GCM",
            iv: ivBytes,
        }, key, ciphertextBytes);
        // Convert back to text
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }
    catch (error) {
        throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Export a CryptoKey to a base64-encoded string for storage
 */
export async function exportKey(key) {
    const exported = await crypto.subtle.exportKey("raw", key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
}
/**
 * Import a base64-encoded key string back to a CryptoKey
 */
export async function importKey(keyData) {
    const keyBytes = new Uint8Array(atob(keyData)
        .split("")
        .map((char) => char.charCodeAt(0)));
    return await crypto.subtle.importKey("raw", keyBytes, {
        name: "AES-GCM",
        length: 256,
    }, true, ["encrypt", "decrypt"]);
}
