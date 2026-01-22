import { createGetLeaderboardUseCase } from '../../../../src/application/use-cases/GetLeaderboardUseCase.js'
import { createInMemoryLeaderboardRepository } from '../../../../src/adapters/out/persistence/InMemoryLeaderboardRepository.js'
import type { IGetLeaderboardUseCase } from '../../../../src/application/use-cases/GetLeaderboardUseCase.js'
import type { InMemoryLeaderboardRepositoryWithState } from '../../../../src/adapters/out/persistence/InMemoryLeaderboardRepository.js'
import type { LeaderboardEntryDto } from '@linkedout/core'

describe('GetLeaderboardUseCase', () => {
  let useCase: IGetLeaderboardUseCase
  let repository: InMemoryLeaderboardRepositoryWithState

  const createEntry = (overrides: Partial<LeaderboardEntryDto> = {}): LeaderboardEntryDto => ({
    id: 'post-1',
    urn: '1234567890',
    content: 'Some post',
    createdAt: '2024-01-01T00:00:00.000Z',
    totalVotes: 5,
    votes: {
      solid: 0,
      interesting: 0,
      salesman: 0,
      bullshit: 0,
      scam: 0,
      guru: 0,
      theater: 0,
    },
    ...overrides,
  })

  beforeEach(() => {
    repository = createInMemoryLeaderboardRepository()
    useCase = createGetLeaderboardUseCase(repository)
  })

  describe('execute', () => {
    it('should return empty array when no entries', async () => {
      const result = await useCase.execute({})
      expect(result).toEqual([])
    })

    it('should return all entries sorted by totalVotes', async () => {
      repository.setEntries([
        createEntry({ id: 'p1', totalVotes: 3 }),
        createEntry({ id: 'p2', totalVotes: 10 }),
        createEntry({ id: 'p3', totalVotes: 5 }),
      ])

      const result = await useCase.execute({})

      expect(result[0]!.id).toBe('p2')
      expect(result[1]!.id).toBe('p3')
      expect(result[2]!.id).toBe('p1')
    })

    it('should apply default limit of 20', async () => {
      const entries = Array.from({ length: 25 }, (_, i) =>
        createEntry({ id: `p${i}`, totalVotes: 25 - i })
      )
      repository.setEntries(entries)

      const result = await useCase.execute({})
      expect(result).toHaveLength(20)
    })

    it('should respect custom limit', async () => {
      const entries = Array.from({ length: 10 }, (_, i) =>
        createEntry({ id: `p${i}`, totalVotes: 10 - i })
      )
      repository.setEntries(entries)

      const result = await useCase.execute({ limit: 5 })
      expect(result).toHaveLength(5)
    })

    it('should respect offset', async () => {
      const entries = Array.from({ length: 10 }, (_, i) =>
        createEntry({ id: `p${i}`, totalVotes: 10 - i })
      )
      repository.setEntries(entries)

      const result = await useCase.execute({ offset: 5, limit: 3 })
      expect(result).toHaveLength(3)
      expect(result[0]!.id).toBe('p5')
    })

    it('should filter by vote type when provided', async () => {
      repository.setEntries([
        createEntry({ id: 'p1', votes: { ...createEntry().votes, bullshit: 5 }, totalVotes: 5 }),
        createEntry({ id: 'p2', votes: { ...createEntry().votes, solid: 3 }, totalVotes: 3 }),
        createEntry({ id: 'p3', votes: { ...createEntry().votes, bullshit: 2 }, totalVotes: 2 }),
      ])

      const result = await useCase.execute({ voteType: 'bullshit' })

      expect(result).toHaveLength(2)
      expect(result[0]!.id).toBe('p1')
      expect(result[1]!.id).toBe('p3')
    })

    it('should sort by specific vote type count when filtered', async () => {
      repository.setEntries([
        createEntry({ id: 'p1', votes: { ...createEntry().votes, guru: 2 }, totalVotes: 10 }),
        createEntry({ id: 'p2', votes: { ...createEntry().votes, guru: 8 }, totalVotes: 8 }),
      ])

      const result = await useCase.execute({ voteType: 'guru' })

      expect(result[0]!.id).toBe('p2')
      expect(result[1]!.id).toBe('p1')
    })

    it('should use default offset of 0', async () => {
      repository.setEntries([
        createEntry({ id: 'p1', totalVotes: 10 }),
        createEntry({ id: 'p2', totalVotes: 5 }),
      ])

      const result = await useCase.execute({ limit: 1 })
      expect(result[0]!.id).toBe('p1')
    })
  })
})
