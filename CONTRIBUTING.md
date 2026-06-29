# 🤝 Prispevanje k VizualizatorPRO

Hvala za zanimanje za prispevanje k VizualizatorPRO! 🎉 Ta dokument pojasnjuje postopek.

## 📋 Vsebina

- [Kodeks obnašanja](#kodeks-obnašanja)
- [Preden začneš](#preden-začneš)
- [Postopek razvoja](#postopek-razvoja)
- [Smernice za kodo](#smernice-za-kodo)
- [Testiranje](#testiranje)
- [Commit messages](#commit-messages)
- [Pull requests](#pull-requests)
- [Reporting bugs](#reporting-bugs)

---

## 📜 Kodeks obnašanja

Sodelovanje v tem projektu pomeni strinjanje z [Kodeksom obnašanja](CODE_OF_CONDUCT.md). Prosimo, da se držiš profesionalnega in spoštljivega tona.

## 🚀 Preden začneš

### Zahteve

- [Node.js](https://nodejs.org/) 20+ ali [Bun](https://bun.sh/) 1.1+
- [Git](https://git-scm.com/)
- GitHub račun

### Setup lokalnega okolja

```bash
# 1. Fork repo-ja na GitHubu
# 2. Kloniraj svoj fork
git clone https://github.com/TVOJ_USERNAME/VizualizatorPRO.git
cd VizualizatorPRO

# 3. Dodaj upstream remote
git remote add upstream https://github.com/markec12345678/VizualizatorPRO.git

# 4. Namesti odvisnosti
bun install

# 5. Pripravi .env
cp .env.example .env
# Izpolni API ključe (opcijsko za demo mode)

# 6. Inicializiraj bazo
bun run db:push

# 7. Zaženi dev server
bun run dev
```

## 🔄 Postopek razvoja

### 1. Ustvari branch

```bash
# Preden začneš delati, se sinhroniziraj z upstream
git checkout main
git pull upstream main

# Ustvari nov feature branch
git checkout -b feature/ime-funkcije
# ali
git checkout -b fix/opis-popravka
```

**Konvencija imen branch-ev:**
- `feature/` — nova funkcionalnost
- `fix/` — popravki napak
- `docs/` — spremembe dokumentacije
- `refactor/` — refaktoriranje
- `chore/` — vzdrževalna dela

### 2. Razvij

```bash
# Delaj spremembe...
bun run dev  # testiraj v brskalniku
bun run lint # preveri kodo
```

### 3. Commit

```bash
git add -A
git commit -m "feat: kratek opis spremembe"
```

### 4. Push in PR

```bash
git push origin feature/ime-funkcije
# Odpri Pull Request na GitHubu
```

## 🎨 Smernice za kodo

### TypeScript

- **Strict mode** je omogočen — brez `any` tipov
- Vsi funkciji morajo imeti eksplicitne return type
- Uporabljaj `interface` za objekte, `type` za unije

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

- **Functional components** samo (ne class components)
- `'use client'` direktiva na vrhu client komponent
- Props z eksplicitnimi TypeScript interface-i

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

### API Routes (Next.js)

- Vedno validiraj input (Zod ali ročno)
- Vrni ustrezne HTTP status kode
- Uporabljaj `try/catch` za error handling

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validacija
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email je obvezen' },
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

- Vedno uporabljaj `cuid()` za ID
- Dodaj `createdAt` in `updatedAt` timestamps
- Uporabljaj relacije namesto denormalizacije

### Tailwind CSS

- Uporabljaj shadcn/ui komponente kjer je mogoče
- Mobile-first pristop (`sm:`, `md:`, `lg:`)
- Brez inline style-ov (razen za dinamične vrednosti)

## 🧪 Testiranje

### Ročno testiranje

Pred PR-jem preveri:

- [ ] Aplikacija se naloži brez napak v konzoli
- [ ] Vse glavne funkcionalnosti delujejo
- [ ] Mobilni prikaz je pravilen
- [ ] Temni način (če implementiran)

### Lint

```bash
bun run lint
# Mora biti 0 napak
```

### Build

```bash
bun run build
# Mora uspeti brez napak
```

## 📝 Commit messages

Uporabljaj [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

### Tipi

- `feat` — nova funkcionalnost
- `fix` — popravki napak
- `docs` — spremembe dokumentacije
- `style` — formatiranje, brez sprememb kode
- `refactor` — refaktoriranje
- `test` — dodajanje testov
- `chore` — vzdrževalna dela

### Primeri

```
feat: dodaj AR vizualizacijo z MediaDevices API

- Real-time prikaz ograd skozi kamero
- Tap za dodajanje stebričkov
- Capture gumb za zajem posnetkov

Closes #123
```

```
fix: popravi velikost slike v PDF ponudbi

Slike so bile raztegnjene v PDF-ju zaradi napačnega aspect ratio.
```

## 🔄 Pull Requests

### Pred odprtjem PR-ja

1. **Sinhroniziraj** z upstream (`git pull upstream main`)
2. **Testiraj** vse spremembe
3. **Lint** brez napak
4. **Build** uspešen
5. **Posodobi dokumentacijo** če je potrebno

### PR template

Uporabi [PR template](.github/pull_request_template.md) za opis sprememb.

### Review proces

1. Code review s strani maintainerjev
2. Morebitne spremembe po review-u
3. Approval in merge

## 🐛 Reporting bugs

Pred odprtjem bug reporta:

1. Preveri [obstoječe issue-je](https://github.com/markec12345678/VizualizatorPRO/issues)
2. Reproduciraj na najnovejši verziji
3. Pripravi:
   - Korake za reproduciranje
   - Pričakovano vs dejansko obnašanje
   - Screenshot
   - Okolje (OS, brskalnik, naprava)

Uporabi [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md).

## 🌍 Prevodi

Aplikacija je trenutno v slovenščini. Če želiš dodati prevod:

1. Ustvari issue z labelo `i18n`
2. Počakaj na odobritev
3. Implementiraj z `next-intl` (že nameščen)

## 📦 Release proces

Maintainerji sledijo [Semantic Versioning](https://semver.org/):

- `MAJOR` — breaking changes
- `MINOR` — nova funkcionalnost (backwards compatible)
- `PATCH` — bug fixes (backwards compatible)

Releases so objavljeni na [Releases strani](https://github.com/markec12345678/VizualizatorPRO/releases).

## 📞 Kontakt

- **Issues**: [GitHub Issues](https://github.com/markec12345678/VizualizatorPRO/issues)
- **Discussions**: [GitHub Discussions](https://github.com/markec12345678/VizualizatorPRO/discussions)
- **Email**: info@vizualizatorpro.si

---

Hvala za tvoje prispevke! 🙏
