import Link from 'next/link'
import { Button, Card } from '@linkedout/ui'

export default function HomePage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Hexagonal Architecture Starter
        </h1>
        <p className="text-gray-600 mb-8">
          Clean Architecture monorepo with TypeScript, Next.js, and Hono
        </p>

        <div className="mb-8">
          <Link href="/users">
            <Button variant="primary" size="lg">
              Try User Management Demo
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Domain Layer">
            <p className="text-gray-600 mb-4">
              Core business logic shared between frontend and backend via{' '}
              <code className="bg-gray-100 px-1 rounded">@linkedout/core</code>
            </p>
            <ul className="text-sm text-gray-500 list-disc list-inside">
              <li>Entities with DDD patterns</li>
              <li>Value Objects (Email, UserId)</li>
              <li>Ports (Repository interfaces)</li>
              <li>Domain Errors</li>
            </ul>
          </Card>

          <Card title="UI Components">
            <p className="text-gray-600 mb-4">
              Reusable React components from{' '}
              <code className="bg-gray-100 px-1 rounded">@linkedout/ui</code>
            </p>
            <div className="flex gap-2">
              <Button variant="primary" size="sm">Primary</Button>
              <Button variant="secondary" size="sm">Secondary</Button>
              <Button variant="outline" size="sm">Outline</Button>
            </div>
          </Card>

          <Card title="API Backend">
            <p className="text-gray-600 mb-4">
              Hexagonal architecture with ports &amp; adapters in{' '}
              <code className="bg-gray-100 px-1 rounded">@linkedout/api</code>
            </p>
            <ul className="text-sm text-gray-500 list-disc list-inside">
              <li>Hono HTTP adapter</li>
              <li>Use Cases (CQRS pattern)</li>
              <li>In-memory repository</li>
              <li>Jest test setup</li>
            </ul>
          </Card>

          <Card title="Next.js Frontend">
            <p className="text-gray-600 mb-4">
              Server Components, App Router, and optimized performance
            </p>
            <ul className="text-sm text-gray-500 list-disc list-inside">
              <li>Tailwind CSS v4</li>
              <li>Vitest + Testing Library</li>
              <li>TypeScript strict mode</li>
              <li>Turbopack dev server</li>
            </ul>
          </Card>
        </div>
      </div>
    </main>
  )
}
