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

export function injectOverlay(postElement: HTMLElement, postData: PostData) {
  const overlay = createOverlayElement(postData)

  const actionsBar = postElement.querySelector(
    '.feed-shared-social-actions, .social-details-social-actions'
  )

  if (actionsBar?.parentNode) {
    actionsBar.parentNode.insertBefore(overlay, actionsBar.nextSibling)
  } else {
    postElement.appendChild(overlay)
  }

  loadScore(postData.urn, overlay)
}

function createOverlayElement(postData: PostData): HTMLElement {
  const overlay = document.createElement('div')
  overlay.className = 'lo-overlay'
  overlay.dataset.postUrn = postData.urn

  const positiveButtons = POSITIVE_VOTES.map(createButtonHTML).join('')
  const negativeButtons = NEGATIVE_VOTES.map(createButtonHTML).join('')

  overlay.innerHTML = `
    <div class="lo-bar">
      <span class="lo-logo">LO</span>
      <div class="lo-buttons lo-buttons--positive">${positiveButtons}</div>
      <span class="lo-separator">|</span>
      <div class="lo-buttons lo-buttons--negative">${negativeButtons}</div>
      <span class="lo-count" data-count></span>
    </div>
  `

  overlay.querySelectorAll<HTMLButtonElement>('[data-vote]').forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      handleVote(postData, button.dataset.vote as VoteType, overlay)
    })
  })

  return overlay
}

function createButtonHTML(vote: VoteType): string {
  const { emoji, label } = VOTE_CONFIG[vote]
  return `<button class="lo-btn" data-vote="${vote}" title="${label}">
    <span class="lo-emoji">${emoji}</span>
  </button>`
}

async function handleVote(postData: PostData, voteType: VoteType, overlay: HTMLElement) {
  const currentSelected = overlay.querySelector<HTMLButtonElement>('.lo-btn--selected')
  if (currentSelected?.dataset.vote === voteType) return

  const buttons = overlay.querySelectorAll<HTMLButtonElement>('[data-vote]')
  buttons.forEach((btn) => (btn.disabled = true))

  // Optimistic UI update
  currentSelected?.classList.remove('lo-btn--selected')
  overlay.querySelector<HTMLButtonElement>(`[data-vote="${voteType}"]`)?.classList.add('lo-btn--selected')

  try {
    const score = await submitVote(postData.urn, postData.content, voteType)
    updateOverlay(overlay, score)
  } finally {
    buttons.forEach((btn) => (btn.disabled = false))
  }
}

async function loadScore(postUrn: string, overlay: HTMLElement) {
  const score = await getPostScore(postUrn)
  updateOverlay(overlay, score)
}

function updateOverlay(overlay: HTMLElement, score: PostScore) {
  const countEl = overlay.querySelector('[data-count]')
  if (countEl) {
    const newCount = score.total > 0 ? `${score.total}` : ''
    if (countEl.textContent !== newCount) {
      countEl.textContent = newCount
    }
  }

  // Only update buttons that actually changed
  overlay.querySelectorAll<HTMLButtonElement>('[data-vote]').forEach((btn) => {
    const shouldBeSelected = btn.dataset.vote === score.myVote
    const isSelected = btn.classList.contains('lo-btn--selected')
    if (shouldBeSelected !== isSelected) {
      btn.classList.toggle('lo-btn--selected', shouldBeSelected)
    }
  })
}
