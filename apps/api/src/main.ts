import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import {
  createCreateUserUseCase,
  createGetUserUseCase,
  createGetAllUsersUseCase
} from './application/use-cases/index.js'
import { createInMemoryUserRepository } from './adapters/out/persistence/InMemoryUserRepository.js'
import { createUserRoutes } from './adapters/in/http/index.js'

// Dependency injection - functional wiring
const userRepository = createInMemoryUserRepository()

const createUserUseCase = createCreateUserUseCase({ userRepository })
const getUserUseCase = createGetUserUseCase({ userRepository })
const getAllUsersUseCase = createGetAllUsersUseCase({ userRepository })

// App setup
const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

// Routes
const userRoutes = createUserRoutes(createUserUseCase, getUserUseCase, getAllUsersUseCase)
app.route('/api', userRoutes)

// Start server
const port = Number(process.env.PORT) || 3001

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🚀 API server running on http://localhost:${info.port}`)
})

// Re-exports for testing
export {
  createCreateUserUseCase,
  createGetUserUseCase,
  createGetAllUsersUseCase
}
export { createInMemoryUserRepository }
export * from '@linkedout/core'
