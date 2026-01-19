// Background service worker for LinkedOut extension

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      settings: {
        enabled: true,
        showOverlay: true,
      },
    })
  }
})

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_SETTINGS') {
    chrome.storage.local.get('settings').then((result) => {
      sendResponse(result.settings || { enabled: true, showOverlay: true })
    })
    return true // Keep channel open for async response
  }

  if (message.type === 'UPDATE_SETTINGS') {
    chrome.storage.local.set({ settings: message.settings }).then(() => {
      sendResponse({ success: true })
    })
    return true
  }
})

// Optional: Badge to show stats
export function updateBadge(bullshitCount: number) {
  if (bullshitCount > 0) {
    chrome.action.setBadgeText({ text: bullshitCount.toString() })
    chrome.action.setBadgeBackgroundColor({ color: '#e94560' })
  } else {
    chrome.action.setBadgeText({ text: '' })
  }
}
