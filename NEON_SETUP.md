# Configuration Neon Database

Ce guide vous explique comment configurer votre application avec Neon Database.

## 1. Créer un compte Neon

1. Allez sur [https://neon.tech](https://neon.tech)
2. Créez un compte gratuit
3. Créez un nouveau projet

## 2. Obtenir la chaîne de connexion

1. Dans votre dashboard Neon, allez dans **Settings** > **Connection Details**
2. Copiez la **Connection String** qui ressemble à :
   ```
   postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

## 3. Configuration de l'environnement

1. Copiez le fichier `.env.example` vers `.env` :
   ```bash
   cp .env.example .env
   ```

2. Modifiez le fichier `.env` avec vos vraies valeurs :
   ```env
   # Remplacez par votre vraie URL Neon
   DATABASE_URL="postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
   
   # Vos clés Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_votre_cle_publique
   CLERK_SECRET_KEY=sk_test_votre_cle_secrete
   
   # Générez des clés de chiffrement sécurisées (32 caractères)
   ENCRYPTION_KEY=votre_cle_de_chiffrement_32_caracteres
   MASTER_KEY=votre_cle_maitre_32_caracteres
   ```

## 4. Installation et migration

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Générez le client Prisma :
   ```bash
   npx prisma generate
   ```

3. Appliquez les migrations à votre base de données Neon :
   ```bash
   npx prisma db push
   ```

## 5. Vérification

Pour vérifier que tout fonctionne :
```bash
npx prisma studio
```

Cela ouvrira une interface web pour visualiser votre base de données.

## Notes importantes

- **SSL requis** : Neon nécessite SSL, c'est pourquoi `?sslmode=require` est ajouté à l'URL
- **Pas de shadow database** : Neon ne nécessite pas de shadow database pour les migrations
- **Connexions limitées** : Le plan gratuit de Neon a des limites de connexions simultanées
- **Hibernation** : Les bases de données Neon gratuites hibernent après inactivité

## Génération de clés de chiffrement

Pour générer des clés sécurisées, vous pouvez utiliser :

```bash
# Générer une clé de 32 caractères
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ou utilisez un générateur en ligne sécurisé pour créer des clés de 32 caractères. 