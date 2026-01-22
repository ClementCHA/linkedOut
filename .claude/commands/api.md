---
description: Créer un endpoint API complet (route → controller → use case)
argument-hint: <VERB /path - description>
allowed-tools: Read, Write, Edit, Grep, Glob
---

# API Endpoint Generator

## Endpoint demandé
$ARGUMENTS

## Étape 1 : Parser la demande

Extraire :
- **Méthode HTTP** : GET, POST, PUT, PATCH, DELETE
- **Path** : /api/resource/:id
- **Description** : Ce que fait l'endpoint

## Étape 2 : Design (PAS de code encore)

Proposer le design au format :

```markdown
### Endpoint : [VERB] /api/[path]

**Description** : [description]

**Request** :
- Path params : [id: UUID]
- Query params : [limit: number, offset: number]
- Body : { field1: type, field2: type }

**Response** :
- 200/201 : { data: ... }
- 400 : Validation error
- 404 : Not found
- 409 : Conflict

**Fichiers à créer/modifier** :
1. `packages/core/src/dtos/XxxDto.ts` (si nouveau DTO)
2. `apps/api/src/application/use-cases/XxxUseCase.ts`
3. `apps/api/src/adapters/in/http/XxxController.ts`
4. `apps/api/tests/unit/application/XxxUseCase.test.ts`
```

⏸️ **STOP - Attendre validation avant de coder**

## Étape 3 : Implémenter (après validation)

### 3.1 DTO (si nécessaire)

```typescript
// packages/core/src/dtos/XxxDto.ts
export interface XxxDto {
  id: string;
  // ...
}
```

### 3.2 Use Case

```typescript
// apps/api/src/application/use-cases/XxxUseCase.ts
export interface XxxCommand {
  // inputs
}

export interface IXxxUseCase {
  execute(command: XxxCommand): Promise<XxxDto>;
}

export class XxxUseCase implements IXxxUseCase {
  constructor(
    private readonly repository: IXxxRepository
  ) {}

  async execute(command: XxxCommand): Promise<XxxDto> {
    // 1. Validation
    // 2. Logique
    // 3. Persistance
    // 4. Return DTO
  }
}
```

### 3.3 Controller/Route

```typescript
// apps/api/src/adapters/in/http/XxxController.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const XxxSchema = z.object({
  field: z.string().min(1),
});

export function createXxxRoutes(useCase: IXxxUseCase) {
  const app = new Hono();

  app.post('/', zValidator('json', XxxSchema), async (c) => {
    const body = c.req.valid('json');

    try {
      const result = await useCase.execute(body);
      return c.json({ data: result }, 201);
    } catch (error) {
      if (error instanceof ValidationError) {
        return c.json({ error: { code: 'VALIDATION_ERROR', message: error.message } }, 400);
      }
      throw error;
    }
  });

  return app;
}
```

### 3.4 Brancher dans l'app

```typescript
// apps/api/src/index.ts
import { createXxxRoutes } from './adapters/in/http/XxxController';

app.route('/api/xxx', createXxxRoutes(xxxUseCase));
```

## Étape 4 : Tests

```typescript
// apps/api/tests/unit/application/XxxUseCase.test.ts
describe('XxxUseCase', () => {
  it('should ...', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Étape 5 : Résumé

```markdown
## ✅ Endpoint créé

**Route** : [VERB] /api/[path]

### Fichiers créés
- `packages/core/src/dtos/XxxDto.ts`
- `apps/api/src/application/use-cases/XxxUseCase.ts`
- `apps/api/src/adapters/in/http/XxxController.ts`
- `apps/api/tests/unit/application/XxxUseCase.test.ts`

### Test
\`\`\`bash
# Unit tests
pnpm --filter @linkedout/api test

# Manual test
curl -X POST http://localhost:3001/api/xxx \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'
\`\`\`
```
