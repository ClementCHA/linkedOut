import { DomainError } from './DomainError.js'

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`Invalid email format: "${email}"`)
  }
}
