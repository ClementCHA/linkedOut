import type { Email } from '../value-objects/Email.js'
import type { UserId } from '../value-objects/UserId.js'

// User type - immutable data structure
export type User = Readonly<{
  id: UserId
  name: string
  email: Email
  createdAt: Date
}>

// Factory function - creates a new user
export const createUser = (id: UserId, name: string, email: Email): User => {
  if (!name || name.trim() === '') {
    throw new Error('Name cannot be empty')
  }
  return {
    id,
    name: name.trim(),
    email,
    createdAt: new Date()
  }
}

// Reconstitute function - recreates user from persistence
export const reconstituteUser = (
  id: UserId,
  name: string,
  email: Email,
  createdAt: Date
): User => ({
  id,
  name,
  email,
  createdAt
})

// Update functions - return new immutable instances
export const updateUserName = (user: User, name: string): User => {
  if (!name || name.trim() === '') {
    throw new Error('Name cannot be empty')
  }
  return { ...user, name: name.trim() }
}

export const updateUserEmail = (user: User, email: Email): User => ({
  ...user,
  email
})
