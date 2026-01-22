import type { LeaderboardEntryDto, VoteType } from '@linkedout/core'
import type { ILeaderboardRepository } from '../../../application/use-cases/GetLeaderboardUseCase.js'

export type InMemoryLeaderboardRepositoryWithState = ILeaderboardRepository & {
  setEntries(entries: LeaderboardEntryDto[]): void
  clear(): void
}

export const createInMemoryLeaderboardRepository = (): InMemoryLeaderboardRepositoryWithState => {
  let entries: LeaderboardEntryDto[] = []

  return {
    getLeaderboard: async (
      voteType?: VoteType,
      limit?: number,
      offset?: number
    ): Promise<LeaderboardEntryDto[]> => {
      let result = [...entries]

      if (voteType) {
        result = result.filter((entry) => entry.votes[voteType] > 0)
        result.sort((a, b) => b.votes[voteType] - a.votes[voteType])
      } else {
        result.sort((a, b) => b.totalVotes - a.totalVotes)
      }

      const start = offset ?? 0
      const end = start + (limit ?? 20)
      return result.slice(start, end)
    },

    setEntries: (newEntries: LeaderboardEntryDto[]): void => {
      entries = [...newEntries]
    },

    clear: (): void => {
      entries = []
    }
  }
}
