import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Server, Database, Zap, Shield, Activity, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Status sistema',
  description: 'Trenutno stanje VizualizatorPRO sistema in API endpointov.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

async function getHealthStatus() {
  try {
    const res = await fetch('http://localhost:3000/api', {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export default async function StatusPage() {
  const health = await getHealthStatus()

  const isOk = health?.status === 'ok'
  const isDegraded = health?.status === 'degraded'

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">VizualizatorPRO</h1>
              <p className="text-xs text-muted-foreground">Status sistema</p>
            </div>
          </Link>
        </div>
      </header>

      <section className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              Nazaj
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-2">Status sistema</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Zadnja preverba: {health?.timestamp ? new Date(health.timestamp).toLocaleString('sl-SI') : 'Ni na voljo'}
          </p>

          {/* GLAVNI STATUS */}
          <div className={`rounded-lg border-2 p-6 mb-6 ${
            isOk ? 'border-green-500 bg-green-50' : isDegraded ? 'border-amber-500 bg-amber-50' : 'border-red-500 bg-red-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                isOk ? 'bg-green-100' : isDegraded ? 'bg-amber-100' : 'bg-red-100'
              }`}>
                {isOk ? (
                  <Activity className="h-6 w-6 text-green-600" />
                ) : isDegraded ? (
                  <Activity className="h-6 w-6 text-amber-600" />
                ) : (
                  <Activity className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {isOk ? 'Vse deluje normalno' : isDegraded ? 'Delno deluje' : 'Sistem ni na voljo'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Status: <span className="font-mono">{health?.status || 'unknown'}</span>
                  {health?.responseTime && ` · Odziv: ${health.responseTime}`}
                </p>
              </div>
            </div>
          </div>

          {/* PODROBNOSTI */}
          {health && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* BAZA */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="h-5 w-5 text-accent" />
                  <h4 className="font-semibold text-foreground">Baza podatkov</h4>
                </div>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Status:</dt>
                    <dd className="font-medium">
                      <span className={health.database.status === 'connected' ? 'text-green-600' : 'text-red-600'}>
                        {health.database.status === 'connected' ? '✓ Povezana' : '✗ Nepovezana'}
                      </span>
                    </dd>
                  </div>
                  {health.database.latency && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Latenca:</dt>
                      <dd className="font-mono">{health.database.latency}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Organizacije:</dt>
                    <dd className="font-mono">{health.database.counts.organizations}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Uporabniki:</dt>
                    <dd className="font-mono">{health.database.counts.users}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Projekti:</dt>
                    <dd className="font-mono">{health.database.counts.projects}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Vizualizacije:</dt>
                    <dd className="font-mono">{health.database.counts.visualizations}</dd>
                  </div>
                </dl>
              </div>

              {/* STREŽNIK */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Server className="h-5 w-5 text-accent" />
                  <h4 className="font-semibold text-foreground">Strežnik</h4>
                </div>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Verzija:</dt>
                    <dd className="font-mono">{health.version}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Okolje:</dt>
                    <dd className="font-mono">{health.environment}</dd>
                  </div>
                  {health.uptime && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Uptime:</dt>
                      <dd className="font-mono">
                        {Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">RSS:</dt>
                    <dd className="font-mono">{health.memory.rss} MB</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Heap:</dt>
                    <dd className="font-mono">{health.memory.heapUsed}/{health.memory.heapTotal} MB</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* FUNKCIONALNOSTI */}
          {health && (
            <div className="rounded-lg border p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-accent" />
                <h4 className="font-semibold text-foreground">Funkcionalnosti</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                {Object.entries(health.features).map(([key, enabled]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className={enabled ? 'text-green-600' : 'text-muted-foreground'}>
                      {enabled ? '✓' : '○'}
                    </span>
                    <span className="text-muted-foreground capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RATE LIMITS */}
          {health && (
            <div className="rounded-lg border p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-accent" />
                <h4 className="font-semibold text-foreground">Omejitve (Rate Limits)</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                {Object.entries(health.limits.rateLimit).map(([endpoint, limit]) => (
                  <div key={endpoint} className="flex flex-col">
                    <span className="text-xs text-muted-foreground capitalize">{endpoint}</span>
                    <span className="font-mono text-foreground">{limit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ENDPOINTI */}
          {health && (
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold text-foreground mb-3">API Endpointi</h4>
              <div className="grid sm:grid-cols-2 gap-1 text-sm font-mono">
                {Object.entries(health.endpoints).map(([name, path]) => (
                  <div key={name} className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-accent">→</span>
                    <span>{path}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!health && (
            <div className="rounded-lg border-2 border-red-500 bg-red-50 p-6 text-center">
              <p className="text-red-700 font-medium">Ne morem pridobiti statusa sistema.</p>
              <p className="text-red-600 text-sm mt-1">Strežnik morda ne deluje ali ni dosegljiv.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
