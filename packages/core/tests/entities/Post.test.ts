import { createPost, reconstitutePost, generatePostId, createPostId } from '../../src/entities/Post.js'
import { createPostUrn } from '../../src/value-objects/PostUrn.js'

describe('Post', () => {
  const urn = createPostUrn('1234567890')

  describe('createPost', () => {
    it('should create a post with valid data', () => {
      const id = createPostId('post-1')
      const post = createPost(id, urn, 'Some LinkedIn content')

      expect(post.id).toBe('post-1')
      expect(post.urn).toBe(urn)
      expect(post.content).toBe('Some LinkedIn content')
      expect(post.createdAt).toBeInstanceOf(Date)
    })

    it('should trim content', () => {
      const post = createPost(createPostId('p1'), urn, '  content with spaces  ')
      expect(post.content).toBe('content with spaces')
    })

    it('should throw for empty content', () => {
      expect(() => createPost(createPostId('p1'), urn, '')).toThrow('Post content cannot be empty')
    })

    it('should throw for whitespace-only content', () => {
      expect(() => createPost(createPostId('p1'), urn, '   ')).toThrow('Post content cannot be empty')
    })

    it('should set createdAt to current time', () => {
      const before = new Date()
      const post = createPost(createPostId('p1'), urn, 'content')
      const after = new Date()

      expect(post.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(post.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })

  describe('reconstitutePost', () => {
    it('should reconstitute with exact values', () => {
      const date = new Date('2024-06-15T10:30:00Z')
      const post = reconstitutePost(createPostId('p1'), urn, 'content', date)

      expect(post.id).toBe('p1')
      expect(post.urn).toBe(urn)
      expect(post.content).toBe('content')
      expect(post.createdAt).toBe(date)
    })
  })

  describe('generatePostId', () => {
    it('should generate unique IDs', () => {
      const id1 = generatePostId()
      const id2 = generatePostId()
      expect(id1).not.toBe(id2)
    })

    it('should generate UUID format', () => {
      const id = generatePostId()
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    })
  })
})
