import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {
  DomainError,
  UserNotFoundError,
  EmailAlreadyExistsError,
  InvalidEmailError
} from '@linkedout/core'
import type { ICreateUserUseCase } from '../../../application/use-cases/CreateUserUseCase.js'
import type { IGetUserUseCase } from '../../../application/use-cases/GetUserUseCase.js'
import type { IGetAllUsersUseCase } from '../../../application/use-cases/GetAllUsersUseCase.js'
import { CreateUserSchema, UserIdParamSchema } from './schemas.js'

export function createUserRoutes(
  createUserUseCase: ICreateUserUseCase,
  getUserUseCase: IGetUserUseCase,
  getAllUsersUseCase: IGetAllUsersUseCase
) {
  const app = new Hono()

  app.get('/users', async (c) => {
    const users = await getAllUsersUseCase.execute()
    return c.json(users)
  })

  app.post('/users', zValidator('json', CreateUserSchema), async (c) => {
    try {
      const { name, email } = c.req.valid('json')

      const user = await createUserUseCase.execute({ name, email })

      return c.json(user, 201)
    } catch (error) {
      if (error instanceof EmailAlreadyExistsError) {
        return c.json({ error: error.message }, 409)
      }
      if (error instanceof InvalidEmailError) {
        return c.json({ error: error.message }, 400)
      }
      if (error instanceof DomainError) {
        return c.json({ error: error.message }, 400)
      }
      throw error
    }
  })

  app.get('/users/:id', zValidator('param', UserIdParamSchema), async (c) => {
    try {
      const { id } = c.req.valid('param')
      const user = await getUserUseCase.execute({ userId: id })
      return c.json(user)
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return c.json({ error: error.message }, 404)
      }
      if (error instanceof DomainError) {
        return c.json({ error: error.message }, 400)
      }
      throw error
    }
  })

  return app
}
