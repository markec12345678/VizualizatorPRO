'use client'

import { jsPDF } from 'jspdf'
import autotable from 'jspdf-autotable'
import { FileText, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { CatalogMaterial } from '@/lib/catalog'

interface PdfExportProps {
  originalImage: string | null
  resultImage: string | null
  material: CatalogMaterial | null
}

interface OfferData {
  customerName: string
  customerAddress: string
  projectAddress: string
  surfaceArea: string
  notes: string
  validityDays: number
}

const DEFAULT_DATA: OfferData = {
  customerName: '',
  customerAddress: '',
  projectAddress: '',
  surfaceArea: '10',
  notes: '',
  validityDays: 30,
}

/**
 * Komponenta za izvoz PDF ponudbe z vizualizacijo
 * Uporablja jsPDF + autotable za profesionalno oblikovanje
 */
export function PdfExport({ originalImage, resultImage, material }: PdfExportProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [data, setData] = useState<OfferData>(DEFAULT_DATA)
  const { toast } = useToast()

  const canGenerate = !!(resultImage && material && originalImage)

  const generatePdf = async () => {
    if (!canGenerate) {
      toast({
        title: 'Manjkajoči podatki',
        description: 'Najprej generiraj vizualizacijo.',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)

    try {
      // Malo zakasnjenja za UI
      await new Promise(r => setTimeout(r, 200))

      const doc = new jsPDF({ unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15

      // === HEADER ===
      // Antracit barva
      doc.setFillColor(10, 10, 10)
      doc.rect(0, 0, pageWidth, 35, 'F')

      // Amber akcent
      doc.setFillColor(245, 158, 11)
      doc.rect(0, 35, pageWidth, 2, 'F')

      // Logo text
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('VizualizatorPRO', margin, 18)

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(180, 180, 180)
      doc.text('AI vizualizacije za prodajo balkonskih ograd in keramike', margin, 24)

      // Datum in številka ponudbe
      const today = new Date()
      const dateStr = today.toLocaleDateString('sl-SI')
      const offerNumber = `P-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

      doc.setFontSize(9)
      doc.setTextColor(200, 200, 200)
      doc.text(`Datum: ${dateStr}`, pageWidth - margin, 18, { align: 'right' })
      doc.text(`Št. ponudbe: ${offerNumber}`, pageWidth - margin, 24, { align: 'right' })

      // === NASLOV PONUDBE ===
      doc.setTextColor(20, 20, 20)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('PONUDBA', margin, 50)

      // === PODATKI STRANKE ===
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Stranka:', margin, 60)
      doc.setFont('helvetica', 'normal')
      doc.text(data.customerName || 'Ime stranke', margin, 66)
      doc.text(data.customerAddress || 'Naslov stranke', margin, 71)

      // === PODATKI PROJEKTA ===
      doc.setFont('helvetica', 'bold')
      doc.text('Lokacija projekta:', margin, 80)
      doc.setFont('helvetica', 'normal')
      doc.text(data.projectAddress || 'Naslov projekta', margin, 86)

      // === VIZUALIZACIJA - PRED / PO ===
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(20, 20, 20)
      doc.text('Vizualizacija projekta', margin, 100)

      const imgY = 105
      const imgWidth = (pageWidth - margin * 2 - 5) / 2
      const imgHeight = imgWidth * 0.5625 // 16:9

      // PRED (original)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100, 100, 100)
      doc.text('PRED', margin, imgY - 2)

      try {
        // Preveri če je base64
        if (originalImage.startsWith('data:image')) {
          doc.addImage(originalImage, 'JPEG', margin, imgY, imgWidth, imgHeight, undefined, 'FAST')
        }
      } catch (e) {
        console.error('Napaka pri dodajanju original slike:', e)
      }

      // PO (rezultat)
      doc.text('PO', margin + imgWidth + 5, imgY - 2)
      try {
        if (resultImage && resultImage.startsWith('data:image')) {
          doc.addImage(resultImage, 'JPEG', margin + imgWidth + 5, imgY, imgWidth, imgHeight, undefined, 'FAST')
        }
      } catch (e) {
        console.error('Napaka pri dodajanju rezultat slike:', e)
      }

      // === MATERIAL TABELA ===
      const tableY = imgY + imgHeight + 10

      const surface = parseFloat(data.surfaceArea) || 10
      const pricePerSqm = material!.pricePerSqm || 0
      const subtotal = surface * pricePerSqm
      const ddv = subtotal * 0.22
      const total = subtotal + ddv

      autotable(doc, {
        startY: tableY,
        head: [['Opis', 'Specifikacija', 'Količina', 'Cena €/m²', 'Znesek']],
        body: [
          [
            material!.name,
            material!.specifications.type + '\n' + (material!.specifications.dimensions || ''),
            `${surface} m²`,
            `${pricePerSqm.toFixed(2)} €`,
            `${subtotal.toFixed(2)} €`,
          ],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [10, 10, 10],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [40, 40, 40],
        },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold' },
          1: { cellWidth: 50 },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: margin, right: margin },
      })

      // === SKUPNI ZNESEK ===
      const summaryY = (doc as any).lastAutoTable.finalY + 5

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60, 60, 60)

      doc.text('Vrednost materiala (brez DDV):', pageWidth - 70, summaryY + 5)
      doc.text(`${subtotal.toFixed(2)} €`, pageWidth - margin, summaryY + 5, { align: 'right' })

      doc.text('DDV (22%):', pageWidth - 70, summaryY + 10)
      doc.text(`${ddv.toFixed(2)} €`, pageWidth - margin, summaryY + 10, { align: 'right' })

      // Skupaj - poudarjeno
      doc.setFillColor(245, 158, 11)
      doc.rect(pageWidth - 75, summaryY + 13, 60, 10, 'F')
      doc.setTextColor(10, 10, 10)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('SKUPAJ:', pageWidth - 70, summaryY + 20)
      doc.text(`${total.toFixed(2)} €`, pageWidth - margin, summaryY + 20, { align: 'right' })

      // === OPOMBE ===
      if (data.notes) {
        doc.setTextColor(60, 60, 60)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.text('Opombe:', margin, summaryY + 30)
        doc.setFont('helvetica', 'normal')
        const splitNotes = doc.splitTextToSize(data.notes, pageWidth - margin * 2)
        doc.text(splitNotes, margin, summaryY + 35)
      }

      // === POGOJI ===
      const conditionsY = Math.max(summaryY + 50, pageHeight - 50)
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, conditionsY, pageWidth - margin, conditionsY)

      doc.setFontSize(8)
      doc.setTextColor(120, 120, 120)
      doc.setFont('helvetica', 'italic')
      doc.text(
        `Ponudba velja ${data.validityDays} dni od datuma izdaje. Cena ne vključuje montaže (po dogovoru).`,
        margin, conditionsY + 5
      )
      doc.text('Garancija na material: ' + (material!.specifications.warranty || 'po pogodbi'), margin, conditionsY + 10)

      // === FOOTER ===
      doc.setFillColor(10, 10, 10)
      doc.rect(0, pageHeight - 15, pageWidth, 15, 'F')

      doc.setTextColor(180, 180, 180)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('VizualizatorPRO · info@vizualizatorpro.si · +386 1 234 56 78', pageWidth / 2, pageHeight - 6, { align: 'center' })

      // Shrani PDF
      const filename = `ponudba-${offerNumber}-${(material!.name || 'vizualizacija').toLowerCase().replace(/\s+/g, '-')}.pdf`
      doc.save(filename)

      toast({
        title: 'PDF ponudba generirana!',
        description: `Datoteka: ${filename}`,
      })
    } catch (err) {
      console.error('Napaka pri generiranju PDF:', err)
      toast({
        title: 'Napaka pri PDF',
        description: err instanceof Error ? err.message : 'Neznana napaka',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent" />
          PDF ponudba z vizualizacijo
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Generiraj profesionalno ponudbo za stranko z vizualizacijo in ceno
        </p>
      </div>

      {!canGenerate ? (
        <div className="rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground">
          Najprej naloži sliko, izberi material in generiraj AI vizualizacijo.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="customerName" className="text-xs">Ime stranke</Label>
              <Input
                id="customerName"
                value={data.customerName}
                onChange={(e) => setData({ ...data, customerName: e.target.value })}
                placeholder="Janez Novak"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="customerAddress" className="text-xs">Naslov stranke</Label>
              <Input
                id="customerAddress"
                value={data.customerAddress}
                onChange={(e) => setData({ ...data, customerAddress: e.target.value })}
                placeholder="Slovenska 1, 1000 Ljubljana"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="projectAddress" className="text-xs">Lokacija projekta</Label>
              <Input
                id="projectAddress"
                value={data.projectAddress}
                onChange={(e) => setData({ ...data, projectAddress: e.target.value })}
                placeholder="Trubarjeva 5, 2000 Maribor"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="surfaceArea" className="text-xs">Površina (m²)</Label>
              <Input
                id="surfaceArea"
                type="number"
                value={data.surfaceArea}
                onChange={(e) => setData({ ...data, surfaceArea: e.target.value })}
                placeholder="10"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-xs">Opombe</Label>
            <Textarea
              id="notes"
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
              placeholder="Vključena montaža, rok izvedbe 14 dni, garancija 25 let..."
              rows={2}
              className="mt-1"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Cena skupaj:</p>
              <p className="text-xs text-muted-foreground">
                {parseFloat(data.surfaceArea) || 0} m² × {material?.pricePerSqm || 0} € + DDV
              </p>
            </div>
            <p className="text-2xl font-bold text-accent">
              {((parseFloat(data.surfaceArea) || 0) * (material?.pricePerSqm || 0) * 1.22).toFixed(2)} €
            </p>
          </div>

          <Button
            onClick={generatePdf}
            disabled={isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generiram PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Prenesi PDF ponudbo
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  )
}
