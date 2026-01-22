# LinkedOut - API Conventions

## Base URL

```
Development: http://localhost:3001/api
Production:  https://api.linkedout.app/api
```

## Authentication

Actuellement : **Aucune** (MVP)

Future : Bearer token dans le header `Authorization`

```
Authorization: Bearer <token>
```

## Request Format

### Headers

```
Content-Type: application/json
Accept: application/json
```

### Body (POST/PUT/PATCH)

```json
{
  "field1": "value",
  "field2": 123
}
```

## Response Format

### Success - Single Resource

```json
{
  "data": {
    "id": "uuid",
    "field": "value",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Success - Collection

```json
{
  "data": [
    { "id": "uuid1", "field": "value1" },
    { "id": "uuid2", "field": "value2" }
  ],
  "meta": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

### Error

```json
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

## HTTP Status Codes

| Code | Usage |
|------|-------|
| `200 OK` | GET success, PUT/PATCH success |
| `201 Created` | POST success (resource created) |
| `204 No Content` | DELETE success |
| `400 Bad Request` | Validation error, malformed request |
| `401 Unauthorized` | Missing or invalid authentication |
| `403 Forbidden` | Authenticated but not authorized |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Resource conflict (duplicate email, etc.) |
| `422 Unprocessable Entity` | Business logic error |
| `500 Internal Server Error` | Unexpected server error |

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input format |
| `INVALID_EMAIL` | 400 | Email format invalid |
| `INVALID_VOTE_TYPE` | 400 | Vote type not recognized |
| `NOT_FOUND` | 404 | Resource not found |
| `USER_NOT_FOUND` | 404 | User ID not found |
| `POST_NOT_FOUND` | 404 | Post URN not found |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Endpoints

### Users

```
GET    /api/users          List all users
GET    /api/users/:id      Get user by ID
POST   /api/users          Create user
```

### Votes

```
POST   /api/votes                    Submit a vote
GET    /api/votes/leaderboard        Get leaderboard
```

## Pagination

Query parameters :
- `limit` : Number of items (default: 20, max: 100)
- `offset` : Number of items to skip (default: 0)

```
GET /api/votes/leaderboard?limit=10&offset=20
```

## Filtering

Query parameters spécifiques à chaque endpoint :

```
GET /api/votes/leaderboard?type=bullshit    # Filter by vote type
```

## Date Format

Toutes les dates en **ISO 8601** :

```
2024-01-15T10:30:00.000Z
```

## ID Format

Tous les IDs sont des **UUID v4** :

```
550e8400-e29b-41d4-a716-446655440000
```

Exception : `voterId` (généré par l'extension, aussi UUID v4 mais non vérifié côté serveur)
