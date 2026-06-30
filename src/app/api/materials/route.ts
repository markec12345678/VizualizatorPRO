import { NextResponse } from 'next/server'
import { ALL_MATERIALS, getMaterialsByCategory, CATEGORY_LABELS, type MaterialCategory } from '@/lib/catalog'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') as MaterialCategory | null
  
  let materials = ALL_MATERIALS
  if (category && category in CATEGORY_LABELS) {
    materials = getMaterialsByCategory(category)
  }
  
  return NextResponse.json({
    total: materials.length,
    categories: CATEGORY_LABELS,
    materials: materials.map(m => ({
      id: m.id,
      name: m.name,
      category: m.category,
      categoryLabel: CATEGORY_LABELS[m.category],
      description: m.description,
      pricePerSqm: m.pricePerSqm,
      referenceImage: m.referenceImage,
      specifications: m.specifications,
    })),
  })
}
