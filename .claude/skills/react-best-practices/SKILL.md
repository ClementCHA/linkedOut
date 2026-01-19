---
name: react-best-practices
description: React et Next.js performance optimization guidelines (basé sur Vercel Engineering - 45+ règles). Utiliser pour review de code React, optimisation de performance, et création de composants.
allowed-tools: Read, Grep, Glob
---

# React & Next.js Best Practices

Guidelines de performance basées sur 10 ans d'expertise Vercel (45+ règles), adaptées pour ce monorepo.

## Priorité des Règles

| Priorité | Catégorie | Impact |
|----------|-----------|--------|
| CRITICAL | Eliminating Waterfalls | Temps de chargement |
| CRITICAL | Bundle Size | Taille JS initiale |
| HIGH | Server Performance | TTFB, caching |
| MEDIUM-HIGH | Client-Side Data Fetching | UX, déduplication |
| MEDIUM | Re-render Optimization | Fluidité UI |
| MEDIUM | Rendering Performance | Paint, layout |
| LOW-MEDIUM | JS Micro-optimizations | Performance fine |

---

## CRITICAL: Eliminating Waterfalls

### async-1: Paralléliser les fetches indépendants

```tsx
// ❌ Waterfall - séquentiel
async function Page() {
  const user = await getUser()
  const posts = await getPosts() // Attend user
  const comments = await getComments() // Attend posts
}

// ✅ Parallèle
async function Page() {
  const [user, posts, comments] = await Promise.all([
    getUser(),
    getPosts(),
    getComments()
  ])
}
```

### async-2: Différer l'await jusqu'au besoin

```tsx
// ❌ Await immédiat bloque tout
async function Page() {
  const data = await fetchData()
  if (condition) {
    return <Empty />
  }
  return <Component data={data} />
}

// ✅ Await seulement si nécessaire
async function Page() {
  const dataPromise = fetchData() // Démarre immédiatement
  if (condition) {
    return <Empty /> // Pas besoin d'attendre
  }
  const data = await dataPromise // Await seulement ici
  return <Component data={data} />
}
```

### async-3: Précharger les données critiques

```tsx
// ✅ Preload pattern avec Next.js
import { preload } from 'react-dom'

export function UserProfile({ userId }: { userId: string }) {
  preload(`/api/users/${userId}`, { as: 'fetch' })
  // ...
}
```

### async-4: Streaming avec Suspense

```tsx
// ✅ Ne pas bloquer la page entière
export default function Page() {
  return (
    <main>
      <Header /> {/* Rendu immédiat */}
      <Suspense fallback={<Skeleton />}>
        <SlowComponent /> {/* Streamé */}
      </Suspense>
    </main>
  )
}
```

### async-5: Paralléliser via composition de composants

```tsx
// ✅ Chaque composant fetch en parallèle
export default function Dashboard() {
  return (
    <div>
      <Suspense fallback={<Skeleton />}>
        <UserStats /> {/* Fetch indépendant */}
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <RecentActivity /> {/* Fetch indépendant */}
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <Notifications /> {/* Fetch indépendant */}
      </Suspense>
    </div>
  )
}
```

---

## CRITICAL: Bundle Size

### bundle-1: Import dynamique pour code non-critique

```tsx
// ❌ Import statique de tout
import { HeavyChart } from 'chart-library'

// ✅ Import dynamique
const HeavyChart = dynamic(() => import('chart-library'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

### bundle-2: Éviter les barrel files en production

```tsx
// ❌ Importe potentiellement tout le package
import { Button } from '@linkedout/ui'

// ✅ Import direct (tree-shakeable)
import { Button } from '@linkedout/ui/components/Button'
```

### bundle-3: Lazy load les routes et modales

```tsx
// ✅ Next.js le fait automatiquement avec App Router
// Pour les modales/drawers:
const Modal = dynamic(() => import('./Modal'))
const Drawer = dynamic(() => import('./Drawer'))
```

### bundle-4: Différer les libs tierces non-critiques

```tsx
// ❌ Charge analytics au démarrage
import { Analytics } from 'analytics-lib'

// ✅ Charge après l'interaction utilisateur
useEffect(() => {
  const loadAnalytics = async () => {
    const { Analytics } = await import('analytics-lib')
    Analytics.init()
  }
  // Charge après idle ou interaction
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadAnalytics)
  } else {
    setTimeout(loadAnalytics, 1000)
  }
}, [])
```

### bundle-5: Preload basé sur l'intention utilisateur

```tsx
// ✅ Précharger au hover
<Link
  href="/heavy-page"
  onMouseEnter={() => {
    import('./HeavyComponent')
  }}
>
  Go to page
</Link>
```

---

## HIGH: Server Performance

### server-1: Utiliser le cache de Next.js

```tsx
// ✅ Fetch avec cache et revalidation
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // Cache 1h
  })
  return res.json()
}
```

### server-2: React.cache() pour déduplication per-request

```tsx
import { cache } from 'react'

// ✅ Même requête, même résultat dans un render
export const getUser = cache(async (id: string) => {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
})

// Appelé plusieurs fois dans différents composants
// mais n'exécute qu'une seule requête
async function UserName({ id }: { id: string }) {
  const user = await getUser(id) // Dédupliqué
  return <span>{user.name}</span>
}

async function UserEmail({ id }: { id: string }) {
  const user = await getUser(id) // Même résultat, pas de re-fetch
  return <span>{user.email}</span>
}
```

### server-3: LRU Cache pour cross-request caching

```tsx
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, unknown>({
  max: 100,
  ttl: 1000 * 60 * 5 // 5 minutes
})

export async function getCachedData(key: string) {
  const cached = cache.get(key)
  if (cached) return cached

  const data = await fetchExpensiveData(key)
  cache.set(key, data)
  return data
}
```

### server-4: Server Components par défaut

```tsx
// ✅ Server Component (pas de "use client")
// - Pas de JS envoyé au client
// - Accès direct à la DB/API
// - Pas de useState/useEffect

export default async function UserList() {
  const users = await db.users.findMany()
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

### server-5: "use client" au niveau le plus bas possible

```tsx
// ❌ Tout le composant en client
'use client'
export function Page() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <Header /> {/* Statique mais envoyé au client */}
      <Counter count={count} setCount={setCount} />
    </div>
  )
}

// ✅ Seulement la partie interactive
// Page.tsx (Server Component)
export function Page() {
  return (
    <div>
      <Header /> {/* Reste sur le serveur */}
      <Counter /> {/* Seul composant client */}
    </div>
  )
}

// Counter.tsx
'use client'
export function Counter() {
  const [count, setCount] = useState(0)
  // ...
}
```

### server-6: Minimiser la sérialisation RSC → Client

```tsx
// ❌ Passer des objets complexes
<ClientComponent user={fullUserObject} />

// ✅ Passer seulement ce qui est nécessaire
<ClientComponent
  userName={user.name}
  userEmail={user.email}
/>
```

---

## MEDIUM-HIGH: Client-Side Data Fetching

### client-1: SWR pour déduplication automatique

```tsx
import useSWR from 'swr'

// ✅ Requêtes dédupliquées automatiquement
function useUser(id: string) {
  const { data, error, isLoading } = useSWR(
    `/api/users/${id}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000
    }
  )
  return { user: data, error, isLoading }
}

// Appelé dans plusieurs composants = 1 seule requête
function UserAvatar({ id }) {
  const { user } = useUser(id)
  return <img src={user?.avatar} />
}

function UserName({ id }) {
  const { user } = useUser(id)
  return <span>{user?.name}</span>
}
```

### client-2: Différer la lecture du state

```tsx
// ❌ Lecture immédiate du store
function Component() {
  const allItems = useStore(state => state.items) // Re-render à chaque changement
  return <Child items={allItems} />
}

// ✅ Lecture différée au composant qui en a besoin
function Component() {
  return <Child />
}

function Child() {
  const items = useStore(state => state.items) // Seulement ce composant re-render
  return <List items={items} />
}
```

### client-3: Lazy state initialization

```tsx
// ❌ Calcul coûteux à chaque render
const [data, setData] = useState(expensiveComputation())

// ✅ Calcul seulement au premier render
const [data, setData] = useState(() => expensiveComputation())

// ✅ Pour les objets complexes
const [filters, setFilters] = useState(() => ({
  ...defaultFilters,
  ...parseUrlParams(window.location.search)
}))
```

### client-4: startTransition pour updates non-urgentes

```tsx
import { useTransition } from 'react'

function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isPending, startTransition] = useTransition()

  function handleSearch(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value) // Urgent: mise à jour input immédiate

    startTransition(() => {
      // Non-urgent: peut être interrompu
      setResults(filterLargeList(value))
    })
  }

  return (
    <>
      <input value={query} onChange={handleSearch} />
      {isPending && <Spinner />}
      <ResultsList results={results} />
    </>
  )
}
```

### client-5: useDeferredValue pour valeurs dérivées

```tsx
import { useDeferredValue } from 'react'

function SearchResults({ query }: { query: string }) {
  // Version "retardée" de query pour éviter de bloquer l'UI
  const deferredQuery = useDeferredValue(query)
  const isStale = query !== deferredQuery

  const results = useMemo(
    () => filterLargeList(deferredQuery),
    [deferredQuery]
  )

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      <ResultsList results={results} />
    </div>
  )
}
```

---

## MEDIUM: Re-render Optimization

### rerender-1: Éviter les objets/arrays inline dans les props

```tsx
// ❌ Nouvel objet à chaque render
<Component style={{ color: 'red' }} />
<Component items={[1, 2, 3]} />

// ✅ Référence stable (hors du composant ou useMemo)
const style = { color: 'red' }
const items = [1, 2, 3]
<Component style={style} items={items} />
```

### rerender-2: useCallback pour les handlers passés en props

```tsx
// ❌ Nouvelle fonction à chaque render
<Button onClick={() => handleClick(id)} />

// ✅ Référence stable
const handleButtonClick = useCallback(() => {
  handleClick(id)
}, [id])
<Button onClick={handleButtonClick} />
```

### rerender-3: useMemo pour calculs coûteux

```tsx
// ❌ Recalcul à chaque render
const sortedItems = items.sort((a, b) => a.name.localeCompare(b.name))

// ✅ Calcul memoïzé
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)
```

### rerender-4: Composition plutôt que props drilling

```tsx
// ❌ Props drilling cause des re-renders en cascade
<Parent user={user}>
  <Child user={user}>
    <GrandChild user={user} />
  </Child>
</Parent>

// ✅ Composition avec children
<Parent>
  <Child>
    <GrandChild user={user} />
  </Child>
</Parent>
```

### rerender-5: Séparer state qui change souvent

```tsx
// ❌ Un seul state = tout re-render
const [state, setState] = useState({
  mousePos: { x: 0, y: 0 },
  formData: {}
})

// ✅ States séparés
const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
const [formData, setFormData] = useState({})
```

---

## MEDIUM: Rendering Performance

### rendering-1: Ternaire explicite plutôt que &&

```tsx
// ❌ Peut afficher "0" ou "false" si condition est falsy
{count && <Counter count={count} />}
{items.length && <List items={items} />}

// ✅ Ternaire explicite
{count > 0 ? <Counter count={count} /> : null}
{items.length > 0 ? <List items={items} /> : null}
```

### rendering-2: content-visibility pour listes longues

```css
/* ✅ Skip le rendu des éléments hors viewport */
.list-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 50px; /* Hauteur estimée */
}
```

```tsx
function LongList({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} className="list-item">
          {item.content}
        </li>
      ))}
    </ul>
  )
}
```

### rendering-3: Animer les wrappers SVG, pas les éléments

```tsx
// ❌ Animer directement le SVG (re-render coûteux)
<motion.path d="..." animate={{ pathLength: 1 }} />

// ✅ Animer un wrapper
<motion.div animate={{ rotate: 360 }}>
  <svg>
    <path d="..." />
  </svg>
</motion.div>
```

### rendering-4: Éviter le mismatch d'hydratation

```tsx
// ❌ Différent server vs client
function Component() {
  return <div>{new Date().toLocaleString()}</div>
}

// ✅ Inline script pour valeurs dynamiques
function Component() {
  return (
    <>
      <div id="time" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('time').textContent =
              new Date().toLocaleString()
          `
        }}
      />
    </>
  )
}

// ✅ Ou useEffect côté client
function Component() {
  const [time, setTime] = useState<string>()
  useEffect(() => {
    setTime(new Date().toLocaleString())
  }, [])
  return <div>{time ?? 'Loading...'}</div>
}
```

### rendering-5: Virtualisation pour très longues listes

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50
  })

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              height: virtualItem.size
            }}
          >
            {items[virtualItem.index].content}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## LOW-MEDIUM: JavaScript Performance

### js-1: Index maps pour lookups répétés

```tsx
// ❌ O(n) lookup à chaque fois
function findUser(users: User[], id: string) {
  return users.find(u => u.id === id)
}

// ✅ O(1) lookup avec Map
const userMap = useMemo(
  () => new Map(users.map(u => [u.id, u])),
  [users]
)
function findUser(id: string) {
  return userMap.get(id)
}
```

### js-2: toSorted/toReversed pour immutabilité

```tsx
// ❌ Mute l'array original
const sorted = items.sort((a, b) => a.name.localeCompare(b.name))

// ✅ Retourne un nouvel array (ES2023)
const sorted = items.toSorted((a, b) => a.name.localeCompare(b.name))
const reversed = items.toReversed()
```

### js-3: Early return pour comparaisons d'arrays

```tsx
// ❌ Compare tout même si longueurs différentes
function arraysEqual(a: unknown[], b: unknown[]) {
  return JSON.stringify(a) === JSON.stringify(b)
}

// ✅ Early exit si longueurs différentes
function arraysEqual(a: unknown[], b: unknown[]) {
  if (a.length !== b.length) return false
  return a.every((item, i) => item === b[i])
}
```

### js-4: Batch les changements CSS DOM

```tsx
// ❌ Plusieurs reflows
element.style.width = '100px'
element.style.height = '100px'
element.style.margin = '10px'

// ✅ Un seul reflow via classe
element.classList.add('new-style')

// Ou via cssText
element.style.cssText = 'width: 100px; height: 100px; margin: 10px'
```

### js-5: Cache les appels de fonction répétés

```tsx
// ❌ Recalcul à chaque itération
items.map(item => {
  const config = getConfig() // Appelé N fois
  return transform(item, config)
})

// ✅ Cache hors de la boucle
const config = getConfig()
items.map(item => transform(item, config))
```

---

## Application à ce Monorepo

### Structure recommandée pour apps/web

```
src/
├── app/
│   ├── layout.tsx        # Server Component
│   ├── page.tsx          # Server Component
│   └── users/
│       ├── page.tsx      # Server Component (data fetching)
│       └── UserTable.tsx # "use client" si interactif
├── components/
│   ├── server/           # Server Components purs
│   └── client/           # "use client" Components
└── lib/
    ├── api.ts            # Fonctions fetch avec cache
    └── cache.ts          # LRU cache utilities
```

### Utilisation de @linkedout/core côté client

```tsx
// ✅ Les DTOs peuvent être importés côté client
import type { UserDto } from '@linkedout/core'

// ❌ Ne pas importer les entités domain côté client
import { User } from '@linkedout/core' // Contient logique métier
```

### Checklist Review Performance

- [ ] Pas de waterfalls (Promise.all, Suspense parallèle)
- [ ] Imports dynamiques pour code > 50KB
- [ ] Server Components par défaut
- [ ] "use client" au niveau le plus bas
- [ ] React.cache() pour fonctions réutilisées
- [ ] Pas d'objets inline dans les props
- [ ] useMemo/useCallback si passé en props
- [ ] Ternaire `? :` au lieu de `&&`
- [ ] content-visibility pour listes > 100 items

Voir [patterns.md](patterns.md) pour plus d'exemples.
