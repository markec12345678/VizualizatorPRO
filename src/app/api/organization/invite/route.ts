import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { getCurrentUser, isAdmin } from '@/lib/auth/session'

/**
 * POST /api/organization/invite
 * Admin doda novega uporabnika v svojo organizacijo
 * 
 * Body:
 * - email: email novega uporabnika
 * - name: ime
 * - password: začasno geslo
 * - role: vloga (ADMIN, VODJA, MONTER, SKLADISCE)
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Nisi prijavljen' },
        { status: 401 }
      )
    }

    if (!isAdmin(currentUser.role)) {
      return NextResponse.json(
        { error: 'Samo admin lahko doda nove uporabnike' },
        { status: 403 }
      )
    }

    if (!currentUser.organizationId) {
      return NextResponse.json(
        { error: 'Nisi član nobene organizacije' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, name, password, role } = body

    // Validacija
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Manjkajoči podatki: email, password in role so obvezni' },
        { status: 400 }
      )
    }

    const ALLOWED_ROLES = ['ADMIN', 'VODJA', 'MONTER', 'SKLADISCE']
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { error: 'Neveljavna vloga' },
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

    // Preveri omejitve organizacije
    const organization = await db.organization.findUnique({
      where: { id: currentUser.organizationId },
      include: { _count: { select: { users: true } } },
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organizacija ni najdena' },
        { status: 404 }
      )
    }

    if (organization._count.users >= organization.maxUsers) {
      return NextResponse.json(
        { 
          error: `Dosežen je maksimalen števil uporabnikov (${organization.maxUsers}).`,
          hint: 'Nadgradi paket za več uporabnikov.'
        },
        { status: 403 }
      )
    }

    // Hash gesla
    const passwordHash = await bcrypt.hash(password, 12)

    // Ustvari uporabnika
    const newUser = await db.user.create({
      data: {
        email,
        name: name || null,
        passwordHash,
        role,
        organizationId: organization.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    console.log(`Nov uporabnik dodan: ${email} (vloga: ${role}) v org: ${organization.name}`)

    return NextResponse.json({
      success: true,
      user: newUser,
      message: `Uporabnik ${email} uspešno dodan v organizacijo`,
    })
  } catch (error) {
    console.error('Napaka v /api/organization/invite:', error)
    return NextResponse.json(
      { error: 'Napaka pri dodajanju uporabnika' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/organization/invite
 * Admin odstrani uporabnika iz organizacije
 */
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Nisi prijavljen' },
        { status: 401 }
      )
    }

    if (!isAdmin(currentUser.role)) {
      return NextResponse.json(
        { error: 'Samo admin lahko odstrani uporabnike' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Manjka userId parameter' },
        { status: 400 }
      )
    }

    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: 'Ne moreš odstraniti samega sebe' },
        { status: 400 }
      )
    }

    // Preveri da je uporabnik v isti organizaciji
    const targetUser = await db.user.findUnique({
      where: { id: userId },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Uporabnik ni najden' },
        { status: 404 }
      )
    }

    if (targetUser.organizationId !== currentUser.organizationId) {
      return NextResponse.json(
        { error: 'Uporabnik ni v tvoji organizaciji' },
        { status: 403 }
      )
    }

    // Odstrani uporabnika (postavi organizationId na null)
    await db.user.update({
      where: { id: userId },
      data: { organizationId: null },
    })

    return NextResponse.json({
      success: true,
      message: 'Uporabnik odstranjen iz organizacije',
    })
  } catch (error) {
    console.error('Napaka pri odstranjevanju uporabnika:', error)
    return NextResponse.json(
      { error: 'Napaka pri odstranjevanju uporabnika' },
      { status: 500 }
    )
  }
}
