import type { Post } from '../entities/Post.js'
import type { VoteType } from '../value-objects/VoteType.js'

export type PostDto = Readonly<{
  id: string
  urn: string
  content: string
  createdAt: string
}>

export type LeaderboardEntryDto = Readonly<{
  id: string
  urn: string
  content: string
  createdAt: string
  totalVotes: number
  votes: Record<VoteType, number>
}>

export const postToDto = (post: Post): PostDto => ({
  id: post.id,
  urn: post.urn,
  content: post.content,
  createdAt: post.createdAt.toISOString(),
})
