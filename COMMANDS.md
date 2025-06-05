# Commandes utiles pour Neon Database

## Configuration initiale

```bash
# 1. Copier le fichier d'environnement
cp .env.example .env

# 2. Modifier .env avec vos vraies valeurs Neon
# Éditez DATABASE_URL avec votre chaîne de connexion Neon

# 3. Installer les dépendances
npm install

# 4. Générer le client Prisma
npm run db:generate
```

## Base de données

```bash
# Tester la connexion à Neon
npm run test:neon

# Appliquer le schéma à la base de données
npm run db:push

# Ouvrir Prisma Studio pour visualiser les données
npm run db:studio

# Régénérer le client Prisma après modification du schéma
npm run db:generate
```

## Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Construire pour la production
npm run build

# Démarrer en mode production
npm run start
```

## Déploiement Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer en mode preview
vercel

# Déployer en production
vercel --prod

# Appliquer le schéma sur la base de production
DATABASE_URL="your_production_neon_url" npx prisma db push
```

## Tests

```bash
# Exécuter les tests
npm test

# Exécuter les tests avec interface
npm run test:ui

# Exécuter les tests une fois
npm run test:run
```

## Dépannage

### Erreur de connexion
```bash
# Vérifier la connexion
npm run test:neon
```

### Problèmes de schéma
```bash
# Réinitialiser et appliquer le schéma
npm run db:generate
npm run db:push
```

### Base de données vide
```bash
# Appliquer le schéma complet
npm run db:push
```

### Erreur Vercel "prisma://" protocol
```bash
# Vérifier que DATABASE_URL utilise le format PostgreSQL standard
echo $DATABASE_URL

# Doit commencer par postgresql:// et non prisma://
```

## Variables d'environnement requises

### Développement (.env)
```env
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxx"
CLERK_SECRET_KEY="sk_test_xxx"
ENCRYPTION_KEY="your_32_character_encryption_key"
MASTER_KEY="your_32_character_master_key"
```

### Production (Vercel)
```env
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require&connect_timeout=15"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_xxx"
CLERK_SECRET_KEY="sk_live_xxx"
ENCRYPTION_KEY="your_production_32_character_key"
MASTER_KEY="your_production_master_key"
NEXTAUTH_URL="https://your-app.vercel.app"
``` 