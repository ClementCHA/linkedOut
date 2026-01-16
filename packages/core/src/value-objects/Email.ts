import { InvalidEmailError } from '../errors/InvalidEmailError.js'

// Branded type for Email
export type Email = string & { readonly __brand: 'Email' }

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const createEmail = (email: string): Email => {
  const normalized = email.toLowerCase().trim()
  if (!isValidEmail(normalized)) {
    throw new InvalidEmailError(email)
  }
  return normalized as Email
}

export const emailEquals = (a: Email, b: Email): boolean => a === b
