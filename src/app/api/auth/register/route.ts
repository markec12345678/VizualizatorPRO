import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

/**
 * POST /api/auth/register
 * Registrira novo organizacijo (firmo) in admin uporabnika
 * 
 * Body:
 * - organizationName: ime firme
 * - slug: URL-friendly identifikator
 * - email: admin email
 * - password: admin geslo
 * - name: ime admin uporabnika
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationName, slug, email, password, name } = body

    // Validacija
    if (!organizationName || !slug || !email || !password) {
      return NextResponse.json(
        { error: 'Manjkajoči podatki: organizationName, slug, email in password so obvezni' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Geslo mora imeti vsaj 6 znakov' },
        { status: 400 }
      )
    }

    // Preveri ali email že obstaja
    const existingUser = await db.user.findUnique({
      where: { email },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email je že registriran' },
        { status: 409 }
      )
    }

    // Preveri ali slug že obstaja
    const existingOrg = await db.organization.findUnique({
      where: { slug },
    })
    if (existingOrg) {
      return NextResponse.json(
        { error: 'URL identifikator firme je že zaseden' },
        { status: 409 }
      )
    }

    // Hash gesla
    const passwordHash = await bcrypt.hash(password, 12)

    // Ustvari organizacijo in admin uporabnika
    const organization = await db.organization.create({
      data: {
        name: organizationName,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        plan: 'trial',
        maxUsers: 1,
        maxVisualizations: 10,
        users: {
          create: {
            email,
            name: name || 'Admin',
            passwordHash,
            role: 'ADMIN',
          },
        },
      },
      include: {
        users: true,
      },
    })

    console.log(`Nova organizacija: ${organization.name} (slug: ${organization.slug})`)
    console.log(`Admin uporabnik: ${email}`)

    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        plan: organization.plan,
      },
      user: {
        email,
        name: name || 'Admin',
        role: 'ADMIN',
      },
      message: 'Organizacija uspešno registrirana. Lahko se prijavite.',
    })
  } catch (error) {
    console.error('Napaka v /api/auth/register:', error)
    return NextResponse.json(
      { error: 'Napaka pri registraciji' },
      { status: 500 }
    )
  }
}
