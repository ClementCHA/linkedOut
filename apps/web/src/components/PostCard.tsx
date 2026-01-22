import { useTranslations } from 'next-intl'
import type { LeaderboardEntryDto } from '@linkedout/core'
import { VoteBadges } from './VoteBadges'

interface PostCardProps {
  entry: LeaderboardEntryDto
  rank: number
}

function getJobTitle(index: number, titles: string[]): string {
  return titles[index % titles.length] ?? 'Thought Leader'
}

function getTimeAgo(createdAt: string): { value: number; unit: 'minutes' | 'hours' | 'days' } {
  const diff = Date.now() - new Date(createdAt).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return { value: Math.max(1, minutes), unit: 'minutes' }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return { value: hours, unit: 'hours' }
  return { value: Math.floor(hours / 24), unit: 'days' }
}

function getInitials(index: number): string {
  const names = ['JD', 'MC', 'PL', 'AS', 'RB', 'TG', 'NF', 'KW', 'EH', 'OC']
  return names[index % names.length] ?? 'TL'
}

function getLinkedInUrl(urn: string): string {
  return `https://www.linkedin.com/feed/update/urn:li:activity:${urn}/`
}

export function PostCard({ entry, rank }: PostCardProps) {
  const t = useTranslations('post')
  const jobTitles = t.raw('jobTitles') as string[]
  const time = getTimeAgo(entry.createdAt)
  const linkedInUrl = getLinkedInUrl(entry.urn)

  const dominantVote = Object.entries(entry.votes)
    .sort(([, a], [, b]) => b - a)[0]

  const isNegative = dominantVote && ['bullshit', 'scam', 'guru', 'theater', 'salesman'].includes(dominantVote[0])

  return (
    <article
      className="rounded-lg p-4 transition-all hover:scale-[1.01]"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
      }}
    >
      {/* LinkedIn-style header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{
            background: isNegative ? '#fee2e2' : '#dcfce7',
            color: isNegative ? '#991b1b' : '#166534',
          }}
        >
          {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : getInitials(rank)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
            {getJobTitle(rank, jobTitles)}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {t('postedBy')}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {t('timeAgo', { value: t(`timeUnits.${time.unit}`, { count: time.value }) })}
          </p>
        </div>
        {entry.totalVotes > 0 && (
          <span
            className="text-xs font-bold px-2 py-1 rounded-full shrink-0"
            style={{ background: 'var(--badge-bg)', color: 'var(--accent)' }}
          >
            #{rank}
          </span>
        )}
      </div>

      {/* Post content */}
      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-3 text-sm leading-relaxed whitespace-pre-wrap hover:opacity-80 transition-opacity"
        style={{ color: 'var(--foreground)' }}
      >
        {entry.content.length > 280
          ? entry.content.slice(0, 280) + '...'
          : entry.content}
        <span className="inline-block ml-1 text-xs" style={{ color: 'var(--accent)' }}>↗</span>
      </a>

      {/* Vote badges */}
      <div className="mb-3">
        <VoteBadges votes={entry.votes} totalVotes={entry.totalVotes} />
      </div>

      {/* LinkedIn-style footer */}
      <div
        className="pt-3 flex items-center justify-between text-xs"
        style={{ borderTop: '1px solid var(--card-border)', color: 'var(--muted)' }}
      >
        <span>
          {entry.totalVotes > 0
            ? t('totalVotes', { count: entry.totalVotes })
            : t('noVotes')}
        </span>
        <span>
          {entry.totalVotes > 0
            ? t('endorsedBy', { count: 0 })
            : t('endorsedByZero')}
        </span>
      </div>
    </article>
  )
}
