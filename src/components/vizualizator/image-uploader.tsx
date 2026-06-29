'use client'

import { useCallback, useState, useRef } from 'react'
import { Camera, Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface ImageUploaderProps {
  imagePreview: string | null
  imageBase64: string | null
  error: string | null
  isProcessing: boolean
  onFileSelect: (file: File) => void
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCameraCapture: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  cameraInputRef: React.RefObject<HTMLInputElement | null>
  title?: string
  subtitle?: string
}

export function ImageUploader({
  imagePreview,
  imageBase64,
  error,
  isProcessing,
  onFileSelect,
  onFileInput,
  onCameraCapture,
  onClear,
  fileInputRef,
  cameraInputRef,
  title = 'Fotografiraj ali naloži prostor',
  subtitle = 'Posnemi balkon, sobo ali fasado — AI bo prikazal rezultat',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      onFileSelect(files[0])
    }
  }, [onFileSelect])

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          {imagePreview && (
            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-200">
              ✓ Slika naložena
            </span>
          )}
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!imagePreview ? (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-accent bg-accent/5' 
                : 'border-muted-foreground/30 hover:border-muted-foreground/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFileInput}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onCameraCapture}
              className="hidden"
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Povleci sliko sem</p>
                <p className="text-sm text-muted-foreground mt-1">ali izberi možnost spodaj</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <Button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1"
                  size="lg"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Fotografiraj
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                  size="lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Naloži iz galerije
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                JPEG, PNG ali WebP · maksimalno 15MB · samodejna kompresija
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Naložena slika prostora"
                className="h-full w-full object-cover"
              />
              <button
                onClick={onClear}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
                aria-label="Odstrani sliko"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Slika pripravljena za AI obdelavo</span>
              <Button variant="ghost" size="sm" onClick={onClear}>
                Zamenjaj sliko
              </Button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="mt-4 space-y-2">
            <Progress value={50} className="h-1" />
            <p className="text-xs text-muted-foreground text-center">Obdelava slike...</p>
          </div>
        )}
      </div>
    </Card>
  )
}
