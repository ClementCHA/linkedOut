# Application Layer Rules

Ces règles s'appliquent à tous les fichiers dans `src/application/`

## Responsabilités

La couche Application **orchestre** les cas d'utilisation. Elle ne contient PAS de logique métier.

```
┌─────────────────────────────────────────┐
│           Application Layer             │
│  ┌─────────────────────────────────┐    │
│  │          Use Cases              │    │
│  │  - Orchestration uniquement     │    │
│  │  - Appelle le Domain            │    │
│  │  - Utilise les Ports            │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## Interdictions

- **Pas de logique métier** → doit être dans le Domain
- **Pas d'accès direct** à la DB, HTTP, filesystem
- **Pas d'import de frameworks** d'infrastructure
- **Pas de dépendance** vers `adapters/`

## Obligations

### Use Cases

```typescript
// Pattern: [Verbe][Nom]UseCase
export interface ICreateUserUseCase {
  execute(command: CreateUserCommand): Promise<UserDto>;
}

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository // Port, pas implémentation
  ) {}

  async execute(command: CreateUserCommand): Promise<UserDto> {
    // 1. Validation des inputs (format, pas métier)
    // 2. Appel au Domain (création d'entités)
    // 3. Persistance via Port
    // 4. Retour de DTO
  }
}
```

### Commands & Queries (CQRS léger)

```typescript
// Command = intention de modification
export interface CreateUserCommand {
  name: string;
  email: string;
}

// Query = intention de lecture
export interface GetUserQuery {
  userId: string;
}
```

### DTOs

- Objets simples pour le transport de données
- Pas de logique
- Conversion depuis/vers entités Domain

```typescript
export interface UserDto {
  id: string;
  name: string;
  email: string;
  createdAt: string; // ISO string, pas Date
}
```

## Gestion des Erreurs

- Propager les erreurs Domain (UserNotFoundError, etc.)
- Transformer en erreurs Application si nécessaire
- NE PAS catch silencieusement

## Tests

- Tester chaque Use Case en isolation
- Mocker les Ports (repositories)
- Vérifier les appels aux dépendances
- Couvrir les cas d'erreur
