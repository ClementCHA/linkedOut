'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const switchLocale = () => {
    const next = locale === 'fr' ? 'en' : 'fr'
    const newPath = pathname.replace(`/${locale}`, `/${next}`)
    const query = searchParams.toString()
    router.replace(query ? `${newPath}?${query}` : newPath)
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
      style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)' }}
    >
      {locale === 'fr' ? 'EN' : 'FR'}
    </button>
  )
}
