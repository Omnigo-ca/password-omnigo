# Omnigo Password Manager

A secure password management application built with Next.js 14, TypeScript, Tailwind CSS, Clerk authentication, and Prisma ORM.

## Features

- 🔐 **Secure Authentication** - Powered by Clerk
- 🛡️ **AES-256-GCM Encryption** - Industry-standard authenticated encryption
- 🔑 **Per-User Key Management** - Individual encryption keys for each user
- 🚀 **Secure CRUD API** - Complete password management endpoints
- ⚡ **Rate Limiting** - Copy endpoint protected (10 req/min per user)
- 🎨 **Modern UI** - Built with Tailwind CSS and responsive design
- 📱 **Mobile Friendly** - Works seamlessly on all devices
- 🗄️ **Database Integration** - PostgreSQL with Prisma ORM
- 🧪 **Comprehensive Testing** - Unit tests with Vitest

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma
- **Encryption**: WebCrypto API (AES-256-GCM)
- **Rate Limiting**: Upstash Redis / In-memory fallback
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Testing**: Vitest

## API Endpoints

### Password Management

- `POST /api/password/create` - Create encrypted password
- `GET /api/password/list` - List password metadata (no sensitive data)
- `POST /api/password/copy` - Decrypt password (rate limited)
- `PUT /api/password/update` - Update password name/value
- `DELETE /api/password/delete` - Delete password

All endpoints require Clerk authentication and implement proper user isolation.

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Clerk account for authentication
- (Optional) Upstash Redis for production rate limiting

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd omnigo-password
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here
   
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/omnigo_password?schema=public"
   
   # Encryption
   # Generate with: node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(32).toString('base64'))"
   MASTER_KEY="your_generated_master_key_here"
   
   # Rate Limiting (Optional - uses in-memory store if not provided)
   # UPSTASH_REDIS_REST_URL="your_upstash_redis_url_here"
   # UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_token_here"
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npx prisma migrate dev --name init
   
   # Generate Prisma client
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
omnigo-password/
├── app/                    # Next.js App Router
│   ├── api/password/      # Password management API endpoints
│   │   ├── create/        # POST - Create password
│   │   ├── list/          # GET - List passwords
│   │   ├── copy/          # POST - Decrypt password (rate limited)
│   │   ├── update/        # PUT - Update password
│   │   └── delete/        # DELETE - Delete password
│   ├── layout.tsx         # Root layout with Clerk provider
│   ├── page.tsx           # Home page with auth states
│   └── globals.css        # Global styles
├── lib/
│   ├── crypto.ts          # AES-256-GCM encryption utilities
│   ├── key-management.ts  # Per-user key management
│   ├── rate-limit.ts      # Rate limiting utilities
│   └── prisma.ts          # Prisma client instance
├── prisma/
│   └── schema.prisma      # Database schema
├── middleware.ts          # Clerk route protection
└── tailwind.config.ts     # Tailwind configuration
```

## Database Schema

The application uses two main models for secure password storage:

```prisma
model UserKey {
  id              String   @id @default(cuid())
  userId          String   @unique
  encryptedKey    String   // User's encryption key encrypted with MASTER_KEY
  iv              String   // IV used for encrypting the user key
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  passwords       Password[]
}

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

## Security Features

- **AES-256-GCM Encryption**: Industry-standard authenticated encryption
- **Per-User Keys**: Each user has their own encryption key
- **Master Key Protection**: User keys are encrypted with a server-level master key
- **Random IVs**: Each encryption uses a unique initialization vector
- **WebCrypto API**: Uses native browser/Node.js crypto implementations
- **Rate Limiting**: Copy endpoint limited to 10 requests per minute per user
- **Key Caching**: In-memory caching for performance with security controls
- **User Isolation**: Complete data separation between users
- **Route Protection**: API routes protected by Clerk middleware
- **Input Validation**: Zod schema validation on all endpoints
- **Secure Error Handling**: No cryptographic details exposed in errors

## API Security Architecture

### Data Flow

1. **Create Password:**
   ```
   plaintext → encrypt(plaintext, userKey) → {ciphertext, iv} → database
   ```

2. **Copy Password:**
   ```
   database → {ciphertext, iv} → decrypt(ciphertext, iv, userKey) → plaintext
   ```

3. **List Passwords:**
   ```
   database → {id, name, timestamps} (no sensitive data)
   ```

### Rate Limiting

- **Copy Endpoint**: 10 requests per minute per user
- **Algorithm**: Sliding window
- **Storage**: Redis (production) or in-memory Map (development)
- **Headers**: Rate limit information in response headers

For detailed implementation details, see [CRYPTO_IMPLEMENTATION.md](./CRYPTO_IMPLEMENTATION.md).

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run
```

Tests cover:
- Encrypt/decrypt round-trip functionality
- Unicode character support
- Key export/import operations
- Error handling and security validation

## Development

To run the development server:

```bash
npm run dev
```

To run database migrations:

```bash
npx prisma migrate dev
```

To view the database:

```bash
npx prisma studio
```

To generate a new master key:

```bash
node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(32).toString('base64'))"
```

## API Usage Examples

### Create a Password

```typescript
const response = await fetch('/api/password/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Gmail Account',
    plaintext: 'super-secure-password-123'
  })
})
```

### List Passwords

```typescript
const response = await fetch('/api/password/list')
const { passwords } = await response.json()
```

### Copy/Decrypt Password

```typescript
const response = await fetch('/api/password/copy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 'password-id' })
})
const { plaintext } = await response.json()
```

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## Deployment

1. Set up your production database
2. Configure environment variables in your hosting platform
3. Generate a secure master key for production
4. (Optional) Set up Upstash Redis for production rate limiting
5. Run database migrations in production
6. Deploy the application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
