/**
 * Unit tests for crypto utilities
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { webcrypto } from 'crypto';
import { generateKey, encrypt, decrypt, exportKey, importKey } from '../crypto';

// Mock crypto.subtle for Node.js environment
beforeAll(() => {
  if (!globalThis.crypto) {
    globalThis.crypto = webcrypto as Crypto;
  }
});

describe('Crypto Utilities', () => {
  describe('generateKey', () => {
    it('should generate a valid AES-GCM key', async () => {
      const key = await generateKey();
      
      expect(key).toBeInstanceOf(CryptoKey);
      expect(key.algorithm.name).toBe('AES-GCM');
      expect((key.algorithm as AesKeyAlgorithm).length).toBe(256);
      expect(key.extractable).toBe(true);
      expect(key.usages).toContain('encrypt');
      expect(key.usages).toContain('decrypt');
    });

    it('should generate different keys each time', async () => {
      const key1 = await generateKey();
      const key2 = await generateKey();
      
      const exported1 = await exportKey(key1);
      const exported2 = await exportKey(key2);
      
      expect(exported1).not.toBe(exported2);
    });
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text successfully', async () => {
      const key = await generateKey();
      const plaintext = 'Hello, World!';
      
      const { ciphertext, iv } = await encrypt(plaintext, key);
      const decrypted = await decrypt(ciphertext, iv, key);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext for same input', async () => {
      const key = await generateKey();
      const plaintext = 'Same input text';
      
      const result1 = await encrypt(plaintext, key);
      const result2 = await encrypt(plaintext, key);
      
      // Different IVs should produce different ciphertext
      expect(result1.ciphertext).not.toBe(result2.ciphertext);
      expect(result1.iv).not.toBe(result2.iv);
      
      // But both should decrypt to the same plaintext
      const decrypted1 = await decrypt(result1.ciphertext, result1.iv, key);
      const decrypted2 = await decrypt(result2.ciphertext, result2.iv, key);
      
      expect(decrypted1).toBe(plaintext);
      expect(decrypted2).toBe(plaintext);
    });

    it('should handle empty strings', async () => {
      const key = await generateKey();
      const plaintext = '';
      
      const { ciphertext, iv } = await encrypt(plaintext, key);
      const decrypted = await decrypt(ciphertext, iv, key);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode characters', async () => {
      const key = await generateKey();
      const plaintext = '🔐 Secure password with émojis and ñ characters! 中文';
      
      const { ciphertext, iv } = await encrypt(plaintext, key);
      const decrypted = await decrypt(ciphertext, iv, key);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle long text', async () => {
      const key = await generateKey();
      const plaintext = 'A'.repeat(10000); // 10KB of text
      
      const { ciphertext, iv } = await encrypt(plaintext, key);
      const decrypted = await decrypt(ciphertext, iv, key);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should fail with wrong key', async () => {
      const key1 = await generateKey();
      const key2 = await generateKey();
      const plaintext = 'Secret message';
      
      const { ciphertext, iv } = await encrypt(plaintext, key1);
      
      await expect(decrypt(ciphertext, iv, key2)).rejects.toThrow('Decryption failed');
    });

    it('should fail with corrupted ciphertext', async () => {
      const key = await generateKey();
      const plaintext = 'Secret message';
      
      const { ciphertext, iv } = await encrypt(plaintext, key);
      const corruptedCiphertext = ciphertext.slice(0, -4) + 'XXXX';
      
      await expect(decrypt(corruptedCiphertext, iv, key)).rejects.toThrow('Decryption failed');
    });

    it('should fail with corrupted IV', async () => {
      const key = await generateKey();
      const plaintext = 'Secret message';
      
      const { ciphertext, iv } = await encrypt(plaintext, key);
      const corruptedIv = iv.slice(0, -4) + 'XXXX';
      
      await expect(decrypt(ciphertext, corruptedIv, key)).rejects.toThrow('Decryption failed');
    });
  });

  describe('exportKey and importKey', () => {
    it('should export and import keys correctly', async () => {
      const originalKey = await generateKey();
      const exported = await exportKey(originalKey);
      const imported = await importKey(exported);
      
      // Test that the imported key works the same as original
      const plaintext = 'Test message';
      const { ciphertext, iv } = await encrypt(plaintext, originalKey);
      const decrypted = await decrypt(ciphertext, iv, imported);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should produce base64 encoded strings', async () => {
      const key = await generateKey();
      const exported = await exportKey(key);
      
      // Should be valid base64
      expect(typeof exported).toBe('string');
      expect(exported.length).toBeGreaterThan(0);
      expect(() => atob(exported)).not.toThrow();
    });

    it('should handle round-trip with different keys', async () => {
      const key1 = await generateKey();
      const key2 = await generateKey();
      
      const exported1 = await exportKey(key1);
      const exported2 = await exportKey(key2);
      
      expect(exported1).not.toBe(exported2);
      
      const imported1 = await importKey(exported1);
      const imported2 = await importKey(exported2);
      
      // Test cross-compatibility
      const plaintext = 'Cross-key test';
      const { ciphertext: cipher1, iv: iv1 } = await encrypt(plaintext, key1);
      const { ciphertext: cipher2, iv: iv2 } = await encrypt(plaintext, key2);
      
      const decrypted1 = await decrypt(cipher1, iv1, imported1);
      const decrypted2 = await decrypt(cipher2, iv2, imported2);
      
      expect(decrypted1).toBe(plaintext);
      expect(decrypted2).toBe(plaintext);
      
      // Should fail with wrong keys
      await expect(decrypt(cipher1, iv1, imported2)).rejects.toThrow();
      await expect(decrypt(cipher2, iv2, imported1)).rejects.toThrow();
    });
  });

  describe('Integration tests', () => {
    it('should handle complete workflow', async () => {
      // Generate key
      const key = await generateKey();
      
      // Export for storage
      const keyData = await exportKey(key);
      
      // Simulate storing and retrieving
      const retrievedKey = await importKey(keyData);
      
      // Encrypt with original key
      const plaintext = 'Complete workflow test';
      const { ciphertext, iv } = await encrypt(plaintext, key);
      
      // Decrypt with retrieved key
      const decrypted = await decrypt(ciphertext, iv, retrievedKey);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle multiple encrypt/decrypt operations', async () => {
      const key = await generateKey();
      const messages = [
        'First message',
        'Second message with more content',
        '🔐 Third message with emojis',
        '', // Empty message
        'A'.repeat(1000), // Long message
      ];
      
      const encrypted = [];
      
      // Encrypt all messages
      for (const message of messages) {
        const result = await encrypt(message, key);
        encrypted.push({ ...result, original: message });
      }
      
      // Decrypt all messages
      for (const item of encrypted) {
        const decrypted = await decrypt(item.ciphertext, item.iv, key);
        expect(decrypted).toBe(item.original);
      }
    });
  });
}); 