# Adapters Layer Rules

Ces règles s'appliquent à tous les fichiers dans `src/adapters/`

## Structure

```
adapters/
├── in/              # Adapters entrants (qui appellent l'application)
│   ├── http/        # Controllers REST
│   ├── graphql/     # Resolvers GraphQL
│   └── cli/         # Commandes CLI
└── out/             # Adapters sortants (appelés par l'application)
    ├── persistence/ # Repositories (DB)
    └── external/    # APIs tierces
```

## Adapters IN (entrants)

Responsabilités:
- Recevoir les requêtes externes
- Valider le format des inputs
- Appeler les Use Cases
- Formater les réponses

```typescript
export class UserController {
  constructor(private readonly createUser: ICreateUserUseCase) {}

  async create(req: Request, res: Response): Promise<void> {
    // 1. Valider format
    // 2. Appeler use case
    // 3. Retourner réponse
  }
}
```

## Adapters OUT (sortants)

Responsabilités:
- Implémenter les Ports du domain
- Gérer la persistence
- Communiquer avec services externes
- Mapper Domain ↔ Technique

```typescript
export class PostgresUserRepository implements IUserRepository {
  async findById(id: UserId): Promise<User | null> {
    const row = await this.db.query(/* ... */)
    return row ? this.toDomain(row) : null
  }

  private toDomain(row: UserRow): User {
    return User.reconstitute(/* mapping */)
  }
}
```

## Interdictions

- **Pas de logique métier** dans les adapters
- Adapters IN: pas d'accès direct aux repositories
- Adapters OUT: pas de dépendance vers adapters IN
