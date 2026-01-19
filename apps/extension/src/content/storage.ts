/**
 * Vote types - 7 categories
 */
export type VoteType =
  | 'solid'       // ✅ Solide
  | 'interesting' // 💡 Intéressant
  | 'salesman'    // 📢 Vendeur
  | 'bullshit'    // 🧻 Bullshit
  | 'scam'        // ⚠️ Scam
  | 'guru'        // 🧙 Gourou en carton
  | 'theater'     // 🎭 LinkedIn Theater

export const VOTE_CONFIG: Record<VoteType, { emoji: string; label: string; positive: boolean }> = {
  solid:       { emoji: '✅', label: 'Solide', positive: true },
  interesting: { emoji: '💡', label: 'Intéressant', positive: true },
  salesman:    { emoji: '📢', label: 'Vendeur', positive: false },
  bullshit:    { emoji: '🧻', label: 'Bullshit', positive: false },
  scam:        { emoji: '⚠️', label: 'Scam', positive: false },
  guru:        { emoji: '🧙', label: 'Gourou en carton', positive: false },
  theater:     { emoji: '🎭', label: 'LinkedIn Theater', positive: false },
}

export const POSITIVE_VOTES: VoteType[] = ['solid', 'interesting']
export const NEGATIVE_VOTES: VoteType[] = ['salesman', 'bullshit', 'scam', 'guru', 'theater']

/**
 * Score for a post
 */
export interface PostScore {
  myVote: VoteType | null
  scores: Record<VoteType, number>
  total: number
}

/**
 * Get score for a post from local storage
 */
export async function getPostScore(postHash: string): Promise<PostScore> {
  const result = await chrome.storage.local.get('votes')
  const votes: Record<string, PostScore> = result.votes || {}

  return votes[postHash] || createEmptyScore()
}

/**
 * Submit a vote for a post (local storage only)
 */
export async function submitVote(postHash: string, voteType: VoteType): Promise<PostScore> {
  const result = await chrome.storage.local.get('votes')
  const votes: Record<string, PostScore> = result.votes || {}

  const currentScore = votes[postHash] || createEmptyScore()
  const previousVote = currentScore.myVote

  // Remove previous vote if exists
  if (previousVote) {
    currentScore.scores[previousVote] = Math.max(0, currentScore.scores[previousVote] - 1)
    currentScore.total = Math.max(0, currentScore.total - 1)
  }

  // Add new vote
  currentScore.scores[voteType] = (currentScore.scores[voteType] || 0) + 1
  currentScore.total += 1
  currentScore.myVote = voteType

  // Save
  votes[postHash] = currentScore
  await chrome.storage.local.set({ votes })

  return currentScore
}

/**
 * Create empty score object
 */
function createEmptyScore(): PostScore {
  return {
    myVote: null,
    scores: {
      solid: 0,
      interesting: 0,
      salesman: 0,
      bullshit: 0,
      scam: 0,
      guru: 0,
      theater: 0,
    },
    total: 0,
  }
}
