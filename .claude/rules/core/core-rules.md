# Core Package Rules (@linkedout/core)

Ces règles s'appliquent à tous les fichiers dans `packages/core/`

## Rôle

Le package `@linkedout/core` est la **source unique de vérité** pour le domaine métier. Il est partagé entre toutes les apps (API, Web, Extension).

```
packages/core/
├── src/
│   ├── entities/        # Objets avec identité
│   ├── value-objects/   # Immutables, sans identité
│   ├── ports/           # Interfaces (contrats)
│   ├── errors/          # Erreurs métier
│   └── dtos/            # Data Transfer Objects
└── index.ts             # Exports publics
```

## Interdictions Absolues

- **AUCUN import de frameworks** (Express, Hono, Prisma, React, Next.js...)
- **AUCUNE dépendance** vers `apps/` (api, web, extension)
- **AUCUN accès** à la DB, filesystem, APIs externes, localStorage
- **AUCUN code asynchrone** dans entities/value-objects (sauf ports)

## Exports

Tout ce qui est exporté depuis `index.ts` fait partie de l'API publique.

```typescript
// packages/core/src/index.ts
// Entities
export { User } from './entities/User';
export type { UserProps } from './entities/User';

// Value Objects
export { Email } from './value-objects/Email';
export { UserId } from './value-objects/UserId';

// Ports
export type { IUserRepository } from './ports/IUserRepository';

// Errors
export { UserNotFoundError } from './errors/UserNotFoundError';

// DTOs
export type { UserDto } from './dtos/UserDto';
```

## Patterns

### Entities (avec identité)

```typescript
// Branded type pour l'ID
export type UserId = string & { readonly __brand: 'UserId' };

// Type immutable
export type User = Readonly<{
  id: UserId;
  email: Email;
  name: string;
  createdAt: Date;
}>;

// Factory functions
export const User = {
  create: (props: CreateUserProps): User => ({ ... }),
  reconstitute: (props: UserProps): User => ({ ... }),
};
```

### Value Objects (immutables)

```typescript
export type Email = string & { readonly __brand: 'Email' };

export const Email = {
  create: (value: string): Email => {
    if (!isValidEmail(value)) {
      throw new InvalidEmailError(value);
    }
    return value.toLowerCase() as Email;
  },

  isValid: (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
};
```

### Ports (interfaces)

```typescript
export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}
```

### Erreurs Métier

```typescript
export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User not found: ${userId}`);
    this.name = 'UserNotFoundError';
  }
}
```

### DTOs

```typescript
export interface UserDto {
  id: string;
  name: string;
  email: string;
  createdAt: string; // ISO 8601
}

export const toUserDto = (user: User): UserDto => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt.toISOString(),
});
```

## Règles de Dépendance

```
✅ apps/api     → @linkedout/core
✅ apps/web     → @linkedout/core (DTOs seulement côté client)
✅ apps/extension → @linkedout/core

❌ @linkedout/core → apps/*
❌ @linkedout/core → node_modules (frameworks)
```

## Tests

Les tests du core doivent être 100% synchrones et sans mocks externes.

```typescript
describe('Email', () => {
  it('should create valid email', () => {
    const email = Email.create('test@example.com');
    expect(email).toBe('test@example.com');
  });

  it('should throw on invalid email', () => {
    expect(() => Email.create('invalid')).toThrow(InvalidEmailError);
  });
});
```
