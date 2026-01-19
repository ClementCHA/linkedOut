import type { PostId } from './Post.js'
import type { VoterId } from '../value-objects/VoterId.js'
import type { VoteType } from '../value-objects/VoteType.js'

export type VoteId = string & { readonly __brand: 'VoteId' }

export type Vote = Readonly<{
  id: VoteId
  postId: PostId
  voterId: VoterId
  voteType: VoteType
  createdAt: Date
}>

export const createVote = (
  id: VoteId,
  postId: PostId,
  voterId: VoterId,
  voteType: VoteType
): Vote => ({
  id,
  postId,
  voterId,
  voteType,
  createdAt: new Date(),
})

export const reconstituteVote = (
  id: VoteId,
  postId: PostId,
  voterId: VoterId,
  voteType: VoteType,
  createdAt: Date
): Vote => ({
  id,
  postId,
  voterId,
  voteType,
  createdAt,
})

export const generateVoteId = (): VoteId => crypto.randomUUID() as VoteId
export const createVoteId = (value: string): VoteId => value as VoteId
