# Omnigo Password - Crypto Implementation

## Overview

This document describes the implementation of AES-256-GCM encryption utilities and per-user key management system for the Omnigo Password Manager.

## 🔐 Crypto Utilities (`lib/crypto.ts`)

### Core Functions

#### `generateKey(): Promise<CryptoKey>`
- Generates a new 256-bit AES-GCM encryption key
- Uses the WebCrypto API (`crypto.subtle.generateKey`)
- Returns an extractable key that can be used for both encryption and decryption

#### `encrypt(text: string, key: CryptoKey): Promise<{ciphertext: string; iv: string}>`
- Encrypts plaintext using AES-256-GCM
- Generates a random 96-bit (12-byte) initialization vector (IV) for each encryption
- Returns base64-encoded ciphertext and IV for storage
- Supports Unicode characters and text of any length

#### `decrypt(ciphertext: string, iv: string, key: CryptoKey): Promise<string>`
- Decrypts base64-encoded ciphertext using AES-256-GCM
- Requires the original IV and encryption key
- Throws descriptive errors if decryption fails
- Returns the original plaintext

#### `exportKey(key: CryptoKey): Promise<string>`
- Exports a CryptoKey to a base64-encoded string for storage
- Allows keys to be persisted in databases

#### `importKey(keyData: string): Promise<CryptoKey>`
- Imports a base64-encoded key string back to a CryptoKey
- Recreates the original key for encryption/decryption operations

### Security Features

- **AES-256-GCM**: Industry-standard authenticated encryption
- **Random IVs**: Each encryption uses a unique initialization vector
- **WebCrypto API**: Uses browser/Node.js native crypto implementations
- **Base64 Encoding**: Safe storage format for binary data

## 🔑 Key Management (`lib/key-management.ts`)

### Architecture

The key management system implements a two-tier encryption approach:

1. **Master Key**: Server-level key stored in environment variables
2. **User Keys**: Per-user encryption keys encrypted with the master key

### Database Schema

#### UserKey Model
```prisma
model UserKey {
  id              String   @id @default(cuid())
  userId          String   @unique
  encryptedKey    String   // User's key encrypted with MASTER_KEY
  iv              String   // IV used for encrypting the user key
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  passwords       Password[]
}
```

#### Updated Password Model
```prisma
model Password {
  id         String   @id @default(cuid())
  name       String
  ciphertext String   // Password encrypted with user's key
  iv         String   // IV used for password encryption
  userId     String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  userKey    UserKey  @relation(fields: [userId], references: [userId])
}
```

### Core Functions

#### `getUserKey(userId: string): Promise<CryptoKey>`
- Retrieves or creates a user's encryption key
- Implements caching for performance
- Automatically creates new keys for first-time users
- Decrypts stored keys using the master key

#### `createUserKey(userId: string): Promise<CryptoKey>`
- Generates a new encryption key for a user
- Encrypts the key with the master key before storage
- Stores encrypted key and IV in the database
- Caches the key for immediate use

#### `clearUserKeyCache(userId?: string): void`
- Clears cached keys for security or testing
- Can clear specific user or all cached keys

#### `rotateUserKey(userId: string): Promise<CryptoKey>`
- Advanced feature for key rotation
- Re-encrypts all user passwords with a new key
- Uses database transactions for consistency
- Updates cache with new key

#### `generateMasterKey(): Promise<string>`
- Utility function for generating new master keys
- Returns base64-encoded key for environment configuration

### Security Considerations

- **Master Key**: Stored in environment variables, never in code
- **Key Caching**: In-memory cache for performance, cleared on server restart
- **Database Encryption**: User keys are encrypted before database storage
- **Automatic Key Creation**: Seamless key generation for new users

## 🧪 Testing

### Test Coverage

Comprehensive unit tests verify:

- ✅ Basic encrypt/decrypt round-trip functionality
- ✅ Different ciphertext generation for same input (IV randomness)
- ✅ Unicode character support (emojis, international characters)
- ✅ Key export/import functionality
- ✅ Error handling for wrong keys
- ✅ Empty string handling
- ✅ Long text support (1000+ characters)
- ✅ Cross-key compatibility testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run
```

## 🔧 Environment Setup

### Required Environment Variables

```bash
# Master key for encrypting user keys
MASTER_KEY="your_generated_master_key_here"

# Generate a new master key with:
node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(32).toString('base64'))"
```

### Database Migration

After updating the schema, run:

```bash
npx prisma generate
npx prisma db push  # or npx prisma migrate dev
```

## 🚀 Usage Examples

### Basic Password Encryption

```typescript
import { getUserKey } from '@/lib/key-management';
import { encrypt, decrypt } from '@/lib/crypto';

// Encrypt a password
const userKey = await getUserKey(userId);
const { ciphertext, iv } = await encrypt('user-password', userKey);

// Store ciphertext and iv in database
await prisma.password.create({
  data: {
    name: 'Gmail',
    ciphertext,
    iv,
    userId,
  }
});

// Decrypt a password
const password = await prisma.password.findFirst({ where: { userId } });
const decryptedPassword = await decrypt(password.ciphertext, password.iv, userKey);
```

### Key Management

```typescript
import { getUserKey, clearUserKeyCache } from '@/lib/key-management';

// Get user's key (creates if doesn't exist)
const userKey = await getUserKey('user_123');

// Clear cache for security
clearUserKeyCache('user_123');
```

## 🔒 Security Best Practices

1. **Master Key Security**: Store master key securely, rotate periodically
2. **Key Caching**: Clear cache on security events or user logout
3. **Database Security**: Use encrypted database connections
4. **Error Handling**: Don't expose cryptographic details in error messages
5. **Key Rotation**: Implement periodic key rotation for high-security environments

## 📋 Implementation Status

- ✅ AES-256-GCM crypto utilities
- ✅ Per-user key management
- ✅ Master key encryption
- ✅ Database schema with relations
- ✅ Comprehensive unit tests
- ✅ Environment configuration
- ✅ Build system integration
- ✅ TypeScript type safety

## 🔄 Next Steps

The crypto foundation is now ready for:
- Password CRUD operations
- User authentication integration
- Frontend password management UI
- Import/export functionality
- Advanced security features (2FA, biometrics) 