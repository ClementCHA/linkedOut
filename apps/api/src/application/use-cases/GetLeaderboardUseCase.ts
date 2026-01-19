import type { LeaderboardEntryDto, VoteType } from '@linkedout/core'

export interface GetLeaderboardQuery {
  voteType?: VoteType
  limit?: number
  offset?: number
}

export interface IGetLeaderboardUseCase {
  execute(query: GetLeaderboardQuery): Promise<LeaderboardEntryDto[]>
}

// This interface extends what we need from the database
export interface ILeaderboardRepository {
  getLeaderboard(voteType?: VoteType, limit?: number, offset?: number): Promise<LeaderboardEntryDto[]>
}

export const createGetLeaderboardUseCase = (
  leaderboardRepository: ILeaderboardRepository
): IGetLeaderboardUseCase => ({
  async execute(query: GetLeaderboardQuery): Promise<LeaderboardEntryDto[]> {
    const limit = query.limit ?? 20
    const offset = query.offset ?? 0

    return leaderboardRepository.getLeaderboard(query.voteType, limit, offset)
  },
})
