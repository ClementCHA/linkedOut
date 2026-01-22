# Infrastructure Rules

Ces règles s'appliquent aux fichiers de configuration, CI/CD, et déploiement.

## Structure

```
/
├── .github/
│   └── workflows/       # GitHub Actions
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── docker-compose.yml
├── scripts/
│   └── deploy.sh
├── turbo.json           # Turborepo config
├── pnpm-workspace.yaml
└── biome.json           # Linter/formatter
```

## Monorepo (Turborepo)

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Dépendances entre packages

```
@linkedout/core     ← Aucune dépendance
@linkedout/ui       ← @linkedout/core (types seulement)
@linkedout/api      ← @linkedout/core
@linkedout/web      ← @linkedout/core, @linkedout/ui
@linkedout/extension ← @linkedout/core
```

## Docker

### Dockerfile Multi-stage

```dockerfile
# Dockerfile.api
FROM node:20-alpine AS base
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @linkedout/api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./

RUN pnpm install --prod --frozen-lockfile

EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile.api
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/linkedout
    depends_on:
      - db

  web:
    build:
      context: .
      dockerfile: docker/Dockerfile.web
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3001

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: linkedout
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## CI/CD (GitHub Actions)

### Workflow CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
```

## Variables d'Environnement

### Convention de nommage

```bash
# Public (exposé au client)
NEXT_PUBLIC_API_URL=https://api.linkedout.app

# Privé (serveur seulement)
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

### Fichiers

```
.env              # Défauts (committé, sans secrets)
.env.local        # Override local (gitignored)
.env.production   # Production (gitignored ou dans CI)
```

### Validation

```typescript
// env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3001),
});

export const env = envSchema.parse(process.env);
```

## Database

### Migrations

```bash
# Appliquer
psql $DATABASE_URL -f migrations/001_create_users.sql

# Vérifier
psql $DATABASE_URL -c "\dt"
```

### Backups

```bash
# Dump
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

## Logs & Monitoring

### Structured Logging

```typescript
// ✅ JSON structuré
logger.info({
  event: 'user_created',
  userId: user.id,
  duration: 42,
});

// ❌ String non structuré
console.log('User created: ' + user.id);
```

### Health Check

```typescript
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    version: process.env.npm_package_version,
    timestamp: new Date().toISOString(),
  });
});
```

## Sécurité

### Headers

```typescript
// Helmet pour Hono
app.use('*', secureHeaders());
```

### Secrets

```bash
# ❌ Jamais dans le code
const secret = "abc123";

# ❌ Jamais dans git
.env.production

# ✅ Variables d'environnement CI
# GitHub Secrets, Vercel Env, etc.
```

### Dependabot

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```
