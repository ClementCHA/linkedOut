import { Hono } from 'hono'
import { createVotesRoutes } from '../../src/adapters/in/http/VotesController.js'
import { createSubmitVoteUseCase } from '../../src/application/use-cases/SubmitVoteUseCase.js'
import { createGetLeaderboardUseCase } from '../../src/application/use-cases/GetLeaderboardUseCase.js'
import { createInMemoryPostRepository } from '../../src/adapters/out/persistence/InMemoryPostRepository.js'
import { createInMemoryVoteRepository } from '../../src/adapters/out/persistence/InMemoryVoteRepository.js'
import { createInMemoryLeaderboardRepository } from '../../src/adapters/out/persistence/InMemoryLeaderboardRepository.js'
import type { InMemoryPostRepositoryWithClear } from '../../src/adapters/out/persistence/InMemoryPostRepository.js'
import type { InMemoryVoteRepositoryWithClear } from '../../src/adapters/out/persistence/InMemoryVoteRepository.js'
import type { InMemoryLeaderboardRepositoryWithState } from '../../src/adapters/out/persistence/InMemoryLeaderboardRepository.js'

describe('VotesController', () => {
  let app: Hono
  let postRepository: InMemoryPostRepositoryWithClear
  let voteRepository: InMemoryVoteRepositoryWithClear
  let leaderboardRepository: InMemoryLeaderboardRepositoryWithState

  beforeEach(() => {
    postRepository = createInMemoryPostRepository()
    voteRepository = createInMemoryVoteRepository()
    leaderboardRepository = createInMemoryLeaderboardRepository()

    const submitVoteUseCase = createSubmitVoteUseCase(postRepository, voteRepository)
    const getLeaderboardUseCase = createGetLeaderboardUseCase(leaderboardRepository)

    app = new Hono()
    app.route('/votes', createVotesRoutes(submitVoteUseCase, getLeaderboardUseCase))
  })

  describe('POST /votes', () => {
    const validBody = {
      urn: '1234567890',
      content: 'LinkedIn post about disrupting the synergy paradigm',
      voteType: 'bullshit',
      voterId: 'voter-123',
    }

    it('should return 201 with vote result on valid submission', async () => {
      const res = await app.request('/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      })

      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.urn).toBe('1234567890')
      expect(body.totalVotes).toBe(1)
      expect(body.votes.bullshit).toBe(1)
    })

    it('should return 400 when urn is missing', async () => {
      const res = await app.request('/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, urn: undefined }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toContain('Missing required fields')
    })

    it('should return 400 when content is missing', async () => {
      const res = await app.request('/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, content: undefined }),
      })

      expect(res.status).toBe(400)
    })

    it('should return 400 when voteType is missing', async () => {
      const res = await app.request('/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, voteType: undefined }),
      })

      expect(res.status).toBe(400)
    })

    it('should return 400 when voterId is missing', async () => {
      const res = await app.request('/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, voterId: undefined }),
      })

      expect(res.status).toBe(400)
    })

    it('should return 400 for invalid vote type', async () => {
      const res = await app.request('/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, voteType: 'invalid' }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toContain('Invalid vote type')
    })

    it('should handle vote update (same voter, same post)', async () => {
      await app.request('/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validBody),
      })

      const res = await app.request('/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, voteType: 'solid' }),
      })

      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.totalVotes).toBe(1)
      expect(body.votes.bullshit).toBe(0)
      expect(body.votes.solid).toBe(1)
    })

    it('should handle multiple voters on same post', async () => {
      await app.request('/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, voterId: 'voter-1' }),
      })

      const res = await app.request('/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validBody, voterId: 'voter-2', voteType: 'guru' }),
      })

      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.totalVotes).toBe(2)
      expect(body.votes.bullshit).toBe(1)
      expect(body.votes.guru).toBe(1)
    })
  })

  describe('GET /votes/leaderboard', () => {
    it('should return 200 with empty array when no data', async () => {
      const res = await app.request('/votes/leaderboard')

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual([])
    })

    it('should return leaderboard entries', async () => {
      leaderboardRepository.setEntries([
        {
          id: 'p1',
          urn: '111',
          content: 'Post 1',
          createdAt: '2024-01-01T00:00:00.000Z',
          totalVotes: 10,
          votes: { solid: 2, interesting: 1, salesman: 0, bullshit: 5, scam: 1, guru: 1, theater: 0 },
        },
      ])

      const res = await app.request('/votes/leaderboard')

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toHaveLength(1)
      expect(body[0].urn).toBe('111')
      expect(body[0].totalVotes).toBe(10)
    })

    it('should filter by vote type', async () => {
      leaderboardRepository.setEntries([
        {
          id: 'p1',
          urn: '111',
          content: 'Post 1',
          createdAt: '2024-01-01T00:00:00.000Z',
          totalVotes: 5,
          votes: { solid: 0, interesting: 0, salesman: 0, bullshit: 5, scam: 0, guru: 0, theater: 0 },
        },
        {
          id: 'p2',
          urn: '222',
          content: 'Post 2',
          createdAt: '2024-01-01T00:00:00.000Z',
          totalVotes: 3,
          votes: { solid: 3, interesting: 0, salesman: 0, bullshit: 0, scam: 0, guru: 0, theater: 0 },
        },
      ])

      const res = await app.request('/votes/leaderboard?type=bullshit')

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toHaveLength(1)
      expect(body[0].urn).toBe('111')
    })

    it('should return 400 for invalid vote type filter', async () => {
      const res = await app.request('/votes/leaderboard?type=invalid')

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toContain('Invalid vote type')
    })

    it('should respect limit parameter', async () => {
      const entries = Array.from({ length: 5 }, (_, i) => ({
        id: `p${i}`,
        urn: `${1000 + i}`,
        content: `Post ${i}`,
        createdAt: '2024-01-01T00:00:00.000Z',
        totalVotes: 10 - i,
        votes: { solid: 0, interesting: 0, salesman: 0, bullshit: 10 - i, scam: 0, guru: 0, theater: 0 },
      }))
      leaderboardRepository.setEntries(entries)

      const res = await app.request('/votes/leaderboard?limit=2')

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toHaveLength(2)
    })

    it('should respect offset parameter', async () => {
      const entries = Array.from({ length: 5 }, (_, i) => ({
        id: `p${i}`,
        urn: `${1000 + i}`,
        content: `Post ${i}`,
        createdAt: '2024-01-01T00:00:00.000Z',
        totalVotes: 50 - i * 10,
        votes: { solid: 0, interesting: 0, salesman: 0, bullshit: 0, scam: 0, guru: 0, theater: 0 },
      }))
      leaderboardRepository.setEntries(entries)

      const res = await app.request('/votes/leaderboard?offset=2&limit=2')

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toHaveLength(2)
      expect(body[0].id).toBe('p2')
    })
  })
})
