# Chrome Extension Rules

Ces règles s'appliquent à tous les fichiers dans `apps/extension/`

## Architecture

```
apps/extension/
├── src/
│   ├── background/     # Service Worker (Manifest V3)
│   ├── content/        # Scripts injectés dans LinkedIn
│   ├── popup/          # Popup de l'extension
│   └── options/        # Page d'options
├── public/
│   ├── manifest.json
│   └── icons/
└── dist/               # Build output
```

## Manifest V3 Obligatoire

Manifest V2 est déprécié. Toujours utiliser V3.

```json
{
  "manifest_version": 3,
  "background": {
    "service_worker": "background.js"
  }
}
```

## Règles Content Scripts

### Isolation CSS

```css
/* TOUJOURS préfixer les classes */
.linkedout-* { }

/* Reset pour éviter conflits LinkedIn */
.linkedout-container {
  all: initial;
}
```

### Injection DOM

```typescript
// ✅ Vérifier avant d'injecter
if (!element.querySelector('.linkedout-overlay')) {
  element.appendChild(overlay);
}

// ❌ Ne jamais modifier le DOM LinkedIn directement
element.innerHTML = '...'; // INTERDIT
```

### Performance

```typescript
// ✅ Debounce les observers
const observer = new MutationObserver(
  debounce(handleMutations, 100)
);

// ✅ Limiter la portée
observer.observe(feedContainer, { // Pas document.body
  childList: true,
  subtree: true,
});

// ✅ Déconnecter quand non nécessaire
observer.disconnect();
```

## Règles Background (Service Worker)

### Pas d'état persistant

```typescript
// ❌ L'état est perdu au réveil
let cache = {};

// ✅ Utiliser chrome.storage
await chrome.storage.local.set({ cache: data });
```

### Async obligatoire

```typescript
// ❌ Listener synchrone
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const data = fetchData(); // Bloquant
  sendResponse(data);
});

// ✅ Retourner true pour async
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  fetchData().then(sendResponse);
  return true; // Keep channel open
});
```

## Communication

### Content ↔ Background

```typescript
// Content script → Background
const response = await chrome.runtime.sendMessage({
  type: 'ACTION_TYPE',
  payload: { ... }
});

// Background → Content (spécifier le tab)
await chrome.tabs.sendMessage(tabId, {
  type: 'ACTION_TYPE',
  payload: { ... }
});
```

### Typage des messages

```typescript
type Message =
  | { type: 'SUBMIT_VOTE'; payload: { urn: string; voteType: string } }
  | { type: 'GET_LEADERBOARD'; payload: { limit: number } }
  | { type: 'VOTE_SUBMITTED'; payload: { success: boolean } };
```

## Storage

### Typage strict

```typescript
interface StorageSchema {
  voterId: string;
  settings: UserSettings;
  cache: CachedLeaderboard;
}

// Wrapper typé
async function getStorage<K extends keyof StorageSchema>(
  key: K
): Promise<StorageSchema[K] | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key];
}
```

### Quotas

```typescript
// Vérifier l'espace disponible
const { quota, usage } = await navigator.storage.estimate();

// storage.local: ~5MB
// storage.sync: ~100KB (synchronisé)
```

## Permissions

### Principe du moindre privilège

```json
{
  "permissions": [
    "storage",      // Nécessaire
    "activeTab"     // Mieux que "tabs"
  ],
  "host_permissions": [
    "https://www.linkedin.com/*",  // Spécifique
    "http://localhost:3001/*"      // Dev seulement
  ]
}
```

### Permissions optionnelles

```typescript
// Demander au runtime si besoin
const granted = await chrome.permissions.request({
  permissions: ['notifications']
});
```

## Sécurité

### Pas d'eval

```typescript
// ❌ JAMAIS
eval(userInput);
new Function(userInput);

// ❌ innerHTML avec contenu externe
element.innerHTML = responseFromApi;

// ✅ Méthodes sûres
element.textContent = responseFromApi;
```

### CSP

Le manifest V3 impose une CSP stricte. Pas de script inline.

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

## Tests

```typescript
// Mock des APIs Chrome
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
    },
  },
};
```

## Build

```bash
# Dev avec watch
pnpm --filter @linkedout/extension dev

# Build production
pnpm --filter @linkedout/extension build

# Charger dans Chrome
# chrome://extensions → Load unpacked → dist/
```
