# LinkedOut - Glossaire Projet

## Concept

**LinkedOut** est un "LinkedIn Bullshit Detector" - une plateforme collaborative pour noter les posts LinkedIn selon leur qualité/authenticité.

## Termes Métier

### Post
Un post LinkedIn détecté par l'extension. Identifié par son **URN** (Uniform Resource Name).

### URN (Post URN)
Identifiant unique d'un post LinkedIn.
- Format LinkedIn complet : `urn:li:activity:7123456789012345678`
- Format stocké (simplifié) : `7123456789012345678` (partie numérique uniquement)

### Vote
Une notation d'un post par un utilisateur. Un voter ne peut voter qu'une fois par post (peut changer son vote).

### VoteType
Type de vote possible. Classés en positifs et négatifs :

| Type | Emoji | Catégorie | Description |
|------|-------|-----------|-------------|
| `solid` | 👍 | Positif | Contenu de qualité, utile |
| `interesting` | 💡 | Positif | Perspective intéressante |
| `salesman` | 🤑 | Négatif | Auto-promotion excessive |
| `bullshit` | 💩 | Négatif | Contenu faux ou trompeur |
| `scam` | 🚨 | Négatif | Arnaque, fraude |
| `guru` | 🧘 | Négatif | Conseils génériques, "thought leader" vide |
| `theater` | 🎭 | Négatif | Mise en scène, histoire inventée |

### VoterId
Identifiant anonyme d'un voteur. Généré par l'extension Chrome et stocké localement. Format : UUID v4.

### Leaderboard
Classement des posts par nombre/type de votes. Peut être filtré par type de vote.

## Termes Techniques

### Hexagonal Architecture (Ports & Adapters)
Architecture logicielle où le domaine métier est au centre, isolé des dépendances techniques via des interfaces (ports) et leurs implémentations (adapters).

```
[Adapters IN] → [Application] → [Domain] ← [Ports] ← [Adapters OUT]
    HTTP           Use Cases     Entities    IRepository    PostgreSQL
```

### Domain Layer
Couche contenant la logique métier pure. Aucune dépendance vers l'infrastructure.
- **Entities** : Objets avec identité (User, Post, Vote)
- **Value Objects** : Objets immutables sans identité (Email, UserId, VoteType)
- **Ports** : Interfaces définissant les contrats (IUserRepository)

### Application Layer
Couche orchestrant les use cases. Ne contient pas de logique métier, seulement la coordination.
- **Use Cases** : Actions possibles (CreateUser, SubmitVote, GetLeaderboard)
- **DTOs** : Objets de transfert de données

### Adapters
Implémentations concrètes des ports.
- **Adapters IN** : Points d'entrée (HTTP controllers)
- **Adapters OUT** : Points de sortie (PostgreSQL repositories)

## Acronymes

| Acronyme | Signification |
|----------|---------------|
| **SOLID** | Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion |
| **TDD** | Test-Driven Development |
| **DDD** | Domain-Driven Design |
| **CQRS** | Command Query Responsibility Segregation |
| **DTO** | Data Transfer Object |
| **URN** | Uniform Resource Name |
| **UUID** | Universally Unique Identifier |
| **ISR** | Incremental Static Regeneration (Next.js) |
| **RSC** | React Server Components |

## Packages

| Package | Description |
|---------|-------------|
| `@linkedout/core` | Domain partagé (entities, value objects, ports) |
| `@linkedout/api` | Backend Hono avec PostgreSQL |
| `@linkedout/web` | Frontend Next.js 15 |
| `@linkedout/extension` | Extension Chrome Manifest V3 |
| `@linkedout/ui` | Composants React partagés |
| `@linkedout/config` | Configurations TypeScript/Biome partagées |
