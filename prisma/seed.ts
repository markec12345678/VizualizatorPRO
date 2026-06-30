import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

/**
 * VizualizatorPRO - Seed skripta
 * 
 * Ustvari demo podatke za razvoj in testiranje:
 * - 1 organizacijo (Roksal d.o.o. Kranj)
 * - 3 uporabnike (admin, vodja, monter)
 * - 5 projektov z različnimi statusi
 * - 8 vizualizacij
 * - 3 custom materiale
 * 
 * Uporaba:
 *   bunx tsx prisma/seed.ts
 *   ali
 *   bun run db:seed
 */

async function main() {
  console.log('🌱 Seeding VizualizatorPRO...')

  // Počisti obstoječe podatke (pazljivo!)
  console.log('🗑️  Čistim stare podatke...')
  await db.visualization.deleteMany()
  await db.project.deleteMany()
  await db.material.deleteMany()
  await db.user.deleteMany()
  await db.organization.deleteMany()

  // ============================================
  // 1. ORGANIZACIJA
  // ============================================
  console.log('🏢 Ustvarjam organizacijo...')
  const org = await db.organization.create({
    data: {
      name: 'Roksal d.o.o. Kranj',
      slug: 'roksal',
      plan: 'pro',
      maxUsers: 3,
      maxVisualizations: 200,
    },
  })

  // ============================================
  // 2. UPORABNIKI
  // ============================================
  console.log('👥 Ustvarjam uporabnike...')
  const passwordHash = await bcrypt.hash('demo123', 12)

  const admin = await db.user.create({
    data: {
      email: 'admin@roksal.si',
      name: 'Marko Marković',
      passwordHash,
      role: 'ADMIN',
      organizationId: org.id,
    },
  })

  const vodja = await db.user.create({
    data: {
      email: 'peter@roksal.si',
      name: 'Peter Petrović',
      passwordHash,
      role: 'VODJA',
      organizationId: org.id,
    },
  })

  const monter = await db.user.create({
    data: {
      email: 'janez@roksal.si',
      name: 'Janez Novak',
      passwordHash,
      role: 'MONTER',
      organizationId: org.id,
    },
  })

  // ============================================
  // 3. PROJEKTI
  // ============================================
  console.log('📁 Ustvarjam projekte...')
  const projects = await Promise.all([
    db.project.create({
      data: {
        title: 'Balkon - Trubarjeva 5, Maribor',
        customerName: 'Jožef Horvat',
        customerEmail: 'jozef.horvat@gmail.com',
        customerPhone: '+386 41 234 567',
        address: 'Trubarjeva 5, 2000 Maribor',
        notes: 'Balkon 8m², želi WPC H-Line v teak barvi',
        status: 'V_TEKU',
        organizationId: org.id,
        assignedToId: monter.id,
      },
    }),
    db.project.create({
      data: {
        title: 'Balkon - Prešernova 12, Ljubljana',
        customerName: 'Ana Kovač',
        customerEmail: 'ana.kovac@email.si',
        customerPhone: '+386 31 987 654',
        address: 'Prešernova 12, 1000 Ljubljana',
        notes: 'Stopniščna ograja, 12m linearnih',
        status: 'V_TEKU',
        organizationId: org.id,
        assignedToId: monter.id,
      },
    }),
    db.project.create({
      data: {
        title: 'Terasa - Slovenska 3, Bled',
        customerName: 'Mitja Zupan',
        customerEmail: 'mitja.zupan@email.si',
        customerPhone: '+386 51 555 333',
        address: 'Slovenska 3, 4260 Bled',
        notes: 'Terasa 25m², inox ograja z steklom',
        status: 'NACRTOVANO',
        organizationId: org.id,
        assignedToId: vodja.id,
      },
    }),
    db.project.create({
      data: {
        title: 'Balkon - Kidričeva 8, Kranj',
        customerName: 'Tina Lesjak',
        customerEmail: 'tina.lesjak@email.si',
        customerPhone: '+386 41 111 222',
        address: 'Kidričeva 8, 4000 Kranj',
        notes: 'Zaključeno. WPC V-Line Pokončno, 6m',
        status: 'ZAKLJUCENO',
        organizationId: org.id,
        assignedToId: monter.id,
      },
    }),
    db.project.create({
      data: {
        title: 'Lead: Franc Potočnik (brez firme)',
        customerName: 'Franc Potočnik',
        customerEmail: 'franc.potocnik@email.si',
        customerPhone: '+386 41 333 444',
        notes: 'Zanima: WPC H-Line Vodoravno. Zanima me 10m balkon',
        status: 'NACRTOVANO',
        organizationId: org.id,
      },
    }),
  ])

  // ============================================
  // 4. VIZUALIZACIJE
  // ============================================
  console.log('🎨 Ustvarjam vizualizacije...')
  const materials = [
    { id: 'wpc-h-line', name: 'WPC H-Line Vodoravno', category: 'WPC_OGRAJA' },
    { id: 'wpc-v-line', name: 'WPC V-Line Pokončno', category: 'WPC_OGRAJA' },
    { id: 'inox-line', name: 'Inox Line Premium', category: 'WPC_OGRAJA' },
    { id: 'steklo-full', name: 'Steklena ograja Full', category: 'WPC_OGRAJA' },
    { id: 'keramika-wood-look', name: 'Wood Look Porcelan', category: 'KERAMIKA' },
    { id: 'keramika-marble', name: 'Marmor Effect Premium', category: 'KERAMIKA' },
    { id: 'keramika-metro', name: 'Metro Subway Premium', category: 'KERAMIKA' },
    { id: 'alu-klasik', name: 'ALU Klasik', category: 'WPC_OGRAJA' },
  ]

  const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'FAILED', 'COMPLETED']
  const processingTimes = [12, 8, 15, 18, 6, 22, null, 10]

  for (let i = 0; i < materials.length; i++) {
    const project = projects[i % projects.length]
    await db.visualization.create({
      data: {
        projectId: project.id,
        organizationId: org.id,
        originalImage: 'data:image/jpeg;base64,/9j/4AAQ...',
        resultImage: statuses[i] === 'COMPLETED' ? 'data:image/png;base64,iVBORw0KGgo...' : null,
        status: statuses[i],
        errorMessage: statuses[i] === 'FAILED' ? 'AI generiranje ni uspelo' : null,
        category: materials[i].category,
        materialId: materials[i].id,
        materialName: materials[i].name,
        prompt: 'photorealistic professional architectural photography...',
        processingTime: processingTimes[i],
      },
    })
  }

  // ============================================
  // 5. CUSTOM MATERIALI
  // ============================================
  console.log('📦 Ustvarjam custom materiale...')
  await db.material.create({
    data: {
      name: 'WPC Premium Teak XL',
      category: 'WPC_OGRAJA',
      description: 'Lastni WPC profil z izboljšano zaščito proti UV',
      pricePerSqm: 225,
      promptHint: 'premium WPC composite extra wide teak wood balcony railing',
      specifications: JSON.stringify({
        type: 'WPC kompozit',
        dimensions: '200×30 mm letev',
        color: 'Teak Premium',
        warranty: '25 let',
      }),
      organizationId: org.id,
      active: true,
    },
  })

  await db.material.create({
    data: {
      name: 'Inox Cable XL',
      category: 'WPC_OGRAJA',
      description: 'Inox s širimi kabli za moderen videz',
      pricePerSqm: 315,
      promptHint: 'premium stainless steel cable railing wide cables modern minimalist',
      specifications: JSON.stringify({
        type: 'Inox AISI 316',
        dimensions: 'Kabel 8mm, profili 50×15mm',
        color: 'Ščetlan inox',
        warranty: '20 let',
      }),
      organizationId: org.id,
      active: true,
    },
  })

  await db.material.create({
    data: {
      name: 'Keramika Carrara XL',
      category: 'KERAMIKA',
      description: 'Velik format z marmornim vzorcem Carrara',
      pricePerSqm: 105,
      promptHint: 'large format Carrara marble porcelain tiles luxury bathroom',
      specifications: JSON.stringify({
        type: 'Porcelanat poliran',
        dimensions: '120×120 cm',
        color: 'Carrara White',
      }),
      organizationId: org.id,
      active: true,
    },
  })

  // ============================================
  // Povzetek
  // ============================================
  console.log('')
  console.log('✅ Seed uspešno končan!')
  console.log('')
  console.log('📊 Ustvarjeni podatki:')
  console.log(`  🏢 Organizacije: 1 (${org.name})`)
  console.log(`  👥 Uporabniki: 3`)
  console.log(`  📁 Projekti: ${projects.length}`)
  console.log(`  🎨 Vizualizacije: ${materials.length}`)
  console.log(`  📦 Custom materiali: 3`)
  console.log('')
  console.log('🔑 Demo uporabniki (geslo: demo123):')
  console.log('  ┌─────────────────────────────────────────────────┐')
  console.log('  │ 📧 admin@roksal.si    (ADMIN)   - Marko M.     │')
  console.log('  │ 📧 peter@roksal.si    (VODJA)   - Peter P.     │')
  console.log('  │ 📧 janez@roksal.si    (MONTER)  - Janez N.     │')
  console.log('  └─────────────────────────────────────────────────┘')
  console.log('')
  console.log('🌐 Odpri http://localhost:3000 in se prijavi!')
}

main()
  .catch((error) => {
    console.error('❌ Napaka pri seed-anju:', error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
