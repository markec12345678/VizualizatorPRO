'use client'

import { useState, useEffect } from 'react'
import { Globe, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { locales, getLocaleName, getLocaleFlag, type Locale } from '@/i18n/request'

/**
 * Language switcher komponenta
 * 
 * Shranjuje izbrani jezik v localStorage in cookie.
 * V produkciji bi lahko uporabljalo tudi URL prefix (next-intl middleware).
 */
export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('sl')
  const [pendingLocale, setPendingLocale] = useState<Locale | null>(null)

  useEffect(() => {
    let mounted = true
    const saved = (window.localStorage.getItem('locale') as Locale) || 'sl'
    if (mounted && saved !== currentLocale) {
      setCurrentLocale(saved)
    }
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (pendingLocale) {
      window.localStorage.setItem('locale', pendingLocale)
      window.document.cookie = `locale=${pendingLocale};path=/;max-age=31536000;samesite=lax`
      window.location.reload()
    }
  }, [pendingLocale])

  const handleLocaleChange = (locale: Locale) => {
    setCurrentLocale(locale)
    setPendingLocale(locale)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{getLocaleFlag(currentLocale)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{getLocaleFlag(locale)}</span>
              <span>{getLocaleName(locale)}</span>
            </span>
            {currentLocale === locale && <Check className="h-4 w-4 text-accent" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
