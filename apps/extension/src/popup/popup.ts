interface Settings {
  enabled: boolean
  showOverlay: boolean
}

// Load settings on popup open
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await loadSettings()
  applySettings(settings)
  loadStats()

  // Setup toggle listeners
  const enabledToggle = document.getElementById('enabledToggle') as HTMLInputElement
  const overlayToggle = document.getElementById('overlayToggle') as HTMLInputElement

  enabledToggle.addEventListener('change', () => {
    saveSettings({ enabled: enabledToggle.checked, showOverlay: overlayToggle.checked })
  })

  overlayToggle.addEventListener('change', () => {
    saveSettings({ enabled: enabledToggle.checked, showOverlay: overlayToggle.checked })
  })
})

async function loadSettings(): Promise<Settings> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
      resolve(response || { enabled: true, showOverlay: true })
    })
  })
}

function applySettings(settings: Settings) {
  const enabledToggle = document.getElementById('enabledToggle') as HTMLInputElement
  const overlayToggle = document.getElementById('overlayToggle') as HTMLInputElement

  enabledToggle.checked = settings.enabled
  overlayToggle.checked = settings.showOverlay
}

async function saveSettings(settings: Settings) {
  chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', settings })

  // Notify content scripts to update
  const tabs = await chrome.tabs.query({ url: 'https://www.linkedin.com/*' })
  for (const tab of tabs) {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_UPDATED', settings })
    }
  }
}

async function loadStats() {
  try {
    const result = await chrome.storage.local.get(['todayVotes', 'todayBullshit'])

    const totalVotesEl = document.getElementById('totalVotes')
    const bullshitDetectedEl = document.getElementById('bullshitDetected')

    if (totalVotesEl) {
      totalVotesEl.textContent = (result.todayVotes || 0).toString()
    }
    if (bullshitDetectedEl) {
      bullshitDetectedEl.textContent = (result.todayBullshit || 0).toString()
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}
