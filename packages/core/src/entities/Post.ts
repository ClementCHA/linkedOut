import type { PostUrn } from '../value-objects/PostUrn.js'

export type PostId = string & { readonly __brand: 'PostId' }

export type Post = Readonly<{
  id: PostId
  urn: PostUrn
  content: string
  createdAt: Date
}>

export const createPost = (id: PostId, urn: PostUrn, content: string): Post => {
  if (!content || content.trim() === '') {
    throw new Error('Post content cannot be empty')
  }
  return {
    id,
    urn,
    content: content.trim(),
    createdAt: new Date(),
  }
}

export const reconstitutePost = (
  id: PostId,
  urn: PostUrn,
  content: string,
  createdAt: Date
): Post => ({
  id,
  urn,
  content,
  createdAt,
})

export const generatePostId = (): PostId => crypto.randomUUID() as PostId
export const createPostId = (value: string): PostId => value as PostId
