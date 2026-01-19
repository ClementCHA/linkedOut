import type { Pool } from 'pg'
import type { IPostRepository, Post, PostId, PostUrn } from '@linkedout/core'
import { reconstitutePost, createPostId, createPostUrn } from '@linkedout/core'

export class PostgresPostRepository implements IPostRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: PostId): Promise<Post | null> {
    const result = await this.pool.query(
      'SELECT id, urn, content, created_at FROM posts WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) return null

    return this.toDomain(result.rows[0])
  }

  async findByUrn(urn: PostUrn): Promise<Post | null> {
    const result = await this.pool.query(
      'SELECT id, urn, content, created_at FROM posts WHERE urn = $1',
      [urn]
    )

    if (result.rows.length === 0) return null

    return this.toDomain(result.rows[0])
  }

  async save(post: Post): Promise<void> {
    await this.pool.query(
      'INSERT INTO posts (id, urn, content, created_at) VALUES ($1, $2, $3, $4)',
      [post.id, post.urn, post.content, post.createdAt]
    )
  }

  private toDomain(row: { id: string; urn: string; content: string; created_at: Date }): Post {
    return reconstitutePost(
      createPostId(row.id),
      createPostUrn(row.urn),
      row.content,
      row.created_at
    )
  }
}
