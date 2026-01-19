import type { User, IUserRepository } from '@linkedout/core'
import { emailEquals } from '@linkedout/core'
import type { Email, UserId } from '@linkedout/core'

export type InMemoryUserRepositoryWithClear = IUserRepository & {
  clear(): void
}

export const createInMemoryUserRepository = (): InMemoryUserRepositoryWithClear => {
  const users = new Map<string, User>()

  return {
    findById: async (id: UserId): Promise<User | null> => {
      return users.get(id) ?? null
    },

    findByEmail: async (email: Email): Promise<User | null> => {
      for (const user of users.values()) {
        if (emailEquals(user.email, email)) {
          return user
        }
      }
      return null
    },

    findAll: async (): Promise<User[]> => {
      return Array.from(users.values())
    },

    save: async (user: User): Promise<void> => {
      users.set(user.id, user)
    },

    delete: async (id: UserId): Promise<void> => {
      users.delete(id)
    },

    clear: (): void => {
      users.clear()
    }
  }
}
