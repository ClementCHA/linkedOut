import type { PostData } from './detector'
import {
  type VoteType,
  type PostScore,
  VOTE_CONFIG,
  POSITIVE_VOTES,
  NEGATIVE_VOTES,
  getPostScore,
  submitVote,
} from './storage'

/**
 * Inject the voting overlay into a LinkedIn post
 */
export function injectOverlay(postElement: HTMLElement, postData: PostData) {
  const overlay = createOverlayElement(postData)

  // Find the best place to insert the overlay (after the post actions bar)
  const actionsBar = postElement.querySelector(
    '.feed-shared-social-actions, .social-details-social-actions'
  )

  if (actionsBar?.parentNode) {
    actionsBar.parentNode.insertBefore(overlay, actionsBar.nextSibling)
  } else {
    postElement.appendChild(overlay)
  }

  // Load existing score
  loadScore(postData.hash, overlay)
}

/**
 * Create the compact overlay DOM element
 */
function createOverlayElement(postData: PostData): HTMLElement {
  const overlay = document.createElement('div')
  overlay.className = 'lo-overlay'
  overlay.dataset.postHash = postData.hash

  // Build buttons HTML
  const positiveButtons = POSITIVE_VOTES.map((vote) => createButtonHTML(vote)).join('')
  const negativeButtons = NEGATIVE_VOTES.map((vote) => createButtonHTML(vote)).join('')

  overlay.innerHTML = `
    <div class="lo-bar">
      <span class="lo-logo">LO</span>
      <div class="lo-buttons lo-buttons--positive">${positiveButtons}</div>
      <span class="lo-separator">│</span>
      <div class="lo-buttons lo-buttons--negative">${negativeButtons}</div>
      <span class="lo-count" data-count>·</span>
    </div>
  `

  // Attach vote handlers
  const buttons = overlay.querySelectorAll<HTMLButtonElement>('[data-vote]')
  for (const button of buttons) {
    button.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      handleVote(postData.hash, button.dataset.vote as VoteType, overlay)
    })
  }

  return overlay
}

/**
 * Create HTML for a single vote button
 */
function createButtonHTML(vote: VoteType): string {
  const config = VOTE_CONFIG[vote]
  return `<button class="lo-btn" data-vote="${vote}" title="${config.label}">
    <span class="lo-emoji">${config.emoji}</span>
  </button>`
}

/**
 * Handle a vote submission
 */
async function handleVote(postHash: string, voteType: VoteType, overlay: HTMLElement) {
  const buttons = overlay.querySelectorAll<HTMLButtonElement>('[data-vote]')

  // Disable buttons during submission
  for (const btn of buttons) {
    btn.disabled = true
  }

  try {
    const score = await submitVote(postHash, voteType)
    updateOverlay(overlay, score)
  } catch (error) {
    console.error('[LinkedOut] Vote failed:', error)
  } finally {
    for (const btn of buttons) {
      btn.disabled = false
    }
  }
}

/**
 * Load and display the current score for a post
 */
async function loadScore(postHash: string, overlay: HTMLElement) {
  try {
    const score = await getPostScore(postHash)
    updateOverlay(overlay, score)
  } catch (error) {
    console.error('[LinkedOut] Failed to load score:', error)
  }
}

/**
 * Update the overlay UI with score data
 */
function updateOverlay(overlay: HTMLElement, score: PostScore) {
  // Update vote count
  const countEl = overlay.querySelector('[data-count]')
  if (countEl) {
    countEl.textContent = score.total > 0 ? `· ${score.total}` : '·'
  }

  // Update selected state
  const buttons = overlay.querySelectorAll<HTMLButtonElement>('[data-vote]')
  for (const btn of buttons) {
    const isSelected = btn.dataset.vote === score.myVote
    btn.classList.toggle('lo-btn--selected', isSelected)
  }
}
