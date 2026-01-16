import { DomainError } from './DomainError.js'

export class EmailAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`A user with email "${email}" already exists`)
  }
}
