import { createVoterId, voterIdEquals } from '../../src/value-objects/VoterId.js'

describe('VoterId', () => {
  describe('createVoterId', () => {
    it('should create a valid VoterId', () => {
      const id = createVoterId('voter-123')
      expect(id).toBe('voter-123')
    })

    it('should trim whitespace', () => {
      const id = createVoterId('  voter-123  ')
      expect(id).toBe('voter-123')
    })

    it('should throw for empty string', () => {
      expect(() => createVoterId('')).toThrow('VoterId cannot be empty')
    })

    it('should throw for whitespace-only string', () => {
      expect(() => createVoterId('   ')).toThrow('VoterId cannot be empty')
    })
  })

  describe('voterIdEquals', () => {
    it('should return true for equal IDs', () => {
      const a = createVoterId('voter-1')
      const b = createVoterId('voter-1')
      expect(voterIdEquals(a, b)).toBe(true)
    })

    it('should return false for different IDs', () => {
      const a = createVoterId('voter-1')
      const b = createVoterId('voter-2')
      expect(voterIdEquals(a, b)).toBe(false)
    })
  })
})
