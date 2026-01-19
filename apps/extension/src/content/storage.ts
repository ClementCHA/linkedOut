import { submitVoteToApi } from './api'

export type VoteType =
  | 'solid'
  | 'interesting'
  | 'salesman'
  | 'bullshit'
  | 'scam'
  | 'guru'
  | 'theater'

export const VOTE_CONFIG: Record<VoteType, { emoji: string; label: string; positive: boolean }> = {
  solid:       { emoji: '✅', label: 'Solide', positive: true },
  interesting: { emoji: '💡', label: 'Intéressant', positive: true },
  salesman:    { emoji: '📢', label: 'Vendeur', positive: false },
  bullshit:    { emoji: '🧻', label: 'Bullshit', positive: false },
  scam:        { emoji: '⚠️', label: 'Scam', positive: false },
  guru:        { emoji: '🧙', label: 'Gourou', positive: false },
  theater:     { emoji: '🎭', label: 'Theater', positive: false },
}

export const POSITIVE_VOTES: VoteType[] = ['solid', 'interesting']
export const NEGATIVE_VOTES: VoteType[] = ['salesman', 'bullshit', 'scam', 'guru', 'theater']

export interface PostScore {
  myVote: VoteType | null
  votes: Record<VoteType, number>
  total: number
}

// Get or generate a unique voter ID for this extension installation
async function getVoterId(): Promise<string> {
  const result = await chrome.storage.local.get('voterId')
  if (result.voterId) {
    return result.voterId
  }

  const voterId = crypto.randomUUID()
  await chrome.storage.local.set({ voterId })
  return voterId
}

// Local cache of user's votes (to track "myVote" state)
async function getMyVote(postUrn: string): Promise<VoteType | null> {
  const result = await chrome.storage.local.get('myVotes')
  const myVotes: Record<string, VoteType> = result.myVotes || {}
  return myVotes[postUrn] || null
}

async function setMyVote(postUrn: string, voteType: VoteType): Promise<void> {
  const result = await chrome.storage.local.get('myVotes')
  const myVotes: Record<string, VoteType> = result.myVotes || {}
  myVotes[postUrn] = voteType
  await chrome.storage.local.set({ myVotes })
}

export async function getPostScore(postUrn: string): Promise<PostScore> {
  const myVote = await getMyVote(postUrn)

  // Return local state only - we don't fetch from API on load to avoid rate limiting
  return {
    myVote,
    votes: { solid: 0, interesting: 0, salesman: 0, bullshit: 0, scam: 0, guru: 0, theater: 0 },
    total: 0,
  }
}

export async function submitVote(
  postUrn: string,
  content: string,
  voteType: VoteType
): Promise<PostScore> {
  const voterId = await getVoterId()

  try {
    const apiResponse = await submitVoteToApi(postUrn, content, voteType, voterId)
    await setMyVote(postUrn, voteType)

    return {
      myVote: voteType,
      votes: apiResponse.votes,
      total: apiResponse.totalVotes,
    }
  } catch (error) {
    console.error('[LinkedOut] API error, falling back to local:', error)

    // Fallback to local storage if API fails
    await setMyVote(postUrn, voteType)
    const myVote = await getMyVote(postUrn)

    return {
      myVote,
      votes: { solid: 0, interesting: 0, salesman: 0, bullshit: 0, scam: 0, guru: 0, theater: 0 },
      total: 0,
    }
  }
}
