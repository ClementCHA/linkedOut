import { createGetAllUsersUseCase } from '../../../../src/application/use-cases/GetAllUsersUseCase.js'
import { createCreateUserUseCase } from '../../../../src/application/use-cases/CreateUserUseCase.js'
import { createInMemoryUserRepository } from '../../../../src/adapters/out/persistence/InMemoryUserRepository.js'
import type { IGetAllUsersUseCase } from '../../../../src/application/use-cases/GetAllUsersUseCase.js'
import type { ICreateUserUseCase } from '../../../../src/application/use-cases/CreateUserUseCase.js'
import type { InMemoryUserRepositoryWithClear } from '../../../../src/adapters/out/persistence/InMemoryUserRepository.js'

describe('GetAllUsersUseCase', () => {
  let getAllUsersUseCase: IGetAllUsersUseCase
  let createUserUseCase: ICreateUserUseCase
  let repository: InMemoryUserRepositoryWithClear

  beforeEach(() => {
    repository = createInMemoryUserRepository()
    getAllUsersUseCase = createGetAllUsersUseCase({ userRepository: repository })
    createUserUseCase = createCreateUserUseCase({ userRepository: repository })
  })

  describe('execute', () => {
    it('should return empty array when no users exist', async () => {
      const result = await getAllUsersUseCase.execute()

      expect(result).toEqual([])
    })

    it('should return all users', async () => {
      await createUserUseCase.execute({
        name: 'User 1',
        email: 'user1@example.com'
      })
      await createUserUseCase.execute({
        name: 'User 2',
        email: 'user2@example.com'
      })
      await createUserUseCase.execute({
        name: 'User 3',
        email: 'user3@example.com'
      })

      const result = await getAllUsersUseCase.execute()

      expect(result).toHaveLength(3)
      expect(result.map((u) => u.name)).toContain('User 1')
      expect(result.map((u) => u.name)).toContain('User 2')
      expect(result.map((u) => u.name)).toContain('User 3')
    })

    it('should return UserDto objects', async () => {
      await createUserUseCase.execute({
        name: 'John Doe',
        email: 'john@example.com'
      })

      const result = await getAllUsersUseCase.execute()

      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('name')
      expect(result[0]).toHaveProperty('email')
    })
  })
})
