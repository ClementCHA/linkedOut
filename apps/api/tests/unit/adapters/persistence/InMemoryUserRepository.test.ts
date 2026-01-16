import { createInMemoryUserRepository } from '../../../../src/adapters/out/persistence/InMemoryUserRepository.js'
import { createUser, generateUserId, createEmail, updateUserName } from '@linkedout/core'
import type { InMemoryUserRepositoryWithClear } from '../../../../src/adapters/out/persistence/InMemoryUserRepository.js'

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepositoryWithClear

  beforeEach(() => {
    repository = createInMemoryUserRepository()
  })

  const makeUser = (name: string, email: string) => {
    return createUser(generateUserId(), name, createEmail(email))
  }

  describe('save', () => {
    it('should save a user', async () => {
      const user = makeUser('John Doe', 'john@example.com')

      await repository.save(user)
      const found = await repository.findById(user.id)

      expect(found).not.toBeNull()
      expect(found?.name).toBe('John Doe')
    })

    it('should update existing user', async () => {
      const user = makeUser('John Doe', 'john@example.com')
      await repository.save(user)

      const updatedUser = updateUserName(user, 'John Updated')
      await repository.save(updatedUser)

      const found = await repository.findById(user.id)
      expect(found?.name).toBe('John Updated')

      const all = await repository.findAll()
      expect(all).toHaveLength(1)
    })
  })

  describe('findById', () => {
    it('should return null when user not found', async () => {
      const result = await repository.findById(generateUserId())
      expect(result).toBeNull()
    })

    it('should find user by id', async () => {
      const user = makeUser('John Doe', 'john@example.com')
      await repository.save(user)

      const found = await repository.findById(user.id)

      expect(found?.id).toBe(user.id)
    })
  })

  describe('findByEmail', () => {
    it('should return null when email not found', async () => {
      const result = await repository.findByEmail(createEmail('notfound@example.com'))
      expect(result).toBeNull()
    })

    it('should find user by email', async () => {
      const user = makeUser('John Doe', 'john@example.com')
      await repository.save(user)

      const found = await repository.findByEmail(createEmail('john@example.com'))

      expect(found?.email).toBe(createEmail('john@example.com'))
    })
  })

  describe('findAll', () => {
    it('should return empty array when no users', async () => {
      const result = await repository.findAll()
      expect(result).toEqual([])
    })

    it('should return all saved users', async () => {
      await repository.save(makeUser('User 1', 'user1@example.com'))
      await repository.save(makeUser('User 2', 'user2@example.com'))

      const result = await repository.findAll()

      expect(result).toHaveLength(2)
    })
  })

  describe('delete', () => {
    it('should delete user', async () => {
      const user = makeUser('John Doe', 'john@example.com')
      await repository.save(user)

      await repository.delete(user.id)
      const found = await repository.findById(user.id)

      expect(found).toBeNull()
    })

    it('should not throw when deleting non-existent user', async () => {
      await expect(repository.delete(generateUserId())).resolves.not.toThrow()
    })
  })

  describe('clear', () => {
    it('should remove all users', async () => {
      await repository.save(makeUser('User 1', 'user1@example.com'))
      await repository.save(makeUser('User 2', 'user2@example.com'))

      repository.clear()
      const result = await repository.findAll()

      expect(result).toEqual([])
    })
  })
})
