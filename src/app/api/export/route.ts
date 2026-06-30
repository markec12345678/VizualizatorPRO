import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, isAdmin } from '@/lib/auth/session'

/**
 * GET /api/export?type=leads|visualizations|materials&format=json|csv
 * 
 * Admin lahko izvozi vse podatke organizacije v JSON ali CSV formatu.
 * Uporabno za backup, analizo ali prenos v druge sisteme.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Nisi prijavljen' },
        { status: 401 }
      )
    }

    if (!isAdmin(user.role)) {
      return NextResponse.json(
        { error: 'Samo admin lahko izvaža podatke' },
        { status: 403 }
      )
    }

    if (!user.organizationId) {
      return NextResponse.json(
        { error: 'Nisi član organizacije' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'leads'
    const format = searchParams.get('format') || 'json'

    let data: any[] = []
    let filename = ''

    switch (type) {
      case 'leads':
        data = await db.project.findMany({
          where: {
            organizationId: user.organizationId,
            title: { startsWith: 'Lead:' },
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            address: true,
            notes: true,
            status: true,
            createdAt: true,
          },
        })
        filename = `leads-${new Date().toISOString().split('T')[0]}`
        break

      case 'visualizations':
        data = await db.visualization.findMany({
          where: { organizationId: user.organizationId },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            materialName: true,
            category: true,
            status: true,
            processingTime: true,
            createdAt: true,
            project: {
              select: { title: true, customerName: true },
            },
          },
        })
        filename = `vizualizacije-${new Date().toISOString().split('T')[0]}`
        break

      case 'materials':
        data = await db.material.findMany({
          where: { organizationId: user.organizationId },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            category: true,
            description: true,
            pricePerSqm: true,
            active: true,
            createdAt: true,
          },
        })
        filename = `materiali-${new Date().toISOString().split('T')[0]}`
        break

      case 'projects':
        data = await db.project.findMany({
          where: { organizationId: user.organizationId },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            address: true,
            notes: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        filename = `projekti-${new Date().toISOString().split('T')[0]}`
        break

      default:
        return NextResponse.json(
          { error: 'Neveljaven tip izvoza. Dovoljeni: leads, visualizations, materials, projects' },
          { status: 400 }
        )
    }

    // JSON format
    if (format === 'json') {
      return NextResponse.json(
        {
          exportedAt: new Date().toISOString(),
          organization: user.organizationId,
          type,
          count: data.length,
          data,
        },
        {
          headers: {
            'Content-Disposition': `attachment; filename="${filename}.json"`,
          },
        }
      )
    }

    // CSV format
    if (format === 'csv') {
      if (data.length === 0) {
        return NextResponse.json(
          { error: 'Ni podatkov za izvoz' },
          { status: 404 }
        )
      }

      // Flatten data za CSV
      const flatData = data.map((item: any) => {
        const flat: Record<string, string> = {}
        for (const [key, value] of Object.entries(item)) {
          if (typeof value === 'object' && value !== null) {
            flat[key] = JSON.stringify(value)
          } else {
            flat[key] = String(value || '')
          }
        }
        return flat
      })

      // Headers
      const headers = Object.keys(flatData[0])
      const csvRows = [
        headers.join(','),
        ...flatData.map(row =>
          headers
            .map(header => {
              const val = row[header] || ''
              // Escape CSV vrednosti
              if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                return `"${val.replace(/"/g, '""')}"`
              }
              return val
            })
            .join(',')
        ),
      ]
      const csv = csvRows.join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      })
    }

    return NextResponse.json(
      { error: 'Neveljaven format. Dovoljena: json, csv' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Napaka pri izvozu:', error)
    return NextResponse.json(
      { error: 'Napaka pri izvažanju podatkov' },
      { status: 500 }
    )
  }
}
