---
description: Générer une migration de base de données PostgreSQL
argument-hint: <description du changement de schéma>
allowed-tools: Read, Grep, Glob, Write
---

# Database Migration Generator

## Changement demandé
$ARGUMENTS

## Étape 1 : Analyser l'existant

1. Lire les entités du domain (`packages/core/src/entities/`)
2. Lire les migrations existantes (`apps/api/migrations/`)
3. Identifier le prochain numéro de migration

## Étape 2 : Mapper Domain → SQL

| Domain | PostgreSQL |
|--------|------------|
| `UserId` | `UUID PRIMARY KEY` |
| `Email` | `VARCHAR(255) UNIQUE` |
| `VoteType` | `VARCHAR(20) CHECK (...)` |
| `Date` | `TIMESTAMPTZ` |
| `string` | `VARCHAR(n)` ou `TEXT` |
| `number` | `INTEGER` |
| `boolean` | `BOOLEAN` |

## Étape 3 : Générer la migration

### Template

```sql
-- Migration: XXX_<description>
-- Created: <date>
-- Description: <description détaillée>

-- ============================================
-- UP
-- ============================================

BEGIN;

-- [SQL statements here]

COMMIT;

-- ============================================
-- DOWN (Rollback)
-- ============================================

-- BEGIN;
-- [Rollback SQL here]
-- COMMIT;
```

### Conventions

1. **Nommage** : `XXX_snake_case_description.sql`
2. **Transactions** : Toujours entourer de `BEGIN/COMMIT`
3. **Idempotent** : Utiliser `IF NOT EXISTS`, `IF EXISTS`
4. **Rollback** : Toujours fournir le DOWN (commenté)

## Étape 4 : Vérifications

Checklist avant création :
- [ ] Pas de perte de données
- [ ] Indexes sur les foreign keys
- [ ] Contraintes CHECK pour les enums
- [ ] DEFAULT pour les nouvelles colonnes NOT NULL
- [ ] Rollback possible et testé

## Étape 5 : Créer le fichier

Écrire dans : `apps/api/migrations/XXX_description.sql`

## Étape 6 : Instructions d'exécution

```markdown
## Migration créée

**Fichier** : `apps/api/migrations/XXX_description.sql`

### Pour appliquer

\`\`\`bash
# Via psql
psql $DATABASE_URL -f apps/api/migrations/XXX_description.sql

# Ou via le script (si existant)
pnpm --filter @linkedout/api migrate
\`\`\`

### Pour rollback

Décommenter la section DOWN et exécuter :
\`\`\`bash
psql $DATABASE_URL -f apps/api/migrations/XXX_description.sql
\`\`\`

### Vérifier

\`\`\`bash
psql $DATABASE_URL -c "\d table_name"
\`\`\`
```
