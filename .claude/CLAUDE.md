# LinkedOut - LinkedIn Bullshit Detector

Extension Chrome pour voter "Bullshit" / "Not Bullshit" sur les posts LinkedIn.

## Stack

Extension Chrome MV3 (Preact) → API Hono (PostgreSQL) → Web Next.js 15

## Structure

```
packages/core/     → Domain (source of truth, AUCUN framework)
apps/api/          → Backend hexagonal (use cases + adapters)
apps/web/          → Leaderboard Next.js
apps/extension/    → Chrome Extension
```

## Hiérarchie de décision

Quand tu dois faire un choix, applique dans cet ordre:

1. **Sécurité** - Jamais de compromis (OWASP, validation, pas de secrets)
2. **Contrat domain** - Le core définit la vérité métier
3. **Simplicité** - Le code le plus simple qui marche
4. **Cohérence** - Suivre les patterns existants du projet
5. **Performance** - Optimiser seulement si nécessaire

## Règles de décision

| Si tu... | Alors... |
|----------|----------|
| Crées une entité/VO | → Dans `packages/core/`, jamais dans apps/ |
| Ajoutes un endpoint | → Controller (validation) → UseCase (logique) → Repository (data) |
| Hésites entre server/client component | → Server par défaut, client seulement pour interactivité |
| Écris une query SQL | → Paramétrisée, jamais de concaténation |
| Retournes des données d'un use case | → DTO, jamais l'entité directement |
| Importes depuis core/ | → OK partout, c'est la source of truth |
| Importes depuis apps/ | → INTERDIT entre apps, utilise core/ |

## Anti-patterns (ne jamais faire)

- `require()` → Utiliser `import` (ES Modules)
- Logique métier dans un controller → Déplacer dans un use case
- Entité retournée par l'API → Mapper vers un DTO
- `any` en TypeScript → Typer explicitement
- Test sans assertion → Chaque test vérifie un comportement
- Commit sans conventionnel → `feat:`, `fix:`, `refactor:`

## Questions à se poser

Avant d'écrire du code, vérifie:

1. **Où va ce code?** Domain (core) vs Application (use case) vs Adapter (controller/repo)
2. **Qui dépend de qui?** Le flux: Adapter IN → Use Case → Port ← Adapter OUT
3. **Est-ce testable?** Si non, probablement mal structuré
4. **Existe-t-il déjà?** Chercher dans core/ avant de créer

## Contexte détaillé

| Besoin | Fichier |
|--------|---------|
| Termes métier (URN, VoteType...) | `.claude/context/project-glossary.md` |
| Format API (status codes, erreurs) | `.claude/context/api-conventions.md` |
| Pourquoi ces choix (ADRs) | `.claude/context/tech-decisions.md` |

## Commandes

```bash
pnpm dev                      # Tout en parallèle
pnpm --filter api dev         # API seule
pnpm --filter extension build # Build extension → dist/
pnpm test && pnpm lint
```

## Commands Claude

`/feature` `/commit` `/pr` `/api` `/component` `/test-first` `/debug`
