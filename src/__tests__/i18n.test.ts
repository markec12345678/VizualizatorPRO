import { describe, it, expect } from 'vitest'
import { locales, defaultLocale, getLocaleName, getLocaleFlag, type Locale } from '@/i18n/request'

describe('i18n configuration', () => {
  describe('locales', () => {
    it('should have 4 locales', () => {
      expect(locales).toHaveLength(4)
    })

    it('should include Slovenian as first locale', () => {
      expect(locales[0]).toBe('sl')
    })

    it('should include all expected locales', () => {
      expect(locales).toContain('sl')
      expect(locales).toContain('en')
      expect(locales).toContain('de')
      expect(locales).toContain('it')
    })
  })

  describe('defaultLocale', () => {
    it('should default to Slovenian', () => {
      expect(defaultLocale).toBe('sl')
    })
  })

  describe('getLocaleName', () => {
    it('should return Slovenian name for sl', () => {
      expect(getLocaleName('sl')).toBe('Slovenščina')
    })

    it('should return English name for en', () => {
      expect(getLocaleName('en')).toBe('English')
    })

    it('should return German name for de', () => {
      expect(getLocaleName('de')).toBe('Deutsch')
    })

    it('should return Italian name for it', () => {
      expect(getLocaleName('it')).toBe('Italiano')
    })

    it('should return the locale code for unknown locale', () => {
      expect(getLocaleName('fr')).toBe('fr')
    })
  })

  describe('getLocaleFlag', () => {
    it('should return Slovenian flag for sl', () => {
      expect(getLocaleFlag('sl')).toBe('🇸🇮')
    })

    it('should return UK flag for en', () => {
      expect(getLocaleFlag('en')).toBe('🇬🇧')
    })

    it('should return German flag for de', () => {
      expect(getLocaleFlag('de')).toBe('🇩🇪')
    })

    it('should return Italian flag for it', () => {
      expect(getLocaleFlag('it')).toBe('🇮🇹')
    })

    it('should return globe emoji for unknown locale', () => {
      expect(getLocaleFlag('fr')).toBe('🌍')
    })
  })
})

describe('Translation messages', () => {
  it('should load Slovenian messages', async () => {
    const messages = (await import('@/messages/sl.json')).default
    expect(messages).toBeDefined()
    expect(messages.common.appName).toBe('VizualizatorPRO')
    expect(messages.hero.title).toContain('Stranka vidi rezultat')
  })

  it('should load English messages', async () => {
    const messages = (await import('@/messages/en.json')).default
    expect(messages).toBeDefined()
    expect(messages.common.appName).toBe('VizualizatorPRO')
    expect(messages.hero.title).toContain('Customer sees the result')
  })

  it('should load German messages', async () => {
    const messages = (await import('@/messages/de.json')).default
    expect(messages).toBeDefined()
    expect(messages.common.appName).toBe('VizualizatorPRO')
    expect(messages.hero.title).toContain('Kunde sieht das Ergebnis')
  })

  it('should load Italian messages', async () => {
    const messages = (await import('@/messages/it.json')).default
    expect(messages).toBeDefined()
    expect(messages.common.appName).toBe('VizualizatorPRO')
    expect(messages.hero.title).toContain('Il cliente vede il risultato')
  })

  it('should have consistent keys across all locales', async () => {
    const sl = (await import('@/messages/sl.json')).default
    const en = (await import('@/messages/en.json')).default
    const de = (await import('@/messages/de.json')).default
    const it = (await import('@/messages/it.json')).default

    const getKeys = (obj: any, prefix = ''): string[] => {
      return Object.keys(obj).flatMap((key) => {
        const fullKey = prefix ? `${prefix}.${key}` : key
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          return getKeys(obj[key], fullKey)
        }
        return [fullKey]
      })
    }

    const slKeys = getKeys(sl).sort()
    const enKeys = getKeys(en).sort()
    const deKeys = getKeys(de).sort()
    const itKeys = getKeys(it).sort()

    expect(enKeys).toEqual(slKeys)
    expect(deKeys).toEqual(slKeys)
    expect(itKeys).toEqual(slKeys)
  })
})
