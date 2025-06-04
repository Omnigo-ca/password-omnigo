# Omnigo Password Manager

A secure password management application built with Next.js 14, TypeScript, Tailwind CSS, Clerk authentication, and Prisma ORM.

## Features

- 🔐 **Secure Authentication** - Powered by Clerk
- 🛡️ **AES-256-GCM Encryption** - Industry-standard authenticated encryption
- 🔑 **Per-User Key Management** - Individual encryption keys for each user
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
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Testing**: Vitest

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Clerk account for authentication

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
│   ├── layout.tsx         # Root layout with Clerk provider
│   ├── page.tsx           # Home page with auth states
│   └── globals.css        # Global styles
├── lib/
│   ├── crypto.ts          # AES-256-GCM encryption utilities
│   ├── key-management.ts  # Per-user key management
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
- **Key Caching**: In-memory caching for performance with security controls
- **User Isolation**: Complete data separation between users
- **Route Protection**: Sensitive routes protected by Clerk middleware

## Crypto Implementation

### Core Functions

- `generateKey()` - Generate 256-bit AES-GCM keys
- `encrypt(text, key)` - Encrypt with random IV
- `decrypt(ciphertext, iv, key)` - Decrypt with authentication
- `getUserKey(userId)` - Get or create user's encryption key
- `exportKey(key)` / `importKey(data)` - Key serialization

### Security Architecture

1. **Master Key**: Stored in environment variables, encrypts user keys
2. **User Keys**: Generated per-user, encrypted with master key
3. **Password Encryption**: Each password encrypted with user's key
4. **IV Randomization**: Unique IV for every encryption operation

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

## Deployment

1. Set up your production database
2. Configure environment variables in your hosting platform
3. Generate a secure master key for production
4. Run database migrations in production
5. Deploy the application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
