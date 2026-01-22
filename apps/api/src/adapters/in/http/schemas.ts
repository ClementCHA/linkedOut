import { z } from 'zod'
import { VOTE_TYPES } from '@linkedout/core'

export const SubmitVoteSchema = z.object({
  urn: z.string().min(1, 'urn is required').regex(/^\d+$/, 'urn must be numeric'),
  content: z.string().min(1, 'content is required'),
  voteType: z.enum(VOTE_TYPES as [string, ...string[]], { message: 'Invalid vote type' }),
  voterId: z.string().min(1, 'voterId is required'),
})

export const LeaderboardQuerySchema = z.object({
  type: z.enum(VOTE_TYPES as [string, ...string[]], { message: 'Invalid vote type' }).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
})

export const UserIdParamSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
})
