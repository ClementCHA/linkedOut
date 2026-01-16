import { generateUUID } from './EntityId.js'

// Branded type for UserId
export type UserId = string & { readonly __brand: 'UserId' }

export const createUserId = (value: string): UserId => {
  if (!value || value.trim() === '') {
    throw new Error('UserId cannot be empty')
  }
  return value as UserId
}

export const generateUserId = (): UserId => generateUUID() as UserId

export const userIdEquals = (a: UserId, b: UserId): boolean => a === b
