# Web App Rules (Next.js)

Ces règles s'appliquent à tous les fichiers dans `apps/web/`

## Architecture

```
apps/web/
├── src/
│   ├── app/            # App Router
│   │   ├── layout.tsx  # Root layout
│   │   ├── page.tsx    # Home page
│   │   └── [route]/    # Routes
│   ├── components/     # Composants locaux
│   └── lib/            # Utilitaires, API client
├── public/             # Assets statiques
└── next.config.ts
```

## Server Components par Défaut

```typescript
// ✅ Server Component (par défaut)
export default function Page() {
  return <div>Server rendered</div>;
}

// ❌ Client Component uniquement si nécessaire
'use client';
export default function InteractiveComponent() {
  const [state, setState] = useState();
  // ...
}
```

### Quand utiliser 'use client'

| Besoin | Server | Client |
|--------|--------|--------|
| Data fetching | ✅ | ❌ |
| Accès DB direct | ✅ | ❌ |
| useState/useEffect | ❌ | ✅ |
| onClick/onChange | ❌ | ✅ |
| Browser APIs | ❌ | ✅ |
| Affichage statique | ✅ | ❌ |

### Pattern : Client au plus bas

```typescript
// ✅ Bon - Client component isolé
export default function Page() {
  return (
    <Layout>
      <Header />           {/* Server */}
      <Content />          {/* Server */}
      <InteractiveWidget /> {/* Client - 'use client' ici */}
      <Footer />           {/* Server */}
    </Layout>
  );
}

// ❌ Mauvais - Tout en client
'use client';
export default function Page() { /* Tout est client */ }
```

## Data Fetching

### Server Components

```typescript
// ✅ Direct dans le composant
async function UserList() {
  const users = await db.users.findAll(); // Accès direct DB
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// ✅ Avec cache/revalidation
async function Posts() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 } // ISR: revalider toutes les 60s
  });
  return <PostList posts={posts} />;
}
```

### Parallel Fetching

```typescript
// ✅ Paralléliser les requêtes indépendantes
async function Dashboard() {
  const [user, posts, stats] = await Promise.all([
    getUser(),
    getPosts(),
    getStats(),
  ]);
  return <DashboardView user={user} posts={posts} stats={stats} />;
}

// ❌ Waterfall
async function Dashboard() {
  const user = await getUser();
  const posts = await getPosts(); // Attend user inutilement
  const stats = await getStats(); // Attend posts inutilement
}
```

## Routing

### File-based routing

```
app/
├── page.tsx              → /
├── about/page.tsx        → /about
├── users/
│   ├── page.tsx          → /users
│   └── [id]/page.tsx     → /users/:id
└── api/
    └── route.ts          → /api
```

### Dynamic routes

```typescript
// app/users/[id]/page.tsx
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getUser(id);
  return <UserProfile user={user} />;
}

// Générer les pages statiques
export async function generateStaticParams() {
  const users = await getUsers();
  return users.map((user) => ({ id: user.id }));
}
```

## Composants

### Props typées

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={cn(variants[variant], sizes[size])}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Composition

```typescript
// ✅ Composants composables
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

## Performance

### Images

```typescript
import Image from 'next/image';

// ✅ next/image optimise automatiquement
<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={400}
  priority // Pour LCP
/>
```

### Code Splitting

```typescript
import dynamic from 'next/dynamic';

// ✅ Charger dynamiquement les composants lourds
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // Si client-only
});
```

### Fonts

```typescript
// ✅ next/font optimise le chargement
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Layout({ children }) {
  return (
    <html className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

## API Client

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getUsers(): Promise<UserDto[]> {
  const res = await fetch(`${API_BASE}/api/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return data.data;
}

export async function createUser(input: CreateUserInput): Promise<UserDto> {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error.message);
  }
  const data = await res.json();
  return data.data;
}
```

## Styles (Tailwind)

```typescript
// ✅ Utility-first
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">

// ✅ Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ✅ Dark mode
<div className="bg-white dark:bg-gray-900">

// ✅ cn() pour conditionnel
import { cn } from '@/lib/utils';
<button className={cn('btn', isActive && 'btn-active')}>
```

## Tests

```typescript
// Vitest + React Testing Library
import { render, screen } from '@testing-library/react';
import { UserList } from './UserList';

describe('UserList', () => {
  it('should render users', () => {
    render(<UserList users={mockUsers} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```
