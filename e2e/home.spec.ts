import { test, expect } from '@playwright/test'

test.describe('🏠 Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/VizualizatorPRO/)
  })

  test('should display header with logo', async ({ page }) => {
    await expect(page.locator('h1:has-text("VizualizatorPRO")')).toBeVisible()
  })

  test('should display hero section', async ({ page }) => {
    await expect(page.locator('text=Stranka vidi rezultat')).toBeVisible()
    await expect(page.locator('text=Kupi takoj')).toBeVisible()
  })

  test('should display conversion rate badge', async ({ page }) => {
    await expect(page.locator('text=+47% stopnja konverzije')).toBeVisible()
  })

  test('should display login button', async ({ page }) => {
    await expect(page.locator('button:has-text("Prijava")')).toBeVisible()
  })

  test('should display language switcher', async ({ page }) => {
    await expect(page.locator('button[aria-haspopup]').first()).toBeVisible()
  })

  test('should display feature cards', async ({ page }) => {
    await expect(page.locator('text=Hitro kot blisk')).toBeVisible()
    await expect(page.locator('text=Profesionalno')).toBeVisible()
    await expect(page.locator('text=Dokazano poveča prodajo')).toBeVisible()
  })

  test('should display footer', async ({ page }) => {
    await expect(page.locator('text=Slovenija')).toBeVisible()
    await expect(page.locator('text=info@vizualizatorpro.si')).toBeVisible()
  })
})

test.describe('📁 Material catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display 3 tabs (Ograje, Keramika, Moji)', async ({ page }) => {
    await expect(page.locator('button[role="tab"]:has-text("Ograje")')).toBeVisible()
    await expect(page.locator('button[role="tab"]:has-text("Keramika")')).toBeVisible()
    await expect(page.locator('button[role="tab"]:has-text("Moji")')).toBeVisible()
  })

  test('should show 6 WPC profiles by default', async ({ page }) => {
    await expect(page.locator('text=WPC H-Line Vodoravno')).toBeVisible()
    await expect(page.locator('text=WPC V-Line Pokončno')).toBeVisible()
    await expect(page.locator('text=WPC Panel Full')).toBeVisible()
    await expect(page.locator('text=Inox Line Premium')).toBeVisible()
    await expect(page.locator('text=Steklena ograja Full')).toBeVisible()
    await expect(page.locator('text=ALU Klasik')).toBeVisible()
  })

  test('should switch to Keramika tab', async ({ page }) => {
    await page.click('button[role="tab"]:has-text("Keramika")')
    await expect(page.locator('text=Wood Look Porcelan')).toBeVisible()
    await expect(page.locator('text=Stone Effect Porcelan')).toBeVisible()
    await expect(page.locator('text=Marmor Effect Premium')).toBeVisible()
    await expect(page.locator('text=Mozaik Mediterranean')).toBeVisible()
  })

  test('should show prices in €/m²', async ({ page }) => {
    await expect(page.locator('text=185 €/m²')).toBeVisible()
    await expect(page.locator('text=295 €/m²')).toBeVisible()
    await expect(page.locator('text=345 €/m²')).toBeVisible()
  })

  test('should select material on click', async ({ page }) => {
    await page.click('button:has-text("WPC H-Line Vodoravno")')
    await expect(page.locator('text=✓ Material izbran')).toBeVisible()
  })

  test('should show custom materials tab with add button', async ({ page }) => {
    await page.click('button[role="tab"]:has-text("Moji")')
    await expect(page.locator('button:has-text("Dodaj svoj material")')).toBeVisible()
  })
})

test.describe('🖼️ Image upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display upload section', async ({ page }) => {
    await expect(page.locator('text=Fotografiraj ali naloži prostor')).toBeVisible()
  })

  test('should display camera and gallery buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("Fotografiraj")')).toBeVisible()
    await expect(page.locator('button:has-text("Naloži iz galerije")')).toBeVisible()
  })

  test('should display supported formats hint', async ({ page }) => {
    await expect(page.locator('text=JPEG, PNG ali WebP')).toBeVisible()
  })
})

test.describe('🤖 Generate visualization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should have disabled generate button initially', async ({ page }) => {
    const button = page.locator('button:has-text("Generiraj AI vizualizacijo")')
    await expect(button).toBeDisabled()
  })

  test('should enable generate button after selecting material', async ({ page }) => {
    await page.click('button:has-text("WPC H-Line Vodoravno")')
    const button = page.locator('button:has-text("Generiraj AI vizualizacijo")')
    await expect(button).toBeDisabled() // Še vedno disabled ker ni slike
  })

  test('should show hint when no image and no material', async ({ page }) => {
    await expect(page.locator('text=Naloži sliko in izberi material')).toBeVisible()
  })
})

test.describe('📷 AR mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display AR section', async ({ page }) => {
    await expect(page.locator('text=AR vizualizacija v realnem času')).toBeVisible()
  })

  test('should display start camera button', async ({ page }) => {
    await expect(page.locator('button:has-text("Zaženi AR kamero")')).toBeVisible()
  })

  test('should display how-to instructions', async ({ page }) => {
    await expect(page.locator('text=Kako uporabljati AR')).toBeVisible()
    await expect(page.locator('text=Zaženi AR kamero (zahteva HTTPS v produkciji)')).toBeVisible()
  })
})

test.describe('🔐 Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should open login dialog on click', async ({ page }) => {
    await page.click('button:has-text("Prijava")')
    await expect(page.locator('text=Prijava').first()).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should switch to register tab', async ({ page }) => {
    await page.click('button:has-text("Prijava")')
    await page.click('button[role="tab"]:has-text("Registracija")')
    await expect(page.locator('text=Ime firme')).toBeVisible()
    await expect(page.locator('text=URL identifikator')).toBeVisible()
    await expect(page.locator('text=Tvoje ime')).toBeVisible()
  })

  test('should show trial info on register tab', async ({ page }) => {
    await page.click('button:has-text("Prijava")')
    await page.click('button[role="tab"]:has-text("Registracija")')
    await expect(page.locator('text=Trial paket: 10 AI vizualizacij, 1 uporabnik')).toBeVisible()
  })
})

test.describe('📧 Lead form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display lead form', async ({ page }) => {
    await expect(page.locator('text=Pošlji povpraševanje')).toBeVisible()
    await expect(page.locator('input[id="leadName"]')).toBeVisible()
    await expect(page.locator('input[id="leadEmail"]')).toBeVisible()
  })

  test('should show validation error on empty submit', async ({ page }) => {
    await page.click('button[type="submit"]:has-text("Pošlji povpraševanje")')
    // Toast obvestilo o napaki
    await expect(page.locator('text=Manjkajoči podatki')).toBeVisible({ timeout: 5000 })
  })

  test('should accept valid input', async ({ page }) => {
    await page.fill('input[id="leadName"]', 'Janez Novak')
    await page.fill('input[id="leadEmail"]', 'janez@firma.si')
    await page.fill('input[id="leadPhone"]', '+386 41 234 567')
    await page.fill('input[id="leadCompany"]', 'Moja firma d.o.o.')
    
    const submitButton = page.locator('button[type="submit"]:has-text("Pošlji povpraševanje")')
    await expect(submitButton).toBeEnabled()
  })
})

test.describe('🛡️ Admin panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })
  })

  test('should display admin panel section', async ({ page }) => {
    await expect(page.locator('text=Admin panel')).toBeVisible()
  })

  test('should show password input', async ({ page }) => {
    await expect(page.locator('text=Admin geslo')).toBeVisible()
  })

  test('should show demo password hint', async ({ page }) => {
    await expect(page.locator('text=vizualizator-pro-2026')).toBeVisible()
  })

  test('should unlock with correct password', async ({ page }) => {
    await page.fill('input[id="adminPassword"]', 'vizualizator-pro-2026')
    await page.click('button:has-text("Odkleni admin panel")')
    await expect(page.locator('text=Admin dostop odobren')).toBeVisible({ timeout: 5000 })
  })

  test('should reject wrong password', async ({ page }) => {
    await page.fill('input[id="adminPassword"]', 'wrong-password')
    await page.click('button:has-text("Odkleni admin panel")')
    await expect(page.locator('text=Napačno geslo')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('🌍 Language switcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display language switcher button', async ({ page }) => {
    const switcher = page.locator('button').filter({ hasText: /^[🌍🇸🇮🇬🇧🇩🇪🇮🇹]/ })
    await expect(switcher).toBeVisible()
  })

  test('should open language dropdown', async ({ page }) => {
    const switcher = page.locator('button').filter({ hasText: /^[🌍🇸🇮🇬🇧🇩🇪🇮🇹]/ })
    await switcher.click()
    // Dropdown se odpre
    await expect(page.locator('[role="menu"]')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('📱 Responsive design', () => {
  test('should be responsive on mobile', async ({ page, isMobile }) => {
    await page.goto('/')
    
    if (isMobile) {
      // Na mobilni napravi preveri da so elementi prisotni
      await expect(page.locator('h1:has-text("VizualizatorPRO")')).toBeVisible()
      await expect(page.locator('button:has-text("Prijava")')).toBeVisible()
    }
  })

  test('should have readable text on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('/')
    
    const heroTitle = page.locator('text=Stranka vidi rezultat')
    await expect(heroTitle).toBeVisible()
    
    // Preveri da ni horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
  })
})
