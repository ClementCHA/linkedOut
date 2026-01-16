'use client'

import type { UserDto } from '@linkedout/core'

interface UserListProps {
  initialUsers: UserDto[]
}

export function UserList({ initialUsers }: UserListProps) {
  if (initialUsers.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No users yet. Create one!
      </p>
    )
  }

  return (
    <ul className="divide-y divide-gray-200">
      {initialUsers.map((user) => (
        <li key={user.id} className="py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
