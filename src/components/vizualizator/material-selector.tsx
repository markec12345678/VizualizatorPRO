'use client'

import { useState } from 'react'
import { Check, Layers, Grid3x3 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  WPC_PROFILES,
  CERAMIC_TILES,
  type CatalogMaterial,
  type MaterialCategory,
} from '@/lib/catalog'

interface MaterialSelectorProps {
  selectedId: string | null
  onSelect: (material: CatalogMaterial) => void
}

export function MaterialSelector({ selectedId, onSelect }: MaterialSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<MaterialCategory>('WPC_OGRAJA')

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">2. Izberi material</h2>
            <p className="text-sm text-muted-foreground mt-1">
              WPC ograje, Inox, Steklo in keramike — vse s tehničnimi specifikacijami
            </p>
          </div>
          {selectedId && (
            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-200">
              ✓ Material izbran
            </span>
          )}
        </div>

        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as MaterialCategory)}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="WPC_OGRAJA" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Balkonske ograje ({WPC_PROFILES.length})
            </TabsTrigger>
            <TabsTrigger value="KERAMIKA" className="flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              Keramika ({CERAMIC_TILES.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="WPC_OGRAJA" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {WPC_PROFILES.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  isSelected={selectedId === material.id}
                  onSelect={() => onSelect(material)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="KERAMIKA" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CERAMIC_TILES.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  isSelected={selectedId === material.id}
                  onSelect={() => onSelect(material)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  )
}

interface MaterialCardProps {
  material: CatalogMaterial
  isSelected: boolean
  onSelect: () => void
}

function MaterialCard({ material, isSelected, onSelect }: MaterialCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`group relative text-left rounded-lg border-2 transition-all overflow-hidden ${
        isSelected
          ? 'border-accent bg-accent/5 shadow-sm'
          : 'border-border hover:border-muted-foreground/40 hover:shadow-sm'
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 rounded-full bg-accent p-1 text-accent-foreground shadow-md">
          <Check className="h-3 w-3" />
        </div>
      )}

      <div className="aspect-[4/3] bg-muted flex items-center justify-center relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={material.referenceImage}
          alt={material.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        {material.pricePerSqm && (
          <Badge
            variant="secondary"
            className="absolute bottom-2 left-2 bg-white/95 text-foreground shadow-sm"
          >
            {material.pricePerSqm} €/m²
          </Badge>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm text-foreground line-clamp-1">{material.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {material.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {material.specifications.type && (
            <Badge variant="outline" className="text-[10px] py-0 px-1.5">
              {material.specifications.type}
            </Badge>
          )}
          {material.specifications.color && (
            <Badge variant="outline" className="text-[10px] py-0 px-1.5">
              {material.specifications.color.split(' / ')[0]}
            </Badge>
          )}
        </div>
      </div>
    </button>
  )
}
