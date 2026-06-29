# 🎨 VizualizatorPRO

**Profesionalno AI orodje za prodajo balkonskih ograd in keramike**

> Stranka vidi rezultat. Kupi takoj.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![AI: GLM-5.2](https://img.shields.io/badge/AI-GLM--5.2-orange)](https://z.ai)

Aplikacija za izvajalce gradbenih storitev, ki na kraju samem stranki pokaže fotorealističen prikaz končnega rezultata — z novo ograjo ali keramiko. Preprosto: fotografiraš balkon, izbereš material, AI generira vizualizacijo v 30 sekundah, stranka vidi "svoj balkon" z novo ograjo — in podpiše pogodbo.

---

## 🎯 Poslovni problem

Izvajalci balkonskih ograd in keramike izgubljajo posle ker stranke **ne morejo vizualizirati končnega rezultata**. Klasični pristop:

1. Stranka vidi katalog PDF → ne more predstavljati si končnega rezultata
2. Monter nariše skico na papirju → neprofesionalno
3. Stranka okleva → najde cenejšo ponudbo
4. Izvajalec izgubi posel

**Rešitev:** VizualizatorPRO generira fotorealističen prikaz z izbranim materialom apliciranim na strankin balkon — v 30 sekundah, na kraju samem, z mobilnim telefonom.

**Rezultat:** +30-50% stopnja konverzije (po poročanju industrij: Rilla, Remodel AI, Houzz).

---

## ✨ Ključne funkcionalnosti

### 📸 AI vizualizacija
- **Camera capture** — posnemi balkon z mobilnim telefonom na terenu
- **Upload iz galerije** — naloži obstoječo fotografijo
- **Samodejna kompresija** — max 1280px, JPEG quality 0.85
- **AI generiranje** — fotorealističen rezultat v 30 sekundah
- **Pred/po primerjava** — interaktivni drsnik za primerjavo originala in rezultata

### 🎨 Katalog materialov (14 izdelkov)

#### Balkonske ograje (6)
| Material | Cena | Garancija |
|----------|------|-----------|
| WPC H-Line Vodoravno | 185 €/m² | 25 let |
| WPC V-Line Pokončno | 195 €/m² | 25 let |
| WPC Panel Full | 215 €/m² | 25 let |
| Inox Line Premium | 295 €/m² | 15 let |
| Steklena ograja Full | 345 €/m² | 10 let |
| ALU Klasik | 145 €/m² | 10 let |

#### Keramika (8)
| Material | Cena | Tip |
|----------|------|-----|
| Wood Look Porcelan | 38 €/m² | Porcelanat |
| Stone Effect Porcelan | 42 €/m² | Porcelanat |
| Marmor Effect Premium | 65 €/m² | Poliran porcelanat |
| Mozaik Mediterranean | 75 €/m² | Mozaik |
| Metro Subway Premium | 45 €/m² | Glazirana keramika |
| Terra Cotta Rustical | 55 €/m² | Terakota |
| Cement Tiles Modern | 68 €/m² | Cementne ploščice |
| Large Format Slim | 92 €/m² | Slim porcelanat |

### 📧 Lead generation sistem
- Integriran lead form na glavni strani
- Avtomatsko email obvestilo adminu o novem leadu
- Avtomatska potrditev stranki
- Vsi leadi shranjeni v bazo za sledenje

### 🔐 Admin panel
- Zaščiten z geslom (demo: `vizualizator-pro-2026`)
- Pregled vseh leadov z kontakti in sporočili
- Statistike: skupno leadov, vizualizacije, stopnja uspešnosti
- Direktni mailto/tel povezave za hitro kontaktiranje

### 📄 PDF ponudba z vizualizacijo
- Profesionalno oblikovana A4 ponudba (jsPDF + autotable)
- Vključuje pred/po vizualizacijo
- Avtomatski izračun cene (površina × cena/m² + DDV 22%)
- Polja za stranko, projekt, opombe, garancijo
- Številka ponudbe in datum avtomatsko generirana
- Antracit + amber barvna shema ( profesionalen B2B videz)

### 📱 PWA z offline delovanjem
- Service Worker za caching statičnih resursov
- Web Manifest za namestitev na domači zaslon
- Custom app ikone (192x192, 512x512, AI generirane)
- Cache-First strategija za slike materialov
- Network-First strategija za API zahteve
- Background Sync za lead form (ko je povezava nazaj)
- Push notifications (pripravljeno za prihodnost)
- Custom offline stran z VizualizatorPRO branding

### 🎨 Custom material upload
- Firme dodajajo svoje materiale v katalog
- Upload reference slike (z avtomatsko kompresijo)
- AI prompt hint za generiranje vizualizacij
- Specifikacije: cena, dimenzije, barva, garancija
- Nov "Moji materiali" tab v katalogu
- Vsi custom materiali shranjeni v bazi (Prisma)

### 📷 AR vizualizacija v realnem času
- Real-time prikaz ograd skozi kamero mobilnega telefona
- MediaDevices API za zadnjo kamero (facingMode: environment)
- Canvas 2D za risanje ograd v realnem času
- Tap za dodajanje stebričkov z oštevilčenjem
- Izbira profila med AR načinom (WPC, Inox, ALU, Steklo)
- Barvno kodirani profili glede na material
- Vertikalne palice za WPC-V in ALU profile
- Capture gumb za zajem posnetkov
- Zgodovina AR posnetkov (zadnjih 6)
- Prenos posnetkov kot JPEG
- Fullscreen način za boljšo izkušnjo
- Navodila za uporabo v aplikaciji

### 🔐 Multi-tenant avtentikacija
- NextAuth.js v4 z Credentials provider
- Registracija novih firm (organizacij) z admin uporabnikom
- 4 vloge uporabnikov: ADMIN, VODJA, MONTER, SKLADISCE
- Bcrypt hashing gesel (12 rounds)
- JWT session z 30-dnevno veljavnostjo
- Vsaka organizacija ima svoje paket (trial/pro/agency)
- Omejitve: max uporabnikov, max vizualizacij
- SessionProvider za client-side auth state
- AuthDialog komponenta z login/register tab-oma

### 📊 Nadzorna plošča (Dashboard)
- Pregled statistik za prijavljene uporabnike
- 4 glavne metrike: projekti, vizualizacije, ekipa, materiali
- Sub-statistike: novi leadi in vizualizacije v zadnjih 30 dneh
- Uporabniški progress bars z opozorili pri 80% in 100% porabi
- Zadnji projekti (5) z številom vizualizacij
- Zadnje vizualizacije (5) z statusom (completed/failed)
- API endpoint `/api/dashboard` z vsemi podatki organizacije

### 👥 Team Management
- Admin lahko doda nove uporabnike v organizacijo
- Dodelitev vlog (ADMIN, VODJA, MONTER, SKLADISCE)
- Začasna gesla (bcrypt hash, 12 rounds)
- Preverjanje omejitev paketa (max uporabnikov)
- Odstranjevanje uporabnikov iz ekipe
- API endpoint `/api/organization/invite` (POST, DELETE)
- Dialog z validacijo in prijaznimi napakami
- Prikaz ekipe z vlogami in ikonami (Crown za admin)

### 📱 Mobilna aplikacija (Capacitor)
- Konfiguracija v `capacitor.config.ts`
- Podpora za Android in iOS
- Native plugins: Camera, Geolocation, LocalNotifications, PushNotifications, StatusBar, SplashScreen
- Standalone Next.js output (pripravljen za Capacitor)
- App ID: `si.vizualizatorpro.app`
- Antracit tema z amber akcentom
- Celovita navodila v `MOBILE.md`

---

## 🛠️ Tehnološki sklad

| Plast | Tehnologija |
|-------|-------------|
| **Ogrodje** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Jezik** | [TypeScript 5](https://www.typescriptlang.org/) (strict) |
| **Stil** | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Baza** | [Prisma ORM 6](https://www.prisma.io/) + SQLite |
| **AI vizualizacija** | [Replicate](https://replicate.com/) ControlNet (primarni), [Z.ai GLM-5.2](https://z.ai) (fallback) |
| **Email** | [Resend](https://resend.com/) |
| **PDF** | [jsPDF](https://github.com/parallax/jsPDF) + jspdf-autotable |
| **PWA** | Service Worker + Web Manifest |
| **Avtentikacija** | [NextAuth.js v4](https://next-auth.js.org/) + bcryptjs |
| **AR** | MediaDevices API + Canvas 2D |
| **Paketni upravitelj** | [Bun](https://bun.sh/) |
| **Linting** | ESLint 9 + eslint-config-next |

---

## 🚀 Namestitev

### Zahteve
- [Node.js](https://nodejs.org/) 20+ ali [Bun](https://bun.sh/) 1.1+
- Git

### Koraki

```bash
# 1. Kloniraj repo
git clone https://github.com/markec12345678/VizualizatorPRO.git
cd VizualizatorPRO

# 2. Namesti odvisnosti
bun install

# 3. Pripravi okoljske spremenljivke
cp .env.example .env
# Uredi .env in dodaj svoje API ključe

# 4. Inicializiraj bazo
bun run db:push

# 5. Zaženi razvojni server
bun run dev
# → http://localhost:3000
```

### Skripte

| Skripta | Opis |
|---------|------|
| `bun run dev` | Zažene Next.js dev server (port 3000) |
| `bun run build` | Produkcijska build |
| `bun run start` | Zažene produkcijski server |
| `bun run lint` | ESLint preverjanje |
| `bun run db:push` | Sinhronizira Prisma shemo z bazo |
| `bun run db:generate` | Generira Prisma Client |

---

## 🔑 Okoljske spremenljivke

Glej [`.env.example`](./.env.example) za popoln seznam. Glavne:

```env
# Baza
DATABASE_URL=file:./db/custom.db

# AI vizualizacija (opcijsko - brez njih deluje demo mode)
REPLICATE_API_TOKEN=your_replicate_token_here

# Email (opcijsko - brez tega se emaili samo log-ajo)
RESEND_API_KEY=your_resend_key_here
FROM_EMAIL=info@vizualizatorpro.si
NOTIFICATION_EMAIL=admin@vizualizatorpro.si
```

### Kako pridobiti API ključe

#### Replicate (za fotorealistične vizualizacije)
1. Registriraj se na [replicate.com](https://replicate.com)
2. Dodaj sredstva ($5 je dovolj za ~300 vizualizacij)
3. Profile → API Tokens → Create token
4. Kopiraj v `.env` kot `REPLICATE_API_TOKEN`

#### Resend (za email obvestila)
1. Registriraj se na [resend.com](https://resend.com)
2. Brezplačni plan: 3000 emailov/mesec
3. API Keys → Create API Key
4. Kopiraj v `.env` kot `RESEND_API_KEY`

---

## 🏛️ Arhitektura

```
vizualizatorpro/
├── prisma/
│   └── schema.prisma              # 3 modeli: Project, Visualization, Material
├── public/
│   ├── materials/                 # 14 referenčnih slik materialov (AI generirane)
│   ├── logo.svg
│   └── robots.txt
├── scripts/
│   └── generate-material-images.sh # Skripta za generiranje referenčnih slik
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Metadata, slovenski jezik, tema
│   │   ├── page.tsx               # Glavna stran (workflow + admin panel)
│   │   ├── globals.css            # Antracit + amber tema
│   │   └── api/
│   │       ├── visualize/route.ts # AI vizualizacija endpoint (Replicate + fallback)
│   │       ├── lead/route.ts      # Lead form endpoint + email
│   │       ├── materials/route.ts # Materiali API
│   │       └── route.ts           # Health check
│   ├── components/
│   │   ├── ui/                    # shadcn/ui primitivi
│   │   └── vizualizator/
│   │       ├── image-uploader.tsx  # Upload/camera z drag-drop
│   │       ├── material-selector.tsx # Katalog z 14 materiali
│   │       ├── result-viewer.tsx   # Pred/po drsnik
│   │       └── admin-panel.tsx     # Admin panel z statistikami
│   ├── hooks/
│   │   ├── use-image-upload.ts    # Hook za upload/kompresijo
│   │   ├── use-toast.ts
│   │   └── use-mobile.ts
│   └── lib/
│       ├── catalog.ts             # Katalog 14 materialov s prompt hinti
│       ├── email.ts               # Resend email service
│       ├── db.ts                  # Prisma Client
│       └── utils.ts
├── .env.example
├── LICENSE
└── README.md
```

---

## 🔄 AI vizualizacija — kako deluje

```
[Uporabnik naloži sliko]
        ↓
[POST /api/visualize]
        ↓
┌───────────────────────────────────────┐
│ 1. POSKUSI REPLICATE ControlNET       │  ← najboljša kakovost
│    (če je REPLICATE_API_TOKEN)       │
└───────────────────────────────────────┘
        ↓ (fallback če Replicate ne deluje)
┌───────────────────────────────────────┐
│ 2. POSKUSI Z.AI GLM-5.2               │  ← vgrajen v environment
│    (image generation SDK)            │
└───────────────────────────────────────┘
        ↓ (fallback če Z.AI ne deluje)
┌───────────────────────────────────────┐
│ 3. DEMO MODE                          │  ← vrne original
│    (samo log, za razvoj brez API)    │
└───────────────────────────────────────┘
        ↓
[Shrani v bazo + pošlji email obvestilo]
        ↓
[Vrni rezultat uporabniku]
```

**Stroški AI generiranja:**
- Replicate ControlNet: ~$0.015 na vizualizacijo
- Z.ai GLM-5.2: brezplačno (vgrajen v environment)
- Demo mode: brezplačno

---

## 📱 Uporaba

### Glavni delovni tok

1. **Odpri aplikacijo** na mobilnem telefonu ali računalniku
2. **Fotografiraj** balkon/prostor z gumbom "Fotografiraj" (mobilni) ali naloži sliko
3. **Izberi material** iz kataloga (WPC, Inox, Steklo, keramika...)
4. **Klikni "Generiraj AI vizualizacijo"**
5. **Počakaj 30 sekund** — AI obdela sliko
6. **Prikaži stranki** pred/po primerjavo z drsnikom
7. **Prenesi** sliko za ponudbo ali pošlji email

### Admin dostop

1. Pomakni se na dno glavne strani
2. Klikni "Admin panel"
3. Vnesi geslo: `vizualizator-pro-2026` (demo)
4. Pregleduj leade, statistike, kontaktne podatke

---

## 🚢 Deploy

### Vercel (priporočeno)

```bash
# 1. Push na GitHub
git push origin main

# 2. Na Vercel: New Project → Import iz GitHub
# 3. Dodaj okoljske spremenljivke v Vercel dashboard
# 4. Deploy
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/markec12345678/VizualizatorPRO)

### Samostojno

```bash
bun run build
bun run start
```

---

## 📊 Tržni potencial

### Ciljne skupine (Slovenija)

1. **Izvajalci balkonskih ograd** — ~150 firm v Sloveniji
2. **Trgovci s keramiko** — ~100 salonov (Miza, Porcelanosa, Marles...)
3. **Izvajalci fasad** — ~100 firm
4. **Notranji opremljevalci** — ~200 firm

### Monetizacija (predlog)

| Paket | Cena | Vsebine |
|-------|------|---------|
| **Trial** | Brezplačno (14 dni) | 10 vizualizacij, 1 uporabnik |
| **Pro** | 49 €/mes | 200 vizualizacij/mes, 3 uporabniki, lasten logotip |
| **Agency** | 199 €/mes | 1000 vizualizacij/mes, 10 uporabnikov, white-label |

---

## 🆚 Konkurenca

| Funkcija | Remodel AI | IKEA Kreativ | Wayfair Decorify | **VizualizatorPRO** |
|----------|:----------:|:------------:|:----------------:|:-------------------:|
| Slovenščina | ❌ | ❌ | ❌ | ✅ |
| WPC/Inox ograje | ❌ | ❌ | ❌ | ✅ |
| Keramika | delno | ❌ | ❌ | ✅ |
| Lastni materialni katalog | ❌ | samo IKEA | samo Wayfair | ✅ |
| B2B fokus | ❌ (B2C) | ❌ (B2C) | ❌ (B2C) | ✅ |
| Lead generation | ❌ | ❌ | ❌ | ✅ |
| Mobilno (PWA-ready) | delno | ❌ | ❌ | ✅ |
| Lokalne cene (€/m²) | ❌ | ❌ | ❌ | ✅ |
| Admin panel | ❌ | ❌ | ❌ | ✅ |

---

## 🔒 Varnost

- **Input validacija** — vse API zahteve validirajo input (velikost slike, email format, kategorije)
- **SQL injection zaščita** — Prisma ORM z parameteriziranimi query-ji
- **HTTPS obvezno** — za Camera, Geolocation in Service Worker API
- **Admin geslo** — v produkciji prestavi v `ADMIN_PASSWORD` env variable

---

## 🗺️ Roadmap

- [x] MVP z 14 materiali
- [x] AI vizualizacija (Replicate + fallback)
- [x] Lead generation + email obvestila
- [x] Admin panel z statistikami
- [x] Pred/po drsnik
- [x] Prave referenčne slike (AI generirane)
- [x] **PWA z offline delovanjem** (Service Worker + manifest)
- [x] **PDF izvoz ponudbe** z vizualizacijo (jsPDF)
- [x] **Custom material upload** (firme dodajajo svoje materiale)
- [x] **AR mode** (real-time vizualizacija skozi kamero z MediaDevices)
- [x] **Multi-tenant** arhitektura (NextAuth + 4 vloge + organizacije)
- [x] **Dashboard** za prijavljene uporabnike (statistike, poraba)
- [x] **Team Management** (admin doda/odstrani uporabnike)
- [x] **Mobilna aplikacija** (Capacitor konfiguracija + navodila)
- [ ] **Stripe integracija** za mesečne naročnine
- [ ] **WebXR AR** za bolj napredno vizualizacijo z globino
- [ ] **App Store / Google Play** deploy (po Capacitor build-u)

---

## 🤝 Prispevanje

Prispevki so dobrodošli! Prosimo:

1. Fork repozitorija
2. Ustvari feature branch (`git checkout -b feature/amazing-feature`)
3. Commit spremembe (`git commit -m 'Add amazing feature'`)
4. Push na branch (`git push origin feature/amazing-feature`)
5. Odpri Pull Request

---

## 📄 Licenca

[MIT License](./LICENSE) — prosto uporabljaj, spreminjaj in distribuira.

---

## 📞 Kontakt

- **GitHub:** [@markec12345678](https://github.com/markec12345678)
- **Email:** info@vizualizatorpro.si
- **Telefon:** +386 1 234 56 78

---

## 🙏 Zahvale

- [Next.js](https://nextjs.org/) — ogrodje
- [Prisma](https://www.prisma.io/) — ORM
- [shadcn/ui](https://ui.shadcn.com/) — UI komponente
- [Tailwind CSS](https://tailwindcss.com/) — stil
- [Replicate](https://replicate.com/) — AI modeli
- [Z.ai GLM-5.2](https://z.ai) — fallback AI
- [Resend](https://resend.com/) — email service
- [Lucide](https://lucide.dev/) — ikone

---

**Razvito s ❤️ za slovenske izvajalce gradbenih storitev.**

> *"Stranka vidi rezultat. Kupi takoj."*
