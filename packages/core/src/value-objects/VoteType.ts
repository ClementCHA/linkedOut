export type VoteType =
  | 'solid'
  | 'interesting'
  | 'salesman'
  | 'bullshit'
  | 'scam'
  | 'guru'
  | 'theater'

export const VOTE_TYPES: VoteType[] = [
  'solid',
  'interesting',
  'salesman',
  'bullshit',
  'scam',
  'guru',
  'theater',
]

export const POSITIVE_VOTES: VoteType[] = ['solid', 'interesting']
export const NEGATIVE_VOTES: VoteType[] = ['salesman', 'bullshit', 'scam', 'guru', 'theater']

export const isValidVoteType = (value: string): value is VoteType => {
  return VOTE_TYPES.includes(value as VoteType)
}

export const isPositiveVote = (type: VoteType): boolean => POSITIVE_VOTES.includes(type)
export const isNegativeVote = (type: VoteType): boolean => NEGATIVE_VOTES.includes(type)
