# Déploiement Vercel avec Neon Database

Ce guide explique comment déployer votre application sur Vercel avec Neon Database.

## 1. Préparation du projet

### Variables d'environnement pour Vercel

Dans votre dashboard Vercel, ajoutez ces variables d'environnement :

```env
# Base de données Neon
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Authentification Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_live_key
CLERK_SECRET_KEY=sk_live_your_live_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Chiffrement (utilisez des clés différentes de celles de développement)
ENCRYPTION_KEY=your_production_32_character_key
MASTER_KEY=your_production_master_key

# Next.js
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_production_nextauth_secret
```

## 2. Configuration Neon pour la production

### Optimisations recommandées

1. **Utilisez la région la plus proche** de vos utilisateurs
2. **Activez le connection pooling** si nécessaire
3. **Configurez les limites de connexion** appropriées

### URL de connexion optimisée

Pour Vercel, utilisez cette format d'URL :
```
postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require&connect_timeout=15
```

## 3. Configuration du build

Le script de build dans `package.json` est déjà configuré :
```json
"build": "npx prisma generate --no-engine && next build"
```

Cela garantit que :
- Le client Prisma est généré avant le build
- L'option `--no-engine` optimise pour les environnements serverless

## 4. Déploiement

### Via GitHub (recommandé)

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Via CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

## 5. Post-déploiement

### Appliquer le schéma de base de données

Après le premier déploiement, appliquez le schéma :

```bash
# Localement avec l'URL de production
DATABASE_URL="your_neon_production_url" npx prisma db push
```

Ou utilisez Prisma Studio avec l'URL de production :
```bash
DATABASE_URL="your_neon_production_url" npx prisma studio
```

## 6. Monitoring et maintenance

### Surveillance des connexions

- Surveillez l'utilisation des connexions dans le dashboard Neon
- Configurez des alertes si nécessaire

### Logs et debugging

- Utilisez les logs Vercel pour diagnostiquer les problèmes
- Les logs Prisma sont désactivés en production pour les performances

## 7. Dépannage

### Erreur "prisma://" protocol

Si vous obtenez cette erreur :
```
Error validating datasource `db`: the URL must start with the protocol `prisma://`
```

**Solution :**
1. Vérifiez que `DATABASE_URL` utilise le format PostgreSQL standard
2. N'utilisez PAS Prisma Accelerate URLs sur Vercel avec Neon
3. Utilisez directement l'URL Neon native

### Timeouts de connexion

Si vous avez des timeouts :
```
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require&connect_timeout=15&pool_timeout=15"
```

### Limites de connexions

Pour éviter les limites de connexions Neon :
- Utilisez le connection pooling de Neon
- Configurez `connection_limit` dans l'URL si nécessaire

## 8. Sécurité

### Variables d'environnement

- ✅ Utilisez des clés différentes entre dev/prod
- ✅ Générez des clés de chiffrement fortes (32+ caractères)
- ✅ Utilisez les clés Clerk de production
- ✅ Configurez NEXTAUTH_URL avec votre domaine Vercel

### Base de données

- ✅ Activez SSL (déjà inclus avec `sslmode=require`)
- ✅ Utilisez des mots de passe forts
- ✅ Limitez l'accès réseau si possible 