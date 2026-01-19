export interface PostData {
  urn: string
  content: string
  author: string
  authorUrl: string | null
  timestamp: string | null
}

// Selectors for LinkedIn DOM
export const POST_SELECTOR = '.feed-shared-update-v2'
const CONTENT_SELECTOR = '.update-components-text, .feed-shared-update-v2__description'
const AUTHOR_SELECTOR = '.update-components-actor__title, .feed-shared-actor__name'
const AUTHOR_LINK_SELECTOR = '.update-components-actor__meta-link, .update-components-actor__container-link'
const TIMESTAMP_SELECTOR = '.update-components-actor__sub-description, .feed-shared-actor__sub-description'

const URN_REGEX = /urn:li:(?:activity|share|ugcPost):(\d+)/

/**
 * Check if we're on the feed page (not a single post page)
 */
export function isOnFeedPage(): boolean {
  const url = window.location.href
  return url.includes('/feed') && !url.includes('/posts/')
}

/**
 * Extract data from a LinkedIn post element
 */
export function detectPost(postElement: HTMLElement): PostData | null {
  // Only process posts on the feed page
  if (!isOnFeedPage()) {
    return null
  }

  const contentElement = postElement.querySelector(CONTENT_SELECTOR)
  const authorElement = postElement.querySelector(AUTHOR_SELECTOR)

  if (!contentElement || !authorElement) {
    return null
  }

  const content = contentElement.textContent?.trim() || ''
  const author = authorElement.textContent?.trim() || ''

  // Skip very short posts
  if (content.length < 50) {
    return null
  }

  const authorLinkElement = postElement.querySelector<HTMLAnchorElement>(AUTHOR_LINK_SELECTOR)
  const timestampElement = postElement.querySelector<HTMLTimeElement>(TIMESTAMP_SELECTOR)

  const authorUrl = authorLinkElement?.href || null
  const timestamp = timestampElement?.getAttribute('datetime') || null

  // Extract LinkedIn URN (unique identifier)
  const urn = extractUrn(postElement) || generateHash(content + author + (timestamp || ''))

  return { urn, content, author, authorUrl, timestamp }
}

/**
 * Extract LinkedIn post ID from element (normalized - just the numeric ID)
 */
function extractUrn(postElement: HTMLElement): string | null {
  const dataUrn = postElement.getAttribute('data-urn')
  if (dataUrn) {
    const match = dataUrn.match(URN_REGEX)
    if (match) return match[1]
  }
  return null
}

/**
 * Generate a simple hash for post identification (fallback)
 */
function generateHash(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return 'hash-' + Math.abs(hash).toString(16).padStart(8, '0')
}
