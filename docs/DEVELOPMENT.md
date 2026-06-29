# 🛠️ Development

> Navodila za setup lokalnega razvojnega okolja

## 📑 Kazalo

- [Zahteve](#zahteve)
- [Hitri začetek](#hitri-zacetek)
- [Namestitev](#namestitev)
- [Razvojni strežnik](#razvojni-streznik)
- [Struktura projekta](#struktura-projekta)
- [Skripte](#skripte)
- [Coding standardi](#coding-standardi)
- [Git workflow](#git-workflow)
- [Debugging](#debugging)
- [Database development](#database-development)
- [Testiranje](#testiranje)
- [Tipi za VS Code](#tipi-za-vs-code)

---

## 📋 Zahteve

| Orodje | Verzija | Namen |
|--------|---------|-------|
| [Node.js](https://nodejs.org/) | 20+ | JavaScript runtime |
| [Bun](https://bun.sh/) | 1.1+ | Paketni upravitelj, runtime |
| [Git](https://git-scm.com/) | 2.30+ | Version control |
| [VS Code](https://code.visualstudio.com/) | najnovejši | Priporočeni IDE |

### Opcijsko (za napredne funkcije)

| Orodje | Namen |
|--------|-------|
| [Docker](https://www.docker.com/) | Testiranje Docker build-a |
| [Replicate account](https://replicate.com) | AI vizualizacije |
| [Resend account](https://resend.com) | Email obvestila |
| [Postman](https://www.postman.com/) | API testiranje |

---

## 🚀 Hitri začetek

```bash
# 1. Fork in kloniraj
git clone https://github.com/TVOJ_USERNAME/VizualizatorPRO.git
cd VizualizatorPRO

# 2. Dodaj upstream
git remote add upstream https://github.com/markec12345678/VizualizatorPRO.git

# 3. Namesti odvisnosti
bun install

# 4. Pripravi okolje
cp .env.example .env
# Uredi .env (opcijsko za demo mode)

# 5. Inicializiraj bazo
bun run db:push

# 6. Zaženi razvojni strežnik
bun run dev
```

Aplikacija bo dostopna na http://localhost:3000

---

## 📦 Namestitev

### Bun (priporočeno)

```bash
# Namesti Bun
curl -fsSL https://bun.sh/install | bash

# Namesti odvisnosti
bun install

# Zaženi
bun run dev
```

### npm (alternativa)

```bash
# Namesti odvisnosti
npm install

# Zaženi
npm run dev
```

### Yarn (alternativa)

```bash
# Namesti odvisnosti
yarn install

# Zaženi
yarn dev
```

---

## 💻 Razvojni strežnik

```bash
# Zaženi (default port 3000)
bun run dev

# Drugi port
PORT=3001 bun run dev

# Določi host (za testiranje na mobilni napravi)
bun run dev -H 0.0.0.0
```

### Hot reload

Next.js 16 z Turbopack ima avtomatski hot reload. Spremembe v kodi se samodejno prikažejo v brskalniku.

### Testiranje na mobilni napravi

```bash
# 1. Zaženi z -H 0.0.0.0
bun run dev -H 0.0.0.0

# 2. Na mobilni napravi odpri:
# http://IP_TVOJEGA_RAČUNALNIKA:3000
# (mora biti na istem WiFi-ju)
```

---

## 📁 Struktura projekta

```
VizualizatorPRO/
├── .github/                    # GitHub konfiguracija
│   ├── ISSUE_TEMPLATE/         # Predloge za issue-je
│   ├── workflows/              # CI/CD pipeline-i
│   ├── CODEOWNERS              # Avtomatski reviewerji
│   ├── dependabot.yml          # Avto-update odvisnosti
│   └── labels.yml              # Standardizirane labele
├── docs/                       # Dodatna dokumentacija
│   ├── API.md                  # API dokumentacija
│   ├── ARCHITECTURE.md         # Tehnična arhitektura
│   ├── DATABASE.md             # Shema baze
│   ├── DEPLOYMENT.md           # Navodila za deploy
│   ├── DEVELOPMENT.md          # Ta datoteka
│   └── TESTING.md              # Navodila za testiranje
├── prisma/                     # Prisma ORM
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
│   ├── icon-192.png            # PWA icon
│   ├── icon-512.png            # PWA icon
│   ├── icon.svg                # Favicon
│   ├── logo.svg                # Logo
│   ├── manifest.json           # PWA manifest
│   ├── materials/              # 14 referenčnih slik materialov
│   ├── sw.js                   # Service Worker
│   └── uploads/                # Custom material slike
├── scripts/                    # Utility skripte
│   └── generate-material-images.sh
├── src/                        # Source code
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # NextAuth + register
│   │   │   ├── dashboard/      # Statistike
│   │   │   ├── lead/           # Lead form
│   │   │   ├── materials/      # Materiali + custom
│   │   │   ├── organization/   # Team management
│   │   │   ├── visualize/      # AI vizualizacija
│   │   │   └── route.ts        # Health check
│   │   ├── globals.css         # Global styles + tema
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Glavna stran
│   ├── components/             # React komponente
│   │   ├── ui/                 # shadcn/ui primitivi
│   │   ├── vizualizator/       # Aplikacijske komponente
│   │   └── providers.tsx       # SessionProvider
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-image-upload.ts # Upload + kompresija
│   │   ├── use-mobile.ts       # Mobile detection
│   │   └── use-toast.ts        # Toast notifications
│   └── lib/                    # Utilities
│       ├── auth/               # NextAuth config + helpers
│       ├── catalog.ts          # Katalog 14 materialov
│       ├── db.ts               # Prisma client
│       ├── email.ts            # Resend email service
│       └── utils.ts            # Razne utility funkcije
├── .dockerignore
├── .editorconfig               # Editor config
├── .env.example                # Primer environment
├── .gitignore
├── Caddyfile                   # HTTPS reverse proxy
├── CHANGELOG.md                # Zgodovina verzij
├── CODE_OF_CONDUCT.md          # Kodeks obnašanja
├── CONTRIBUTING.md             # Smernice za prispevanje
├── Dockerfile                  # Multi-stage Docker build
├── LICENSE                     # MIT licenca
├── MOBILE.md                   # Mobilna aplikacija navodila
├── README.md                   # Glavna dokumentacija
├── SECURITY.md                 # Politika varnosti
├── bun.lock                    # Lockfile
├── capacitor.config.ts         # Mobilna aplikacija config
├── components.json             # shadcn/ui config
├── docker-compose.yml          # Docker Compose
├── eslint.config.mjs           # ESLint config
├── next.config.ts              # Next.js config
├── package.json                # Odvisnosti in skripte
├── postcss.config.mjs          # PostCSS config
├── tailwind.config.ts          # Tailwind config
└── tsconfig.json               # TypeScript config
```

---

## 📜 Skripte

Definirane v `package.json`:

| Skripta | Ukaz | Opis |
|---------|------|------|
| `dev` | `next dev` | Razvojni strežnik (port 3000) |
| `build` | `next build` | Produkcijski build |
| `start` | `next start` | Zaženi produkcijski build |
| `lint` | `eslint .` | Preveri kodo z ESLint |
| `db:push` | `prisma db push` | Sinhroniziraj shemo z bazo |
| `db:generate` | `prisma generate` | Generiraj Prisma client |
| `db:migrate` | `prisma migrate dev` | Ustvari migracijo |
| `db:reset` | `prisma migrate reset` | Ponastavi bazo |

### Uporaba

```bash
bun run dev          # Razvoj
bun run lint         # Preveri kodo
bun run build        # Build za produkcijo
bun run db:push      # Po spremembi sheme
```

---

## 🎨 Coding standardi

### TypeScript

- **Strict mode** je omogočen
- Uporabljaj `interface` za objekte, `type` za unije
- Eksplicitni return type-ji za funkcije
- Brez `any` tipov

```typescript
// ✅ DOBRO
interface User {
  id: string
  email: string
  role: 'ADMIN' | 'VODJA' | 'MONTER' | 'SKLADISCE'
}

function getUser(id: string): Promise<User | null> { ... }

// ❌ SLABO
function getUser(id: any): any { ... }
```

### React komponente

- Functional components samo
- `'use client'` direktiva za client komponente
- Props z eksplicitnimi interface-i

```tsx
'use client'

import { useState } from 'react'

interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'default' | 'outline' | 'destructive'
}

export function Button({ label, onClick, variant = 'default' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}
```

### API Routes

- Vedno validiraj input
- Try/catch za error handling
- Ustrezne HTTP status kode

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.required) {
      return NextResponse.json(
        { error: 'Manjkajoči podatki' },
        { status: 400 }
      )
    }
    
    // Logika...
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Napaka:', error)
    return NextResponse.json(
      { error: 'Napaka pri obdelavi' },
      { status: 500 }
    )
  }
}
```

### Prisma

- `cuid()` za ID-je
- `createdAt` in `updatedAt` timestamps
- Relacije namesto denormalizacije

### Tailwind CSS

- Mobile-first pristop (`sm:`, `md:`, `lg:`)
- shadcn/ui komponente kjer je mogoče
- Brez inline style-ov (razen dinamične vrednosti)

---

## 🌿 Git workflow

### Branch naming

```
feature/ime-funkcije      # Nova funkcionalnost
fix/opis-popravka         # Bug fix
docs/tema-dokumentacije   # Dokumentacija
refactor/kaj-refaktoriramo # Refaktoriranje
chore/vzdrževalna-naloga  # Vzdrževanje
```

### Conventional commits

```
<type>[scope]: <description>

[optional body]

[optional footer]
```

Tipi:
- `feat` — nova funkcionalnost
- `fix` — popravki napak
- `docs` — spremembe dokumentacije
- `style` — formatiranje
- `refactor` — refaktoriranje
- `test` — testi
- `chore` — vzdrževalna dela

### Primer workflow-a

```bash
# 1. Sync z upstream
git checkout main
git pull upstream main

# 2. Ustvari feature branch
git checkout -b feature/nova-funkcija

# 3. Delaj in commitaj
git add -A
git commit -m "feat: dodaj novo funkcijo"

# 4. Push na svoj fork
git push origin feature/nova-funkcija

# 5. Odpri Pull Request na GitHubu
```

Podrobnejša navodila: [CONTRIBUTING.md](../CONTRIBUTING.md)

---

## 🐛 Debugging

### VS Code debugger

Ustvari `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "serverReadyAction": {
        "pattern": "- Local:.+(https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Browser DevTools

- **React DevTools** - za komponente
- **Next.js DevTools** - za App Router
- **Network tab** - za API klice

### Console.log debugging

```typescript
// Server-side (pojavi se v terminalu)
console.log('Server:', data)

// Client-side (pojavi se v brskalniku)
console.log('Client:', data)

// Next.js logger (priporočeno)
import { log } from 'next-axiom'
log.info('Sporočilo')
```

### Prisma Studio

```bash
# Zaženi Prisma Studio (GUI za bazo)
bunx prisma studio
```

Dostopno na http://localhost:5555

---

## 🗄️ Database development

### Sprememba sheme

```bash
# 1. Uredi prisma/schema.prisma

# 2. Sinhroniziraj z bazo (development)
bun run db:push

# 3. Generiraj nov Prisma client
bun run db:generate
```

### Migracije (production)

```bash
# Ustvari migracijo
bun run db:migrate --name add_new_table

# Apply migracije v produkciji
bun run db:migrate deploy
```

### Reset baze

```bash
# Pozor: izbriše vse podatke!
bun run db:reset
```

### Seed data (prihodnje)

```bash
# Poženi seed skripto
bunx tsx prisma/seed.ts
```

---

## 🧪 Testiranje

Glej [TESTING.md](./TESTING.md) za podrobna navodila.

```bash
# Lint
bun run lint

# Type check
bunx tsc --noEmit

# Build (preveri da build uspe)
bun run build
```

---

## 💡 Tipi za VS Code

### Priporočeni extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",           // ESLint
    "esbenp.prettier-vscode",           // Prettier
    "bradlc.vscode-tailwindcss",        // Tailwind IntelliSense
    "prisma.prisma",                    // Prisma
    "ms-vscode.vscode-typescript-next", // TypeScript
    "unifiedjs.vscode-mdx",             // MDX
    "mikestead.dotenv",                 // .env syntax
    "github.vscode-pull-request-github" // GitHub PRs
  ]
}
```

### Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixImage.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    "cva\\(([^)]*)\\)",
    "[\"'`]([^\"'`]*).*?[\"'`]"
  ],
  "files.associations": {
    "*.prisma": "prisma"
  }
}
```

### Snippets

Ustvari `.vscode/next-component.code-snippets`:

```json
{
  "Next.js Client Component": {
    "scope": "typescriptreact",
    "prefix": "ncc",
    "body": [
      "'use client'",
      "",
      "import { useState } from 'react'",
      "",
      "export function ${1:ComponentName}() {",
      "  return (",
      "    <div>$0</div>",
      "  )",
      "}"
    ]
  },
  "Next.js API Route": {
    "scope": "typescript",
    "prefix": "nar",
    "body": [
      "import { NextRequest, NextResponse } from 'next/server'",
      "",
      "export async function POST(request: NextRequest) {",
      "  try {",
      "    const body = await request.json()",
      "    return NextResponse.json({ success: true })",
      "  } catch (error) {",
      "    return NextResponse.json({ error: 'Napaka' }, { status: 500 })",
      "  }",
      "}"
    ]
  }
}
```

---

## 🔧 Environment setup

### .env lokalno

```env
# Baza
DATABASE_URL=file:/home/z/my-project/db/custom.db

# NextAuth
NEXTAUTH_SECRET=dev-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000

# AI (opcijsko - brez tega deluje demo mode)
REPLICATE_API_TOKEN=

# Email (opcijsko - brez tega se samo log-a)
RESEND_API_KEY=
FROM_EMAIL=onboarding@resend.dev
NOTIFICATION_EMAIL=admin@localhost
```

### Demo mode

Če `REPLICATE_API_TOKEN` in `RESEND_API_KEY` nista nastavljena:
- AI vizualizacija: vrne originalno sliko (demo mode)
- Email: se samo log-a v konzolo (ne pošilja se)
- Lead-i: se shranjujejo v bazo

---

## 🚀 Pred PR-jem

```bash
# 1. Sync z main
git checkout main
git pull upstream main
git checkout tvoja-veja
git rebase main

# 2. Preveri kodo
bun run lint

# 3. Preveri da build uspe
bun run build

# 4. Preveri v brskalniku
bun run dev
# Testiraj vse funkcionalnosti

# 5. Commit in push
git add -A
git commit -m "feat: opis spremembe"
git push origin tvoja-veja

# 6. Odpri Pull Request
```

---

© 2026 VizualizatorPRO. MIT License.
