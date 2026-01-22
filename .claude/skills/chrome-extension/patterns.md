# Chrome Extension Advanced Patterns

## Error Boundary for Content Scripts

```typescript
function safeExecute<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch (error) {
    console.error('[LinkedOut] Error:', error);
    return fallback;
  }
}

// Usage
const postData = safeExecute(() => extractPostData(element), null);
```

## Graceful Degradation

```typescript
// Check if extension context is still valid
function isExtensionContextValid(): boolean {
  try {
    return !!chrome.runtime?.id;
  } catch {
    return false;
  }
}

// Wrap all chrome API calls
async function safeSendMessage<T>(message: Message): Promise<T | null> {
  if (!isExtensionContextValid()) {
    console.warn('[LinkedOut] Extension context invalidated');
    return null;
  }

  try {
    return await chrome.runtime.sendMessage(message);
  } catch (error) {
    if ((error as Error).message.includes('Extension context invalidated')) {
      // Extension was reloaded/updated
      location.reload();
    }
    throw error;
  }
}
```

## LinkedIn-Specific Selectors

```typescript
// Centralized selectors (update when LinkedIn changes)
export const LINKEDIN_SELECTORS = {
  // Feed
  feed: '.scaffold-finite-scroll__content',
  post: '[data-urn^="urn:li:activity:"]',

  // Post content
  postContent: '.feed-shared-update-v2__description',
  postText: '.feed-shared-text',

  // Author
  authorContainer: '.update-components-actor',
  authorName: '.update-components-actor__name span[aria-hidden="true"]',
  authorTitle: '.update-components-actor__description',

  // Engagement
  socialCounts: '.social-details-social-counts',
  likeCount: '.social-details-social-counts__reactions-count',
  commentCount: '.social-details-social-counts__comments',

  // Actions
  actionBar: '.feed-shared-social-actions',

  // Timestamp
  timestamp: '.update-components-actor__sub-description time',
} as const;

// Selector validation (detect LinkedIn changes)
function validateSelectors(): boolean {
  const required = ['feed', 'post', 'postContent'];
  const missing = required.filter((key) => {
    const selector = LINKEDIN_SELECTORS[key as keyof typeof LINKEDIN_SELECTORS];
    return !document.querySelector(selector);
  });

  if (missing.length > 0) {
    console.warn('[LinkedOut] Missing selectors:', missing);
    return false;
  }
  return true;
}
```

## CSS Injection Without Conflicts

```css
/* linkedout.css - Scoped styles */

/* Use specific prefix */
[class^="linkedout-"],
[class*=" linkedout-"] {
  all: revert;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* High specificity to override LinkedIn */
html body .linkedout-overlay {
  position: absolute !important;
  top: 8px !important;
  right: 8px !important;
  z-index: 100 !important;
  display: flex !important;
  gap: 4px !important;
  padding: 4px !important;
  background: white !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

html body .linkedout-btn {
  all: unset !important;
  cursor: pointer !important;
  padding: 6px 10px !important;
  border-radius: 6px !important;
  font-size: 16px !important;
  transition: background 0.2s, transform 0.1s !important;
}

html body .linkedout-btn:hover {
  background: #f3f4f6 !important;
  transform: scale(1.1) !important;
}

html body .linkedout-btn.voted {
  background: #dcfce7 !important;
}

html body .linkedout-btn.loading {
  opacity: 0.5 !important;
  pointer-events: none !important;
}
```

## Popup State Management

```typescript
// popup/state.ts
interface PopupState {
  loading: boolean;
  error: string | null;
  leaderboard: LeaderboardEntry[];
  filter: VoteType | null;
}

class PopupStore {
  private state: PopupState = {
    loading: true,
    error: null,
    leaderboard: [],
    filter: null,
  };

  private listeners = new Set<(state: PopupState) => void>();

  getState(): Readonly<PopupState> {
    return this.state;
  }

  setState(partial: Partial<PopupState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  subscribe(listener: (state: PopupState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.state));
  }
}

export const store = new PopupStore();

// Auto-bind to DOM
store.subscribe((state) => {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const listEl = document.getElementById('leaderboard');

  if (loadingEl) loadingEl.hidden = !state.loading;
  if (errorEl) {
    errorEl.hidden = !state.error;
    errorEl.textContent = state.error || '';
  }
  if (listEl) {
    listEl.innerHTML = state.leaderboard
      .map((entry) => `<li>${entry.urn}: ${entry.totalVotes} votes</li>`)
      .join('');
  }
});
```

## Testing Utilities

```typescript
// tests/mocks/chrome.ts
export function createChromeMock() {
  const storage = new Map<string, any>();

  return {
    runtime: {
      id: 'test-extension-id',
      sendMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
      onInstalled: {
        addListener: jest.fn(),
      },
    },
    storage: {
      local: {
        get: jest.fn((keys) => {
          if (typeof keys === 'string') {
            return Promise.resolve({ [keys]: storage.get(keys) });
          }
          const result: Record<string, any> = {};
          keys.forEach((k: string) => {
            if (storage.has(k)) result[k] = storage.get(k);
          });
          return Promise.resolve(result);
        }),
        set: jest.fn((items) => {
          Object.entries(items).forEach(([k, v]) => storage.set(k, v));
          return Promise.resolve();
        }),
        remove: jest.fn((keys) => {
          (Array.isArray(keys) ? keys : [keys]).forEach((k) => storage.delete(k));
          return Promise.resolve();
        }),
      },
      onChanged: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      },
    },
    tabs: {
      query: jest.fn(),
      sendMessage: jest.fn(),
    },
    alarms: {
      create: jest.fn(),
      onAlarm: {
        addListener: jest.fn(),
      },
    },
  };
}

// Setup in test
beforeEach(() => {
  (global as any).chrome = createChromeMock();
});
```

## Build Configuration

```typescript
// vite.config.ts for extension
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.ts'),
        popup: resolve(__dirname, 'src/popup/popup.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
```
