import type { Post, PostId, IPostRepository, PostUrn } from '@linkedout/core'
import { postUrnEquals } from '@linkedout/core'

export type InMemoryPostRepositoryWithClear = IPostRepository & {
  clear(): void
}

export const createInMemoryPostRepository = (): InMemoryPostRepositoryWithClear => {
  const posts = new Map<string, Post>()

  return {
    findById: async (id: PostId): Promise<Post | null> => {
      return posts.get(id) ?? null
    },

    findByUrn: async (urn: PostUrn): Promise<Post | null> => {
      for (const post of posts.values()) {
        if (postUrnEquals(post.urn, urn)) {
          return post
        }
      }
      return null
    },

    save: async (post: Post): Promise<void> => {
      posts.set(post.id, post)
    },

    clear: (): void => {
      posts.clear()
    }
  }
}
