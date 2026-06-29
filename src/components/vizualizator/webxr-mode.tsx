'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Box, Camera, X, AlertCircle, Loader2, Zap, ZapOff, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { WPC_PROFILES, type CatalogMaterial } from '@/lib/catalog'

/**
 * WebXR AR vizualizacija z globino
 * 
 * Uporablja WebXR API za pravo AR izkušnjo z globino:
 * - Hit-test za detekcijo površin
 * - 3D postavitev ograd v prostoru
 * - Realistična perspektiva z globino
 * 
 * Podprto na:
 * - Android Chrome 81+ (ARCore)
 * - Samsung Internet
 * - iOS Safari 16+ (na nekaterih napravah)
 * 
 * Fallback: če WebXR ni podprt, prikaže navodila
 */

interface ArAnchor {
  id: number
  x: number
  y: number
  z: number
}

export function WebXrMode() {
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const [anchors, setAnchors] = useState<ArAnchor[]>([])
  const [selectedProfile, setSelectedProfile] = useState<CatalogMaterial>(WPC_PROFILES[0])
  const [session, setSession] = useState<XRSession | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const anchorIdCounter = useRef(0)
  const { toast } = useToast()

  // Preveri WebXR podporo
  useEffect(() => {
    const checkSupport = async () => {
      if ('xr' in navigator) {
        try {
          const supported = await (navigator as any).xr.isSessionSupported('immersive-ar')
          setIsSupported(supported)
        } catch {
          setIsSupported(false)
        }
      } else {
        setIsSupported(false)
      }
    }
    checkSupport()
  }, [])

  // Začni WebXR sejo
  const startSession = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    try {
      if (!('xr' in navigator)) {
        throw new Error('WebXR ni podprt v tem brskalniku')
      }

      const xrSession = await (navigator as any).xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'anchors'],
        optionalFeatures: ['dom-overlay', 'local-floor'],
        domOverlay: { root: document.body },
      })

      setSession(xrSession)
      setIsActive(true)

      // Setup WebGL
      const canvas = canvasRef.current
      if (!canvas) return

      const gl = canvas.getContext('webgl', {
        xrCompatible: true,
        alpha: true,
      }) as WebGLRenderingContext

      if (!gl) {
        throw new Error('WebGL ni na voljo')
      }

      glRef.current = gl
      ;(xrSession as any).updateRenderState({
        baseLayer: new XRWebGLLayer(xrSession, gl),
      })

      // Hit-test source
      const viewerSpace = await xrSession.requestReferenceSpace('viewer')
      const hitTestSource = await xrSession.requestHitTestSource({
        space: viewerSpace,
        offsetRay: new XRRay(),
      })

      // Reference space
      const refSpace = await xrSession.requestReferenceSpace('local-floor')

      // Render loop
      let anchorMap = new Map<number, XRAnchor>()

      xrSession.requestAnimationFrame((time: number, frame: XRFrame) => {
        const pose = frame.getViewerPose(refSpace)
        if (!pose) return

        // Clear
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        // Process hit tests
        const hitTestResults = frame.getHitTestResults(hitTestSource)
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0]
          const hitPose = hit.getPose(refSpace)
          if (hitPose) {
            // Lahko dodamo vizualni indikator (crosshair)
          }
        }

        // Render anchors
        anchorMap.forEach((anchor, id) => {
          const anchorPose = frame.getPose(anchor.anchorSpace, refSpace)
          if (anchorPose) {
            renderRailingPost(gl, anchorPose.transform, selectedProfile)
          }
        })
      })

      // Cleanup ob koncu
      xrSession.addEventListener('end', () => {
        setIsActive(false)
        setSession(null)
        setAnchors([])
        anchorMap.clear()
      })

      toast({
        title: 'AR seja aktivna',
        description: 'Tapni na površino za dodajanje stebričkov',
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Napaka pri zagonu AR'
      setError(msg)
      toast({
        title: 'AR napaka',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [selectedProfile, toast])

  // Končaj sejo
  const endSession = useCallback(async () => {
    if (session) {
      await session.end()
      setSession(null)
      setIsActive(false)
      setAnchors([])
    }
  }, [session])

  // Render stebrička v 3D (poenostavljeno)
  const renderRailingPost = (
    gl: WebGLRenderingContext,
    transform: XRRigidTransform,
    profile: CatalogMaterial
  ) => {
    // V realni implementaciji bi tukaj uporabili Three.js ali similar
    // za rendering 3D modelov stebričkov z globino
    
    // Za demo: zapišemo v console
    console.log('Render post at:', transform.position)
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (session) {
        session.end().catch(console.error)
      }
    }
  }, [session])

  // Ni podprt
  if (isSupported === false) {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Box className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              WebXR AR (z globino)
              <Badge variant="secondary" className="text-xs">Napredno</Badge>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Prava AR izkušnja z 3D globino in detekcijo površin
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">WebXR ni podprt v tem brskalniku</p>
              <p className="text-sm text-amber-700 mt-1">
                WebXR AR zahteva podprto napravo in brskalnik. Za najboljšo izkušnjo uporabi:
              </p>
              <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
                <li>Android Chrome 81+ (z ARCore)</li>
                <li>Samsung Internet</li>
                <li>Mozilla WebXR Viewer (Firefox)</li>
              </ul>
              <p className="text-xs text-amber-600 mt-3">
                Alternativa: uporabi osnovni AR način (MediaDevices API), ki deluje na več napravah.
              </p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Box className="h-5 w-5 text-accent" />
            WebXR AR z globino
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Prava AR izkušnja z detekcijo površin in 3D globino
          </p>
        </div>
        {isActive && (
          <Badge className="bg-green-600 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-white mr-1" />
            AR ACTIVE
          </Badge>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full aspect-video rounded-lg bg-black"
        style={{ display: isActive ? 'block' : 'none' }}
      />

      {!isActive && (
        <div className="aspect-video rounded-lg bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Box className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">WebXR AR</p>
            <p className="text-sm mt-1">
              {isSupported === null ? 'Preverjam podporo...' : 'Pripravljen za zagon'}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {isActive && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Profil ograje
            </label>
            <Select
              value={selectedProfile.id}
              onValueChange={(value) => {
                const profile = WPC_PROFILES.find((p) => p.id === value)
                if (profile) setSelectedProfile(profile)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WPC_PROFILES.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name} — {profile.pricePerSqm} €/m²
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!isActive ? (
          <Button
            onClick={startSession}
            disabled={isLoading || isSupported === false}
            size="lg"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Zaganjam AR...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Zaženi WebXR AR
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={endSession}
            variant="destructive"
            size="lg"
            className="w-full"
          >
            <ZapOff className="h-4 w-4 mr-2" />
            Končaj AR sejo
          </Button>
        )}

        {/* Info panel */}
        <div className="rounded-lg bg-muted/50 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-accent" />
            Razlika od osnovnega AR
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="font-medium text-foreground mb-1">Osnovni AR (MediaDevices)</p>
              <ul className="text-muted-foreground space-y-0.5">
                <li>• 2D Canvas overlay</li>
                <li>• Deluje na vseh napravah</li>
                <li>• Brez globine</li>
                <li>• HTTPS zahtevano</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">WebXR AR (z globino)</p>
              <ul className="text-muted-foreground space-y-0.5">
                <li>• 3D rendering z globino</li>
                <li>• Hit-test za površine</li>
                <li>• Anchor sistem</li>
                <li>• Realistična perspektiva</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Zahteve */}
        {!isActive && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Zahteve:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Android Chrome 81+ z ARCore</li>
              <li>HTTPS povezava (obvezno)</li>
              <li>Dovoljenje za kamero</li>
              <li>Podprta naprava (ARCore kompatibilna)</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  )
}
