import { Hono } from 'hono'
import { DomainError, InvalidVoteTypeError, isValidVoteType, type VoteType } from '@linkedout/core'
import type { ISubmitVoteUseCase, IGetLeaderboardUseCase } from '../../../application/use-cases/index.js'

export const createVotesRoutes = (
  submitVoteUseCase: ISubmitVoteUseCase,
  getLeaderboardUseCase: IGetLeaderboardUseCase
) => {
  const router = new Hono()

  // POST /votes - Submit a vote
  router.post('/', async (c) => {
    try {
      const body = await c.req.json()
      const { urn, content, voteType, voterId } = body

      if (!urn || !content || !voteType || !voterId) {
        return c.json({ error: 'Missing required fields: urn, content, voteType, voterId' }, 400)
      }

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
  router.get('/leaderboard', async (c) => {
    const voteType = c.req.query('type') as VoteType
    const limit = parseInt(c.req.query('limit') || '20', 10)
    const offset = parseInt(c.req.query('offset') || '0', 10)

    if (voteType && !isValidVoteType(voteType)) {
      return c.json({ error: `Invalid vote type: ${voteType}` }, 400)
    }

    const result = await getLeaderboardUseCase.execute({
      voteType,
      limit,
      offset,
    })

    return c.json(result)
  })

  return router
}
