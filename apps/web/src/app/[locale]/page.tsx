import { useTranslations } from 'next-intl'
import { LeaderboardFeed } from '../../components/LeaderboardFeed'
import { ThemeToggle } from '../../components/ThemeToggle'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'

export default function HomePage() {
  const t = useTranslations()

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1
              className="text-3xl font-black tracking-tight"
              style={{ color: 'var(--foreground)' }}
            >
              {t('header.title')}
            </h1>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
          <p
            className="text-lg font-medium italic"
            style={{ color: 'var(--accent)' }}
          >
            {t('header.tagline')}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {t('header.subtitle')}
          </p>
        </header>

        {/* Feed */}
        <LeaderboardFeed />

        {/* Footer */}
        <footer className="mt-12 pt-6 text-center text-xs" style={{ borderTop: '1px solid var(--card-border)', color: 'var(--muted)' }}>
          <p className="mb-2">{t('footer.disclaimer')}</p>
          <p className="font-medium" style={{ color: 'var(--accent)' }}>
            {t('footer.cta')}
          </p>
        </footer>
      </div>
    </main>
  )
}
