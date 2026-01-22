// PostUrn - LinkedIn post unique identifier (normalized numeric ID)
export type PostUrn = string & { readonly __brand: 'PostUrn' }

const POST_ID_REGEX = /^\d+$/

export const createPostUrn = (value: string): PostUrn => {
  if (!value || !POST_ID_REGEX.test(value)) {
    throw new Error(`Invalid post ID: ${value}`)
  }
  return value as PostUrn
}

export const postUrnEquals = (a: PostUrn, b: PostUrn): boolean => a === b
