import { userToDto } from '@linkedout/core'
import type { IUserRepository, UserDto } from '@linkedout/core'

export interface IGetAllUsersUseCase {
  execute(): Promise<UserDto[]>
}

export const createGetAllUsersUseCase = (deps: {
  userRepository: IUserRepository
}): IGetAllUsersUseCase => ({
  execute: async (): Promise<UserDto[]> => {
    const users = await deps.userRepository.findAll()
    return users.map(userToDto)
  }
})
