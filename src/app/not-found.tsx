import Link from 'next/link'
import { Home, Search, ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">VizualizatorPRO</span>
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-bold text-accent mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Stran ni najdena
        </h2>
        <p className="text-muted-foreground mb-8">
          Stran, ki jo iščeš, ne obstaja ali je bila premaknjena.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Na začetek
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Search className="h-4 w-4 mr-2" />
              Nazaj
            </Link>
          </Button>
        </div>

        {/* Helpful links */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-xs text-muted-foreground mb-3">Morda iščeš:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/#vizualizacija"
              className="text-sm text-accent hover:underline"
            >
              AI vizualizacija
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link
              href="/#katalog"
              className="text-sm text-accent hover:underline"
            >
              Katalog materialov
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link
              href="/#ar"
              className="text-sm text-accent hover:underline"
            >
              AR način
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link
              href="/#kontakt"
              className="text-sm text-accent hover:underline"
            >
              Kontakt
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
