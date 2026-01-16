import {
  createUser,
  createEmail,
  generateUserId,
  userToDto,
  EmailAlreadyExistsError
} from '@linkedout/core'
import type { IUserRepository, UserDto } from '@linkedout/core'

export type CreateUserCommand = {
  name: string
  email: string
}

export interface ICreateUserUseCase {
  execute(command: CreateUserCommand): Promise<UserDto>
}

export const createCreateUserUseCase = (deps: {
  userRepository: IUserRepository
}): ICreateUserUseCase => ({
  execute: async (command: CreateUserCommand): Promise<UserDto> => {
    const email = createEmail(command.email)

    const existingUser = await deps.userRepository.findByEmail(email)
    if (existingUser) {
      throw new EmailAlreadyExistsError(email)
    }

    const user = createUser(generateUserId(), command.name, email)

    await deps.userRepository.save(user)

    return userToDto(user)
  }
})
