---
description: Générer de la documentation à partir du code
argument-hint: <fichier ou module à documenter>
allowed-tools: Read, Grep, Glob
---

# Documentation Generator

## Cible
$ARGUMENTS

## Étape 1 : Analyser le code

1. Lire le(s) fichier(s) concerné(s)
2. Identifier :
   - Exports publics
   - Types/Interfaces
   - Fonctions/Méthodes
   - Dépendances

## Étape 2 : Générer la documentation

### Format pour un Module

```markdown
# [Module Name]

> [One-line description]

## Installation

\`\`\`bash
pnpm add @linkedout/[package]
\`\`\`

## Usage

\`\`\`typescript
import { X, Y } from '@linkedout/[package]';

// Example usage
const result = X.create(...);
\`\`\`

## API Reference

### `ClassName`

[Description]

#### Constructor

\`\`\`typescript
new ClassName(options: ClassOptions)
\`\`\`

| Parameter | Type | Description |
|-----------|------|-------------|
| options.x | string | Description |

#### Methods

##### `methodName(param: Type): ReturnType`

[Description]

**Parameters:**
- `param` - [Description]

**Returns:** [Description]

**Example:**
\`\`\`typescript
const result = instance.methodName('value');
\`\`\`

**Throws:**
- `ErrorType` - When [condition]

### Types

#### `TypeName`

\`\`\`typescript
interface TypeName {
  field: string;
  optional?: number;
}
\`\`\`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| field | string | Yes | Description |
| optional | number | No | Description |

## Examples

### [Use Case 1]

\`\`\`typescript
// Full example
\`\`\`

### [Use Case 2]

\`\`\`typescript
// Full example
\`\`\`

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| ErrorName | When X happens | Do Y |

## See Also

- [Related Module](./related.md)
- [API Documentation](./api.md)
```

### Format pour une API

```markdown
# [Endpoint Name]

## `[METHOD] /api/[path]`

[Description]

### Authentication

[Required / Optional / None]

### Request

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Resource identifier |

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | Max results |

#### Request Body

\`\`\`typescript
interface CreateXRequest {
  name: string;  // Required, 2-100 chars
  email: string; // Required, valid email
}
\`\`\`

### Response

#### Success (200/201)

\`\`\`json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "createdAt": "ISO8601"
  }
}
\`\`\`

#### Errors

| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid request body |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |

### Example

\`\`\`bash
curl -X POST http://localhost:3001/api/resource \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
\`\`\`
```

## Étape 3 : Output

Afficher la documentation générée en markdown.

Ne PAS créer de fichier .md sauf si explicitement demandé.

## Conventions

- Utiliser JSDoc pour la documentation inline du code
- Exemples concrets et fonctionnels
- Types TypeScript précis
- Couvrir les cas d'erreur
