import { useTranslations } from 'next-intl'
import type { VoteType } from '@linkedout/core'

interface VoteBadgesProps {
  votes: Record<VoteType, number>
  totalVotes: number
}

const VOTE_EMOJIS: Record<VoteType, string> = {
  solid: '✅',
  interesting: '💡',
  salesman: '📢',
  bullshit: '🧻',
  scam: '⚠️',
  guru: '🧙',
  theater: '🎭',
}

export function VoteBadges({ votes, totalVotes }: VoteBadgesProps) {
  const t = useTranslations('voteLabels')

  const sorted = Object.entries(votes)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)

  if (totalVotes === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {sorted.map(([type, count]) => (
        <span
          key={type}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)' }}
        >
          {VOTE_EMOJIS[type as VoteType]} {count} {t(type)}
        </span>
      ))}
    </div>
  )
}
