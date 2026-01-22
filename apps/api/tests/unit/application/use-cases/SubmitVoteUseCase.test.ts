import { createSubmitVoteUseCase } from '../../../../src/application/use-cases/SubmitVoteUseCase.js'
import { createInMemoryPostRepository } from '../../../../src/adapters/out/persistence/InMemoryPostRepository.js'
import { createInMemoryVoteRepository } from '../../../../src/adapters/out/persistence/InMemoryVoteRepository.js'
import { InvalidVoteTypeError } from '@linkedout/core'
import type { ISubmitVoteUseCase } from '../../../../src/application/use-cases/SubmitVoteUseCase.js'
import type { InMemoryPostRepositoryWithClear } from '../../../../src/adapters/out/persistence/InMemoryPostRepository.js'
import type { InMemoryVoteRepositoryWithClear } from '../../../../src/adapters/out/persistence/InMemoryVoteRepository.js'

describe('SubmitVoteUseCase', () => {
  let useCase: ISubmitVoteUseCase
  let postRepository: InMemoryPostRepositoryWithClear
  let voteRepository: InMemoryVoteRepositoryWithClear

  beforeEach(() => {
    postRepository = createInMemoryPostRepository()
    voteRepository = createInMemoryVoteRepository()
    useCase = createSubmitVoteUseCase(postRepository, voteRepository)
  })

  const validCommand = {
    urn: '1234567890',
    content: 'Some LinkedIn post about synergy and disruption',
    voteType: 'bullshit',
    voterId: 'voter-abc-123',
  }

  describe('execute', () => {
    it('should create a new post and vote when post does not exist', async () => {
      const result = await useCase.execute(validCommand)

      expect(result.urn).toBe('1234567890')
      expect(result.content).toBe('Some LinkedIn post about synergy and disruption')
      expect(result.totalVotes).toBe(1)
      expect(result.votes.bullshit).toBe(1)
    })

    it('should return all vote type counts initialized to 0', async () => {
      const result = await useCase.execute(validCommand)

      expect(result.votes.solid).toBe(0)
      expect(result.votes.interesting).toBe(0)
      expect(result.votes.salesman).toBe(0)
      expect(result.votes.scam).toBe(0)
      expect(result.votes.guru).toBe(0)
      expect(result.votes.theater).toBe(0)
    })

    it('should reuse existing post when URN already exists', async () => {
      await useCase.execute(validCommand)

      const result = await useCase.execute({
        ...validCommand,
        voterId: 'voter-different',
        voteType: 'solid',
      })

      expect(result.urn).toBe('1234567890')
      expect(result.totalVotes).toBe(2)
      expect(result.votes.bullshit).toBe(1)
      expect(result.votes.solid).toBe(1)
    })

    it('should update vote when same voter votes again on same post', async () => {
      await useCase.execute(validCommand)

      const result = await useCase.execute({
        ...validCommand,
        voteType: 'solid',
      })

      expect(result.totalVotes).toBe(1)
      expect(result.votes.bullshit).toBe(0)
      expect(result.votes.solid).toBe(1)
    })

    it('should throw InvalidVoteTypeError for invalid vote type', async () => {
      await expect(
        useCase.execute({ ...validCommand, voteType: 'invalid' })
      ).rejects.toThrow(InvalidVoteTypeError)
    })

    it('should throw for empty URN', async () => {
      await expect(
        useCase.execute({ ...validCommand, urn: '' })
      ).rejects.toThrow('Invalid post ID')
    })

    it('should throw for empty voterId', async () => {
      await expect(
        useCase.execute({ ...validCommand, voterId: '' })
      ).rejects.toThrow('VoterId cannot be empty')
    })

    it('should handle multiple voters on the same post', async () => {
      await useCase.execute({ ...validCommand, voterId: 'voter-1', voteType: 'bullshit' })
      await useCase.execute({ ...validCommand, voterId: 'voter-2', voteType: 'bullshit' })
      const result = await useCase.execute({ ...validCommand, voterId: 'voter-3', voteType: 'guru' })

      expect(result.totalVotes).toBe(3)
      expect(result.votes.bullshit).toBe(2)
      expect(result.votes.guru).toBe(1)
    })

    it('should accept all valid vote types', async () => {
      const types = ['solid', 'interesting', 'salesman', 'bullshit', 'scam', 'guru', 'theater']

      for (let i = 0; i < types.length; i++) {
        const result = await useCase.execute({
          urn: `${1000 + i}`,
          content: `Post ${i}`,
          voteType: types[i]!,
          voterId: `voter-${i}`,
        })
        expect(result.votes[types[i] as keyof typeof result.votes]).toBe(1)
      }
    })

    it('should return ISO string for createdAt', async () => {
      const result = await useCase.execute(validCommand)
      expect(() => new Date(result.createdAt)).not.toThrow()
      expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })

    it('should return the post id', async () => {
      const result = await useCase.execute(validCommand)
      expect(result.id).toBeDefined()
      expect(typeof result.id).toBe('string')
      expect(result.id.length).toBeGreaterThan(0)
    })
  })
})
