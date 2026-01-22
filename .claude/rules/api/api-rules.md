# API Rules (Hono)

Ces règles s'appliquent à tous les fichiers dans `apps/api/`

## Architecture

```
apps/api/
├── src/
│   ├── application/
│   │   └── use-cases/      # Business logic orchestration
│   ├── adapters/
│   │   ├── in/
│   │   │   └── http/       # Controllers (Hono routes)
│   │   └── out/
│   │       └── persistence/ # Repositories
│   └── index.ts            # Entry point
├── tests/
└── migrations/
```

## Controllers (HTTP Adapters)

### Structure d'une route

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
});

export function createUserRoutes(createUserUseCase: ICreateUserUseCase) {
  const app = new Hono();

  app.post('/', zValidator('json', CreateUserSchema), async (c) => {
    const body = c.req.valid('json');

    try {
      const user = await createUserUseCase.execute(body);
      return c.json({ data: user }, 201);
    } catch (error) {
      // Error handling
    }
  });

  return app;
}
```

### Validation avec Zod

```typescript
// Toujours valider les inputs
const QuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  type: z.enum(['bullshit', 'solid', 'scam']).optional(),
});

app.get('/', zValidator('query', QuerySchema), async (c) => {
  const { limit, offset, type } = c.req.valid('query');
  // ...
});
```

## Gestion des Erreurs

### Error Handler Global

```typescript
import { HTTPException } from 'hono/http-exception';

app.onError((err, c) => {
  // Erreurs métier connues
  if (err instanceof DomainError) {
    return c.json({
      error: {
        code: err.code,
        message: err.message,
      }
    }, err.statusCode);
  }

  // Erreurs HTTP Hono
  if (err instanceof HTTPException) {
    return c.json({
      error: {
        code: 'HTTP_ERROR',
        message: err.message,
      }
    }, err.status);
  }

  // Erreurs inattendues
  console.error(err);
  return c.json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    }
  }, 500);
});
```

### Mapping Erreurs → HTTP

| Domain Error | HTTP Status |
|--------------|-------------|
| `ValidationError` | 400 |
| `UnauthorizedError` | 401 |
| `ForbiddenError` | 403 |
| `NotFoundError` | 404 |
| `ConflictError` | 409 |
| `DomainError` (generic) | 422 |

### Pattern dans les controllers

```typescript
app.post('/', async (c) => {
  try {
    const result = await useCase.execute(command);
    return c.json({ data: result }, 201);
  } catch (error) {
    if (error instanceof EmailAlreadyExistsError) {
      return c.json({
        error: { code: 'EMAIL_EXISTS', message: error.message }
      }, 409);
    }
    if (error instanceof InvalidEmailError) {
      return c.json({
        error: { code: 'VALIDATION_ERROR', message: error.message }
      }, 400);
    }
    throw error; // Let global handler catch it
  }
});
```

## Format des Réponses

### Succès

```typescript
// Single resource
{ "data": { "id": "...", "name": "..." } }

// Collection
{
  "data": [...],
  "meta": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}

// No content
// Status 204, pas de body
```

### Erreurs

```typescript
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [
      { "field": "email", "message": "Invalid format" }
    ]
  }
}
```

## Middleware

### CORS

```typescript
import { cors } from 'hono/cors';

app.use('*', cors({
  origin: ['http://localhost:3000', 'https://linkedout.app'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
```

### Logger

```typescript
import { logger } from 'hono/logger';

app.use('*', logger());
```

### Auth (exemple)

```typescript
import { bearerAuth } from 'hono/bearer-auth';

// Routes protégées
app.use('/api/admin/*', bearerAuth({ token: process.env.ADMIN_TOKEN }));
```

## Dependency Injection

```typescript
// index.ts - Composition Root
import { createUserRoutes } from './adapters/in/http/UserController';
import { CreateUserUseCase } from './application/use-cases/CreateUserUseCase';
import { InMemoryUserRepository } from './adapters/out/persistence/InMemoryUserRepository';

// Instantiate dependencies
const userRepository = new InMemoryUserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);

// Wire routes
app.route('/api/users', createUserRoutes(createUserUseCase));
```

## Tests

### Unit Test (Use Case)

```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepo: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepo = { save: jest.fn(), findByEmail: jest.fn() };
    useCase = new CreateUserUseCase(mockRepo);
  });

  it('should create user', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    const result = await useCase.execute({ name: 'John', email: 'john@test.com' });
    expect(result.name).toBe('John');
    expect(mockRepo.save).toHaveBeenCalled();
  });
});
```

### Integration Test (API)

```typescript
describe('POST /api/users', () => {
  it('should return 201', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John', email: 'john@test.com' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.name).toBe('John');
  });
});
```

## Commandes

```bash
# Dev
pnpm --filter @linkedout/api dev

# Test
pnpm --filter @linkedout/api test

# Build
pnpm --filter @linkedout/api build
```
