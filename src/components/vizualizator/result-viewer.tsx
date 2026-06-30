'use client'

import { useState, useRef, useCallback } from 'react'
import { Sparkles, Loader2, Download, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ResultViewerProps {
  originalImage: string | null
  resultImage: string | null
  isProcessing: boolean
  error: string | null
  materialName: string | null
  processingTime: number | null
  onReset: () => void
  onDownload: () => void
}

export function ResultViewer({
  originalImage,
  resultImage,
  isProcessing,
  error,
  materialName,
  processingTime,
  onReset,
  onDownload,
}: ResultViewerProps) {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPos(percentage)
  }, [])

  const handleMouseDown = useCallback(() => {
    isDragging.current = true
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) handleMove(e.clientX)
  }, [handleMove])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }, [handleMove])

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">3. AI vizualizacija</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {resultImage && materialName
                ? `Rezultat z materialom: ${materialName}`
                : 'Po izbiri materiala klikni "Generiraj vizualizacijo"'}
            </p>
          </div>
          {resultImage && !isProcessing && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4 mr-1" />
                Prenesi
              </Button>
              <Button variant="ghost" size="sm" onClick={onReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Ponovi
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-medium">Napaka pri generiranju</p>
            <p className="mt-1 text-destructive/80">{error}</p>
          </div>
        )}

        {!originalImage && !isProcessing && (
          <div className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30">
            <div className="text-center text-muted-foreground">
              <Sparkles className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Tu bo prikazana AI vizualizacija</p>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="aspect-video rounded-lg bg-muted/30 flex items-center justify-center border-2 border-accent/30">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
                <div className="relative rounded-full bg-accent/10 p-6">
                  <Loader2 className="h-10 w-10 text-accent animate-spin mx-auto" />
                </div>
              </div>
              <p className="mt-4 font-medium text-foreground">AI obdeluje sliko...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Generiranje fotorealistične vizualizacije
              </p>
              <div className="mt-3 flex items-center justify-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {!isProcessing && resultImage && originalImage && (
          <div className="space-y-3">
            <div
              ref={containerRef}
              className="relative aspect-video rounded-lg overflow-hidden bg-black select-none cursor-ew-resize"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalImage}
                alt="Original"
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
              
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultImage}
                  alt="Rezultat"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ width: `${100 / (sliderPos / 100)}%`, maxWidth: 'none' }}
                  draggable={false}
                />
              </div>

              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <div className="flex items-center gap-0.5">
                    <svg className="h-3 w-3 text-gray-700" fill="currentColor" viewBox="0 0 8 8">
                      <path d="M5.5 0L1 4l4.5 4V0z" />
                    </svg>
                    <svg className="h-3 w-3 text-gray-700" fill="currentColor" viewBox="0 0 8 8">
                      <path d="M2.5 0L7 4 2.5 8V0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <Badge
                variant="secondary"
                className="absolute top-3 right-3 bg-black/70 text-white border-0"
              >
                PRED
              </Badge>
              <Badge
                variant="secondary"
                className="absolute top-3 left-3 bg-accent text-accent-foreground border-0"
              >
                PO ({materialName})
              </Badge>

              {processingTime && (
                <Badge
                  variant="secondary"
                  className="absolute bottom-3 right-3 bg-black/70 text-white border-0 text-xs"
                >
                  {processingTime}s
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <span>← Povleci za primerjavo pred / po →</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
