import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/session'
import { captureError } from '@/lib/sentry'

/**
 * Projects API - CRUD operacije za projekte
 * 
 * GET  /api/projects          - seznam projektov (z paginacijo in filtri)
 * POST /api/projects          - ustvari nov projekt
 * GET  /api/projects/:id      - pridobi posamezni projekt
 * PATCH /api/projects/:id     - posodobi projekt
 * DELETE /api/projects/:id    - izbriši projekt
 */

// === GET - seznam projektov ===
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Nisi prijavljen' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    const where: any = {}
    if (user.organizationId) {
      where.organizationId = user.organizationId
    }
    if (status) {
      where.status = status
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
        { address: { contains: search } },
      ]
    }

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { visualizations: true } },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      db.project.count({ where }),
    ])

    return NextResponse.json({
      projects: projects.map((p) => ({
        id: p.id,
        title: p.title,
        customerName: p.customerName,
        customerEmail: p.customerEmail,
        customerPhone: p.customerPhone,
        address: p.address,
        notes: p.notes,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        visualizationsCount: (p as any)._count?.visualizations || 0,
        assignedTo: p.assignedTo,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), {
      endpoint: 'GET /api/projects',
    })
    return NextResponse.json({ error: 'Napaka pri pridobivanju projektov' }, { status: 500 })
  }
}

// === POST - ustvari nov projekt ===
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Nisi prijavljen' }, { status: 401 })
    }

    const body = await request.json()
    const { title, customerName, customerEmail, customerPhone, address, notes, status, assignedToId } = body

    if (!title) {
      return NextResponse.json({ error: 'Naslov projekta je obvezen' }, { status: 400 })
    }

    const project = await db.project.create({
      data: {
        title,
        customerName,
        customerEmail,
        customerPhone,
        address,
        notes,
        status: status || 'NACRTOVANO',
        organizationId: user.organizationId,
        assignedToId: assignedToId || user.id,
      },
    })

    return NextResponse.json(
      {
        success: true,
        project: {
          id: project.id,
          title: project.title,
          status: project.status,
          createdAt: project.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), {
      endpoint: 'POST /api/projects',
    })
    return NextResponse.json({ error: 'Napaka pri ustvarjanju projekta' }, { status: 500 })
  }
}

// === PATCH - posodobi projekt ===
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Nisi prijavljen' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'ID projekta je obvezen' }, { status: 400 })
    }

    // Preveri lastništvo
    const existing = await db.project.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Projekt ni najden' }, { status: 404 })
    }
    if (existing.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Nimaš dostopa do tega projekta' }, { status: 403 })
    }

    const updated = await db.project.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      project: {
        id: updated.id,
        title: updated.title,
        status: updated.status,
        updatedAt: updated.updatedAt,
      },
    })
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), {
      endpoint: 'PATCH /api/projects',
    })
    return NextResponse.json({ error: 'Napaka pri posodabljanju projekta' }, { status: 500 })
  }
}

// === DELETE - izbriši projekt ===
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Nisi prijavljen' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Manjka id parameter' }, { status: 400 })
    }

    // Preveri lastništvo
    const existing = await db.project.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Projekt ni najden' }, { status: 404 })
    }
    if (existing.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Nimaš dostopa do tega projekta' }, { status: 403 })
    }

    // Kaskadno izbriši (tudi vizualizacije)
    await db.project.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: 'Projekt uspešno izbrisan',
    })
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), {
      endpoint: 'DELETE /api/projects',
    })
    return NextResponse.json({ error: 'Napaka pri brisanju projekta' }, { status: 500 })
  }
}
