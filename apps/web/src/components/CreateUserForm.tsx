'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@linkedout/ui/components'
import { createUser } from '@/lib/api'

export function CreateUserForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await createUser({ name, email })
      setName('')
      setEmail('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
        required
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="john@example.com"
        required
      />

      {error && (
        <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create User'}
      </Button>
    </form>
  )
}
