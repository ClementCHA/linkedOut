import type { User } from '../entities/User.js'

// UserDto type - immutable data transfer object
export type UserDto = Readonly<{
  id: string
  name: string
  email: string
  createdAt: string
}>

// Factory function - converts User entity to DTO
export const userToDto = (user: User): UserDto => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt.toISOString()
})
