import {
  type IPostRepository,
  type IVoteRepository,
  type VoteType,
  type LeaderboardEntryDto,
  createPostUrn,
  createVoterId,
  createPost,
  createVote,
  generatePostId,
  generateVoteId,
  isValidVoteType,
  InvalidVoteTypeError,
  VOTE_TYPES,
} from '@linkedout/core'

export interface SubmitVoteCommand {
  urn: string
  content: string
  voteType: string
  voterId: string
}

export interface ISubmitVoteUseCase {
  execute(command: SubmitVoteCommand): Promise<LeaderboardEntryDto>
}

export const createSubmitVoteUseCase = (
  postRepository: IPostRepository,
  voteRepository: IVoteRepository
): ISubmitVoteUseCase => ({
  async execute(command: SubmitVoteCommand): Promise<LeaderboardEntryDto> {
    // Validate vote type
    if (!isValidVoteType(command.voteType)) {
      throw new InvalidVoteTypeError(command.voteType)
    }

    const urn = createPostUrn(command.urn)
    const voterId = createVoterId(command.voterId)
    const voteType = command.voteType as VoteType

    // Find or create post
    let post = await postRepository.findByUrn(urn)
    if (!post) {
      post = createPost(generatePostId(), urn, command.content)
      await postRepository.save(post)
    }

    // Find existing vote
    const existingVote = await voteRepository.findByPostAndVoter(post.id, voterId)

    if (existingVote) {
      // Update existing vote
      const updatedVote = { ...existingVote, voteType }
      await voteRepository.update(updatedVote)
    } else {
      // Create new vote
      const vote = createVote(generateVoteId(), post.id, voterId, voteType)
      await voteRepository.save(vote)
    }

    // Get updated vote counts
    const voteCounts = await voteRepository.countByPost(post.id)

    // Build response
    const votes = VOTE_TYPES.reduce(
      (acc, type) => {
        const count = voteCounts.find((vc) => vc.voteType === type)
        acc[type] = count?.count ?? 0
        return acc
      },
      {} as Record<VoteType, number>
    )

    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0)

    return {
      id: post.id,
      urn: post.urn,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      totalVotes,
      votes,
    }
  },
})
