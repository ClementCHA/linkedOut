import { detectPost, POST_SELECTOR } from './detector'
import { injectOverlay } from './overlay'

// Initialize the extension
function init() {
  console.log('[LinkedOut] Extension loaded')

  if (!document.body) {
    return
  }

  // Process existing posts
  document.querySelectorAll<HTMLElement>(POST_SELECTOR).forEach(processPost)

  // Watch for new posts (infinite scroll)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement

          // Check if the added node is a post
          if (element.matches?.(POST_SELECTOR)) {
            processPost(element)
          }

          // Check for posts within the added node
          element.querySelectorAll?.<HTMLElement>(POST_SELECTOR).forEach(processPost)
        }
      }
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

// Process a single post
function processPost(postElement: HTMLElement) {
  // Skip if already processed
  if (postElement.dataset.linkedoutProcessed) {
    return
  }

  const postData = detectPost(postElement)

  if (postData) {
    postElement.dataset.linkedoutProcessed = 'true'
    injectOverlay(postElement, postData)
  }
}

// Wait for DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
