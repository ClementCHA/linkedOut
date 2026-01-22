import { createPostUrn, postUrnEquals } from '../../src/value-objects/PostUrn.js'

describe('PostUrn', () => {
  describe('createPostUrn', () => {
    it('should create a valid PostUrn from numeric string', () => {
      const urn = createPostUrn('1234567890')
      expect(urn).toBe('1234567890')
    })

    it('should accept single digit', () => {
      const urn = createPostUrn('1')
      expect(urn).toBe('1')
    })

    it('should accept long numeric string', () => {
      const urn = createPostUrn('12345678901234567890')
      expect(urn).toBe('12345678901234567890')
    })

    it('should throw for empty string', () => {
      expect(() => createPostUrn('')).toThrow('Invalid post ID')
    })

    it('should throw for non-numeric string', () => {
      expect(() => createPostUrn('abc')).toThrow('Invalid post ID')
    })

    it('should throw for mixed alphanumeric', () => {
      expect(() => createPostUrn('123abc')).toThrow('Invalid post ID')
    })

    it('should throw for string with spaces', () => {
      expect(() => createPostUrn('123 456')).toThrow('Invalid post ID')
    })

    it('should throw for string with special characters', () => {
      expect(() => createPostUrn('123-456')).toThrow('Invalid post ID')
    })
  })

  describe('postUrnEquals', () => {
    it('should return true for equal URNs', () => {
      const a = createPostUrn('12345')
      const b = createPostUrn('12345')
      expect(postUrnEquals(a, b)).toBe(true)
    })

    it('should return false for different URNs', () => {
      const a = createPostUrn('12345')
      const b = createPostUrn('67890')
      expect(postUrnEquals(a, b)).toBe(false)
    })
  })
})
