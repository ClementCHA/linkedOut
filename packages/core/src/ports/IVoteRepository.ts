import type { Vote } from '../entities/Vote.js'
import type { PostId } from '../entities/Post.js'
import type { VoterId } from '../value-objects/VoterId.js'
import type { VoteType } from '../value-objects/VoteType.js'

export interface VoteCount {
  postId: PostId
  voteType: VoteType
  count: number
}

export interface IVoteRepository {
  findByPostAndVoter(postId: PostId, voterId: VoterId): Promise<Vote | null>
  save(vote: Vote): Promise<void>
  update(vote: Vote): Promise<void>
  countByPost(postId: PostId): Promise<VoteCount[]>
}
