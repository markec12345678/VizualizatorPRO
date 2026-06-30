import { Resend } from 'resend'

interface LeadEmailData {
  name: string
  email: string
  phone?: string
  company?: string
  notes?: string
  materialInterest?: string
}

interface VisualizationEmailData {
  materialName: string
  category: string
  processingTime: number
  mode: string
}

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'
const TO_EMAIL = process.env.NOTIFICATION_EMAIL || 'info@vizualizatorpro.si'

export async function sendLeadNotification(data: LeadEmailData): Promise<boolean> {
  const resend = getResendClient()
  
  const emailContent = `
<h2>Nov lead preko VizualizatorPRO!</h2>
<table style="border-collapse: collapse; width: 100%; font-family: sans-serif;">
  <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Ime:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.name}</td></tr>
  <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Email:</td><td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
  ${data.phone ? `<tr><td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Telefon:</td><td style="padding: 8px; border: 1px solid #ddd;"><a href="tel:${data.phone}">${data.phone}</a></td></tr>` : ''}
  ${data.company ? `<tr><td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Firma:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.company}</td></tr>` : ''}
  ${data.materialInterest ? `<tr><td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Zanima:</td><td style="padding: 8px; border: 1px solid #ddd;">${data.materialInterest}</td></tr>` : ''}
</table>
${data.notes ? `<h3>Sporočilo:</h3><p style="font-family: sans-serif; padding: 12px; background: #f9f9f9; border-left: 4px solid #f59e0b;">${data.notes}</p>` : ''}
<hr>
<p style="font-size: 12px; color: #666; font-family: sans-serif;">Email poslan avtomatsko iz VizualizatorPRO sistema.</p>
`.trim()

  if (!resend) {
    console.log('=== NOV LEAD (demo mode - email ne poslan) ===')
    console.log(`Ime: ${data.name}`)
    console.log(`Email: ${data.email}`)
    console.log(`Telefon: ${data.phone || 'ni podan'}`)
    console.log(`Firma: ${data.company || 'ni podana'}`)
    console.log(`Zanima: ${data.materialInterest || 'ni podano'}`)
    console.log(`Sporočilo: ${data.notes || 'prazno'}`)
    console.log('==========================================')
    return false
  }

  try {
    const { error } = await resend.emails.send({
      from: `VizualizatorPRO <${FROM_EMAIL}>`,
      to: [TO_EMAIL],
      subject: `🎯 Nov lead: ${data.name}${data.company ? ` (${data.company})` : ''}`,
      html: emailContent,
      reply_to: data.email,
    })

    if (error) {
      console.error('Resend napaka:', error)
      return false
    }

    console.log(`✓ Lead email poslan na ${TO_EMAIL}`)
    return true
  } catch (err) {
    console.error('Napaka pri pošiljanju email-a:', err)
    return false
  }
}

export async function sendVisualizationNotification(data: VisualizationEmailData): Promise<void> {
  const resend = getResendClient()
  if (!resend) return

  try {
    await resend.emails.send({
      from: `VizualizatorPRO <${FROM_EMAIL}>`,
      to: [TO_EMAIL],
      subject: `✨ Nova vizualizacija: ${data.materialName}`,
      html: `
        <h2>Nova AI vizualizacija generirana</h2>
        <p><strong>Material:</strong> ${data.materialName}</p>
        <p><strong>Kategorija:</strong> ${data.category}</p>
        <p><strong>Čas obdelave:</strong> ${data.processingTime}s</p>
        <p><strong>Način:</strong> ${data.mode}</p>
        <hr>
        <p style="font-size: 12px; color: #666;">Avtomatsko obvestilo iz VizualizatorPRO</p>
      `,
    })
  } catch (err) {
    console.error('Napaka pri vizualizacija email-u:', err)
  }
}

export async function sendLeadConfirmation(customerEmail: string, customerName: string): Promise<boolean> {
  const resend = getResendClient()
  if (!resend) return false

  try {
    await resend.emails.send({
      from: `VizualizatorPRO <${FROM_EMAIL}>`,
      to: [customerEmail],
      subject: 'Hvala za povpraševanje — VizualizatorPRO',
      html: `
        <h2>Pozdravljeni ${customerName},</h2>
        <p>Hvala za vaše povpraševanje preko VizualizatorPRO platforme.</p>
        <p>Naša ekipa bo vašo prijavo obravnavala in vas kontaktirala v roku 24 ur.</p>
        <p>Lahko se tudi sami oglasite na:</p>
        <ul>
          <li>📞 Telefon: +386 1 234 56 78</li>
          <li>📧 Email: info@vizualizatorpro.si</li>
        </ul>
        <p>Lep pozdrav,<br>Ekipa VizualizatorPRO</p>
        <hr>
        <p style="font-size: 12px; color: #666;">To je avtomatsko generiran email. Prosimo, ne odgovarjajte nanj.</p>
      `,
    })
    return true
  } catch (err) {
    console.error('Napaka pri potrditvenem email-u:', err)
    return false
  }
}
