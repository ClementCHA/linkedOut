# Next.js Advanced Patterns

## Optimistic Updates

```typescript
// components/VoteButton.tsx
'use client';

import { useOptimistic, useTransition } from 'react';
import { submitVote } from '@/lib/actions';

interface VoteButtonProps {
  postId: string;
  initialCount: number;
}

export function VoteButton({ postId, initialCount }: VoteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticCount, addOptimistic] = useOptimistic(
    initialCount,
    (current, delta: number) => current + delta
  );

  const handleVote = () => {
    addOptimistic(1); // Immediately show +1
    startTransition(async () => {
      try {
        await submitVote(postId);
      } catch {
        addOptimistic(-1); // Revert on error
      }
    });
  };

  return (
    <button onClick={handleVote} disabled={isPending}>
      Votes: {optimisticCount}
    </button>
  );
}
```

## Form with Server Actions

```typescript
// components/CreateUserForm.tsx
'use client';

import { useActionState } from 'react';
import { createUser } from '@/lib/actions';

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUser, null);

  return (
    <form action={formAction}>
      <input name="name" required />
      <input name="email" type="email" required />

      {state?.error && <p className="error">{state.error}</p>}

      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

## Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Auth check
  const token = request.cookies.get('token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add headers
  const response = NextResponse.next();
  response.headers.set('x-request-id', crypto.randomUUID());

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

## Route Handlers (API Routes)

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '20');

  const users = await getUsers({ limit });

  return NextResponse.json({ data: users });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate
  if (!body.email || !body.name) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const user = await createUser(body);

  return NextResponse.json({ data: user }, { status: 201 });
}
```

## Image Optimization

```typescript
import Image from 'next/image';

// Remote images (configure in next.config.js)
<Image
  src="https://example.com/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // For LCP images
/>

// Local images (auto-sized)
import heroImage from '@/public/hero.jpg';

<Image
  src={heroImage}
  alt="Hero"
  placeholder="blur" // Show blur while loading
/>

// Fill container
<div className="relative w-full h-64">
  <Image
    src="/image.jpg"
    alt="Description"
    fill
    className="object-cover"
  />
</div>
```

## Metadata

```typescript
// app/layout.tsx - Static metadata
export const metadata = {
  title: 'LinkedOut',
  description: 'LinkedIn Bullshit Detector',
  openGraph: {
    title: 'LinkedOut',
    description: 'Rate LinkedIn posts collaboratively',
    images: ['/og-image.png'],
  },
};

// app/posts/[id]/page.tsx - Dynamic metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  return {
    title: `Post by ${post.author}`,
    description: post.content.slice(0, 160),
  };
}
```

## Parallel Routes

```typescript
// app/@modal/(.)posts/[id]/page.tsx - Intercepted route
export default function PostModal({ params }) {
  return (
    <Modal>
      <PostDetail id={params.id} />
    </Modal>
  );
}

// app/layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
```

## Internationalization

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'fr', 'es'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  const acceptLang = request.headers.get('accept-language');
  // Parse and match...
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if locale is in path
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect to localized path
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(request.nextUrl);
}
```

## Environment Variables

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Server-only
  DATABASE_URL: z.string().url(),
  API_SECRET: z.string().min(32),

  // Public (exposed to client)
  NEXT_PUBLIC_API_URL: z.string().url(),
});

// Validate at build time
export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  API_SECRET: process.env.API_SECRET,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
```

## Testing

```typescript
// __tests__/page.test.tsx
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Page from '@/app/page';

// Mock server component data fetching
vi.mock('@/lib/api', () => ({
  getUsers: vi.fn().mockResolvedValue([
    { id: '1', name: 'John' },
  ]),
}));

test('renders users', async () => {
  const page = await Page();
  render(page);

  expect(screen.getByText('John')).toBeInTheDocument();
});
```
