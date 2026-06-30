import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendLeadNotification, sendLeadConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, notes, materialInterest } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Ime in email sta obvezna' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Neveljaven email format' },
        { status: 400 }
      )
    }

    const project = await db.project.create({
      data: {
        title: `Lead: ${name} (${company || 'brez firme'})`,
        customerName: name,
        customerEmail: email,
        customerPhone: phone || null,
        address: company || null,
        notes: `${materialInterest ? `Zanima: ${materialInterest}. ` : ''}${notes || ''}`,
        status: 'NACRTOVANO',
      },
    })

    const leadData = { name, email, phone, company, notes, materialInterest }
    
    Promise.all([
      sendLeadNotification(leadData),
      sendLeadConfirmation(email, name),
    ]).catch(err => console.error('Email sending failed:', err))

    console.log(`Nov lead shranjen: ${name} <${email}> - ${company || 'brez firme'}`)

    return NextResponse.json({
      success: true,
      projectId: project.id,
      message: 'Lead uspešno sprejet. Kontaktirali vas bomo v 24 urah.',
    })
  } catch (error) {
    console.error('Napaka v /api/lead:', error)
    return NextResponse.json(
      { error: 'Napaka pri shranjevanju lead-a' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const leads = await db.project.findMany({
      where: {
        title: { startsWith: 'Lead:' }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      total: leads.length,
      leads: leads.map(l => ({
        id: l.id,
        name: l.customerName,
        email: l.customerEmail,
        phone: l.customerPhone,
        company: l.address,
        notes: l.notes,
        createdAt: l.createdAt,
      })),
    })
  } catch (error) {
    console.error('Napaka pri pridobivanju lead-ov:', error)
    return NextResponse.json(
      { error: 'Napaka pri pridobivanju podatkov' },
      { status: 500 }
    )
  }
}
