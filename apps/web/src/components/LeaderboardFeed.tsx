'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { LeaderboardEntryDto, VoteType } from '@linkedout/core'
import { getLeaderboard } from '../lib/api'
import { FilterTabs } from './FilterTabs'
import { PostCard } from './PostCard'

export function LeaderboardFeed() {
  const t = useTranslations('empty')
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filter = (searchParams.get('type') as VoteType) || null
  const [entries, setEntries] = useState<LeaderboardEntryDto[]>([])
  const [loaded, setLoaded] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const setFilter = (type: VoteType | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (type) {
      params.set('type', type)
    } else {
      params.delete('type')
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    getLeaderboard(filter ?? undefined)
      .then((data) => {
        if (!controller.signal.aborted) {
          setEntries(data)
          setLoaded(true)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setEntries([])
          setLoaded(true)
        }
      })

    return () => controller.abort()
  }, [filter])

  return (
    <div>
      <div className="mb-6">
        <FilterTabs selected={filter} onChange={setFilter} />
      </div>

      <div>
        {entries.length === 0 && loaded ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🏜️</p>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              {t('title')}
            </h3>
            <p style={{ color: 'var(--muted)' }}>
              {t('subtitle')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <PostCard key={entry.id} entry={entry} rank={index + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
