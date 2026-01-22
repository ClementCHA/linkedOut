'use client'

import { useTranslations } from 'next-intl'
import type { VoteType } from '@linkedout/core'

interface FilterTabsProps {
  selected: VoteType | null
  onChange: (type: VoteType | null) => void
}

const FILTERS: { key: string; type: VoteType | null; emoji: string }[] = [
  { key: 'all', type: null, emoji: '🏆' },
  { key: 'bullshit', type: 'bullshit', emoji: '🧻' },
  { key: 'guru', type: 'guru', emoji: '🧙' },
  { key: 'theater', type: 'theater', emoji: '🎭' },
  { key: 'salesman', type: 'salesman', emoji: '📢' },
  { key: 'scam', type: 'scam', emoji: '⚠️' },
  { key: 'solid', type: 'solid', emoji: '✅' },
  { key: 'interesting', type: 'interesting', emoji: '💡' },
]

export function FilterTabs({ selected, onChange }: FilterTabsProps) {
  const t = useTranslations('filters')

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ key, type, emoji }) => {
        const isActive = selected === type
        return (
          <button
            key={key}
            onClick={() => onChange(type)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: isActive ? 'var(--accent)' : 'var(--badge-bg)',
              color: isActive ? '#ffffff' : 'var(--badge-text)',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {emoji} {t(key)}
          </button>
        )
      })}
    </div>
  )
}
