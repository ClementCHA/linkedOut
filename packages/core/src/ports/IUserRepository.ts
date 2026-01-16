import type { User } from '../entities/User.js'
import type { Email } from '../value-objects/Email.js'
import type { UserId } from '../value-objects/UserId.js'

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>
  findByEmail(email: Email): Promise<User | null>
  findAll(): Promise<User[]>
  save(user: User): Promise<void>
  delete(id: UserId): Promise<void>
}
