# 🧪 Testing

> Navodila za testiranje VizualizatorPRO

## 📑 Kazalo

- [Pregled](#pregled)
- [Ročno testiranje](#rocno-testiranje)
- [Lint in type check](#lint-in-type-check)
- [Build test](#build-test)
- [API testiranje](#api-testiranje)
- [E2E testiranje (prihodnje)](#e2e-testiranje-prihodnje)
- [Unit testi (prihodnje)](#unit-testi-prihodnje)
- [Testiranje v brskalniku](#testiranje-v-brskalniku)
- [Testiranje na mobilni napravi](#testiranje-na-mobilni-napravi)
- [Performance testiranje](#performance-testiranje)
- [Security testiranje](#security-testiranje)

---

## 📊 Pregled

| Tip testiranja | Status | Orodje |
|----------------|--------|--------|
| ESLint | ✅ Aktiven | eslint |
| Type check | ✅ Aktiven | tsc |
| Build | ✅ Aktiven | next build |
| Ročno testiranje | ✅ Aktivno | Brskalnik + Agent Browser |
| API testiranje | ✅ Aktivno | curl, Postman |
| Unit testi | 🔲 Prihodnje | Vitest |
| Integration testi | 🔲 Prihodnje | Vitest + Prisma |
| E2E testi | 🔲 Prihodnje | Playwright |
| Performance | 🔲 Prihodnje | Lighthouse |
| Security scan | ✅ CI/CD | CodeQL |

---

## 🖐️ Ročno testiranje

### Pred vsakim PR-jem

```bash
# 1. Lint
bun run lint

# 2. Build
bun run build

# 3. Zaženi in testiraj
bun run dev
```

### Testiranje glavnih funkcionalnosti

#### 1. AI vizualizacija

```bash
# Zaženi aplikacijo
bun run dev
```

**Testni koraki:**
1. Odpri http://localhost:3000
2. Klikni "Fotografiraj" ali "Naloži iz galerije"
3. Izberi sliko (JPEG, PNG ali WebP)
4. Izberi material iz kataloga (WPC, Inox, Steklo, Keramika)
5. Klikni "Generiraj AI vizualizacijo"
6. Preveri:
   - ✅ Loading state se prikaže
   - ✅ Po ~30s se prikaže rezultat
   - ✅ Pred/po drsnik deluje
   - ✅ Badge "LIVE AI" ali "DEMO način" se prikaže
   - ✅ Prenos slike deluje

#### 2. AR vizualizacija

**Testni koraki:**
1. Pomakni se na AR sekcijo
2. Klikni "Zaženi AR kamero"
3. Dovoli dostop do kamere
4. Preveri:
   - ✅ Kamera se zažene
   - ✅ Tap za dodajanje stebričkov deluje
   - ✅ Ograja se izriše v realnem času
   - ✅ Izbira profila deluje
   - ✅ Capture gumb shrani posnetek
   - ✅ Razveljavi/Počisti delujeta

#### 3. Avtentikacija

**Registracija:**
1. Klikni "Prijava" v headerju
2. Preklopi na "Registracija" tab
3. Izpolni: ime firme, slug, ime, email, geslo
4. Klikni "Ustvari račun"
5. Preveri:
   - ✅ Toast "Registracija uspešna"
   - ✅ Samodejna prijava
   - ✅ UserMenu prikaže podatke

**Prijava:**
1. Odjava
2. Ponovna prijava z email + geslo
3. Preveri:
   - ✅ Toast "Uspešna prijava"
   - ✅ UserMenu prikaže podatke

#### 4. Dashboard

1. Prijavi se
2. Pomakni se na "Nadzorna plošča"
3. Preveri:
   - ✅ Statistike se prikažejo
   - ✅ Progress bars se napolnijo
   - ✅ Zadnji projekti se prikažejo
   - ✅ Ekipa se prikaže

#### 5. Team Management

1. Prijavi se kot admin
2. Na dashboardu klikni "Dodaj uporabnika"
3. Izpolni: email, ime, geslo, vloga
4. Preveri:
   - ✅ Nov uporabnik se prikaže v ekipi
   - ✅ Email obvestilo je poslano (če je Resend konfiguriran)

#### 6. Custom material upload

1. Pojdi v katalog materialov
2. Preklopi na "Moji" tab
3. Klikni "Dodaj svoj material"
4. Izpolni obrazec z referenčno sliko
5. Preveri:
   - ✅ Material se shrani v bazo
   - ✅ Prikazan je v "Moji" tab-u
   - ✅ Lahko ga izbereš za vizualizacijo

#### 7. PDF ponudba

1. Naloži sliko, izberi material, generiraj vizualizacijo
2. Pomakni se na "PDF ponudba"
3. Izpolni podatke stranke
4. Klikni "Prenesi PDF ponudbo"
5. Preveri:
   - ✅ PDF se prenese
   - ✅ Vsebuje PRED/PO vizualizacijo
   - ✅ Cena je pravilno izračunana
   - ✅ DDV 22% je dodan

#### 8. Lead form

1. Pomakni se na "Pošlji povpraševanje"
2. Izpolni: ime, email, telefon, firma, sporočilo
3. Klikni "Pošlji povpraševanje"
4. Preveri:
   - ✅ Toast "Hvala za povpraševanje"
   - ✅ Admin email je poslan (če je Resend)
   - ✅ Stranka dobi potrditveni email
   - ✅ Lead se shrani v bazo
   - ✅ V admin panelu je viden

#### 9. Admin panel

1. Pomakni se na dno strani
2. Vnesi geslo: `vizualizator-pro-2026`
3. Preveri:
   - ✅ Statistike se prikažejo
   - ✅ Leadi so vidni
   - ✅ Mailto in tel povezave delujejo

#### 10. PWA

1. Odpri Chrome DevTools → Application → Manifest
2. Preveri:
   - ✅ Manifest se naloži
   - ✅ Ikone so prisotne
   - ✅ Theme color je amber

**Test offline (samo v produkciji):**
1. Odpri v produkciji (HTTPS zahtevan)
2. Naloži stran
3. Izključi internet
4. Osveži - stran bi morala delovati iz cache-a

---

## 🔍 Lint in type check

### ESLint

```bash
# Preveri kodo
bun run lint

# Auto-fix
bun run lint --fix
```

**Pravila:**
- 0 napak (errors) obvezno
- Warning-i so dovoljeni (npr. `@next/next/no-img-element`)

### TypeScript

```bash
# Type check brez build-a
bunx tsc --noEmit

# Z build-om (bolj celovito)
bun run build
```

---

## 🏗️ Build test

```bash
# Produkcijski build
bun run build

# Preveri da ni napak
echo $?
# 0 = uspeh, 1 = napaka
```

### Build z minimalnim env-om

```bash
# Brez API ključev (demo mode)
DATABASE_URL="file:./db/test.db" \
NEXTAUTH_SECRET="test-secret" \
NEXTAUTH_URL="http://localhost:3000" \
bun run build
```

---

## 🌐 API testiranje

### curl

```bash
# Health check
curl http://localhost:3000/api

# AI vizualizacija (potrebna slika)
curl -X POST http://localhost:3000/api/visualize \
  -H "Content-Type: application/json" \
  -d '{"originalImage":"data:image/jpeg;base64,/9j/...","materialId":"wpc-h-line"}'

# Lead submission
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.si"}'

# Materiali
curl http://localhost:3000/api/materials

# Custom materiali
curl http://localhost:3000/api/materials/custom

# Statistike vizualizacij
curl http://localhost:3000/api/visualize
```

### Postman

Prenesi Postman collection (prihodnje):
```
docs/postman/VizualizatorPRO.postman_collection.json
```

### Testiranje avtentikacije

```bash
# Registracija
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "Test Firma",
    "slug": "test-firma",
    "email": "admin@test.si",
    "password": "geslo123",
    "name": "Admin"
  }'

# Prijava (pridobi cookie)
curl -c cookies.txt -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@test.si&password=geslo123&csrfToken=..."

# Dashboard (z cookie-jem)
curl -b cookies.txt http://localhost:3000/api/dashboard
```

---

## 🎭 E2E testiranje (prihodnje)

### Načrtovan setup z Playwright

```bash
# Namesti Playwright
bunx playwright install

# Zaženi test-e
bunx playwright test
```

### Primer testa (prihodnje)

```typescript
// e2e/visualize.spec.ts
import { test, expect } from '@playwright/test'

test('AI vizualizacija workflow', async ({ page }) => {
  await page.goto('/')
  
  // Naloži sliko
  await page.setInputFiles('input[type=file]', 'test-files/balcony.jpg')
  
  // Izberi material
  await page.click('button:has-text("WPC H-Line Vodoravno")')
  
  // Generiraj
  await page.click('button:has-text("Generiraj AI vizualizacijo")')
  
  // Počakaj na rezultat
  await expect(page.locator('text=Vizualizacija pripravljena')).toBeVisible({ timeout: 60000 })
  
  // Preveri pred/po drsnik
  await expect(page.locator('text=PRED')).toBeVisible()
  await expect(page.locator('text=PO')).toBeVisible()
})
```

---

## 🧪 Unit testi (prihodnje)

### Načrtovan setup z Vitest

```bash
# Namesti Vitest
bun add -d vitest @testing-library/react @testing-library/jest-dom
```

### Primer testa (prihodnje)

```typescript
// src/lib/catalog.test.ts
import { describe, it, expect } from 'vitest'
import { ALL_MATERIALS, getMaterialById, getMaterialsByCategory } from './catalog'

describe('catalog', () => {
  it('should have 14 materials', () => {
    expect(ALL_MATERIALS).toHaveLength(14)
  })

  it('should have 6 WPC profiles', () => {
    expect(getMaterialsByCategory('WPC_OGRAJA')).toHaveLength(6)
  })

  it('should have 8 ceramic tiles', () => {
    expect(getMaterialsByCategory('KERAMIKA')).toHaveLength(8)
  })

  it('should find material by id', () => {
    const material = getMaterialById('wpc-h-line')
    expect(material).toBeDefined()
    expect(material?.name).toBe('WPC H-Line Vodoravno')
  })
})
```

---

## 🌍 Testiranje v brskalniku

### Podprti brskalniki

| Brskalnik | Min verzija | Testirano |
|-----------|-------------|-----------|
| Chrome | 120+ | ✅ |
| Firefox | 120+ | ✅ |
| Safari | 17+ | ✅ |
| Edge | 120+ | ✅ |
| iOS Safari | 17+ | ✅ |
| Chrome Android | 120+ | ✅ |

### Chrome DevTools

1. **Console tab** - preveri napake
2. **Network tab** - preveri API klice
3. **Application tab** - preveri Service Worker, Manifest, LocalStorage
4. **Lighthouse** - performance, accessibility, SEO, PWA
5. **Device toolbar** - test različnih naprav

### Testiranje responsive

V Chrome DevTools:
1. F12 → Toggle device toolbar (Ctrl+Shift+M)
2. Test naprav:
   - iPhone SE (375×667)
   - iPhone 14 (390×844)
   - iPad (768×1024)
   - iPad Pro (1024×1366)
   - Desktop (1920×1080)

---

## 📱 Testiranje na mobilni napravi

### Lokalno (isti WiFi)

```bash
# Zaženi z 0.0.0.0
bun run dev -H 0.0.0.0

# Na mobilni napravi odpri:
# http://IP_TVOJEGA_RAČUNALNIKA:3000
```

### Ngrok (za HTTPS na mobilni)

```bash
# Namesti ngrok
npm install -g ngrok

# Zaženi tunnel
ngrok http 3000

# Dobi HTTPS URL, ki ga odpriš na mobilni napravi
```

### Testiranje AR kamere

AR zahteva HTTPS (razen localhost):

```bash
# Zaženi z HTTPS (za self-signed cert)
bun run dev --experimental-https

# Ali uporabi ngrok
ngrok http 3000
```

**Testni koraki:**
1. Odpri HTTPS URL na mobilni napravi
2. Pojdi v AR sekcijo
3. Zaženi kamero (zahteva dovoljenje)
4. Preveri:
   - ✅ Kamera se zažene (zadnja kamera)
   - ✅ Tap za dodajanje točk deluje
   - ✅ Ograja se izriše v realnem času

### Testiranje PWA

1. Odpri aplikacijo na mobilni napravi (HTTPS)
2. Chrome menu → "Add to Home screen"
3. Odpri iz domačega zaslona
4. Preveri:
   - ✅ Ikona je prisotna
   - ✅ Aplikacija se odpre v fullscreen načinu
   - ✅ Brez naslovne vrstice brskalnika

---

## ⚡ Performance testiranje

### Lighthouse

```bash
# Chrome DevTools → Lighthouse → Generate report
# Ali preko CLI
bunx lighthouse http://localhost:3000 --view
```

**Ciljne metrike:**
- **Performance**: > 90
- **Accessibility**: > 90
- **Best Practices**: > 90
- **SEO**: > 90
- **PWA**: > 90

### Core Web Vitals

| Metrika | Cilj | Kako izmeriti |
|---------|------|----------------|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse, Chrome DevTools |
| FID (First Input Delay) | < 100ms | Lighthouse |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| TTFB (Time to First Byte) | < 600ms | Network tab |
| FCP (First Contentful Paint) | < 1.8s | Lighthouse |

### Bundle analiza

```bash
# Namesti bundle analyzer
bun add -d @next/bundle-analyzer

# Analiziraj
ANALYZE=true bun run build
```

---

## 🔒 Security testiranje

### CodeQL (CI/CD)

CodeQL se samodejno izvaja v CI/CD pipeline-u (`/.github/workflows/ci-cd.yml`).

### Ročno preverjanje

```bash
# 1. Preveri .gitignore - .env NE sme biti commitan
git ls-files | grep -E "\.env$"
# Rezultat: prazno (pravilno!)

# 2. Preveri dependencies za znane ranljivosti
bun audit

# 3. Preveri ESLint security pravila
bun run lint
```

### Testiranje avtentikacije

```bash
# 1. Test brez session
curl http://localhost:3000/api/dashboard
# Pričakovan rezultat: 401 Unauthorized

# 2. Test z napačno vlogo
# (prijavi se kot MONTER, poskusi dostop do admin endpointa)
curl -b cookies.txt http://localhost:3000/api/organization/invite -X POST
# Pričakovan rezultat: 403 Forbidden
```

### OWASP Top 10 checklist

- [ ] **A01: Broken Access Control** - multi-tenant izolacija deluje
- [ ] **A02: Cryptographic Failures** - bcrypt gesla, HTTPS obvezen
- [ ] **A03: Injection** - Prisma parameterized queries
- [ ] **A04: Insecure Design** - input validacija na vseh API-jih
- [ ] **A05: Security Misconfiguration** - security headers v Caddy
- [ ] **A06: Vulnerable Components** - Dependabot avto-update
- [ ] **A07: Auth Failures** - rate limiting (pripravljeno)
- [ ] **A08: Data Integrity Failures** - JWT validacija
- [ ] **A09: Logging Failures** - error logging
- [ ] **A10: SSRF** - Replicate API kliče samo dovoljene domene

---

## 🔄 CI/CD test pipeline

CI/CD pipeline (`/.github/workflows/ci-cd.yml`) samodejno izvaja:

1. **Lint** - ESLint preveri kodo
2. **Build** - Next.js build mora uspeti
3. **Security scan** - CodeQL analiza
4. **Docker build** - slika se zgradi in push-a na GHCR
5. **Vercel deploy** - avtomatski deploy na Vercel (če je konfiguriran)

### Status badges

Vsak workflow ima badge v [README.md](../README.md):

```markdown
[![CI/CD](https://github.com/markec12345678/VizualizatorPRO/actions/workflows/ci-cd.yml/badge.svg)](...)
[![Stale](https://github.com/markec12345678/VizualizatorPRO/actions/workflows/stale.yml/badge.svg)](...)
[![Label Sync](https://github.com/markec12345678/VizualizatorPRO/actions/workflows/labels.yml/badge.svg)](...)
```

---

## 📊 Test coverage (prihodnje)

Ko bodo dodani unit testi:

```bash
# Namesti c8 za coverage
bun add -d c8

# Zaženi test-e z coverage
c8 bunx vitest run

# Poročilo bo v coverage/index.html
```

**Cilj:**
- Statements: > 70%
- Branches: > 70%
- Functions: > 70%
- Lines: > 70%

---

## 🐛 Reporting bugs

Če odkriješ napako:

1. Preveri [obstoječe issue-je](https://github.com/markec12345678/VizualizatorPRO/issues)
2. Odpri nov issue z [Bug Report predlogo](https://github.com/markec12345678/VizualizatorPRO/issues/new?template=bug_report.md)
3. Vključi:
   - Korake za reproduciranje
   - Pričakovano vs dejansko obnašanje
   - Screenshot
   - Okolje (OS, brskalnik, naprava)

---

© 2026 VizualizatorPRO. MIT License.
