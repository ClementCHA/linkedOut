import { createCreateUserUseCase } from '../../../../src/application/use-cases/CreateUserUseCase.js'
import { createInMemoryUserRepository } from '../../../../src/adapters/out/persistence/InMemoryUserRepository.js'
import { EmailAlreadyExistsError, InvalidEmailError } from '@linkedout/core'
import type { ICreateUserUseCase } from '../../../../src/application/use-cases/CreateUserUseCase.js'
import type { InMemoryUserRepositoryWithClear } from '../../../../src/adapters/out/persistence/InMemoryUserRepository.js'

describe('CreateUserUseCase', () => {
  let useCase: ICreateUserUseCase
  let repository: InMemoryUserRepositoryWithClear

  beforeEach(() => {
    repository = createInMemoryUserRepository()
    useCase = createCreateUserUseCase({ userRepository: repository })
  })

  describe('execute', () => {
    it('should create a user with valid data', async () => {
      const command = {
        name: 'John Doe',
        email: 'john@example.com'
      }

      const result = await useCase.execute(command)

      expect(result).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com'
      })
      expect(result.id).toBeDefined()
    })

    it('should persist the user in the repository', async () => {
      const command = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      }

      const result = await useCase.execute(command)
      const users = await repository.findAll()

      expect(users).toHaveLength(1)
      expect(users[0]?.id).toBe(result.id)
    })

    it('should throw EmailAlreadyExistsError when email is taken', async () => {
      const command = {
        name: 'John Doe',
        email: 'john@example.com'
      }

      await useCase.execute(command)

      await expect(
        useCase.execute({ name: 'Another John', email: 'john@example.com' })
      ).rejects.toThrow(EmailAlreadyExistsError)
    })

    it('should throw InvalidEmailError for invalid email format', async () => {
      const command = {
        name: 'John Doe',
        email: 'invalid-email'
      }

      await expect(useCase.execute(command)).rejects.toThrow(InvalidEmailError)
    })

    it('should allow different users with different emails', async () => {
      await useCase.execute({ name: 'User 1', email: 'user1@example.com' })
      await useCase.execute({ name: 'User 2', email: 'user2@example.com' })

      const users = await repository.findAll()
      expect(users).toHaveLength(2)
    })
  })
})
