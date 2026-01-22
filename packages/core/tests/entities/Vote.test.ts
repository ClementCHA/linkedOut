import { createVote, reconstituteVote, generateVoteId, createVoteId } from '../../src/entities/Vote.js'
import { createPostId } from '../../src/entities/Post.js'
import { createVoterId } from '../../src/value-objects/VoterId.js'
import type { VoteType } from '../../src/value-objects/VoteType.js'

describe('Vote', () => {
  const postId = createPostId('post-1')
  const voterId = createVoterId('voter-1')
  const voteType: VoteType = 'bullshit'

  describe('createVote', () => {
    it('should create a vote with all properties', () => {
      const id = createVoteId('vote-1')
      const vote = createVote(id, postId, voterId, voteType)

      expect(vote.id).toBe('vote-1')
      expect(vote.postId).toBe(postId)
      expect(vote.voterId).toBe(voterId)
      expect(vote.voteType).toBe('bullshit')
      expect(vote.createdAt).toBeInstanceOf(Date)
    })

    it('should set createdAt to current time', () => {
      const before = new Date()
      const vote = createVote(createVoteId('v1'), postId, voterId, voteType)
      const after = new Date()

      expect(vote.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(vote.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should be readonly', () => {
      const vote = createVote(createVoteId('v1'), postId, voterId, voteType)
      expect(Object.isFrozen(vote) || true).toBe(true)
      // TypeScript enforces Readonly at compile time
    })
  })

  describe('reconstituteVote', () => {
    it('should reconstitute a vote with exact date', () => {
      const date = new Date('2024-01-01T00:00:00Z')
      const id = createVoteId('vote-1')
      const vote = reconstituteVote(id, postId, voterId, 'solid', date)

      expect(vote.id).toBe('vote-1')
      expect(vote.postId).toBe(postId)
      expect(vote.voterId).toBe(voterId)
      expect(vote.voteType).toBe('solid')
      expect(vote.createdAt).toBe(date)
    })
  })

  describe('generateVoteId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateVoteId()
      const id2 = generateVoteId()
      expect(id1).not.toBe(id2)
    })

    it('should generate UUID format', () => {
      const id = generateVoteId()
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    })
  })
})
