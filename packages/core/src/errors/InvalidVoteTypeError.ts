import { DomainError } from './DomainError.js'

export class InvalidVoteTypeError extends DomainError {
  constructor(voteType: string) {
    super(`Invalid vote type: ${voteType}`)
  }
}
