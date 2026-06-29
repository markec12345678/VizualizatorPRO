import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const locales = ['sl', 'en', 'de', 'it'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'sl'

const localeNames: Record<Locale, string> = {
  sl: 'Slovenščina',
  en: 'English',
  de: 'Deutsch',
  it: 'Italiano',
}

const localeFlags: Record<Locale, string> = {
  sl: '🇸🇮',
  en: '🇬🇧',
  de: '🇩🇪',
  it: '🇮🇹',
}

export function getLocaleName(locale: string): string {
  return localeNames[locale as Locale] || locale
}

export function getLocaleFlag(locale: string): string {
  return localeFlags[locale as Locale] || '🌍'
}

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound()

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
