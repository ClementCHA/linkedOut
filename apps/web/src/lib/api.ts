import type { UserDto, LeaderboardEntryDto, VoteType } from '@linkedout/core'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function getUsers(): Promise<UserDto[]> {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }

  return response.json()
}

export async function getUser(id: string): Promise<UserDto> {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('User not found')
    }
    throw new Error('Failed to fetch user')
  }

  return response.json()
}

export async function createUser(data: {
  name: string
  email: string
}): Promise<UserDto> {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create user')
  }

  return response.json()
}

export async function getLeaderboard(
  type?: VoteType,
  limit: number = 20,
  offset: number = 0
): Promise<LeaderboardEntryDto[]> {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  params.set('limit', String(limit))
  params.set('offset', String(offset))

  const response = await fetch(
    `${API_BASE_URL}/api/votes/leaderboard?${params.toString()}`,
    { cache: 'no-store' }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard')
  }

  return response.json()
}
