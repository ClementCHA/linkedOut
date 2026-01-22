import type { Vote, PostId, IVoteRepository, VoterId, VoteCount } from '@linkedout/core'
import { voterIdEquals } from '@linkedout/core'

export type InMemoryVoteRepositoryWithClear = IVoteRepository & {
  clear(): void
}

export const createInMemoryVoteRepository = (): InMemoryVoteRepositoryWithClear => {
  const votes = new Map<string, Vote>()

  return {
    findByPostAndVoter: async (postId: PostId, voterId: VoterId): Promise<Vote | null> => {
      for (const vote of votes.values()) {
        if (vote.postId === postId && voterIdEquals(vote.voterId, voterId)) {
          return vote
        }
      }
      return null
    },

    save: async (vote: Vote): Promise<void> => {
      votes.set(vote.id, vote)
    },

    update: async (vote: Vote): Promise<void> => {
      votes.set(vote.id, vote)
    },

    countByPost: async (postId: PostId): Promise<VoteCount[]> => {
      const counts = new Map<string, number>()
      for (const vote of votes.values()) {
        if (vote.postId === postId) {
          const current = counts.get(vote.voteType) ?? 0
          counts.set(vote.voteType, current + 1)
        }
      }
      return Array.from(counts.entries()).map(([voteType, count]) => ({
        postId,
        voteType: voteType as Vote['voteType'],
        count,
      }))
    },

    clear: (): void => {
      votes.clear()
    }
  }
}
