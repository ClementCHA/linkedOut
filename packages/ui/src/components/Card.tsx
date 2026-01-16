import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  children: ReactNode
}

export function Card({ title, children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}
      {...props}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  )
}
