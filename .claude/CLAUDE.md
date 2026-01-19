# Hexagonal Architecture Monorepo

## Vue d'ensemble

Monorepo TypeScript avec architecture hexagonale, Next.js, et les best practices Vercel.

```
typescript-clean-starter/
├── apps/
│   ├── api/          # Backend Node.js (hexagonal)
│   └── web/          # Frontend Next.js 15
├── packages/
│   ├── core/         # Domain partagé (THE source of truth)
│   ├── ui/           # Composants React partagés
│   └── config/       # Configs TypeScript/Biome
└── .claude/          # Skills, agents, rules
```

## Philosophie

- **Architecture Hexagonale** (Ports & Adapters - Alistair Cockburn)
- **SOLID** (Uncle Bob)
- **TDD** (Kent Beck)
- **React Best Practices** (Vercel Engineering)

## Packages

### @linkedout/core - Domain Partagé

Source unique de vérité pour le domaine métier. Partagé entre API et Web.

```typescript
// Depuis n'importe quelle app
import { User, Email, UserId, UserDto } from '@linkedout/core'
import type { IUserRepository } from '@linkedout/core'
```

**Contenu:**
- `entities/` - Objets avec identité (User, Order...)
- `value-objects/` - Immutables (Email, Money, UserId...)
- `ports/` - Interfaces (IUserRepository...)
- `errors/` - Erreurs métier (UserNotFoundError...)
- `dtos/` - Data Transfer Objects partagés

### @linkedout/ui - Composants React

Composants React réutilisables avec Tailwind.

```typescript
import { Button, Card, Input } from '@linkedout/ui'
```

### @linkedout/config - Configurations

Configs TypeScript et Biome partagées.

```json
// Dans tsconfig.json de n'importe quel package
{ "extends": "@linkedout/config/tsconfig/node" }
{ "extends": "@linkedout/config/tsconfig/react" }
{ "extends": "@linkedout/config/tsconfig/nextjs" }
```

## Apps

### @linkedout/api - Backend Hexagonal

```
apps/api/
├── src/
│   ├── application/use-cases/   # Orchestration
│   └── adapters/
│       ├── in/http/             # Controllers (à implémenter)
│       └── out/persistence/     # Repositories
└── tests/
```

### @linkedout/web - Frontend Next.js

```
apps/web/
├── src/
│   ├── app/          # App Router (Server Components)
│   ├── components/   # Composants locaux
│   └── lib/          # Utilitaires
```

## Commandes

```bash
# Monorepo
pnpm dev          # Démarre tout en parallèle
pnpm build        # Build tous les packages
pnpm test         # Tests tous les packages
pnpm lint         # Lint tous les packages

# Package spécifique
pnpm --filter @linkedout/api test
pnpm --filter @linkedout/web dev
```

## Règles d'Architecture

### Domain (@linkedout/core)
- AUCUN import de frameworks
- AUCUNE dépendance vers apps/
- Logique métier UNIQUEMENT ici

### Application (apps/api)
- Orchestre via Use Cases
- Dépend de @linkedout/core (ports)
- Ne contient PAS de logique métier

### Presentation (apps/web)
- Importe @linkedout/core (DTOs seulement côté client)
- Importe @linkedout/ui (composants)
- Server Components par défaut

## TDD Workflow

```
RED    → Écrire un test qui échoue
GREEN  → Code minimal pour passer
REFACTOR → Améliorer sans casser
```

## Next.js Best Practices

- Server Components par défaut
- `"use client"` au plus bas niveau
- Paralléliser les fetches (`Promise.all`)
- Dynamic imports pour code non-critique
- Cache avec `next: { revalidate: ... }`

Voir `.claude/skills/react-best-practices/` pour les 45 règles Vercel.
