'use client'

import { useState, useEffect } from 'react'
import { Cookie, X, Check, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

const CONSENT_KEY = 'vizualizatorpro-cookie-consent'
const CONSENT_VERSION = '1.0'

interface ConsentData {
  version: string
  necessary: boolean
  analytics: boolean
  timestamp: string
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [analytics, setAnalytics] = useState(true)

  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY)
    let needsConsent = false
    if (!stored) {
      needsConsent = true
    } else {
      try {
        const data = JSON.parse(stored) as ConsentData
        if (data.version !== CONSENT_VERSION) {
          needsConsent = true
        }
      } catch {
        needsConsent = true
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (needsConsent) setShouldShow(true)
  }, [])

  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [shouldShow])

  const handleAccept = (acceptAnalytics: boolean) => {
    const data: ConsentData = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: acceptAnalytics,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(CONSENT_KEY, JSON.stringify(data))

    if (acceptAnalytics) {
      document.cookie = `cookie-consent=full;path=/;max-age=31536000;samesite=lax`
    } else {
      document.cookie = `cookie-consent=necessary-only;path=/;max-age=31536000;samesite=lax`
    }

    setVisible(false)
  }

  const handleDismiss = () => setVisible(false)

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <Card className="max-w-2xl mx-auto p-6 pointer-events-auto shadow-2xl border-2">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 flex-shrink-0">
            <Cookie className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm">
              Piškotki in zasebnost
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Uporabljamo piškotke za zagotavljanje osnovne funkcionalnosti in
              (z vašim soglasjem) analitiko uporabe.{' '}
              <Link
                href="/privacija"
                className="text-accent hover:underline inline-flex items-center gap-0.5"
              >
                Politika zasebnosti
                <Info className="h-3 w-3" />
              </Link>
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Zapri"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {showDetails && (
          <div className="mb-4 space-y-2 text-xs">
            <div className="flex items-start gap-2 p-2 rounded bg-muted/50">
              <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Nujni piškotki (obvezni)</p>
                <p className="text-muted-foreground">
                  Session, avtentikacija, varnost. Brez teh aplikacija ne deluje.
                </p>
              </div>
            </div>
            <label className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-0.5"
              />
              <div>
                <p className="font-medium text-foreground">Analitični piškotki (opcijski)</p>
                <p className="text-muted-foreground">
                  PostHog analitika za izboljšanje uporabniške izkušnje. Anonimni podatki.
                </p>
              </div>
            </label>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          {!showDetails && (
            <button
              onClick={() => setShowDetails(true)}
              className="text-xs text-muted-foreground hover:text-foreground text-left sm:text-center"
            >
              Nastavitve piškotkov →
            </button>
          )}
          <div className="flex gap-2 sm:ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAccept(false)}
            >
              Samo nujni
            </Button>
            <Button
              size="sm"
              onClick={() => handleAccept(analytics)}
            >
              {showDetails ? 'Shrani nastavitve' : 'Sprejmi vse'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
