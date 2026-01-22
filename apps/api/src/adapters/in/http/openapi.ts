import type { OpenAPIV3 } from '../../../types/openapi.js'

const voteTypes = ['solid', 'interesting', 'salesman', 'bullshit', 'scam', 'guru', 'theater'] as const

export const openApiSpec: OpenAPIV3 = {
  openapi: '3.0.3',
  info: {
    title: 'LinkedOut API',
    description: 'API for the LinkedIn Bullshit Detector - Vote on LinkedIn posts and view the leaderboard.',
    version: '1.0.0',
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Local development' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['System'],
        responses: {
          '200': {
            description: 'API is healthy',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } } } },
          },
        },
      },
    },
    '/api/users': {
      get: {
        summary: 'Get all users',
        tags: ['Users'],
        responses: {
          '200': {
            description: 'List of users',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } },
          },
        },
      },
      post: {
        summary: 'Create a user',
        tags: ['Users'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUser' } } },
        },
        responses: {
          '201': {
            description: 'User created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          '400': { description: 'Invalid input' },
          '409': { description: 'Email already exists' },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        summary: 'Get a user by ID',
        tags: ['Users'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'User found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          '404': { description: 'User not found' },
        },
      },
    },
    '/api/votes': {
      post: {
        summary: 'Submit a vote on a LinkedIn post',
        tags: ['Votes'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SubmitVote' } } },
        },
        responses: {
          '201': {
            description: 'Vote submitted',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/VoteResult' } } },
          },
          '400': { description: 'Invalid input or vote type' },
        },
      },
    },
    '/api/votes/leaderboard': {
      get: {
        summary: 'Get the leaderboard',
        tags: ['Votes'],
        parameters: [
          { name: 'type', in: 'query', required: false, schema: { type: 'string', enum: [...voteTypes] }, description: 'Filter by vote type' },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'offset', in: 'query', required: false, schema: { type: 'integer', minimum: 0, default: 0 } },
        ],
        responses: {
          '200': {
            description: 'Leaderboard entries',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/LeaderboardEntry' } } } },
          },
          '400': { description: 'Invalid vote type' },
        },
      },
    },
  },
  components: {
    schemas: {
      CreateUser: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100, example: 'Jean-Michel Disrupteur' },
          email: { type: 'string', format: 'email', example: 'jm@linkedin-guru.io' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      SubmitVote: {
        type: 'object',
        required: ['urn', 'content', 'voteType', 'voterId'],
        properties: {
          urn: { type: 'string', pattern: '^\\d+$', example: '7654321098765', description: 'LinkedIn post URN (numeric)' },
          content: { type: 'string', minLength: 1, example: 'Thrilled to announce I disrupted the synergy paradigm...', description: 'Post content text' },
          voteType: { type: 'string', enum: [...voteTypes], example: 'bullshit' },
          voterId: { type: 'string', minLength: 1, example: 'voter-abc123', description: 'Unique voter identifier' },
        },
      },
      VoteResult: {
        type: 'object',
        properties: {
          urn: { type: 'string' },
          totalVotes: { type: 'integer' },
          votes: {
            type: 'object',
            properties: Object.fromEntries(voteTypes.map(t => [t, { type: 'integer' }])),
          },
        },
      },
      LeaderboardEntry: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          urn: { type: 'string' },
          content: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          totalVotes: { type: 'integer' },
          votes: {
            type: 'object',
            properties: Object.fromEntries(voteTypes.map(t => [t, { type: 'integer' }])),
          },
        },
      },
    },
  },
}
