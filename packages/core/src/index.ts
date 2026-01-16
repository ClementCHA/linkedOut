// Entities
export type { User } from './entities/User.js'
export { createUser, reconstituteUser, updateUserName, updateUserEmail } from './entities/User.js'

// Value Objects
export { generateUUID, entityIdEquals } from './value-objects/EntityId.js'
export type { UserId } from './value-objects/UserId.js'
export { createUserId, generateUserId, userIdEquals } from './value-objects/UserId.js'
export type { Email } from './value-objects/Email.js'
export { createEmail, emailEquals } from './value-objects/Email.js'

// Ports
export type { IUserRepository } from './ports/IUserRepository.js'

// Errors
export { DomainError } from './errors/DomainError.js'
export { EmailAlreadyExistsError } from './errors/EmailAlreadyExistsError.js'
export { InvalidEmailError } from './errors/InvalidEmailError.js'
export { UserNotFoundError } from './errors/UserNotFoundError.js'

// DTOs
export type { UserDto } from './dtos/UserDto.js'
export { userToDto } from './dtos/UserDto.js'
