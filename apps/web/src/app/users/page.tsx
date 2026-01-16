import { Suspense } from 'react'
import { Card } from '@linkedout/ui/components'
import { getUsers } from '@/lib/api'
import { UserList } from '@/components/UserList'
import { CreateUserForm } from '@/components/CreateUserForm'

async function UsersData() {
  const users = await getUsers()
  return <UserList initialUsers={users} />
}

export default function UsersPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <Card title="Create User">
            <CreateUserForm />
          </Card>

          <Card title="Users">
            <Suspense
              fallback={
                <div className="text-gray-500 animate-pulse">
                  Loading users...
                </div>
              }
            >
              <UsersData />
            </Suspense>
          </Card>
        </div>
      </div>
    </main>
  )
}
