'use client'

import { useState, useCallback } from 'react'
import { Plus, Upload, X, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import type { MaterialCategory } from '@/lib/catalog'

interface CustomMaterialUploadProps {
  onMaterialAdded?: (material: any) => void
}

interface CustomMaterialForm {
  name: string
  category: MaterialCategory
  description: string
  pricePerSqm: string
  promptHint: string
  referenceImage: string | null
  color: string
  type: string
  dimensions: string
  warranty: string
}

const DEFAULT_FORM: CustomMaterialForm = {
  name: '',
  category: 'WPC_OGRAJA',
  description: '',
  pricePerSqm: '',
  promptHint: '',
  referenceImage: null,
  color: '',
  type: '',
  dimensions: '',
  warranty: '',
}

export function CustomMaterialUpload({ onMaterialAdded }: CustomMaterialUploadProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<CustomMaterialForm>(DEFAULT_FORM)
  const { toast } = useToast()

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Napaka',
        description: 'Datoteka ni slika',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Napaka',
        description: 'Slika je prevelika (max 5MB)',
        variant: 'destructive',
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 800
        let { width, height } = img
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        const compressed = canvas.toDataURL('image/jpeg', 0.85)
        setForm(prev => ({ ...prev, referenceImage: compressed }))
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.promptHint) {
      toast({
        title: 'Manjkajoči podatki',
        description: 'Ime materiala in AI prompt sta obvezna',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/materials/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          description: form.description,
          pricePerSqm: form.pricePerSqm,
          promptHint: form.promptHint,
          referenceImage: form.referenceImage,
          specifications: {
            type: form.type,
            dimensions: form.dimensions,
            color: form.color,
            warranty: form.warranty,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Napaka pri shranjevanju')
      }

      toast({
        title: 'Material dodan!',
        description: `${form.name} je sedaj v vašem katalogu`,
      })

      onMaterialAdded?.(data.material)
      setForm(DEFAULT_FORM)
      setOpen(false)
    } catch (err) {
      toast({
        title: 'Napaka',
        description: err instanceof Error ? err.message : 'Neznana napaka',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Dodaj svoj material
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Dodaj svoj material v katalog
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Slika */}
          <div>
            <Label className="text-xs">Referenčna slika materiala</Label>
            <div className="mt-1">
              {form.referenceImage ? (
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted max-w-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.referenceImage} alt="Material" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, referenceImage: null }))}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-accent transition-colors max-w-xs">
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Naloži sliko materiala</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="name" className="text-xs">Ime materiala *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="npr. WPC H-Line Premium Teak"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-xs">Kategorija</Label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as MaterialCategory })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="WPC_OGRAJA">Balkonske ograje</option>
                <option value="KERAMIKA">Keramika</option>
                <option value="BARVA">Barva</option>
                <option value="FAZADA">Fasada</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-xs">Opis</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Kratek opis materiala za stranko..."
              rows={2}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="promptHint" className="text-xs">AI prompt *</Label>
            <Textarea
              id="promptHint"
              value={form.promptHint}
              onChange={(e) => setForm({ ...form, promptHint: e.target.value })}
              placeholder="modern WPC composite horizontal slats balcony railing, warm teak wood color..."
              rows={2}
              className="mt-1"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Opis za AI kako naj uporabi material na sliki
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pricePerSqm" className="text-xs">Cena (€/m²)</Label>
              <Input
                id="pricePerSqm"
                type="number"
                value={form.pricePerSqm}
                onChange={(e) => setForm({ ...form, pricePerSqm: e.target.value })}
                placeholder="185"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="type" className="text-xs">Tip materiala</Label>
              <Input
                id="type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                placeholder="WPC kompozit"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="dimensions" className="text-xs">Dimenzije</Label>
              <Input
                id="dimensions"
                value={form.dimensions}
                onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                placeholder="180×25 mm"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="color" className="text-xs">Barva</Label>
              <Input
                id="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="Teak / Antracit"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="warranty" className="text-xs">Garancija</Label>
              <Input
                id="warranty"
                value={form.warranty}
                onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                placeholder="25 let"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Prekliči
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Shranjujem...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj material
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
