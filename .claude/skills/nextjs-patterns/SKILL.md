---
name: nextjs-patterns
description: Patterns Next.js 15 App Router. Server Components, caching, routing. Chargé pour work sur le web.
allowed-tools: Read, Write, Edit, Glob
---

# Next.js 15 App Router Patterns

Patterns modernes pour Next.js avec App Router et React Server Components.

## Server Components (Default)

```typescript
// app/users/page.tsx - Server Component by default
import { getUsers } from '@/lib/api';

export default async function UsersPage() {
  // Direct data fetching - no useEffect needed
  const users = await getUsers();

  return (
    <main>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </main>
  );
}
```

## Client Components (When Needed)

```typescript
// components/VoteButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { submitVote } from '@/lib/actions';

interface VoteButtonProps {
  postId: string;
  voteType: string;
}

export function VoteButton({ postId, voteType }: VoteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [voted, setVoted] = useState(false);

  const handleClick = () => {
    startTransition(async () => {
      await submitVote(postId, voteType);
      setVoted(true);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending || voted}
      className={voted ? 'voted' : ''}
    >
      {isPending ? 'Voting...' : voteType}
    </button>
  );
}
```

## Server Actions

```typescript
// lib/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitVote(postId: string, voteType: string) {
  const response = await fetch(`${process.env.API_URL}/api/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, voteType }),
  });

  if (!response.ok) {
    throw new Error('Vote failed');
  }

  // Revalidate the page to show updated data
  revalidatePath('/leaderboard');
}

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  const response = await fetch(`${process.env.API_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message };
  }

  redirect('/users');
}
```

## Data Fetching Patterns

### Parallel Fetching

```typescript
// app/dashboard/page.tsx
async function Dashboard() {
  // Parallel requests - much faster than sequential
  const [user, posts, stats] = await Promise.all([
    getUser(),
    getPosts(),
    getStats(),
  ]);

  return (
    <div>
      <UserCard user={user} />
      <PostList posts={posts} />
      <StatsPanel stats={stats} />
    </div>
  );
}
```

### Streaming with Suspense

```typescript
// app/leaderboard/page.tsx
import { Suspense } from 'react';

export default function LeaderboardPage() {
  return (
    <main>
      <h1>Leaderboard</h1>

      {/* This loads immediately */}
      <SearchFilters />

      {/* This streams in when ready */}
      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardList />
      </Suspense>
    </main>
  );
}

// Async component that can suspend
async function LeaderboardList() {
  const entries = await getLeaderboard(); // Slow query
  return <ul>{entries.map(/* ... */)}</ul>;
}
```

## Caching

### Static Data

```typescript
// Cached indefinitely (default in production)
const data = await fetch('https://api.example.com/data');
```

### Revalidate on Interval

```typescript
// Revalidate every 60 seconds
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 },
});
```

### No Cache

```typescript
// Always fetch fresh
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store',
});
```

### Route Segment Config

```typescript
// app/leaderboard/page.tsx
export const revalidate = 60; // Revalidate this page every 60s
export const dynamic = 'force-dynamic'; // Always render dynamically
```

## Routing Patterns

### Dynamic Routes

```typescript
// app/posts/[id]/page.tsx
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return <PostDetail post={post} />;
}

// Generate static pages at build time
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ id: post.id }));
}
```

### Catch-all Routes

```typescript
// app/docs/[...slug]/page.tsx
interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  // slug = ['guide', 'getting-started'] for /docs/guide/getting-started
  const path = slug.join('/');
  const doc = await getDoc(path);
  return <DocContent doc={doc} />;
}
```

## Layouts

### Root Layout

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

### Nested Layout

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
```

## Error Handling

### Error Boundary

```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Not Found

```typescript
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find the requested resource</p>
    </div>
  );
}
```

## Loading States

```typescript
// app/loading.tsx - Automatic loading UI
export default function Loading() {
  return <Skeleton />;
}

// Or component-level with Suspense
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>
```

Voir [patterns.md](patterns.md) pour plus de patterns avancés.
