import { Hono } from 'hono'
import type { ICreateUserUseCase } from '../../../application/use-cases/CreateUserUseCase.js'
import type { IGetUserUseCase } from '../../../application/use-cases/GetUserUseCase.js'
import type { IGetAllUsersUseCase } from '../../../application/use-cases/GetAllUsersUseCase.js'
import {
  DomainError,
  UserNotFoundError,
  EmailAlreadyExistsError,
  InvalidEmailError
} from '@linkedout/core'

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

  app.post('/users', async (c) => {
    try {
      const body = await c.req.json<{ name: string; email: string }>()

      if (!body.name || !body.email) {
        return c.json({ error: 'Name and email are required' }, 400)
      }

      const user = await createUserUseCase.execute({
        name: body.name,
        email: body.email
      })

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

  app.get('/users/:id', async (c) => {
    try {
      const userId = c.req.param('id')
      const user = await getUserUseCase.execute({ userId })
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
