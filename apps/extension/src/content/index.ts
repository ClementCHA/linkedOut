import { detectPost, POST_SELECTOR } from './detector'
import { injectOverlay } from './overlay'

const pendingPosts = new Set<HTMLElement>()
let isProcessing = false

function init() {
  if (!document.body) return

  // Process existing posts
  document.querySelectorAll<HTMLElement>(POST_SELECTOR).forEach(queuePost)
  processPendingPosts()

  // Watch for new posts (infinite scroll)
  const observer = new MutationObserver(
    debounce(() => {
      document.querySelectorAll<HTMLElement>(POST_SELECTOR).forEach(queuePost)
      processPendingPosts()
    }, 100)
  )

  const feedContainer = document.querySelector('.scaffold-finite-scroll, .core-rail, main')
  observer.observe(feedContainer || document.body, { childList: true, subtree: true })
}

function queuePost(postElement: HTMLElement) {
  if (!postElement.dataset.linkedoutProcessed) {
    pendingPosts.add(postElement)
  }
}

function processPendingPosts() {
  if (isProcessing || pendingPosts.size === 0) return
  isProcessing = true

  const processNext = () => {
    const next = pendingPosts.values().next()
    if (next.done) {
      isProcessing = false
      return
    }

    pendingPosts.delete(next.value)
    processPost(next.value)

    if (pendingPosts.size > 0) {
      requestAnimationFrame(processNext)
    } else {
      isProcessing = false
    }
  }

  requestAnimationFrame(processNext)
}

function processPost(postElement: HTMLElement) {
  if (postElement.dataset.linkedoutProcessed) return

  const postData = detectPost(postElement)
  if (postData) {
    postElement.dataset.linkedoutProcessed = 'true'
    injectOverlay(postElement, postData)
  }
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return ((...args: unknown[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }) as T
}

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
