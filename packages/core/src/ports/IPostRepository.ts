import type { Post, PostId } from '../entities/Post.js'
import type { PostUrn } from '../value-objects/PostUrn.js'

export interface IPostRepository {
  findById(id: PostId): Promise<Post | null>
  findByUrn(urn: PostUrn): Promise<Post | null>
  save(post: Post): Promise<void>
}
