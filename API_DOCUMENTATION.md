# Omnigo Password Manager - API Documentation

## Overview

This document describes the secure CRUD API endpoints for the Omnigo Password Manager. All endpoints require authentication via Clerk and implement proper encryption/decryption of password data.

## Authentication

All API endpoints require a valid Clerk session. Unauthenticated requests will receive a `401 Unauthorized` response.

**Headers Required:**
- `Authorization: Bearer <clerk_session_token>` (handled automatically by Clerk middleware)

## Base URL

All endpoints are prefixed with `/api/password/`

## Endpoints

### 1. Create Password

**Endpoint:** `POST /api/password/create`

**Description:** Creates a new password entry with AES-256-GCM encryption.

**Request Body:**
```json
{
  "name": "string (1-100 chars, required)",
  "plaintext": "string (required)"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "password": {
    "id": "string",
    "name": "string",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

**Response (Error - 400):**
```json
{
  "error": "Invalid request data",
  "details": [
    {
      "code": "string",
      "message": "string",
      "path": ["field_name"]
    }
  ]
}
```

**Security Features:**
- Password is encrypted with user's unique AES-256-GCM key
- Plaintext is never stored in database
- Random IV generated for each encryption

---

### 2. List Passwords

**Endpoint:** `GET /api/password/list`

**Description:** Retrieves metadata for all user's passwords (no sensitive data exposed).

**Request Body:** None

**Response (Success - 200):**
```json
{
  "success": true,
  "passwords": [
    {
      "id": "string",
      "name": "string",
      "createdAt": "ISO 8601 timestamp",
      "updatedAt": "ISO 8601 timestamp"
    }
  ]
}
```

**Security Features:**
- Only returns metadata (id, name, timestamps)
- Ciphertext and IV are explicitly excluded
- Results filtered by authenticated user ID

---

### 3. Copy Password (Decrypt)

**Endpoint:** `POST /api/password/copy`

**Description:** Decrypts and returns a password's plaintext value. Rate limited to 10 requests per minute per user.

**Request Body:**
```json
{
  "id": "string (required)"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "plaintext": "string",
  "name": "string"
}
```

**Response (Rate Limited - 429):**
```json
{
  "error": "Rate limit exceeded",
  "limit": 10,
  "remaining": 0,
  "reset": "ISO 8601 timestamp"
}
```

**Response Headers:**
- `X-RateLimit-Limit: 10`
- `X-RateLimit-Remaining: <number>`
- `X-RateLimit-Reset: <timestamp>`

**Security Features:**
- Rate limited to 10 requests per minute per user
- Ownership verification (user can only access their own passwords)
- AES-256-GCM decryption with user's unique key
- Secure error messages that don't expose cryptographic details

---

### 4. Update Password

**Endpoint:** `PUT /api/password/update`

**Description:** Updates a password's name and/or encrypted value.

**Request Body:**
```json
{
  "id": "string (required)",
  "name": "string (1-100 chars, optional)",
  "plaintext": "string (optional)"
}
```

**Note:** At least one of `name` or `plaintext` must be provided.

**Response (Success - 200):**
```json
{
  "success": true,
  "password": {
    "id": "string",
    "name": "string",
    "createdAt": "ISO 8601 timestamp",
    "updatedAt": "ISO 8601 timestamp"
  }
}
```

**Security Features:**
- Ownership verification before update
- New plaintext is re-encrypted with fresh IV
- Partial updates supported (name only, password only, or both)

---

### 5. Delete Password

**Endpoint:** `DELETE /api/password/delete`

**Description:** Permanently deletes a password entry.

**Request Body:**
```json
{
  "id": "string (required)"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password deleted successfully"
}
```

**Response (Not Found - 404):**
```json
{
  "error": "Password not found or access denied"
}
```

**Security Features:**
- Ownership verification (user can only delete their own passwords)
- Secure deletion from database
- No recovery possible after deletion

## Error Responses

### Common Error Codes

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**400 Bad Request:**
```json
{
  "error": "Invalid request data",
  "details": [/* Zod validation errors */]
}
```

**404 Not Found:**
```json
{
  "error": "Password not found or access denied"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

### Copy Endpoint Rate Limiting

- **Limit:** 10 requests per minute per user
- **Algorithm:** Sliding window
- **Storage:** Redis (production) or in-memory Map (development)
- **Headers:** Rate limit information included in response headers

### Rate Limit Configuration

**Environment Variables (Optional):**
```env
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

If Redis is not configured, the system falls back to in-memory rate limiting.

## Security Architecture

### Encryption Details

1. **Master Key:** Server-level key stored in environment variables
2. **User Keys:** Per-user AES-256-GCM keys encrypted with master key
3. **Password Encryption:** Each password encrypted with user's unique key
4. **IV Randomization:** Unique 96-bit IV for every encryption operation

### Data Flow

1. **Create:** `plaintext` → `encrypt(plaintext, userKey)` → `{ciphertext, iv}` → database
2. **Copy:** database → `{ciphertext, iv}` → `decrypt(ciphertext, iv, userKey)` → `plaintext`
3. **List:** database → `{id, name, timestamps}` (no sensitive data)

### Security Features

- ✅ **Authentication:** Clerk middleware on all routes
- ✅ **Authorization:** User ownership verification
- ✅ **Encryption:** AES-256-GCM with random IVs
- ✅ **Rate Limiting:** Copy endpoint protected
- ✅ **Input Validation:** Zod schema validation
- ✅ **Error Handling:** Secure error messages
- ✅ **Data Isolation:** Complete user separation

## Usage Examples

### JavaScript/TypeScript Client

```typescript
// Create a password
const createResponse = await fetch('/api/password/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Gmail Account',
    plaintext: 'super-secure-password-123'
  })
})

// List passwords
const listResponse = await fetch('/api/password/list')
const { passwords } = await listResponse.json()

// Copy/decrypt a password
const copyResponse = await fetch('/api/password/copy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id: 'password-id-here'
  })
})

// Update a password
const updateResponse = await fetch('/api/password/update', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id: 'password-id-here',
    name: 'Updated Gmail Account',
    plaintext: 'new-secure-password-456'
  })
})

// Delete a password
const deleteResponse = await fetch('/api/password/delete', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id: 'password-id-here'
  })
})
```

### cURL Examples

```bash
# Create password
curl -X POST /api/password/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Gmail","plaintext":"password123"}'

# List passwords
curl -X GET /api/password/list

# Copy password
curl -X POST /api/password/copy \
  -H "Content-Type: application/json" \
  -d '{"id":"clx1234567890"}'

# Update password
curl -X PUT /api/password/update \
  -H "Content-Type: application/json" \
  -d '{"id":"clx1234567890","name":"Updated Gmail"}'

# Delete password
curl -X DELETE /api/password/delete \
  -H "Content-Type: application/json" \
  -d '{"id":"clx1234567890"}'
```

## Testing

All endpoints can be tested using the provided examples above. Ensure you have:

1. Valid Clerk authentication session
2. Proper environment variables configured
3. Database connection established
4. Master key generated and configured

## Production Considerations

1. **Redis Setup:** Configure Upstash Redis for production rate limiting
2. **Environment Security:** Secure master key storage
3. **Database Security:** Use encrypted database connections
4. **Monitoring:** Implement logging and monitoring for security events
5. **Backup:** Regular encrypted database backups 