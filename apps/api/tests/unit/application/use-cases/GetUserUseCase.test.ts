import { createGetUserUseCase } from '../../../../src/application/use-cases/GetUserUseCase.js'
import { createCreateUserUseCase } from '../../../../src/application/use-cases/CreateUserUseCase.js'
import { createInMemoryUserRepository } from '../../../../src/adapters/out/persistence/InMemoryUserRepository.js'
import { UserNotFoundError } from '@linkedout/core'
import type { IGetUserUseCase } from '../../../../src/application/use-cases/GetUserUseCase.js'
import type { ICreateUserUseCase } from '../../../../src/application/use-cases/CreateUserUseCase.js'
import type { InMemoryUserRepositoryWithClear } from '../../../../src/adapters/out/persistence/InMemoryUserRepository.js'

describe('GetUserUseCase', () => {
  let getUserUseCase: IGetUserUseCase
  let createUserUseCase: ICreateUserUseCase
  let repository: InMemoryUserRepositoryWithClear

  beforeEach(() => {
    repository = createInMemoryUserRepository()
    getUserUseCase = createGetUserUseCase({ userRepository: repository })
    createUserUseCase = createCreateUserUseCase({ userRepository: repository })
  })

  describe('execute', () => {
    it('should return user when found', async () => {
      const created = await createUserUseCase.execute({
        name: 'John Doe',
        email: 'john@example.com'
      })

      const result = await getUserUseCase.execute({ userId: created.id })

      expect(result).toMatchObject({
        id: created.id,
        name: 'John Doe',
        email: 'john@example.com'
      })
    })

    it('should throw UserNotFoundError when user does not exist', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000'

      await expect(
        getUserUseCase.execute({ userId: fakeId })
      ).rejects.toThrow(UserNotFoundError)
    })

    it('should return correct user among multiple users', async () => {
      const user1 = await createUserUseCase.execute({
        name: 'User 1',
        email: 'user1@example.com'
      })
      const user2 = await createUserUseCase.execute({
        name: 'User 2',
        email: 'user2@example.com'
      })

      const result = await getUserUseCase.execute({ userId: user2.id })

      expect(result.name).toBe('User 2')
      expect(result.id).toBe(user2.id)
      expect(result.id).not.toBe(user1.id)
    })
  })
})
