import type { Pool } from 'pg'
import type { IVoteRepository, VoteCount, Vote, PostId, VoterId, VoteType } from '@linkedout/core'
import { reconstituteVote, createVoteId, createPostId, createVoterId } from '@linkedout/core'

export class PostgresVoteRepository implements IVoteRepository {
  constructor(private readonly pool: Pool) {}

  async findByPostAndVoter(postId: PostId, voterId: VoterId): Promise<Vote | null> {
    const result = await this.pool.query(
      'SELECT id, post_id, voter_id, vote_type, created_at FROM votes WHERE post_id = $1 AND voter_id = $2',
      [postId, voterId]
    )

    if (result.rows.length === 0) return null

    return this.toDomain(result.rows[0])
  }

  async save(vote: Vote): Promise<void> {
    await this.pool.query(
      'INSERT INTO votes (id, post_id, voter_id, vote_type, created_at) VALUES ($1, $2, $3, $4, $5)',
      [vote.id, vote.postId, vote.voterId, vote.voteType, vote.createdAt]
    )
  }

  async update(vote: Vote): Promise<void> {
    await this.pool.query(
      'UPDATE votes SET vote_type = $1 WHERE id = $2',
      [vote.voteType, vote.id]
    )
  }

  async countByPost(postId: PostId): Promise<VoteCount[]> {
    const result = await this.pool.query(
      `SELECT vote_type, COUNT(*)::int as count
       FROM votes
       WHERE post_id = $1
       GROUP BY vote_type`,
      [postId]
    )

    return result.rows.map((row) => ({
      postId,
      voteType: row.vote_type as VoteType,
      count: row.count,
    }))
  }

  private toDomain(row: {
    id: string
    post_id: string
    voter_id: string
    vote_type: string
    created_at: Date
  }): Vote {
    return reconstituteVote(
      createVoteId(row.id),
      createPostId(row.post_id),
      createVoterId(row.voter_id),
      row.vote_type as VoteType,
      row.created_at
    )
  }
}
