# Testing Rules

Ces règles s'appliquent à tous les fichiers dans `tests/` et `**/*.test.ts`

## Structure des Tests

```
tests/
├── unit/           # Tests unitaires (isolés, rapides)
├── integration/    # Tests d'intégration (DB, APIs)
└── e2e/            # Tests end-to-end (optionnel)
```

## Conventions de Nommage

### Fichiers
```
[NomClasse].test.ts
[NomModule].spec.ts
```

### Tests
```typescript
describe('NomClasse', () => {
  describe('nomMethode', () => {
    it('should [comportement attendu] when [condition]', () => {
      // ...
    });
  });
});
```

## Pattern AAA (Arrange-Act-Assert)

```typescript
it('should return user when found', async () => {
  // Arrange - préparer le contexte
  const userId = UserId.create();
  const expectedUser = createTestUser({ id: userId });
  mockRepository.findById.mockResolvedValue(expectedUser);

  // Act - exécuter l'action
  const result = await useCase.execute({ userId: userId.toString() });

  // Assert - vérifier le résultat
  expect(result).toEqual(expectedUser.toDto());
});
```

## Règles

### DO ✅

- **Un concept par test** : un test = un comportement
- **Noms descriptifs** : le nom du test documente le comportement
- **Tests indépendants** : pas de dépendance entre tests
- **Tests rapides** : < 100ms pour les unitaires
- **Données de test explicites** : pas de magic values

### DON'T ❌

- **Pas de logique** dans les tests (if, for, try/catch)
- **Pas de tests flaky** : même résultat à chaque exécution
- **Pas de dépendances externes** en unit tests
- **Pas de mock excessif** : si trop de mocks → mauvais design

## Factories de Test

```typescript
// tests/helpers/factories.ts
export function createTestUser(overrides: Partial<UserProps> = {}): User {
  return User.reconstitute({
    id: UserId.create(),
    name: 'John Doe',
    email: Email.create('john@example.com'),
    createdAt: new Date(),
    ...overrides,
  });
}
```

## Mocking

```typescript
// Mock de repository
const mockUserRepository: jest.Mocked<IUserRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

// Reset entre chaque test
beforeEach(() => {
  jest.clearAllMocks();
});
```

## Couverture Minimale

| Layer | Couverture cible |
|-------|------------------|
| Domain (entities, value objects) | 90%+ |
| Application (use cases) | 80%+ |
| Adapters | 70%+ |

## Commandes

```bash
pnpm test              # Tous les tests
pnpm test:watch        # Mode watch
pnpm test:coverage     # Avec couverture
pnpm --filter @linkedout/api test  # Package spécifique
```
