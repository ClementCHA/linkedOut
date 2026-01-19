// VoterId - anonymous identifier for a voter (hashed extension ID or IP)
export type VoterId = string & { readonly __brand: 'VoterId' }

export const createVoterId = (value: string): VoterId => {
  if (!value || value.trim() === '') {
    throw new Error('VoterId cannot be empty')
  }
  return value.trim() as VoterId
}

export const voterIdEquals = (a: VoterId, b: VoterId): boolean => a === b
