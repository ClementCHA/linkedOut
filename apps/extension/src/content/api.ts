const API_URL = 'http://localhost:3001/api'

export interface ApiPostScore {
  id: string
  urn: string
  content: string
  createdAt: string
  totalVotes: number
  votes: {
    solid: number
    interesting: number
    salesman: number
    bullshit: number
    scam: number
    guru: number
    theater: number
  }
}

export async function submitVoteToApi(
  urn: string,
  content: string,
  voteType: string,
  voterId: string
): Promise<ApiPostScore> {
  const response = await fetch(`${API_URL}/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urn, content, voteType, voterId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to submit vote')
  }

  return response.json()
}

export async function getLeaderboard(voteType?: string, limit = 20): Promise<ApiPostScore[]> {
  const params = new URLSearchParams()
  if (voteType) params.set('type', voteType)
  params.set('limit', limit.toString())

  const response = await fetch(`${API_URL}/votes/leaderboard?${params}`)

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard')
  }

  return response.json()
}
