// PostUrn - LinkedIn post unique identifier (urn:li:activity:XXX)
export type PostUrn = string & { readonly __brand: 'PostUrn' }

const URN_REGEX = /^urn:li:(activity|share|ugcPost):\d+$/

export const createPostUrn = (value: string): PostUrn => {
  if (!value || !URN_REGEX.test(value)) {
    throw new Error(`Invalid post URN: ${value}`)
  }
  return value as PostUrn
}

export const postUrnEquals = (a: PostUrn, b: PostUrn): boolean => a === b
