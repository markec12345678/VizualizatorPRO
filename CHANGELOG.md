# 📋 Changelog

Vse pomembne spremembe v projektu VizualizatorPRO bodo dokumentirane v tej datoteki.

Format temelji na [Keep a Changelog](https://keepachangelog.com/sl/1.1.0/),
in projekt sledi [Semantic Versioning](https://semver.org/lang/sl/).

## [Unreleased]

### Načrtovano
- Stripe integracija za mesečne naročnine
- WebXR AR z globino
- App Store / Google Play deploy

## [1.3.0] - 2026-06-29

### ✨ Dodano
- **Nadzorna plošča (Dashboard)** za prijavljene uporabnike
  - API endpoint `/api/dashboard` z vsemi statistikami organizacije
  - 4 glavne metrike: projekti, vizualizacije, ekipa, materiali
  - Sub-statistike: novi leadi in vizualizacije v zadnjih 30 dneh
  - Progress bars z opozorili pri 80% in 100% porabi
  - Zadnji projekti (5) z številom vizualizacij
  - Zadnje vizualizacije (5) z statusom
- **Team Management**
  - API endpoint `/api/organization/invite` (POST, DELETE)
  - Admin lahko doda nove uporabnike z vlogami
  - Dodelitev vlog (ADMIN, VODJA, MONTER, SKLADISCE)
  - Začasna gesla (bcrypt hash, 12 rounds)
  - Preverjanje omejitev paketa (max uporabnikov)
  - Odstranjevanje uporabnikov iz ekipe
  - InviteUserDialog z validacijo
- **Mobilna aplikacija (Capacitor)**
  - Konfiguracija v `capacitor.config.ts`
  - Podpora za Android in iOS
  - Native plugins: Camera, Geolocation, LocalNotifications, PushNotifications, StatusBar, SplashScreen
  - Standalone Next.js output
  - Celovita navodila v `MOBILE.md`

### 📚 Dokumentacija
- Nova `MOBILE.md` z navodili za mobilno aplikacijo

## [1.2.0] - 2026-06-26

### ✨ Dodano
- **AR vizualizacija v realnem času**
  - Real-time prikaz ograd skozi kamero mobilnega telefona
  - MediaDevices API (facingMode: environment) za zadnjo kamero
  - Canvas 2D za risanje ograd v realnem času
  - Tap za dodajanje stebričkov z oštevilčenjem
  - Izbira profila med AR načinom (WPC, Inox, ALU, Steklo)
  - Barvno kodirani profili glede na material
  - Vertikalne palice za WPC-V in ALU profile
  - Capture gumb za zajem posnetkov (JPEG)
  - Zgodovina AR posnetkov (zadnjih 6)
  - Prenos posnetkov
  - Fullscreen način
  - Navodila za uporabo
- **Multi-tenant avtentikacija (NextAuth.js v4)**
  - Credentials provider (email + geslo)
  - Bcrypt hashing gesel (12 rounds)
  - JWT session z 30-dnevno veljavnostjo
  - 4 vloge: ADMIN, VODJA, MONTER, SKLADISCE
  - Organizacije (firme) z lastnim paketom (trial/pro/agency)
  - Omejitve: max uporabnikov, max vizualizacij
  - SessionProvider za client-side auth state
  - AuthDialog komponenta z login/register tab-oma
  - UserMenu komponenta (prikaz org/plan/role + odjava)
  - Nov API: `/api/auth/register` (registracija firm)
  - Nov API: `/api/auth/[...nextauth]` (NextAuth handler)
  - Prisma shema posodobljena z Organization, User modeli

### 🔄 Spremenjeno
- Prisma shema razširjena z Organization in User modeli
- Vsi obstoječi modeli (Project, Visualization, Material) povezani z organizacijo
- `.env.example` posodobljen z NEXTAUTH_SECRET in NEXTAUTH_URL

## [1.1.0] - 2026-06-26

### ✨ Dodano
- **PWA z offline delovanjem**
  - Service Worker (`public/sw.js`) z Cache-First za slike, Network-First za API
  - Web Manifest (`public/manifest.json`) za namestitev na domači zaslon
  - Custom app ikone (192x192, 512x512, AI generirane)
  - SW register komponenta (samodejna registracija v produkciji)
  - Custom offline stran z VizualizatorPRO branding
  - Background Sync pripravljen za lead form
  - Push notifications pripravljene za prihodnost
  - Theme color: amber (#f59e0b)
  - Apple Web App podpora
- **PDF izvoz ponudbe z vizualizacijo (jsPDF + autotable)**
  - Profesionalno oblikovana A4 ponudba
  - Vključuje pred/po vizualizacijo
  - Avtomatski izračun cene (površina × cena/m² + DDV 22%)
  - Polja za stranko, projekt, opombe, garancijo
  - Številka ponudbe in datum avtomatsko generirana
  - Antracit + amber barvna shema
- **Custom material upload**
  - Nov API endpoint `/api/materials/custom` (GET, POST)
  - CustomMaterialUpload komponenta z dialogom
  - Upload reference slike z avtomatsko kompresijo (max 800px, JPEG 0.85)
  - Polja: ime, kategorija, opis, cena, AI prompt, dimenzije, barva, garancija
  - Nov "Moji materiali" tab v katalogu
  - `/api/visualize` posodobljen da prepozna custom materiale iz baze
  - Vsi custom materiali shranjeni v Prisma bazi

### 📚 Dokumentacija
- README posodobljen s PWA, PDF in Custom material sekcijami
- Roadmap posodobljen

## [1.0.0] - 2026-06-26

### ✨ Začetna izdaja

#### Glavne funkcionalnosti
- **AI vizualizacija** z Replicate ControlNet (3-stopenjski fallback)
  - Replicate API (najboljša kakovost)
  - Z.ai GLM-5.2 (vgrajen v environment, fallback)
  - Demo mode (za razvoj brez API ključa)
- **Katalog 14 materialov**
  - 6 balkonskih ograd (WPC H-Line, V-Line, Panel, Inox, Steklo, ALU)
  - 8 keramik (Wood, Stone, Marble, Mozaik, Metro, Terracotta, Cement, Large Format)
- **14 AI-generiranih referenčnih slik materialov**
- **Pred/po primerjava** z interaktivnim drsnikom
- **Lead generation sistem**
  - Integriran lead form na glavni strani
  - API endpoint `/api/lead` shranjuje povpraševanja v bazo
  - Povezava z izbranim materialom za personaliziran kontakt
- **Email obvestila (Resend)**
  - 3 funkcije: lead notification, vizualizacija notification, potrditev stranki
  - Brez RESEND_API_KEY se emaili samo log-ajo (demo mode)
- **Admin panel z geslom**
  - Zaščiten z geslom (demo: `vizualizator-pro-2026`)
  - Pregled vseh leadov z kontakti in sporočili
  - Statistike: skupno leadov, vizualizacije, stopnja uspešnosti
  - Direktni mailto/tel povezave

#### Tehnologije
- Next.js 16 (App Router, Turbopack)
- TypeScript 5 (strict)
- Prisma ORM 6 + SQLite
- Tailwind CSS 4 + shadcn/ui
- Replicate API (ControlNet)
- Z.ai GLM-5.2 (fallback)
- Resend (email service)
- Bun (paketni upravitelj)

#### API endpointi
- `/api/visualize` — AI vizualizacija endpoint (3 fallback-i)
- `/api/lead` — lead form endpoint + email
- `/api/materials` — materiali API
- `/api/route.ts` — health check

#### Podatkovni model (Prisma)
- `Project` — projekti/leadi
- `Visualization` — AI vizualizacije
- `Material` — katalog materialov

#### Druge
- MIT licenca
- Profesionalen README s popolno dokumentacijo
- `.env.example` s popisom vseh API ključev
- Antracit + amber barvna shema (premium B2B videz)
- Mobilno-responsive (mobile-first design)
- Slovenščina kot primarni jezik

---

## 📝 Konvencije

### Tipi sprememb
- `✨ Dodano` — nove funkcionalnosti
- `🔄 Spremenjeno` — spremembe obstoječih funkcij
- ` deprecated` — funkcije, ki bodo odstranjene
- `❌ Odstranjeno` — odstranjene funkcije
- `🐛 Popravljeno` — bug fixes
- `🔒 Varnost` — varnostni popravki
- `📚 Dokumentacija` — spremembe dokumentacije

### Linki
[Unreleased]: https://github.com/markec12345678/VizualizatorPRO/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/markec12345678/VizualizatorPRO/releases/tag/v1.3.0
[1.2.0]: https://github.com/markec12345678/VizualizatorPRO/releases/tag/v1.2.0
[1.1.0]: https://github.com/markec12345678/VizualizatorPRO/releases/tag/v1.1.0
[1.0.0]: https://github.com/markec12345678/VizualizatorPRO/releases/tag/v1.0.0
