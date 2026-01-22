# LinkedOut - Architecture Decision Records (ADRs)

## ADR-001: Hexagonal Architecture

**Date**: 2024-01

**Status**: Accepted

**Context**: Besoin d'une architecture maintenable, testable, et évolutive pour le projet.

**Decision**: Adopter l'architecture hexagonale (Ports & Adapters) de Alistair Cockburn.

**Consequences**:
- (+) Domain isolé, testable sans infrastructure
- (+) Facilité de changer de DB, framework HTTP, etc.
- (+) Séparation claire des responsabilités
- (-) Plus de fichiers/indirection
- (-) Courbe d'apprentissage

---

## ADR-002: Monorepo avec Turborepo

**Date**: 2024-01

**Status**: Accepted

**Context**: Projet avec plusieurs apps (API, Web, Extension) partageant du code.

**Decision**: Monorepo avec Turborepo et pnpm workspaces.

**Structure**:
```
apps/
  api/
  web/
  extension/
packages/
  core/       # Domain partagé
  ui/         # Composants React
  config/     # Configs partagées
```

**Consequences**:
- (+) Code partagé sans publish npm
- (+) Refactoring atomique cross-packages
- (+) Build cache intelligent
- (-) Setup initial plus complexe

---

## ADR-003: Branded Types pour Value Objects

**Date**: 2024-01

**Status**: Accepted

**Context**: TypeScript n'a pas de nominal typing. `string` pour email et userId sont interchangeables.

**Decision**: Utiliser des branded types pour les value objects.

```typescript
type UserId = string & { readonly __brand: 'UserId' };
type Email = string & { readonly __brand: 'Email' };
```

**Consequences**:
- (+) Type safety au compile time
- (+) Pas de runtime overhead
- (+) IDE autocomplete différencie les types
- (-) Syntaxe un peu verbose

---

## ADR-004: Hono pour l'API

**Date**: 2024-01

**Status**: Accepted

**Context**: Besoin d'un framework HTTP léger, rapide, avec bon support TypeScript.

**Alternatives considérées**:
- Express (legacy, types moyens)
- Fastify (plus lourd)
- Hono (léger, moderne, excellent TS)

**Decision**: Hono

**Consequences**:
- (+) Très léger et rapide
- (+) Excellent support TypeScript
- (+) Middleware ecosystem
- (+) Fonctionne sur Edge/Workers
- (-) Moins connu qu'Express

---

## ADR-005: VoterId anonyme

**Date**: 2024-01

**Status**: Accepted

**Context**: Les utilisateurs votent depuis l'extension Chrome. Besoin d'identifier les votes sans login obligatoire.

**Decision**: Générer un UUID côté extension, stocké dans `chrome.storage.local`.

**Consequences**:
- (+) Pas de friction utilisateur (pas de signup)
- (+) Simple à implémenter
- (+) Respect vie privée (pas de tracking)
- (-) Votes perdus si extension réinstallée
- (-) Manipulation possible (générer plusieurs IDs)

**Mitigation future**: Optionnel - lier à un compte pour persistance.

---

## ADR-006: PostgreSQL pour la persistance

**Date**: 2024-01

**Status**: Accepted

**Context**: Besoin d'une DB relationnelle robuste pour les votes et le leaderboard.

**Decision**: PostgreSQL

**Reasons**:
- Aggregations efficaces (COUNT FILTER)
- Materialized views pour leaderboard
- JSONB si besoin de flexibilité
- Excellent support Node.js (pg)

---

## ADR-007: Next.js 15 App Router

**Date**: 2024-01

**Status**: Accepted

**Context**: Besoin d'un framework React moderne avec SSR/SSG.

**Decision**: Next.js 15 avec App Router (pas Pages Router)

**Consequences**:
- (+) React Server Components
- (+) Streaming / Suspense natif
- (+) Layouts imbriqués
- (+) Server Actions
- (-) Breaking changes vs Pages Router
- (-) Moins de ressources/exemples (plus récent)

---

## ADR-008: Manifest V3 pour l'extension

**Date**: 2024-01

**Status**: Accepted

**Context**: Chrome déprécie Manifest V2.

**Decision**: Manifest V3 dès le début.

**Consequences**:
- (+) Future-proof
- (+) Meilleure sécurité (CSP strict)
- (-) Service Worker au lieu de background page
- (-) Limitations sur certaines APIs

---

## ADR-009: Pas d'ORM

**Date**: 2024-01

**Status**: Accepted

**Context**: Choix entre ORM (Prisma, Drizzle) ou raw SQL.

**Decision**: Raw SQL avec le driver `pg`.

**Reasons**:
- Contrôle total sur les queries
- Pas de génération de code
- Meilleure performance
- Plus facile à debug

**Mitigation**: Utiliser un query builder léger si besoin (kysely).

---

## ADR-010: Biome au lieu d'ESLint+Prettier

**Date**: 2024-01

**Status**: Accepted

**Context**: Besoin de linting et formatting.

**Decision**: Biome (ex-Rome) pour tout.

**Consequences**:
- (+) Un seul outil au lieu de deux
- (+) Beaucoup plus rapide
- (+) Configuration minimale
- (-) Moins de plugins qu'ESLint
- (-) Plus jeune (moins battle-tested)
