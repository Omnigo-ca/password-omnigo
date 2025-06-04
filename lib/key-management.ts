/**
 * Server-side key management utilities
 * Handles per-user encryption keys encrypted with a master key
 */

import { prisma } from './prisma';
import { generateKey, encrypt, decrypt, exportKey, importKey } from './crypto';

// Cache for user keys to avoid repeated decryption
const keyCache = new Map<string, CryptoKey>();

/**
 * Get the master key from environment variable
 */
async function getMasterKey(): Promise<CryptoKey> {
  const masterKeyBase64 = process.env.MASTER_KEY;
  if (!masterKeyBase64) {
    throw new Error('MASTER_KEY environment variable is not set');
  }
  
  // For simplicity, we'll use the base64 string directly as key material
  // In production, you might want to derive this from a more secure source
  return await importKey(masterKeyBase64);
}

/**
 * Generate and store a new encryption key for a user
 * @param userId - The user's ID from Clerk
 * @returns The user's encryption key
 */
export async function createUserKey(userId: string): Promise<CryptoKey> {
  try {
    // Check if user already has a key
    const existingKey = await prisma.userKey.findUnique({
      where: { userId }
    });
    
    if (existingKey) {
      throw new Error(`User ${userId} already has an encryption key`);
    }
    
    // Generate a new key for the user
    const userKey = await generateKey();
    const masterKey = await getMasterKey();
    
    // Export the user key to store it
    const userKeyData = await exportKey(userKey);
    
    // Encrypt the user key with the master key
    const { ciphertext: encryptedKey, iv } = await encrypt(userKeyData, masterKey);
    
    // Store in database
    await prisma.userKey.create({
      data: {
        userId,
        encryptedKey,
        iv,
      }
    });
    
    // Cache the key
    keyCache.set(userId, userKey);
    
    return userKey;
  } catch (error) {
    throw new Error(`Failed to create user key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a user's encryption key (creates one if it doesn't exist)
 * @param userId - The user's ID from Clerk
 * @returns The user's encryption key
 */
export async function getUserKey(userId: string): Promise<CryptoKey> {
  try {
    // Check cache first
    if (keyCache.has(userId)) {
      return keyCache.get(userId)!;
    }
    
    // Try to get from database
    const userKeyRecord = await prisma.userKey.findUnique({
      where: { userId }
    });
    
    if (!userKeyRecord) {
      // Create a new key if none exists
      return await createUserKey(userId);
    }
    
    // Decrypt the stored key
    const masterKey = await getMasterKey();
    const userKeyData = await decrypt(
      userKeyRecord.encryptedKey,
      userKeyRecord.iv,
      masterKey
    );
    
    // Import the key
    const userKey = await importKey(userKeyData);
    
    // Cache the key
    keyCache.set(userId, userKey);
    
    return userKey;
  } catch (error) {
    throw new Error(`Failed to get user key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Clear the key cache for a user (useful for security or testing)
 * @param userId - The user's ID from Clerk
 */
export function clearUserKeyCache(userId?: string): void {
  if (userId) {
    keyCache.delete(userId);
  } else {
    keyCache.clear();
  }
}

/**
 * Initialize master key if it doesn't exist in environment
 * This is a utility function for development/setup
 */
export async function generateMasterKey(): Promise<string> {
  const masterKey = await generateKey();
  return await exportKey(masterKey);
}

/**
 * Rotate a user's encryption key (advanced feature)
 * This would require re-encrypting all their passwords
 * @param userId - The user's ID from Clerk
 */
export async function rotateUserKey(userId: string): Promise<CryptoKey> {
  try {
    // Get all user's passwords first
    const passwords = await prisma.password.findMany({
      where: { userId }
    });
    
    // Get the old key
    const oldKey = await getUserKey(userId);
    
    // Generate new key
    const newKey = await generateKey();
    const masterKey = await getMasterKey();
    
    // Encrypt new key
    const newKeyData = await exportKey(newKey);
    const { ciphertext: encryptedKey, iv } = await encrypt(newKeyData, masterKey);
    
    // Start transaction to update key and re-encrypt passwords
    await prisma.$transaction(async (tx) => {
      // Update the user key
      await tx.userKey.update({
        where: { userId },
        data: {
          encryptedKey,
          iv,
        }
      });
      
      // Re-encrypt all passwords with new key
      for (const password of passwords) {
        // Decrypt with old key
        const plaintext = await decrypt(password.ciphertext, password.iv, oldKey);
        
        // Encrypt with new key
        const { ciphertext: newCiphertext, iv: newIv } = await encrypt(plaintext, newKey);
        
        // Update password
        await tx.password.update({
          where: { id: password.id },
          data: {
            ciphertext: newCiphertext,
            iv: newIv,
          }
        });
      }
    });
    
    // Update cache
    keyCache.set(userId, newKey);
    
    return newKey;
  } catch (error) {
    throw new Error(`Failed to rotate user key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 