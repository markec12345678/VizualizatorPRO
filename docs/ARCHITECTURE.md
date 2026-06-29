# 🏗️ Arhitektura VizualizatorPRO

> Detajlna tehnična dokumentacija arhitekture sistema

## 📑 Kazalo

- [Pregled sistema](#-pregled-sistema)
- [Tehnološki sklad](#-tehnološki-sklad)
- [Visokonivojska arhitektura](#-visokonivojska-arhitektura)
- [Frontend arhitektura](#-frontend-arhitektura)
- [Backend arhitektura](#-backend-arhitektura)
- [Baza podatkov](#-baza-podatkov)
- [AI vizualizacija pipeline](#-ai-vizualizacija-pipeline)
- [Avtentikacija in avtorizacija](#-avtentikacija-in-avtorizacija)
- [Multi-tenant model](#-multi-tenant-model)
- [Email sistem](#-email-sistem)
- [PWA in offline delovanje](#-pwa-in-offline-delovanje)
- [AR vizualizacija](#-ar-vizualizacija)
- [Docker in deployment](#-docker-in-deployment)
- [Varnostne切身osti](#-varnostne-концnosti)

---

## 🎯 Pregled sistema

VizualizatorPRO je **multi-tenant SaaS aplikacija** za izvajalce gradbenih storitev (balkonske ograje, keramika). Omogoča AI vizualizacije materialov na fotografijah balkonov/prostorov v realnem času.

### Glavni cilji
1. **Prodajno orodje** - stranka vidi rezultat pred nakupom
2. **Multi-tenant** - vsaka firma ima svoj račun in podatke
3. **Mobile-first** - deluje na telefonu na terenu
4. **Offline-ready** - PWA z Service Worker caching
5. **AR** - real-time vizualizacija skozi kamero

---

## 🛠️ Tehnološki sklad

| Plast | Tehnologija | Razlog |
|-------|-------------|--------|
| **Frontend** | Next.js 16 (App Router) | React 19, Turbopack, RSC |
| **Jezik** | TypeScript 5 (strict) | Type safety, DX |
| **UI** | shadcn/ui + Tailwind 4 | Hitri razvoj, dosleden dizajn |
| **State** | React hooks + TanStack Query | Server state caching |
| **Baza** | Prisma 6 + SQLite | Hitri razvoj, portabilnost |
| **Auth** | NextAuth.js v4 | Industrijski standard |
| **AI** | Replicate + Z.ai GLM-5.2 | Najboljša kakovost + fallback |
| **Email** | Resend | Modern API, dobra deliverability |
| **PDF** | jsPDF + autotable | Client-side generacija |
| **PWA** | Service Worker API | Offline, installable |
| **AR** | MediaDevices + Canvas 2D | Real-time brez WebXR |
| **Mobilno** | Capacitor | Android + iOS iz ene kode |
| **Deploy** | Vercel + Docker | Fleksibilnost |

---

## 🌐 Visokonivojska arhitektura

```
┌─────────────────────────────────────────────────────────────┐
│                    UPORABNIK (monter/admin)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BRSKALNIK / MOBILNA APLIKACIJA            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│  │ Next.js 16   │  │ Service     │  │ MediaDevices    │    │
│  │ (React 19)   │  │ Worker      │  │ (kamera/AR)     │    │
│  │ App Router   │  │ (offline)   │  │                 │    │
│  └─────────────┘  └─────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ visualize│ │ lead     │ │ materials│ │ auth     │      │
│  │          │ │          │ │          │ │          │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐                                 │
│  │ dashboard│ │ invite   │                                 │
│  │          │ │          │                                 │
│  └──────────┘ └──────────┘                                 │
└─────────────────────────────────────────────────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────────┐
│  REPLICATE   │ │   RESEND     │ │ PRISMA   │ │  Z.AI GLM    │
│  ControlNet  │ │  Email API   │ │ SQLite   │ │  (fallback)  │
│              │ │              │ │          │ │              │
│  AI slikovna │ │ Obveščanja   │ │ Podatki  │ │ Image gen    │
│  vizualiz.   │ │              │ │          │ │              │
└──────────────┘ └──────────────┘ └──────────┘ └──────────────┘
```

---

## 🎨 Frontend arhitektura

### Struktura komponent

```
src/components/
├── ui/                    # shadcn/ui primitivi (60+)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── vizualizator/          # Aplikacijske komponente
│   ├── image-uploader.tsx     # Upload + camera + drag-drop
│   ├── material-selector.tsx  # Katalog z 3 tabi
│   ├── result-viewer.tsx      # Pred/po drsnik
│   ├── admin-panel.tsx        # Admin z geslom
│   ├── pdf-export.tsx         # PDF ponudbe (jsPDF)
│   ├── custom-material-upload.tsx  # Custom materiali
│   ├── ar-mode.tsx            # AR kamera vizualizacija
│   ├── auth-dialog.tsx        # Login/register dialog
│   ├── user-menu.tsx          # Header uporabnik
│   ├── dashboard.tsx          # Nadzorna plošča
│   └── sw-register.tsx        # Service Worker registracija
└── providers.tsx          # SessionProvider wrapper
```

### State management

```typescript
// Client state (useState, useReducer)
- imageBase64: string | null
- selectedMaterial: CatalogMaterial | null
- resultImage: string | null
- isProcessing: boolean

// Server state (TanStack Query - pripravljeno)
- useSession() - NextAuth
- fetch('/api/dashboard') - statistike
- fetch('/api/materials/custom') - custom materiali

// Form state (react-hook-form - pripravljeno)
- Lead form
- Auth form
- Custom material form
```

### Routing (App Router)

```
src/app/
├── layout.tsx             # Root layout (Providers, Toaster, SW)
├── page.tsx               # Glavna stran (single-page workflow)
├── globals.css            # Antracit + amber tema
├── api/                   # API routes
│   ├── visualize/route.ts
│   ├── lead/route.ts
│   ├── materials/
│   │   ├── route.ts
│   │   └── custom/route.ts
│   ├── auth/
│   │   ├── [...nextauth]/route.ts
│   │   └── register/route.ts
│   ├── dashboard/route.ts
│   ├── organization/invite/route.ts
│   └── route.ts           # Health check
└── (prihodnje)
    ├── auth/prijava/      # Login stran
    ├── auth/registracija/ # Register stran
    ├── dashboard/         # Poln dashboard
    ├── admin/             # Admin panel
    └── postavke/          # Nastavitve
```

---

## ⚙️ Backend arhitektura

### API route pattern

```typescript
// Standardni vzorec za API routes
export async function POST(request: NextRequest) {
  try {
    // 1. Validacija input
    const body = await request.json()
    if (!body.required) {
      return NextResponse.json({ error: '...' }, { status: 400 })
    }

    // 2. Avtentikacija (kjer potrebno)
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3. Avtorizacija (preveri vlogo)
    if (!isAdmin(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 4. Business logika
    const result = await db.someModel.create({ ... })

    // 5. Side effects (email, etc.)
    await sendNotification(...)

    // 6. Return
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Napaka:', error)
    return NextResponse.json(
      { error: 'Napaka pri obdelavi' },
      { status: 500 }
    )
  }
}
```

### API endpointi

| Endpoint | Metoda | Auth | Opis |
|----------|--------|------|------|
| `/api/visualize` | POST | - | AI vizualizacija |
| `/api/visualize` | GET | - | Statistike |
| `/api/lead` | POST | - | Lead submission |
| `/api/lead` | GET | Admin | Pregled leadov |
| `/api/materials` | GET | - | Statični katalog |
| `/api/materials/custom` | GET/POST | User | Custom materiali |
| `/api/auth/[...nextauth]` | GET/POST | - | NextAuth |
| `/api/auth/register` | POST | - | Registracija firme |
| `/api/dashboard` | GET | User | Statistike org |
| `/api/organization/invite` | POST | Admin | Dodaj uporabnika |
| `/api/organization/invite` | DELETE | Admin | Odstrani uporabnika |

---

## 🗄️ Baza podatkov

### Prisma shema (poenostavljeno)

```prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  plan        String   @default("trial")  // trial, pro, agency
  maxUsers    Int      @default(1)
  maxVisualizations Int @default(10)
  users       User[]
  projects    Project[]
  materials   Material[]
  visualizations Visualization[]
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String?
  role          String   @default("MONTER")  // ADMIN, VODJA, MONTER, SKLADISCE
  organizationId String?
  organization  Organization? @relation(...)
}

model Project {
  id              String   @id @default(cuid())
  title           String
  customerName    String?
  organizationId  String?
  assignedToId    String?
  visualizations  Visualization[]
}

model Visualization {
  id              String   @id @default(cuid())
  projectId       String
  organizationId  String?
  originalImage   String
  resultImage     String?
  status          String   @default("PENDING")
  category        String
  materialId      String
  materialName    String
  processingTime  Int?
}

model Material {
  id              String   @id @default(cuid())
  category        String
  name            String
  description     String?
  pricePerSqm     Float?
  referenceImage  String?
  promptHint      String?
  organizationId  String?
  active          Boolean  @default(true)
}
```

### Migracije

```bash
# Razvoj
bun run db:push         # Sinhroniziraj shemo (development)
bun run db:migrate      # Ustvari migracijo (production)

# Produkcija (PostgreSQL)
DATABASE_URL=postgresql://... bun run db:migrate deploy
```

---

## 🤖 AI vizualizacija pipeline

```
[1. UPORABNIK naloži sliko]
        │
        ▼
[2. Kompresija slike na clientu]
    - Max 1280px širina
    - JPEG quality 0.85
    - Canvas API
        │
        ▼
[3. POST /api/visualize]
    - Body: { originalImage, materialId }
        │
        ▼
[4. VALIDACIJA]
    - Preveri velikost (max 8MB)
    - Preveri material (statični katalog ali DB)
    - Preveri kategorijo
        │
        ▼
[5. SHRANI v bazo kot PROCESSING]
        │
        ▼
┌───────────────────────────────────────┐
│ 6. AI GENERIRANJE (3 fallback-i)     │
└───────────────────────────────────────┘
        │
        ├─► [A] REPLICATE ControlNet (če je API_TOKEN)
        │     - Stable Diffusion + ControlNet
        │     - Najboljša kakovost
        │     - ~30s, $0.015/slika
        │
        ├─► [B] Z.AI GLM-5.2 (fallback)
        │     - Image generation SDK
        │     - Brezplačno (vgrajeno)
        │     - ~10s
        │
        └─► [C] DEMO MODE (zadnji fallback)
              - Vrne originalno sliko
              - Za razvoj brez API
        │
        ▼
[7. POSODABI v bazo kot COMPLETED]
        │
        ▼
[8. ASINHRONO pošlji email obvestilo]
        │
        ▼
[9. VRNI rezultat uporabniku]
    - { success, resultImage, processingTime, mode }
```

---

## 🔐 Avtentikacija in avtorizacija

### NextAuth.js v4 konfiguracija

```typescript
// src/lib/auth/auth-options.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // email + password
      // bcrypt compare
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    jwt: ({ token, user }) => {
      // Dodaj role, organizationId, plan
    },
    session: ({ session, token }) => {
      // Razširi session.user z role, org info
    },
  },
}
```

### Vloge uporabnikov

| Vloga | Dovoljenja |
|-------|------------|
| `ADMIN` | Vse + manage users + delete |
| `VODJA` | Manage projects + assign to monterji |
| `MONTER` | Lastni projekti + vizualizacije |
| `SKLADISCE` | Upravljanje zaloge |

### Helper funkcije

```typescript
// src/lib/auth/session.ts
- getAuthSession()      // Server-side session
- getCurrentUser()      // Trenutni uporabnik
- getCurrentOrganization() // Org trenutnega uporabnika
- hasRole(role, allowed)   // Preveri vlogo
- isManager(role)          // ADMIN ali VODJA
- isAdmin(role)            // Samo ADMIN
```

---

## 🏢 Multi-tenant model

### Izolacija podatkov

```typescript
// Vsi query-ji filtrirajo po organizationId
const projects = await db.project.findMany({
  where: {
    organizationId: user.organizationId,  // KLUČNO!
  },
})

// Custom materiali so per-org
const materials = await db.material.findMany({
  where: {
    organizationId: user.organizationId,
    active: true,
  },
})
```

### Paketi (plans)

| Paket | Cena | Uporabniki | Vizualizacije/mes |
|-------|------|------------|-------------------|
| Trial | Brezplačno | 1 | 10 |
| Pro | 49€/mes | 3 | 200 |
| Agency | 199€/mes | 10 | 1000 |

### Preverjanje omejitev

```typescript
// Pred dodajanjem uporabnika
if (org._count.users >= org.maxUsers) {
  throw new Error('Dosežen maksimalen število uporabnikov')
}
```

---

## 📧 Email sistem

### Resend integracija

```typescript
// src/lib/email.ts
- sendLeadNotification(data)      // Admin obvestilo o novem leadu
- sendVisualizationNotification() // Admin obvestilo o vizualizaciji
- sendLeadConfirmation()          // Potrditev stranki
```

### Fallback mode

Če `RESEND_API_KEY` ni nastavljen:
- Emaili se samo log-ajo v konzolo
- Lead-i se še vedno shranjujejo v bazo
- Admin panel še vedno deluje

---

## 📱 PWA in offline delovanje

### Service Worker strategije

```javascript
// public/sw.js
- Cache-First: statične datoteke, slike materialov
- Network-First: API zahteve
- Stale-while-revalidate: Next.js chunks
```

### Manifest

```json
// public/manifest.json
{
  "name": "VizualizatorPRO",
  "short_name": "Vizualizator",
  "display": "standalone",
  "theme_color": "#f59e0b",
  "icons": [192x192, 512x512, SVG]
}
```

---

## 📷 AR vizualizacija

### Implementacija

```typescript
// src/components/vizualizator/ar-mode.tsx
1. MediaDevices.getUserMedia({ facingMode: 'environment' })
2. Canvas 2D overlay preko videa
3. requestAnimationFrame render loop
4. Tap za dodajanje točk (stebričkov)
5. drawRailing() - riše ograjo med točkami
6. drawPoint() - riše oštevilčene stebričke
7. Capture: video frame + canvas overlay → JPEG
```

### Barvno kodiranje profilov

```typescript
- WPC: '#8b5a2b' (teak wood)
- Inox: '#a8a8a8' (srebrna)
- Steklo: 'rgba(200,220,230,0.5)' (prosojna)
- ALU: '#3a3a3a' (antracit)
```

---

## 🐳 Docker in deployment

### Multi-stage build

```dockerfile
# 1. deps: namesti odvisnosti
# 2. builder: build Next.js (standalone)
# 3. runner: minimalna production slika
#    - non-root user (nextjs)
#    - healthcheck
#    - persistent volumes za db in uploads
```

### Docker Compose setup

```yaml
services:
  app:           # Next.js aplikacija
  caddy:         # Reverse proxy z HTTPS
    volumes:
      - ./Caddyfile
    ports: 80, 443

volumes:
  db_data:       # SQLite persistent
  uploads_data:  # Custom material slike
```

---

## 🔒 Varnostne切身osti

### Implementirano

- ✅ **Bcrypt** hashing gesel (12 rounds)
- ✅ **JWT** session z 30-dnevno veljavnostjo
- ✅ **HTTPS** obvezen (Caddy z Let's Encrypt)
- ✅ **Security headers** (CSP, HSTS, X-Frame-Options)
- ✅ **Input validacija** na vseh API-jih
- ✅ **SQL injection zaščita** (Prisma parameterized queries)
- ✅ **Multi-tenant izolacija** (organizationId filter)
- ✅ **Rate limiting** pripravljeno (Upstash Redis)
- ✅ **CORS** restriktiven
- ✅ **.env** v .gitignore

### Za produkcijo

- 🔲 **PostgreSQL** namesto SQLite
- 🔲 **Redis** za rate limiting in cache
- 🔲 **S3/R2** za shranjevanje slik
- 🔲 **Sentry** za error tracking
- 🔲 **PostHog** za analytics
- 🔲 **Cloudflare** za DDoS zaščito

---

## 📊 Performance

### Optimizacije

- **Next.js standalone** output za minimalno Docker sliko
- **Image optimization** z `sharp`
- **Code splitting** z Next.js App Router
- **Lazy loading** slik materialov
- **Service Worker** caching za offline
- **Compression** (gzip, Brotli preko Caddy)
- **CDN** pripravljen (Vercel Edge ali Cloudflare)

### Metrike (pripravljeno za merjenje)

- **LCP** (Largest Contentful Paint) - < 2.5s
- **FID** (First Input Delay) - < 100ms
- **CLS** (Cumulative Layout Shift) - < 0.1
- **TTFB** (Time to First Byte) - < 600ms

---

## 🔮 Prihodnje izboljšave

- [ ] PostgreSQL support
- [ ] WebSocket za real-time kolaboracijo
- [ ] S3/R2 za shranjevanje slik
- [ ] Stripe integracija
- [ ] WebXR za pravo AR z globino
- [ ] React Native mobilna aplikacija
- [ ] i18n (angleščina, nemščina, italijanščina)
- [ ] GraphQL API (poleg REST)
- [ ] Elasticsearch za iskanje
- [ ] Redis za caching

---

## 📚 Nadaljnje branje

- [README.md](../README.md) - Glavna dokumentacija
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Prispevanje
- [SECURITY.md](../SECURITY.md) - Varnost
- [CHANGELOG.md](../CHANGELOG.md) - Spremembe
- [MOBILE.md](../MOBILE.md) - Mobilna aplikacija

---

© 2026 VizualizatorPRO. MIT License.
