'use client'

import { useState, useCallback } from 'react'
import { Sparkles, Wand2, Mail, Zap, Shield, TrendingUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useImageUpload } from '@/hooks/use-image-upload'
import { ImageUploader } from '@/components/vizualizator/image-uploader'
import { MaterialSelector } from '@/components/vizualizator/material-selector'
import { ResultViewer } from '@/components/vizualizator/result-viewer'
import { AdminPanel } from '@/components/vizualizator/admin-panel'
import { PdfExport } from '@/components/vizualizator/pdf-export'
import { ArMode } from '@/components/vizualizator/ar-mode'
import { UserMenu } from '@/components/vizualizator/user-menu'
import { Dashboard } from '@/components/vizualizator/dashboard'
import { useToast } from '@/hooks/use-toast'
import type { CatalogMaterial } from '@/lib/catalog'

export default function Home() {
  const [selectedMaterial, setSelectedMaterial] = useState<CatalogMaterial | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processError, setProcessError] = useState<string | null>(null)
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const [mode, setMode] = useState<'demo' | 'ai'>('demo')

  const [leadName, setLeadName] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [leadCompany, setLeadCompany] = useState('')
  const [leadNotes, setLeadNotes] = useState('')

  const { toast } = useToast()

  const {
    imagePreview,
    imageBase64,
    error: uploadError,
    isProcessing: isUploadProcessing,
    handleFileSelect,
    handleFileInput,
    handleCameraCapture,
    clearImage,
    fileInputRef,
    cameraInputRef,
  } = useImageUpload()

  const handleMaterialSelect = useCallback((material: CatalogMaterial) => {
    setSelectedMaterial(material)
    setResultImage(null)
    setProcessError(null)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!imageBase64 || !selectedMaterial) {
      toast({
        title: 'Manjkajoči podatki',
        description: 'Najprej naloži sliko in izberi material.',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    setProcessError(null)
    setResultImage(null)

    try {
      const response = await fetch('/api/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalImage: imageBase64,
          materialId: selectedMaterial.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Napaka pri AI obdelavi')
      }

      setResultImage(data.resultImage)
      setProcessingTime(data.processingTime)
      setMode(data.mode === 'ai-production' || data.mode === 'replicate' ? 'ai' : 'demo')

      toast({
        title: 'Vizualizacija pripravljena!',
        description: `${selectedMaterial.name} — ${data.processingTime}s obdelava`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Neznana napaka'
      setProcessError(msg)
      toast({
        title: 'Napaka',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }, [imageBase64, selectedMaterial, toast])

  const handleReset = useCallback(() => {
    setResultImage(null)
    setProcessError(null)
    setProcessingTime(null)
  }, [])

  const handleDownload = useCallback(() => {
    if (!resultImage) return
    const link = document.createElement('a')
    link.href = resultImage
    link.download = `vizualizacija-${selectedMaterial?.id || 'rezultat'}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [resultImage, selectedMaterial])

  const handleLeadSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!leadName || !leadEmail) {
      toast({
        title: 'Manjkajoči podatki',
        description: 'Vnesi vsaj ime in email.',
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          phone: leadPhone,
          company: leadCompany,
          notes: leadNotes,
          materialInterest: selectedMaterial?.name,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Hvala za povpraševanje!',
          description: 'Obravnavali smo vašo prijavo in se oglasili v 24 urah.',
        })
        setLeadName('')
        setLeadEmail('')
        setLeadPhone('')
        setLeadCompany('')
        setLeadNotes('')
      } else {
        throw new Error('Napaka pri pošiljanju')
      }
    } catch (err) {
      toast({
        title: 'Napaka',
        description: 'Ne moremo sprejeti povpraševanja. Prosimo, pokličite nas.',
        variant: 'destructive',
      })
    }
  }, [leadName, leadEmail, leadPhone, leadCompany, leadNotes, selectedMaterial, toast])

  const canGenerate = imageBase64 && selectedMaterial && !isProcessing

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">VizualizatorPRO</h1>
                <p className="text-xs text-muted-foreground">AI vizualizacije za prodajo</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:inline-flex">
                <Zap className="h-3 w-3 mr-1" />
                AI-powered
              </Badge>
              {mode === 'ai' && (
                <Badge className="bg-green-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-white mr-1" />
                  LIVE AI
                </Badge>
              )}
              {mode === 'demo' && (
                <Badge variant="secondary">
                  DEMO način
                </Badge>
              )}
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <section className="border-b bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              <TrendingUp className="h-3 w-3 mr-1" />
              +47% stopnja konverzije z vizualizacijami
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Stranka vidi rezultat.
              <br />
              <span className="text-accent">Kupi takoj.</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              Profesionalno AI orodje za izvajalce balkonskih ograd in keramike.
              Fotorealistične vizualizacije na kraju samem — iz fotoaparata mobilnega telefona.
              WPC, Inox, Steklo, keramike vseh vrst.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span>Fotorealističen rezultat v 30 sekundah</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span>14 materialov v katalogu</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span>Deluje na mobilnem telefonu</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ImageUploader
                imagePreview={imagePreview}
                imageBase64={imageBase64}
                error={uploadError}
                isProcessing={isUploadProcessing}
                onFileSelect={handleFileSelect}
                onFileInput={handleFileInput}
                onCameraCapture={handleCameraCapture}
                onClear={clearImage}
                fileInputRef={fileInputRef}
                cameraInputRef={cameraInputRef}
              />

              <MaterialSelector
                selectedId={selectedMaterial?.id || null}
                onSelect={handleMaterialSelect}
              />

              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Generiraj vizualizacijo</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      AI bo apliciral izbrani material na tvojo sliko
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  size="lg"
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                      Generiram...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generiraj AI vizualizacijo
                      {selectedMaterial && (
                        <span className="ml-2 text-xs opacity-70">
                          · {selectedMaterial.name}
                        </span>
                      )}
                    </>
                  )}
                </Button>
                {!canGenerate && !isProcessing && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {!imageBase64 && !selectedMaterial && 'Naloži sliko in izberi material'}
                    {imageBase64 && !selectedMaterial && 'Izberi material iz kataloga'}
                    {!imageBase64 && selectedMaterial && 'Naloži sliko prostora'}
                  </p>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <ResultViewer
                originalImage={imageBase64}
                resultImage={resultImage}
                isProcessing={isProcessing}
                error={processError}
                materialName={selectedMaterial?.name || null}
                processingTime={processingTime}
                onReset={handleReset}
                onDownload={handleDownload}
              />

              <ArMode />

              <Card className="p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Želiš to orodje za svojo firmo?
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pusti kontakt — pripravili smo demo s tvojim materialom
                  </p>
                </div>
                <PdfExport
                  originalImage={imageBase64}
                  resultImage={resultImage}
                  material={selectedMaterial}
                />
              </Card>

              <Card className="p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Pošlji povpraševanje
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pusti kontakt — pripravili smo demo s tvojim materialom
                  </p>
                </div>
                <form onSubmit={handleLeadSubmit} className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="leadName" className="text-xs">Ime in priimek *</Label>
                      <Input
                        id="leadName"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        placeholder="Janez Novak"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="leadCompany" className="text-xs">Firma</Label>
                      <Input
                        id="leadCompany"
                        value={leadCompany}
                        onChange={(e) => setLeadCompany(e.target.value)}
                        placeholder="Moja firma d.o.o."
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="leadEmail" className="text-xs">Email *</Label>
                      <Input
                        id="leadEmail"
                        type="email"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        placeholder="janez@firma.si"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="leadPhone" className="text-xs">Telefon</Label>
                      <Input
                        id="leadPhone"
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                        placeholder="+386 41 234 567"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="leadNotes" className="text-xs">Sporočilo</Label>
                    <Textarea
                      id="leadNotes"
                      value={leadNotes}
                      onChange={(e) => setLeadNotes(e.target.value)}
                      placeholder="Našli ste me preko... Zanima me..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" variant="default" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Pošlji povpraševanje
                  </Button>
                </form>
              </Card>
            </div>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Hitro kot blisk"
              description="30 sekund od slike do vizualizacije. Monter dela na terenu, stranka vidi rezultat takoj."
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5" />}
              title="Profesionalno"
              description="Fotorealističen prikaz z originalno perspektivo. Stranka vidi svoj balkon, ne generično predlogo."
            />
            <FeatureCard
              icon={<TrendingUp className="h-5 w-5" />}
              title="Dokazano poveča prodajo"
              description="Izvajalci poročajo o 30-50% višji stopnji konverzije z vizualizacijami. Stranka vidi, stranka kupi."
            />
          </div>

          <div className="mt-16">
            <AdminPanel />
          </div>
        </div>
      </section>

      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">VizualizatorPRO</p>
                <p className="text-xs text-muted-foreground">AI vizualizacije za izvajalce</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Slovenija 🇸🇮</span>
              <span>info@vizualizatorpro.si</span>
              <span>+386 1 234 56 78</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
            © 2026 VizualizatorPRO. Vse pravice pridržane. AI tehnologija: GLM-5.2 (Z.ai) + ControlNet.
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </Card>
  )
}
