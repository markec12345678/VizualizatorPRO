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
<!DOCTYPE html>
<html lang="sl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nov lead - VizualizatorPRO</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background:#0a0a0a;padding:24px 32px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:40px;height:40px;background:#f59e0b;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:20px;">✨</div>
        <div>
          <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">VizualizatorPRO</h1>
          <p style="margin:0;color:#a1a1aa;font-size:12px;">AI vizualizacije za prodajo</p>
        </div>
      </div>
    </div>
    
    <!-- Amber bar -->
    <div style="height:4px;background:#f59e0b;"></div>
    
    <!-- Content -->
    <div style="padding:32px;">
      <h2 style="margin:0 0 4px;color:#0a0a0a;font-size:22px;">🎯 Nov lead!</h2>
      <p style="margin:0 0 24px;color:#71717a;font-size:14px;">Prejel si novo povpraševanje preko VizualizatorPRO.</p>
      
      <!-- Data table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:12px 16px;background:#f4f4f5;font-weight:600;color:#0a0a0a;font-size:13px;border-radius:8px 0 0 8px;width:35%;">Ime</td>
          <td style="padding:12px 16px;color:#27272a;font-size:14px;background:#ffffff;border:1px solid #e4e4e7;border-radius:0 8px 8px 0;">${data.name}</td>
        </tr>
        <tr><td style="height:8px;"></td></tr>
        <tr>
          <td style="padding:12px 16px;background:#f4f4f5;font-weight:600;color:#0a0a0a;font-size:13px;border-radius:8px 0 0 8px;">Email</td>
          <td style="padding:12px 16px;color:#27272a;font-size:14px;background:#ffffff;border:1px solid #e4e4e7;border-radius:0 8px 8px 0;"><a href="mailto:${data.email}" style="color:#f59e0b;text-decoration:none;">${data.email}</a></td>
        </tr>
        ${data.phone ? `<tr><td style="height:8px;"></td></tr><tr><td style="padding:12px 16px;background:#f4f4f5;font-weight:600;color:#0a0a0a;font-size:13px;border-radius:8px 0 0 8px;">Telefon</td><td style="padding:12px 16px;color:#27272a;font-size:14px;background:#ffffff;border:1px solid #e4e4e7;border-radius:0 8px 8px 0;"><a href="tel:${data.phone}" style="color:#f59e0b;text-decoration:none;">${data.phone}</a></td></tr>` : ''}
        ${data.company ? `<tr><td style="height:8px;"></td></tr><tr><td style="padding:12px 16px;background:#f4f4f5;font-weight:600;color:#0a0a0a;font-size:13px;border-radius:8px 0 0 8px;">Firma</td><td style="padding:12px 16px;color:#27272a;font-size:14px;background:#ffffff;border:1px solid #e4e4e7;border-radius:0 8px 8px 0;">${data.company}</td></tr>` : ''}
        ${data.materialInterest ? `<tr><td style="height:8px;"></td></tr><tr><td style="padding:12px 16px;background:#f4f4f5;font-weight:600;color:#0a0a0a;font-size:13px;border-radius:8px 0 0 8px;">Zanima</td><td style="padding:12px 16px;color:#27272a;font-size:14px;background:#ffffff;border:1px solid #e4e4e7;border-radius:0 8px 8px 0;">${data.materialInterest}</td></tr>` : ''}
      </table>
      
      ${data.notes ? `
      <!-- Notes -->
      <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">Sporočilo</p>
        <p style="margin:0;color:#27272a;font-size:14px;line-height:1.6;">${data.notes}</p>
      </div>
      ` : ''}
      
      <!-- CTA -->
      <a href="mailto:${data.email}" style="display:inline-block;background:#f59e0b;color:#0a0a0a;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">Odgovori stranki →</a>
    </div>
    
    <!-- Footer -->
    <div style="background:#f4f4f5;padding:20px 32px;border-top:1px solid #e4e4e7;">
      <p style="margin:0;color:#a1a1aa;font-size:11px;text-align:center;line-height:1.6;">
        Email poslan avtomatsko iz VizualizatorPRO sistema.<br>
        © 2026 VizualizatorPRO. Vse pravice pridržane.
      </p>
    </div>
  </div>
</body>
</html>
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
