# React Patterns Avancés

## Data Fetching avec Server Components

### Pattern: Fetch dans le Server Component parent

```tsx
// app/users/page.tsx (Server Component)
import { UserTable } from './UserTable'

async function getUsers() {
  const res = await fetch('http://localhost:3001/api/users', {
    next: { revalidate: 60 }
  })
  return res.json()
}

export default async function UsersPage() {
  const users = await getUsers()
  return <UserTable users={users} />
}

// UserTable.tsx (Client Component pour interactivité)
'use client'

import type { UserDto } from '@linkedout/core'
import { useState } from 'react'

export function UserTable({ users }: { users: UserDto[] }) {
  const [sortBy, setSortBy] = useState<'name' | 'email'>('name')
  // Logique de tri côté client...
}
```

### Pattern: React.cache() pour déduplication

```tsx
// lib/data.ts
import { cache } from 'react'

// Dédupliqué automatiquement dans un même render tree
export const getUser = cache(async (id: string) => {
  const res = await fetch(`http://localhost:3001/api/users/${id}`)
  return res.json()
})

export const getUsers = cache(async () => {
  const res = await fetch('http://localhost:3001/api/users')
  return res.json()
})

// Utilisable dans plusieurs Server Components
// app/users/[id]/page.tsx
async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id) // 1ère requête
  return (
    <div>
      <UserHeader userId={params.id} />
      <UserDetails user={user} />
    </div>
  )
}

async function UserHeader({ userId }: { userId: string }) {
  const user = await getUser(userId) // Dédupliqué - pas de nouvelle requête
  return <h1>{user.name}</h1>
}
```

### Pattern: LRU Cache cross-request

```tsx
// lib/cache.ts
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, unknown>({
  max: 500,
  ttl: 1000 * 60 * 5 // 5 minutes
})

export async function getCachedUser(id: string) {
  const cacheKey = `user:${id}`
  const cached = cache.get(cacheKey)

  if (cached) {
    return cached as UserDto
  }

  const res = await fetch(`http://localhost:3001/api/users/${id}`)
  const user = await res.json()

  cache.set(cacheKey, user)
  return user
}

// Invalidation manuelle si besoin
export function invalidateUser(id: string) {
  cache.delete(`user:${id}`)
}
```

---

## Optimistic Updates

```tsx
'use client'

import { useOptimistic, useTransition } from 'react'

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  )
  const [isPending, startTransition] = useTransition()

  async function handleAdd(formData: FormData) {
    const newTodo = { id: crypto.randomUUID(), text: formData.get('text') }

    startTransition(async () => {
      addOptimisticTodo(newTodo) // UI immédiate
      await createTodo(newTodo) // Appel serveur
    })
  }

  return (
    <form action={handleAdd}>
      {/* ... */}
    </form>
  )
}
```

---

## Client-Side Data Fetching avec SWR

### Pattern: Hook réutilisable avec SWR

```tsx
// hooks/useUsers.ts
import useSWR from 'swr'
import type { UserDto } from '@linkedout/core'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR<UserDto[]>(
    'http://localhost:3001/api/users',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000
    }
  )

  return {
    users: data ?? [],
    isLoading,
    isError: !!error,
    refresh: mutate
  }
}

export function useUser(id: string) {
  const { data, error, isLoading } = useSWR<UserDto>(
    id ? `http://localhost:3001/api/users/${id}` : null,
    fetcher
  )

  return {
    user: data,
    isLoading,
    isError: !!error
  }
}
```

### Pattern: Mutation avec revalidation

```tsx
'use client'

import useSWRMutation from 'swr/mutation'
import { useUsers } from '@/hooks/useUsers'

async function createUserFetcher(url: string, { arg }: { arg: { name: string; email: string } }) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg)
  })
  if (!res.ok) throw new Error('Failed to create user')
  return res.json()
}

export function CreateUserForm() {
  const { refresh } = useUsers()
  const { trigger, isMutating } = useSWRMutation(
    'http://localhost:3001/api/users',
    createUserFetcher
  )

  async function handleSubmit(formData: FormData) {
    await trigger({
      name: formData.get('name') as string,
      email: formData.get('email') as string
    })
    refresh() // Revalide la liste
  }

  return (
    <form action={handleSubmit}>
      {/* ... */}
      <button disabled={isMutating}>
        {isMutating ? 'Creating...' : 'Create'}
      </button>
    </form>
  )
}
```

---

## Transitions et Concurrent Features

### Pattern: Search avec useDeferredValue

```tsx
'use client'

import { useState, useDeferredValue, useMemo } from 'react'

export function SearchableList({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const isStale = query !== deferredQuery

  const filteredItems = useMemo(
    () => items.filter(item =>
      item.name.toLowerCase().includes(deferredQuery.toLowerCase())
    ),
    [items, deferredQuery]
  )

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <div style={{ opacity: isStale ? 0.7 : 1, transition: 'opacity 0.2s' }}>
        {filteredItems.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
    </div>
  )
}
```

### Pattern: Tab switching avec startTransition

```tsx
'use client'

import { useState, useTransition } from 'react'

export function TabPanel() {
  const [tab, setTab] = useState('posts')
  const [isPending, startTransition] = useTransition()

  function selectTab(nextTab: string) {
    startTransition(() => {
      setTab(nextTab)
    })
  }

  return (
    <div>
      <nav>
        <button onClick={() => selectTab('posts')}>Posts</button>
        <button onClick={() => selectTab('comments')}>Comments</button>
        <button onClick={() => selectTab('analytics')}>Analytics</button>
      </nav>
      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        {tab === 'posts' && <PostsTab />}
        {tab === 'comments' && <CommentsTab />}
        {tab === 'analytics' && <AnalyticsTab />} {/* Composant lourd */}
      </div>
    </div>
  )
}
```

---

## Modal Pattern avec Route Interception

```
app/
├── users/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx          # Page complète
├── @modal/
│   └── users/
│       └── [id]/
│           └── page.tsx      # Version modale
└── layout.tsx
```

```tsx
// layout.tsx
export default function Layout({
  children,
  modal
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
```

---

## Virtualisation pour Longues Listes

```tsx
'use client'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  estimateSize?: number
  overscan?: number
}

export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 50,
  overscan = 5
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan
  })

  return (
    <div
      ref={parentRef}
      style={{ height: '100%', overflow: 'auto' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            {renderItem(items[virtualItem.index]!, virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// Usage
function UserListPage({ users }: { users: UserDto[] }) {
  return (
    <div style={{ height: '600px' }}>
      <VirtualList
        items={users}
        renderItem={(user) => (
          <div className="p-4 border-b">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        )}
      />
    </div>
  )
}
```

---

## Infinite Scroll avec Server Actions

```tsx
'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { getMoreUsers } from './actions'

export function UserList({ initialUsers }: { initialUsers: UserDto[] }) {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['users'],
    queryFn: ({ pageParam }) => getMoreUsers(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: { pages: [{ users: initialUsers, nextCursor: 1 }], pageParams: [0] }
  })

  // Intersection Observer pour auto-load...
}
```

---

## Form Validation avec Server Actions

```tsx
// actions.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address')
})

export type FormState = {
  errors?: {
    name?: string[]
    email?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function createUser(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email')
  })

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors
    }
  }

  try {
    const response = await fetch('http://localhost:3001/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validated.data)
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        errors: { _form: [error.error || 'Failed to create user'] }
      }
    }
  } catch {
    return {
      errors: { _form: ['Network error. Please try again.'] }
    }
  }

  revalidatePath('/users')
  redirect('/users')
}
```

```tsx
// CreateUserForm.tsx
'use client'

import { useActionState } from 'react'
import { createUser, type FormState } from './actions'
import { Button, Input } from '@linkedout/ui/components'

const initialState: FormState = {}

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUser, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <Input
        name="name"
        label="Name"
        error={state.errors?.name?.[0]}
      />
      <Input
        name="email"
        type="email"
        label="Email"
        error={state.errors?.email?.[0]}
      />

      {state.errors?._form && (
        <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
          {state.errors._form[0]}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </Button>
    </form>
  )
}
```

---

## Error Boundaries

```tsx
'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800 font-medium">Something went wrong</h2>
          <p className="text-red-600 text-sm mt-1">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-sm text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage avec Suspense
function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<Loading />}>
        <AsyncComponent />
      </Suspense>
    </ErrorBoundary>
  )
}
```

---

## Preloading basé sur l'intention

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Précharge au hover
export function PreloadLink({
  href,
  children,
  preloadData
}: {
  href: string
  children: React.ReactNode
  preloadData?: () => Promise<void>
}) {
  const router = useRouter()

  const handleMouseEnter = () => {
    router.prefetch(href)
    preloadData?.()
  }

  return (
    <Link href={href} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  )
}

// Usage
function UserCard({ user }: { user: UserDto }) {
  return (
    <PreloadLink
      href={`/users/${user.id}`}
      preloadData={() => import('./UserDetails')} // Précharge le composant
    >
      <div className="p-4 border rounded hover:bg-gray-50">
        {user.name}
      </div>
    </PreloadLink>
  )
}
```
