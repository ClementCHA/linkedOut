// Entities
export type { User } from './entities/User.js'
export { createUser, reconstituteUser, updateUserName, updateUserEmail } from './entities/User.js'
export type { Post, PostId } from './entities/Post.js'
export { createPost, reconstitutePost, generatePostId, createPostId } from './entities/Post.js'
export type { Vote, VoteId } from './entities/Vote.js'
export { createVote, reconstituteVote, generateVoteId, createVoteId } from './entities/Vote.js'

// Value Objects
export { generateUUID, entityIdEquals } from './value-objects/EntityId.js'
export type { UserId } from './value-objects/UserId.js'
export { createUserId, generateUserId, userIdEquals } from './value-objects/UserId.js'
export type { Email } from './value-objects/Email.js'
export { createEmail, emailEquals } from './value-objects/Email.js'
export type { PostUrn } from './value-objects/PostUrn.js'
export { createPostUrn, postUrnEquals } from './value-objects/PostUrn.js'
export type { VoterId } from './value-objects/VoterId.js'
export { createVoterId, voterIdEquals } from './value-objects/VoterId.js'
export type { VoteType } from './value-objects/VoteType.js'
export { VOTE_TYPES, POSITIVE_VOTES, NEGATIVE_VOTES, isValidVoteType, isPositiveVote, isNegativeVote } from './value-objects/VoteType.js'

// Ports
export type { IUserRepository } from './ports/IUserRepository.js'
export type { IPostRepository } from './ports/IPostRepository.js'
export type { IVoteRepository, VoteCount } from './ports/IVoteRepository.js'

// Errors
export { DomainError } from './errors/DomainError.js'
export { EmailAlreadyExistsError } from './errors/EmailAlreadyExistsError.js'
export { InvalidEmailError } from './errors/InvalidEmailError.js'
export { UserNotFoundError } from './errors/UserNotFoundError.js'
export { InvalidVoteTypeError } from './errors/InvalidVoteTypeError.js'

// DTOs
export type { UserDto } from './dtos/UserDto.js'
export { userToDto } from './dtos/UserDto.js'
export type { PostDto, LeaderboardEntryDto } from './dtos/PostDto.js'
export { postToDto } from './dtos/PostDto.js'
