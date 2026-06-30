import { Sparkles } from 'lucide-react'

/**
 * Loading skeleton - prikaže se med nalaganjem strani
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header skeleton */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-pulse">
              <div className="h-10 w-10 rounded-lg bg-muted" />
              <div className="space-y-1">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero skeleton */}
      <section className="border-b bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl space-y-4">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="space-y-3">
              <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-10 w-2/3 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
              <div className="h-48 bg-muted rounded-lg animate-pulse" />
              <div className="h-20 bg-muted rounded-lg animate-pulse" />
            </div>
            {/* Right column */}
            <div className="space-y-6">
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
              <div className="h-48 bg-muted rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer skeleton */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-2">
            <div className="h-8 w-8 rounded bg-muted animate-pulse" />
            <div className="space-y-1">
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              <div className="h-2 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
