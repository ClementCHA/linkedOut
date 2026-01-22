import {
  VOTE_TYPES,
  POSITIVE_VOTES,
  NEGATIVE_VOTES,
  isValidVoteType,
  isPositiveVote,
  isNegativeVote,
} from '../../src/value-objects/VoteType.js'
import type { VoteType } from '../../src/value-objects/VoteType.js'

describe('VoteType', () => {
  describe('VOTE_TYPES', () => {
    it('should contain exactly 7 vote types', () => {
      expect(VOTE_TYPES).toHaveLength(7)
    })

    it('should contain all expected types', () => {
      expect(VOTE_TYPES).toEqual([
        'solid', 'interesting', 'salesman', 'bullshit', 'scam', 'guru', 'theater'
      ])
    })
  })

  describe('POSITIVE_VOTES', () => {
    it('should contain solid and interesting', () => {
      expect(POSITIVE_VOTES).toEqual(['solid', 'interesting'])
    })
  })

  describe('NEGATIVE_VOTES', () => {
    it('should contain 5 negative types', () => {
      expect(NEGATIVE_VOTES).toEqual(['salesman', 'bullshit', 'scam', 'guru', 'theater'])
    })

    it('should cover all non-positive types', () => {
      const allCovered = [...POSITIVE_VOTES, ...NEGATIVE_VOTES]
      expect(allCovered.sort()).toEqual([...VOTE_TYPES].sort())
    })
  })

  describe('isValidVoteType', () => {
    it.each(VOTE_TYPES)('should return true for valid type "%s"', (type) => {
      expect(isValidVoteType(type)).toBe(true)
    })

    it('should return false for invalid type', () => {
      expect(isValidVoteType('invalid')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isValidVoteType('')).toBe(false)
    })

    it('should return false for uppercase variant', () => {
      expect(isValidVoteType('BULLSHIT')).toBe(false)
    })
  })

  describe('isPositiveVote', () => {
    it.each(POSITIVE_VOTES)('should return true for "%s"', (type) => {
      expect(isPositiveVote(type as VoteType)).toBe(true)
    })

    it.each(NEGATIVE_VOTES)('should return false for "%s"', (type) => {
      expect(isPositiveVote(type as VoteType)).toBe(false)
    })
  })

  describe('isNegativeVote', () => {
    it.each(NEGATIVE_VOTES)('should return true for "%s"', (type) => {
      expect(isNegativeVote(type as VoteType)).toBe(true)
    })

    it.each(POSITIVE_VOTES)('should return false for "%s"', (type) => {
      expect(isNegativeVote(type as VoteType)).toBe(false)
    })
  })
})
