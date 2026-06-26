'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, X, Zap, ZapOff, Maximize2, Camera as CameraIcon, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { WPC_PROFILES, type CatalogMaterial } from '@/lib/catalog'

/**
 * AR vizualizacija - real-time prikaz ograd skozi kamero
 * 
 * Uporablja:
 * - MediaDevices.getUserMedia() za dostop do kamere
 * - Canvas 2D za risanje ograd v realnem času
 * - Tap za dodajanje stebričkov
 * - Izbira profila za različne vizualizacije
 */

interface ArPoint {
  x: number
  y: number
  id: number
}

interface ArSnapshot {
  id: number
  image: string
  timestamp: string
  profileId: string
}

export function ArMode() {
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [points, setPoints] = useState<ArPoint[]>([])
  const [selectedProfile, setSelectedProfile] = useState<CatalogMaterial>(WPC_PROFILES[0])
  const [snapshots, setSnapshots] = useState<ArSnapshot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const pointIdCounter = useRef(0)
  const { toast } = useToast()

  // Začetek kamere
  const startCamera = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tvoj brskalnik ne podpira dostopa do kamere')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setIsActive(true)
      startRendering()
      
      toast({
        title: 'Kamera aktivirana',
        description: 'Tapni na zaslon za dodajanje stebričkov ograje',
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Napaka pri dostopu do kamere'
      setError(msg)
      toast({
        title: 'Napaka',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Ustavi kamero
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsActive(false)
    setPoints([])
  }, [])

  // Render loop - riši ograjo na canvasu
  const startRendering = useCallback(() => {
    const render = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || !streamRef.current) {
        animationFrameRef.current = requestAnimationFrame(render)
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        animationFrameRef.current = requestAnimationFrame(render)
        return
      }

      // Sinhroniziraj velikost canvasa z video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Nariši ograjo če so vsaj 2 točki
      if (points.length >= 2) {
        drawRailing(ctx, canvas.width, canvas.height)
      }

      // Nariši točke
      points.forEach((point, idx) => {
        drawPoint(ctx, point, idx + 1, canvas.width, canvas.height)
      })

      animationFrameRef.current = requestAnimationFrame(render)
    }
    render()
  }, [points, selectedProfile])

  // Risanje posamezne točke (stebrička)
  const drawPoint = (
    ctx: CanvasRenderingContext2D,
    point: ArPoint,
    number: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const x = point.x * canvasWidth
    const y = point.y * canvasHeight
    const radius = 14

    // Senca
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetY = 2

    // Glavni krožnik (amber)
    ctx.fillStyle = '#f59e0b'
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()

    // Notranji krožnik
    ctx.shadowColor = 'transparent'
    ctx.fillStyle = '#fef3c7'
    ctx.beginPath()
    ctx.arc(x, y, radius - 4, 0, Math.PI * 2)
    ctx.fill()

    // Številka
    ctx.fillStyle = '#0a0a0a'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(number), x, y)
  }

  // Risanje ograje med točkami
  const drawRailing = (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const sortedPoints = [...points].sort((a, b) => a.x - b.x)
    
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetY = 2

    const profile = selectedProfile
    const railingHeight = 110 // višina ograje v pikslih (na canvasu)

    // Za vsak par točk nariši segment
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const p1 = sortedPoints[i]
      const p2 = sortedPoints[i + 1]
      const x1 = p1.x * canvasWidth
      const y1 = p1.y * canvasHeight
      const x2 = p2.x * canvasWidth
      const y2 = p2.y * canvasHeight

      const topY1 = y1 - railingHeight
      const topY2 = y2 - railingHeight

      // Določi barvo glede na profil
      let color = '#8b5a2b' // WPC teak
      if (profile.id.includes('inox')) color = '#a8a8a8'
      else if (profile.id.includes('steklo')) color = 'rgba(200, 220, 230, 0.5)'
      else if (profile.id.includes('alu')) color = '#3a3a3a'

      // Glavni horizontalni nosilec (zgoraj)
      ctx.strokeStyle = color
      ctx.lineWidth = 8
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x1, topY1)
      ctx.lineTo(x2, topY2)
      ctx.stroke()

      // Donji nosilec
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.moveTo(x1, y1 - 10)
      ctx.lineTo(x2, y2 - 10)
      ctx.stroke()

      // Srednji nosilec
      ctx.lineWidth = 4
      const midY1 = (topY1 + y1) / 2
      const midY2 = (topY2 + y2) / 2
      ctx.beginPath()
      ctx.moveTo(x1, midY1)
      ctx.lineTo(x2, midY2)
      ctx.stroke()

      // Vertikalne palice med stebriči
      if (profile.id.includes('wpc-v') || profile.id.includes('alu')) {
        const segmentLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
        const numBalusters = Math.floor(segmentLength / 30)
        for (let j = 1; j < numBalusters; j++) {
          const t = j / numBalusters
          const bx = x1 + (x2 - x1) * t
          const byBottom = y1 + (y2 - y1) * t
          const byTop = topY1 + (topY2 - topY1) * t
          
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(bx, byTop)
          ctx.lineTo(bx, byBottom)
          ctx.stroke()
        }
      }

      // Stebrički na mestih točk
      ctx.fillStyle = color
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.rect(x1 - 6, topY1, 12, railingHeight)
      ctx.fill()
      
      if (i === sortedPoints.length - 2) {
        ctx.beginPath()
        ctx.rect(x2 - 6, topY2, 12, railingHeight)
        ctx.fill()
      }
    }

    ctx.shadowColor = 'transparent'
  }

  // Klik na canvas - doda točko
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    let clientX: number, clientY: number
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const rect = canvas.getBoundingClientRect()
    const x = (clientX - rect.left) / rect.width
    const y = (clientY - rect.top) / rect.height

    pointIdCounter.current += 1
    setPoints(prev => [...prev, { x, y, id: pointIdCounter.current }])
  }, [])

  // Izbriši zadnjo točko
  const handleRemoveLastPoint = useCallback(() => {
    setPoints(prev => prev.slice(0, -1))
  }, [])

  // Počisti vse točke
  const handleClearPoints = useCallback(() => {
    setPoints([])
  }, [])

  // Capture screenshot
  const handleCapture = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const captureCanvas = document.createElement('canvas')
    captureCanvas.width = canvas.width
    captureCanvas.height = canvas.height
    const ctx = captureCanvas.getContext('2d')
    if (!ctx) return

    // Nariši video frame
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height)
    // Nariši overlay
    ctx.drawImage(canvas, 0, 0)

    const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.85)
    const snapshot: ArSnapshot = {
      id: Date.now(),
      image: dataUrl,
      timestamp: new Date().toLocaleString('sl-SI'),
      profileId: selectedProfile.id,
    }

    setSnapshots(prev => [snapshot, ...prev].slice(0, 6))

    toast({
      title: 'Posnetek zajet!',
      description: 'Shranjen v zgodovino AR posnetkov',
    })
  }, [selectedProfile, toast])

  // Prenesi posnetek
  const handleDownloadSnapshot = useCallback((snapshot: ArSnapshot) => {
    const link = document.createElement('a')
    link.href = snapshot.image
    link.download = `ar-posnetek-${snapshot.id}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  // Izbriši posnetek
  const handleDeleteSnapshot = useCallback((id: number) => {
    setSnapshots(prev => prev.filter(s => s.id !== id))
  }, [])

  // Fullscreen toggle
  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }, [])

  // Cleanup ob unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  // Cleanup na fullscreen change
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Camera className="h-5 w-5 text-accent" />
              AR vizualizacija v realnem času
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Prikaži ograjo na balkonu skozi kamero — stranka jo vidi takoj
            </p>
          </div>
          {isActive && (
            <Badge className="bg-red-600 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-white mr-1" />
              LIVE
            </Badge>
          )}
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{error}</p>
              <p className="text-xs mt-1 opacity-80">
                HTTPS zahtevano za dostop do kamere. V produkcijskem okolju bo delovalo.
              </p>
            </div>
          </div>
        )}

        {/* AR VIEW */}
        <div 
          ref={containerRef}
          className={`relative bg-black rounded-lg overflow-hidden ${
            isFullscreen ? 'h-screen' : 'aspect-video'
          }`}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
            style={{ display: isActive ? 'block' : 'none' }}
          />
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onTouchStart={handleCanvasClick}
            className="absolute inset-0 h-full w-full"
            style={{ display: isActive ? 'block' : 'none', cursor: 'crosshair' }}
          />

          {/* Placeholder ko kamera ni aktivna */}
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-6">
                <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">AR vizualizacija</p>
                <p className="text-sm opacity-70 mt-1">
                  Zaženi kamero za real-time prikaz ograd
                </p>
              </div>
            </div>
          )}

          {/* Overlay controls */}
          {isActive && (
            <>
              {/* Zgornji overlay - info */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                <Badge variant="secondary" className="bg-black/70 text-white border-0">
                  {selectedProfile.name}
                </Badge>
                <Badge variant="secondary" className="bg-black/70 text-white border-0">
                  {points.length} točk
                </Badge>
              </div>

              {/* Spodnji overlay - gumbi */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleRemoveLastPoint}
                    disabled={points.length === 0}
                    className="bg-black/70 text-white hover:bg-black/90"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Razveljavi
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleClearPoints}
                    disabled={points.length === 0}
                    className="bg-black/70 text-white hover:bg-black/90"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Počisti
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleFullscreen}
                    className="bg-black/70 text-white hover:bg-black/90"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCapture}
                    disabled={points.length === 0}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <CameraIcon className="h-3 w-3 mr-1" />
                    Posnetek
                  </Button>
                </div>
              </div>

              {/* Pomoč uporabniku */}
              {points.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                    👆 Tapni za dodajanje stebričkov
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* KONTROLE POD AR VIEW */}
        <div className="mt-4 space-y-3">
          {/* Izbira profila */}
          {isActive && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Profil ograje
              </label>
              <Select
                value={selectedProfile.id}
                onValueChange={(value) => {
                  const profile = WPC_PROFILES.find(p => p.id === value)
                  if (profile) setSelectedProfile(profile)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WPC_PROFILES.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name} — {profile.pricePerSqm} €/m²
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Glavni gumb za start/stop */}
          {!isActive ? (
            <Button
              onClick={startCamera}
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Vklop kamere...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Zaženi AR kamero
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={stopCamera}
              variant="destructive"
              size="lg"
              className="w-full"
            >
              <ZapOff className="h-4 w-4 mr-2" />
              Ustavi kamero
            </Button>
          )}

          {/* SNAPSHOTS */}
          {snapshots.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <CameraIcon className="h-4 w-4" />
                Zgodovina AR posnetkov ({snapshots.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {snapshots.map(snap => (
                  <div
                    key={snap.id}
                    className="relative aspect-video rounded-lg overflow-hidden bg-muted group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={snap.image}
                      alt={`AR posnetek ${snap.id}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownloadSnapshot(snap)}
                          className="h-7 px-2"
                        >
                          Prenesi
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSnapshot(snap.id)}
                          className="h-7 px-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] py-0"
                    >
                      {new Date(snap.timestamp).toLocaleTimeString('sl-SI')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NAVODILA */}
          {!isActive && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                Kako uporabljati AR
              </h3>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Zaženi AR kamero (zahteva HTTPS v produkciji)</li>
                <li>Usmeri telefon proti balkonu</li>
                <li>Izberi profil ograje (WPC, Inox, ALU...)</li>
                <li>Tapni na zaslon za dodajanje stebričkov</li>
                <li>Ograja se izriše v realnem času</li>
                <li>Posnetek zajemi in shrani za ponudbo</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
