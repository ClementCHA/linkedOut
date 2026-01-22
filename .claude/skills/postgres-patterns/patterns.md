# PostgreSQL Advanced Patterns

## Schema Design

### LinkedOut Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_email UNIQUE (email),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  urn VARCHAR(50) NOT NULL,
  content TEXT,
  author VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_urn UNIQUE (urn)
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  voter_id VARCHAR(50) NOT NULL, -- Anonymous voter ID from extension
  vote_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_vote UNIQUE (post_id, voter_id),
  CONSTRAINT valid_vote_type CHECK (vote_type IN (
    'solid', 'interesting', 'salesman', 'bullshit', 'scam', 'guru', 'theater'
  ))
);

-- Indexes
CREATE INDEX idx_votes_post_id ON votes(post_id);
CREATE INDEX idx_votes_voter_id ON votes(voter_id);
CREATE INDEX idx_votes_type ON votes(vote_type);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

### Auto-update updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votes_updated_at
  BEFORE UPDATE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Repository Pattern

```typescript
// adapters/out/persistence/PostgresVoteRepository.ts
import { Pool } from 'pg';
import { IVoteRepository, Vote, VoteType, VoteCounts } from '@linkedout/core';

export class PostgresVoteRepository implements IVoteRepository {
  constructor(private readonly pool: Pool) {}

  async findByPostAndVoter(postId: string, voterId: string): Promise<Vote | null> {
    const { rows } = await this.pool.query<DbVote>(
      `SELECT * FROM votes WHERE post_id = $1 AND voter_id = $2`,
      [postId, voterId]
    );
    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async save(vote: Vote): Promise<void> {
    await this.pool.query(
      `INSERT INTO votes (id, post_id, voter_id, vote_type, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (post_id, voter_id)
       DO UPDATE SET vote_type = EXCLUDED.vote_type, updated_at = NOW()`,
      [vote.id, vote.postId, vote.voterId, vote.voteType, vote.createdAt]
    );
  }

  async countByPost(postId: string): Promise<VoteCounts> {
    const { rows } = await this.pool.query<VoteCounts>(
      `SELECT
         COALESCE(COUNT(*) FILTER (WHERE vote_type = 'bullshit'), 0)::int as bullshit,
         COALESCE(COUNT(*) FILTER (WHERE vote_type = 'solid'), 0)::int as solid,
         COALESCE(COUNT(*) FILTER (WHERE vote_type = 'scam'), 0)::int as scam,
         COALESCE(COUNT(*) FILTER (WHERE vote_type = 'guru'), 0)::int as guru,
         COALESCE(COUNT(*) FILTER (WHERE vote_type = 'theater'), 0)::int as theater,
         COALESCE(COUNT(*) FILTER (WHERE vote_type = 'salesman'), 0)::int as salesman,
         COALESCE(COUNT(*) FILTER (WHERE vote_type = 'interesting'), 0)::int as interesting,
         COUNT(*)::int as total
       FROM votes
       WHERE post_id = $1`,
      [postId]
    );
    return rows[0];
  }

  private toDomain(row: DbVote): Vote {
    return {
      id: row.id,
      postId: row.post_id,
      voterId: row.voter_id,
      voteType: row.vote_type as VoteType,
      createdAt: row.created_at,
    };
  }
}

interface DbVote {
  id: string;
  post_id: string;
  voter_id: string;
  vote_type: string;
  created_at: Date;
  updated_at: Date;
}
```

## Performance Queries

### Leaderboard Query

```sql
-- Top bullshit posts
SELECT
  p.id,
  p.urn,
  p.content,
  COUNT(v.id) as total_votes,
  COUNT(v.id) FILTER (WHERE v.vote_type = 'bullshit') as bullshit_count
FROM posts p
JOIN votes v ON v.post_id = p.id
GROUP BY p.id
HAVING COUNT(v.id) FILTER (WHERE v.vote_type = 'bullshit') > 0
ORDER BY bullshit_count DESC, total_votes DESC
LIMIT 20;
```

### With Cursor Pagination (Better for large datasets)

```sql
-- First page
SELECT * FROM posts
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Next page (using last item's values as cursor)
SELECT * FROM posts
WHERE (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

## Migrations

### Migration Template

```sql
-- migrations/001_initial_schema.sql
-- Description: Create initial tables

BEGIN;

-- Up
CREATE TABLE IF NOT EXISTS users (...);
CREATE TABLE IF NOT EXISTS posts (...);
CREATE TABLE IF NOT EXISTS votes (...);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_votes_post_id ON votes(post_id);

COMMIT;

-- Down (commented, run manually to rollback)
-- BEGIN;
-- DROP TABLE IF EXISTS votes CASCADE;
-- DROP TABLE IF EXISTS posts CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- COMMIT;
```

### Add Column with Default

```sql
-- migrations/002_add_user_status.sql
BEGIN;

-- Add column with default (no table lock in PG 11+)
ALTER TABLE users
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active';

-- Add check constraint
ALTER TABLE users
  ADD CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'banned'));

COMMIT;
```

### Rename Column Safely

```sql
-- migrations/003_rename_column.sql
BEGIN;

-- 1. Add new column
ALTER TABLE posts ADD COLUMN post_urn VARCHAR(50);

-- 2. Copy data
UPDATE posts SET post_urn = urn;

-- 3. Add constraints to new column
ALTER TABLE posts ALTER COLUMN post_urn SET NOT NULL;
ALTER TABLE posts ADD CONSTRAINT unique_post_urn UNIQUE (post_urn);

-- 4. Drop old column (in next migration after code is updated)
-- ALTER TABLE posts DROP COLUMN urn;

COMMIT;
```

## Monitoring Queries

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Slow queries
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Table sizes
SELECT
  relname as table,
  pg_size_pretty(pg_total_relation_size(relid)) as total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Index usage
SELECT
  indexrelname as index,
  idx_scan as scans,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Unused indexes
SELECT indexrelname FROM pg_stat_user_indexes WHERE idx_scan = 0;
```
