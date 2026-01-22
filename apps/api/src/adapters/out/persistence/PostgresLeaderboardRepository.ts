import type { Pool } from 'pg'
import type { LeaderboardEntryDto, VoteType } from '@linkedout/core'
import type { ILeaderboardRepository } from '../../../application/use-cases/GetLeaderboardUseCase.js'

export class PostgresLeaderboardRepository implements ILeaderboardRepository {
  constructor(private readonly pool: Pool) {}

  async getLeaderboard(
    voteType?: VoteType,
    limit = 20,
    offset = 0
  ): Promise<LeaderboardEntryDto[]> {
    const orderByColumn = voteType ? `${voteType}_count` : 'total_votes'
    const filterClause = voteType
      ? `WHERE ${voteType}_count > 0`
      : 'WHERE total_votes > 0'

    const result = await this.pool.query(
      `SELECT
        id,
        urn,
        content,
        created_at,
        total_votes,
        bullshit_count,
        solid_count,
        interesting_count,
        salesman_count,
        scam_count,
        guru_count,
        theater_count
      FROM leaderboard
      ${filterClause}
      ORDER BY ${orderByColumn} DESC, created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    return result.rows.map((row) => ({
      id: row.id,
      urn: row.urn,
      content: row.content,
      createdAt: row.created_at.toISOString(),
      totalVotes: row.total_votes,
      votes: {
        solid: row.solid_count,
        interesting: row.interesting_count,
        salesman: row.salesman_count,
        bullshit: row.bullshit_count,
        scam: row.scam_count,
        guru: row.guru_count,
        theater: row.theater_count,
      },
    }))
  }
}
