import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

/**
 * POST /api/materials/custom
 * Sprejme custom material od firme (ime, kategorija, slika, prompt)
 * Shrani v bazo in na filesystem
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, description, pricePerSqm, promptHint, referenceImage, specifications } = body

    // Validacija
    if (!name || !category || !promptHint) {
      return NextResponse.json(
        { error: 'Manjkajoči podatki: ime, kategorija in promptHint so obvezni' },
        { status: 400 }
      )
    }

    const ALLOWED_CATEGORIES = ['WPC_OGRAJA', 'KERAMIKA', 'BARVA', 'FAZADA']
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Nedovoljena kategorija' },
        { status: 400 }
      )
    }

    // Shrani sliko na filesystem če je base64
    let imagePath = ''
    if (referenceImage && referenceImage.startsWith('data:image')) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }

      const base64Data = referenceImage.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')
      const filename = `custom-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
      const filepath = path.join(uploadsDir, filename)
      
      fs.writeFileSync(filepath, buffer)
      imagePath = `/uploads/${filename}`
    }

    // Shrani v bazo
    const material = await db.material.create({
      data: {
        name,
        category,
        description: description || '',
        pricePerSqm: pricePerSqm ? parseFloat(pricePerSqm) : null,
        referenceImage: imagePath,
        promptHint,
        specifications: specifications ? JSON.stringify(specifications) : null,
        active: true,
      },
    })

    console.log(`Nov custom material: ${name} (${category})`)

    return NextResponse.json({
      success: true,
      material: {
        id: material.id,
        name: material.name,
        category: material.category,
        referenceImage: material.referenceImage,
        promptHint: material.promptHint,
      },
    })
  } catch (error) {
    console.error('Napaka v /api/materials/custom:', error)
    return NextResponse.json(
      { error: 'Napaka pri shranjevanju materiala' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/materials/custom
 * Vrne vse custom materiale
 */
export async function GET() {
  try {
    const materials = await db.material.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      total: materials.length,
      materials: materials.map(m => ({
        id: m.id,
        name: m.name,
        category: m.category,
        description: m.description,
        pricePerSqm: m.pricePerSqm,
        referenceImage: m.referenceImage,
        promptHint: m.promptHint,
        specifications: m.specifications ? JSON.parse(m.specifications) : null,
      })),
    })
  } catch (error) {
    console.error('Napaka pri pridobivanju custom materialov:', error)
    return NextResponse.json(
      { error: 'Napaka pri pridobivanju podatkov' },
      { status: 500 }
    )
  }
}
