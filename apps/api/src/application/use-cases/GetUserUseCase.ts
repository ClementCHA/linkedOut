import { createUserId, userToDto, UserNotFoundError } from '@linkedout/core'
import type { IUserRepository, UserDto } from '@linkedout/core'

export type GetUserQuery = {
  userId: string
}

export interface IGetUserUseCase {
  execute(query: GetUserQuery): Promise<UserDto>
}

export const createGetUserUseCase = (deps: {
  userRepository: IUserRepository
}): IGetUserUseCase => ({
  execute: async (query: GetUserQuery): Promise<UserDto> => {
    const userId = createUserId(query.userId)
    const user = await deps.userRepository.findById(userId)

    if (!user) {
      throw new UserNotFoundError(userId)
    }

    return userToDto(user)
  }
})
