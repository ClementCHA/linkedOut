# Domain Layer Rules

Ces règles s'appliquent à tous les fichiers dans `src/domain/`

## Interdictions Absolues

- **Aucun import de frameworks** (Express, Fastify, TypeORM, Prisma, etc.)
- **Aucune annotation/decorator** d'infrastructure
- **Aucun accès direct** à la DB, filesystem, APIs externes
- **Aucune dépendance** vers `adapters/` ou `application/`

## Obligations

- **Entités** avec identité et cycle de vie
- **Value Objects** immutables
- **Ports** (interfaces) pour toutes les dépendances externes
- **Erreurs métier** spécifiques

## Patterns

### Entités
```typescript
export class User {
  private constructor(/* ... */) {}
  static create(/* ... */): User { /* ... */ }
  static reconstitute(/* ... */): User { /* ... */ }
}
```

### Value Objects (immutables)
```typescript
export class Email {
  private constructor(private readonly value: string) {}
  static create(email: string): Email { /* validation */ }
  equals(other: Email): boolean { /* ... */ }
}
```

### Ports
```typescript
export interface IUserRepository {
  findById(id: UserId): Promise<User | null>
  save(user: User): Promise<void>
}
```
