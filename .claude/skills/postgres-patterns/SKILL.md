---
name: postgres-patterns
description: Patterns PostgreSQL optimisés. Queries, indexes, transactions. Chargé pour work sur la DB.
allowed-tools: Read, Write, Edit, Glob
---

# PostgreSQL Patterns

Patterns et bonnes pratiques pour PostgreSQL dans un contexte Node.js/TypeScript.

## Connection Pool

```typescript
import { Pool, PoolClient } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000,
});

// Health check
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows;
}

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}
```

## Parameterized Queries (Anti-Injection)

```typescript
// ✅ TOUJOURS paramétré
const users = await query<User>(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// ✅ Multiple params
const posts = await query<Post>(
  'SELECT * FROM posts WHERE user_id = $1 AND created_at > $2 LIMIT $3',
  [userId, since, limit]
);

// ❌ JAMAIS de concaténation
const users = await query(`SELECT * FROM users WHERE email = '${email}'`); // SQL INJECTION!
```

## Transactions

```typescript
async function transferCredits(fromId: string, toId: string, amount: number): Promise<void> {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Vérifier le solde
    const { rows } = await client.query(
      'SELECT credits FROM users WHERE id = $1 FOR UPDATE',
      [fromId]
    );

    if (rows[0].credits < amount) {
      throw new InsufficientCreditsError();
    }

    // Débit
    await client.query(
      'UPDATE users SET credits = credits - $1 WHERE id = $2',
      [amount, fromId]
    );

    // Crédit
    await client.query(
      'UPDATE users SET credits = credits + $1 WHERE id = $2',
      [amount, toId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

## Batch Inserts

```typescript
// ✅ Insert multiple rows efficiently
async function insertVotes(votes: Vote[]): Promise<void> {
  if (votes.length === 0) return;

  const values = votes.map((_, i) => {
    const base = i * 4;
    return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
  }).join(', ');

  const params = votes.flatMap((v) => [v.id, v.postId, v.voterId, v.voteType]);

  await query(
    `INSERT INTO votes (id, post_id, voter_id, vote_type) VALUES ${values}`,
    params
  );
}
```

## UPSERT (INSERT ... ON CONFLICT)

```typescript
// Insert or update
async function upsertVote(vote: Vote): Promise<Vote> {
  const [result] = await query<Vote>(
    `INSERT INTO votes (id, post_id, voter_id, vote_type)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (post_id, voter_id)
     DO UPDATE SET vote_type = EXCLUDED.vote_type, updated_at = NOW()
     RETURNING *`,
    [vote.id, vote.postId, vote.voterId, vote.voteType]
  );
  return result;
}
```

## Pagination

```typescript
interface PaginationParams {
  limit: number;
  offset: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

async function getPaginatedPosts(
  params: PaginationParams
): Promise<PaginatedResult<Post>> {
  // Requête avec count dans un CTE
  const result = await query<Post & { total_count: string }>(
    `WITH counted AS (
       SELECT *, COUNT(*) OVER() as total_count
       FROM posts
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2
     )
     SELECT * FROM counted`,
    [params.limit, params.offset]
  );

  const total = result[0] ? parseInt(result[0].total_count, 10) : 0;

  return {
    data: result.map(({ total_count, ...post }) => post as Post),
    total,
    hasMore: params.offset + result.length < total,
  };
}
```

## Aggregations

```typescript
// Votes count by type for a post
async function getVoteCounts(postId: string): Promise<VoteCounts> {
  const [result] = await query<VoteCounts>(
    `SELECT
       COUNT(*) FILTER (WHERE vote_type = 'bullshit') as bullshit,
       COUNT(*) FILTER (WHERE vote_type = 'solid') as solid,
       COUNT(*) FILTER (WHERE vote_type = 'scam') as scam,
       COUNT(*) FILTER (WHERE vote_type = 'guru') as guru,
       COUNT(*) as total
     FROM votes
     WHERE post_id = $1`,
    [postId]
  );
  return result;
}
```

## Indexes

```sql
-- Primary key (auto-indexed)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

-- Unique constraint (auto-indexed)
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);

-- Foreign keys (ALWAYS index manually)
CREATE INDEX idx_votes_post_id ON votes(post_id);
CREATE INDEX idx_votes_voter_id ON votes(voter_id);

-- Composite for specific queries
CREATE INDEX idx_votes_post_voter ON votes(post_id, voter_id);

-- Partial index (for filtered queries)
CREATE INDEX idx_active_users ON users(id) WHERE active = true;

-- Expression index
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- Covering index (include columns to avoid table lookup)
CREATE INDEX idx_posts_user_covering ON posts(user_id) INCLUDE (title, created_at);
```

## Views for Complex Queries

```sql
-- Materialized view for leaderboard (refresh periodically)
CREATE MATERIALIZED VIEW leaderboard AS
SELECT
  p.id,
  p.urn,
  p.content,
  p.created_at,
  COUNT(v.id) as total_votes,
  COUNT(v.id) FILTER (WHERE v.vote_type = 'bullshit') as bullshit_count,
  COUNT(v.id) FILTER (WHERE v.vote_type = 'solid') as solid_count,
  COUNT(v.id) FILTER (WHERE v.vote_type = 'scam') as scam_count
FROM posts p
LEFT JOIN votes v ON v.post_id = p.id
GROUP BY p.id;

-- Index on materialized view
CREATE INDEX idx_leaderboard_total ON leaderboard(total_votes DESC);

-- Refresh (call periodically or on trigger)
REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;
```

## JSON Operations

```typescript
// Store JSON data
await query(
  `INSERT INTO events (id, type, data) VALUES ($1, $2, $3)`,
  [id, 'VOTE_SUBMITTED', JSON.stringify({ postId, voteType })]
);

// Query JSON
const events = await query<Event>(
  `SELECT * FROM events WHERE data->>'postId' = $1`,
  [postId]
);

// Update JSON field
await query(
  `UPDATE users SET preferences = preferences || $1 WHERE id = $2`,
  [JSON.stringify({ theme: 'dark' }), userId]
);
```

## Full Text Search

```sql
-- Add tsvector column
ALTER TABLE posts ADD COLUMN search_vector tsvector;

-- Update vector
UPDATE posts SET search_vector = to_tsvector('english', content);

-- Create GIN index
CREATE INDEX idx_posts_search ON posts USING GIN(search_vector);

-- Search
SELECT * FROM posts
WHERE search_vector @@ plainto_tsquery('english', 'linkedin bullshit')
ORDER BY ts_rank(search_vector, plainto_tsquery('english', 'linkedin bullshit')) DESC;
```

Voir [patterns.md](patterns.md) pour les migrations et schémas avancés.
