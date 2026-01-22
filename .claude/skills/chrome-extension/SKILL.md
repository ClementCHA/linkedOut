---
name: chrome-extension
description: Patterns Chrome Extension Manifest V3. Chargé automatiquement pour développement d'extension.
allowed-tools: Read, Write, Edit, Glob
---

# Chrome Extension Patterns

Patterns et bonnes pratiques pour le développement d'extensions Chrome Manifest V3.

## Content Script Patterns

### Safe DOM Injection

```typescript
// Créer un élément isolé avec Shadow DOM
function createIsolatedWidget(container: HTMLElement): ShadowRoot {
  const host = document.createElement('div');
  host.id = 'linkedout-host';
  container.appendChild(host);

  const shadow = host.attachShadow({ mode: 'closed' });

  // Styles isolés dans le shadow DOM
  const style = document.createElement('style');
  style.textContent = `
    .widget { /* styles */ }
  `;
  shadow.appendChild(style);

  return shadow;
}
```

### Efficient DOM Observation

```typescript
// Observer optimisé pour LinkedIn feed
function observeFeed(callback: (posts: HTMLElement[]) => void) {
  const feed = document.querySelector('.scaffold-finite-scroll__content');
  if (!feed) return;

  let timeout: number;
  const observer = new MutationObserver(() => {
    // Debounce pour éviter trop d'appels
    clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      const posts = Array.from(feed.querySelectorAll('[data-urn^="urn:li:activity:"]'));
      callback(posts as HTMLElement[]);
    }, 100);
  });

  observer.observe(feed, { childList: true, subtree: true });

  // Cleanup function
  return () => observer.disconnect();
}
```

### Post Data Extraction

```typescript
interface LinkedInPost {
  urn: string;
  content: string;
  author: string;
  timestamp: string;
}

function extractPostData(element: HTMLElement): LinkedInPost | null {
  const urn = element.getAttribute('data-urn');
  if (!urn) return null;

  const content = element.querySelector('.feed-shared-update-v2__description')?.textContent?.trim();
  const author = element.querySelector('.update-components-actor__name')?.textContent?.trim();
  const timestamp = element.querySelector('time')?.getAttribute('datetime');

  if (!content || content.length < 50) return null; // Filter short posts

  return {
    urn: extractNumericId(urn),
    content,
    author: author || 'Unknown',
    timestamp: timestamp || new Date().toISOString(),
  };
}

function extractNumericId(urn: string): string {
  // urn:li:activity:7123456789 → 7123456789
  const match = urn.match(/\d+$/);
  return match ? match[0] : urn;
}
```

## Background Service Worker Patterns

### Message Router

```typescript
// background/router.ts
type MessageHandler<T, R> = (payload: T, sender: chrome.runtime.MessageSender) => Promise<R>;

interface MessageMap {
  SUBMIT_VOTE: { payload: { urn: string; voteType: string }; response: { success: boolean } };
  GET_LEADERBOARD: { payload: { limit: number }; response: LeaderboardEntry[] };
  GET_VOTER_ID: { payload: void; response: string };
}

class MessageRouter {
  private handlers = new Map<string, MessageHandler<any, any>>();

  register<K extends keyof MessageMap>(
    type: K,
    handler: MessageHandler<MessageMap[K]['payload'], MessageMap[K]['response']>
  ) {
    this.handlers.set(type, handler);
  }

  start() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const handler = this.handlers.get(message.type);
      if (handler) {
        handler(message.payload, sender)
          .then(sendResponse)
          .catch((error) => sendResponse({ error: error.message }));
        return true; // Keep channel open
      }
    });
  }
}

// Usage
const router = new MessageRouter();

router.register('SUBMIT_VOTE', async ({ urn, voteType }) => {
  const voterId = await getVoterId();
  await api.submitVote({ urn, voteType, voterId });
  return { success: true };
});

router.start();
```

### Persistent State via Alarms

```typescript
// Service workers can be terminated - use alarms for periodic tasks
chrome.alarms.create('sync-data', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'sync-data') {
    const leaderboard = await api.getLeaderboard();
    await chrome.storage.local.set({ cachedLeaderboard: leaderboard });
  }
});
```

## Storage Patterns

### Typed Storage Wrapper

```typescript
// storage/schema.ts
interface StorageSchema {
  voterId: string;
  settings: {
    enabled: boolean;
    showOverlay: boolean;
  };
  cache: {
    leaderboard: LeaderboardEntry[];
    updatedAt: number;
  };
}

// storage/index.ts
export const storage = {
  async get<K extends keyof StorageSchema>(key: K): Promise<StorageSchema[K] | null> {
    const result = await chrome.storage.local.get(key);
    return result[key] ?? null;
  },

  async set<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  },

  async update<K extends keyof StorageSchema>(
    key: K,
    updater: (current: StorageSchema[K] | null) => StorageSchema[K]
  ): Promise<void> {
    const current = await this.get(key);
    await this.set(key, updater(current));
  },

  onChange<K extends keyof StorageSchema>(
    key: K,
    callback: (newValue: StorageSchema[K], oldValue: StorageSchema[K]) => void
  ): () => void {
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[key]) {
        callback(changes[key].newValue, changes[key].oldValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  },
};
```

## API Communication

### Fetch with Retry

```typescript
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i))); // Exponential backoff
    }
  }
  throw new Error('Max retries reached');
}
```

## UI Components

### Vote Button Overlay

```typescript
function createVoteOverlay(postUrn: string): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'linkedout-vote-overlay';
  overlay.innerHTML = `
    <button data-vote="solid" class="linkedout-btn" title="Solid">
      <span>👍</span>
    </button>
    <button data-vote="bullshit" class="linkedout-btn" title="Bullshit">
      <span>💩</span>
    </button>
    <button data-vote="scam" class="linkedout-btn" title="Scam">
      <span>🚨</span>
    </button>
    <span class="linkedout-score"></span>
  `;

  overlay.addEventListener('click', async (e) => {
    const button = (e.target as HTMLElement).closest('[data-vote]');
    if (!button) return;

    const voteType = button.getAttribute('data-vote')!;
    button.classList.add('loading');

    try {
      await chrome.runtime.sendMessage({
        type: 'SUBMIT_VOTE',
        payload: { urn: postUrn, voteType },
      });
      button.classList.add('voted');
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      button.classList.remove('loading');
    }
  });

  return overlay;
}
```

Voir [patterns.md](patterns.md) pour plus d'exemples.
