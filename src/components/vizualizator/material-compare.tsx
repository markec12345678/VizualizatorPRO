'use client'

import { useState, useCallback } from 'react'
import { GitCompare, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type CatalogMaterial } from '@/lib/catalog'

interface MaterialCompareProps {
  materials: CatalogMaterial[]
  onClear: () => void
}

/**
 * Primerjava materialov - prikaže tabelo z primerjavo specifikacij
 * Do 3 materiale hkrati
 */
export function MaterialCompare({ materials, onClear }: MaterialCompareProps) {
  const [open, setOpen] = useState(false)

  if (materials.length === 0) return null

  const specs = [
    { key: 'name', label: 'Ime', getValue: (m: CatalogMaterial) => m.name },
    { key: 'price', label: 'Cena (€/m²)', getValue: (m: CatalogMaterial) => m.pricePerSqm ? `${m.pricePerSqm} €` : '—' },
    { key: 'type', label: 'Tip', getValue: (m: CatalogMaterial) => m.specifications.type || '—' },
    { key: 'dimensions', label: 'Dimenzije', getValue: (m: CatalogMaterial) => m.specifications.dimensions || '—' },
    { key: 'color', label: 'Barva', getValue: (m: CatalogMaterial) => m.specifications.color || '—' },
    { key: 'warranty', label: 'Garancija', getValue: (m: CatalogMaterial) => m.specifications.warranty || '—' },
    { key: 'category', label: 'Kategorija', getValue: (m: CatalogMaterial) => m.category === 'WPC_OGRAJA' ? 'Ograja' : 'Keramika' },
  ]

  return (
    <>
      <Card className="p-3 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1">
              <GitCompare className="h-3 w-3" />
              Primerjava ({materials.length}/3)
            </Badge>
            {materials.map((m) => (
              <span key={m.id} className="text-xs text-muted-foreground">
                {m.name}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
              <GitCompare className="h-3 w-3 mr-1" />
              Primerjaj
            </Button>
            <Button size="sm" variant="ghost" onClick={onClear}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-accent" />
              Primerjava materialov
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-1/4">
                    Specifikacija
                  </th>
                  {materials.map((m) => (
                    <th key={m.id} className="text-left py-3 px-4 font-semibold text-foreground">
                      {m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specs.map((spec, idx) => (
                  <tr
                    key={spec.key}
                    className={idx % 2 === 0 ? 'bg-muted/30' : ''}
                  >
                    <td className="py-3 px-4 font-medium text-muted-foreground">
                      {spec.label}
                    </td>
                    {materials.map((m) => (
                      <td key={m.id} className="py-3 px-4 text-foreground">
                        {spec.getValue(m)}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Cena na meter */}
                <tr className="bg-accent/5 border-t-2 border-accent/20">
                  <td className="py-3 px-4 font-bold text-foreground">
                    Cena za 10m²
                  </td>
                  {materials.map((m) => (
                    <td key={m.id} className="py-3 px-4 font-bold text-accent">
                      {m.pricePerSqm ? `${(m.pricePerSqm * 10).toFixed(0)} €` : '—'}
                    </td>
                  ))}
                </tr>
                <tr className="bg-accent/5">
                  <td className="py-3 px-4 font-bold text-foreground">
                    Cena za 10m² + DDV
                  </td>
                  {materials.map((m) => (
                    <td key={m.id} className="py-3 px-4 font-bold text-accent">
                      {m.pricePerSqm ? `${(m.pricePerSqm * 10 * 1.22).toFixed(0)} €` : '—'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={() => setOpen(false)}>
              <Check className="h-4 w-4 mr-2" />
              Zaključi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
