export interface PostData {
  hash: string
  content: string
  author: string
  authorUrl: string | null
  timestamp: string | null
}

// Selectors for LinkedIn DOM (updated for 2025)
export const POST_SELECTOR = '.feed-shared-update-v2'
const CONTENT_SELECTOR = '.update-components-text, .feed-shared-update-v2__description'
const AUTHOR_SELECTOR = '.update-components-actor__title, .feed-shared-actor__name'
const AUTHOR_LINK_SELECTOR = '.update-components-actor__meta-link, .update-components-actor__container-link'
const TIMESTAMP_SELECTOR = '.update-components-actor__sub-description, .feed-shared-actor__sub-description'

/**
 * Extract data from a LinkedIn post element
 */
export function detectPost(postElement: HTMLElement): PostData | null {
  const contentElement = postElement.querySelector(CONTENT_SELECTOR)
  const authorElement = postElement.querySelector(AUTHOR_SELECTOR)

  // Skip posts without content or author
  if (!contentElement || !authorElement) {
    return null
  }

  const content = contentElement.textContent?.trim() || ''
  const author = authorElement.textContent?.trim() || ''

  // Skip very short posts (likely not real content)
  if (content.length < 50) {
    return null
  }

  const authorLinkElement = postElement.querySelector<HTMLAnchorElement>(AUTHOR_LINK_SELECTOR)
  const timestampElement = postElement.querySelector<HTMLTimeElement>(TIMESTAMP_SELECTOR)

  const authorUrl = authorLinkElement?.href || null
  const timestamp = timestampElement?.getAttribute('datetime') || null

  // Generate unique hash for this post
  const hash = generateHash(content + author + (timestamp || ''))

  return {
    hash,
    content,
    author,
    authorUrl,
    timestamp,
  }
}

/**
 * Generate a simple hash for post identification
 * Uses a fast non-crypto hash since we just need uniqueness, not security
 */
function generateHash(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  // Convert to hex and ensure positive
  return Math.abs(hash).toString(16).padStart(8, '0')
}
