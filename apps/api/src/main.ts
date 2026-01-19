import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import {
  createCreateUserUseCase,
  createGetUserUseCase,
  createGetAllUsersUseCase,
  createSubmitVoteUseCase,
  createGetLeaderboardUseCase,
} from './application/use-cases/index.js'
import { createInMemoryUserRepository } from './adapters/out/persistence/InMemoryUserRepository.js'
import { createUserRoutes, createVotesRoutes } from './adapters/in/http/index.js'
import { createPool } from './adapters/out/persistence/database.js'
import { PostgresPostRepository } from './adapters/out/persistence/PostgresPostRepository.js'
import { PostgresVoteRepository } from './adapters/out/persistence/PostgresVoteRepository.js'
import { PostgresLeaderboardRepository } from './adapters/out/persistence/PostgresLeaderboardRepository.js'

// Database connection
const pool = createPool()

// User dependencies (in-memory for now)
const userRepository = createInMemoryUserRepository()
const createUserUseCase = createCreateUserUseCase({ userRepository })
const getUserUseCase = createGetUserUseCase({ userRepository })
const getAllUsersUseCase = createGetAllUsersUseCase({ userRepository })

// Vote dependencies (PostgreSQL)
const postRepository = new PostgresPostRepository(pool)
const voteRepository = new PostgresVoteRepository(pool)
const leaderboardRepository = new PostgresLeaderboardRepository(pool)
const submitVoteUseCase = createSubmitVoteUseCase(postRepository, voteRepository)
const getLeaderboardUseCase = createGetLeaderboardUseCase(leaderboardRepository)

// App setup
const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

// Routes
const userRoutes = createUserRoutes(createUserUseCase, getUserUseCase, getAllUsersUseCase)
const votesRoutes = createVotesRoutes(submitVoteUseCase, getLeaderboardUseCase)

app.route('/api', userRoutes)
app.route('/api/votes', votesRoutes)

// Start server
const port = Number(process.env.PORT) || 3001

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API server running on http://localhost:${info.port}`)
})

// Re-exports for testing
export {
  createCreateUserUseCase,
  createGetUserUseCase,
  createGetAllUsersUseCase,
  createSubmitVoteUseCase,
  createGetLeaderboardUseCase,
}
export { createInMemoryUserRepository }
export * from '@linkedout/core'
