import type { UserId } from '../value-objects/UserId.js'
import { DomainError } from './DomainError.js'

export class UserNotFoundError extends DomainError {
  constructor(userId: UserId) {
    super(`User not found: ${userId.toString()}`)
  }
}
