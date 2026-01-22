import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { DomainError, InvalidVoteTypeError } from '@linkedout/core'
import type { VoteType } from '@linkedout/core'
import type { ISubmitVoteUseCase, IGetLeaderboardUseCase } from '../../../application/use-cases/index.js'
import { SubmitVoteSchema, LeaderboardQuerySchema } from './schemas.js'

export const createVotesRoutes = (
  submitVoteUseCase: ISubmitVoteUseCase,
  getLeaderboardUseCase: IGetLeaderboardUseCase
) => {
  const router = new Hono()

  // POST /votes - Submit a vote
  router.post('/', zValidator('json', SubmitVoteSchema), async (c) => {
    try {
      const { urn, content, voteType, voterId } = c.req.valid('json')

      const result = await submitVoteUseCase.execute({
        urn,
        content,
        voteType,
        voterId,
      })

      return c.json(result, 201)
    } catch (error) {
      if (error instanceof InvalidVoteTypeError) {
        return c.json({ error: error.message }, 400)
      }
      if (error instanceof DomainError) {
        return c.json({ error: error.message }, 400)
      }
      throw error
    }
  })

  // GET /votes/leaderboard - Get leaderboard
  router.get('/leaderboard', zValidator('query', LeaderboardQuerySchema), async (c) => {
    const { type, limit, offset } = c.req.valid('query')

    const result = await getLeaderboardUseCase.execute({
      voteType: type as VoteType | undefined,
      limit,
      offset,
    })

    return c.json(result)
  })

  return router
}
