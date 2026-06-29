# 🗄️ Database

> Shema baze podatkov in migracije za VizualizatorPRO

## 📑 Kazalo

- [Pregled](#pregled)
- [Shema](#shema)
- [Modeli](#modeli)
- [Relacije](#relacije)
- [Indeksi](#indeksi)
- [Migracije](#migracije)
- [Prisma Studio](#prisma-studio)
- [Seed data](#seed-data)
- [Backup in restore](#backup-in-restore)
- [Produkcijska baza](#produkcijska-baza)

---

## 📊 Pregled

VizualizatorPRO uporablja **Prisma ORM** z **SQLite** za razvoj in **PostgreSQL** za produkcijo.

| Okolje | Baza | Razlog |
|--------|------|--------|
| Razvoj | SQLite | Hitri setup, brez konfiguracije |
| Produkcija (majhna) | SQLite | Enostavno, file-based |
| Produkcija (večja) | PostgreSQL | Skalabilnost, konkurenca |

---

## 🏗️ Shema

Celotna shema je v [`prisma/schema.prisma`](../prisma/schema.prisma).

### ER Diagram (poenostavljen)

```
┌──────────────────┐       ┌──────────────────┐
│  Organization    │       │      User        │
│──────────────────│       │──────────────────│
│ id          PK   │◄──┐   │ id          PK   │
│ name             │   │   │ email       UQ   │
│ slug        UQ   │   │   │ passwordHash     │
│ plan             │   ├───│ organizationId FK│
│ maxUsers         │   │   │ role             │
│ maxVisualizations│   │   └──────────────────┘
└──────────────────┘   │
        │              │
        │              │
        ├──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│    Project       │ │  Visualization   │ │     Material     │
│──────────────────│ │──────────────────│ │──────────────────│
│ id          PK   │ │ id          PK   │ │ id          PK   │
│ title            │ │ projectId   FK   │ │ category         │
│ customerName     │ │ organizationId FK│ │ name             │
│ customerEmail    │ │ originalImage    │ │ description      │
│ customerPhone    │ │ resultImage      │ │ pricePerSqm      │
│ address          │ │ status           │ │ referenceImage   │
│ notes            │ │ category         │ │ promptHint       │
│ status           │ │ materialId       │ │ specifications   │
│ organizationId FK│ │ materialName     │ │ organizationId FK│
│ assignedToId  FK │ │ prompt           │ │ active           │
│ createdAt        │ │ processingTime   │ │ createdAt        │
│ updatedAt        │ │ createdAt        │ │ updatedAt        │
└──────────────────┘ │ updatedAt        │ └──────────────────┘
        │            └──────────────────┘
        │                    │
        └────────────────────┘
              1:N
```

---

## 📋 Modeli

### Organization

```prisma
model Organization {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  plan              String   @default("trial")  // trial, pro, agency
  maxUsers          Int      @default(1)
  maxVisualizations Int      @default(10)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  users            User[]
  projects         Project[]
  materials        Material[]
  visualizations   Visualization[]
}
```

| Polje | Tip | Opis |
|-------|-----|------|
| `id` | String (cuid) | Primary key |
| `name` | String | Ime firme |
| `slug` | String (unique) | URL identifikator |
| `plan` | String | Paket: `trial`, `pro`, `agency` |
| `maxUsers` | Int | Max uporabnikov glede na paket |
| `maxVisualizations` | Int | Max vizualizacij na mesec |

### User

```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  passwordHash    String?
  role            String   @default("MONTER")
  organizationId  String?
  organization    Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  projects        Project[]
}
```

| Polje | Tip | Opis |
|-------|-----|------|
| `id` | String (cuid) | Primary key |
| `email` | String (unique) | Email uporabnika |
| `name` | String? | Ime (opcijsko) |
| `passwordHash` | String? | Bcrypt hash gesla |
| `role` | String | `ADMIN`, `VODJA`, `MONTER`, `SKLADISCE` |
| `organizationId` | String? | FK na organizacijo |

### Project

```prisma
model Project {
  id              String   @id @default(cuid())
  title           String
  customerName    String?
  customerEmail   String?
  customerPhone   String?
  address         String?
  notes           String?
  status          String   @default("NACRTOVANO")
  organizationId  String?
  organization    Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  assignedToId    String?
  assignedTo      User?     @relation(fields: [assignedToId], references: [id], onDelete: SetNull)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  visualizations  Visualization[]
}
```

| Polje | Tip | Opis |
|-------|-----|------|
| `title` | String | Naslov projekta |
| `customerName` | String? | Ime stranke |
| `customerEmail` | String? | Email stranke |
| `customerPhone` | String? | Telefon stranke |
| `status` | String | `NACRTOVANO`, `V_TEKU`, `ZAKLJUCENO`, `USTAVLJENO` |
| `assignedToId` | String? | FK na uporabnika (monterja) |

### Visualization

```prisma
model Visualization {
  id              String   @id @default(cuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  organizationId  String?
  organization    Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  originalImage   String
  resultImage     String?
  status          String   @default("PENDING")
  errorMessage    String?
  category        String
  materialId      String
  materialName    String
  prompt          String?
  processingTime  Int?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

| Polje | Tip | Opis |
|-------|-----|------|
| `originalImage` | String | Base64 originalne slike (skrajšan za demo) |
| `resultImage` | String? | Base64 rezultata |
| `status` | String | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `category` | String | `WPC_OGRAJA`, `KERAMIKA`, `BARVA`, `FAZADA` |
| `processingTime` | Int? | Čas obdelave v sekundah |

### Material

```prisma
model Material {
  id              String   @id @default(cuid())
  category        String
  name            String
  description     String?
  pricePerSqm     Float?
  referenceImage  String?
  promptHint      String?
  specifications  String?  // JSON string
  organizationId  String?
  organization    Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  active          Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

| Polje | Tip | Opis |
|-------|-----|------|
| `category` | String | `WPC_OGRAJA`, `KERAMIKA`, `BARVA`, `FAZADA` |
| `pricePerSqm` | Float? | Cena na m² |
| `specifications` | String? | JSON s tehničnimi specifikacijami |
| `organizationId` | String? | Če je null, je globalni material |

---

## 🔗 Relacije

### Pregled

| Od | Do | Tip | Kaskada |
|----|-----|-----|---------|
| Organization | User | 1:N | Cascade delete |
| Organization | Project | 1:N | Cascade delete |
| Organization | Visualization | 1:N | Cascade delete |
| Organization | Material | 1:N | Cascade delete |
| User | Project | 1:N | SetNull (assignedTo) |
| Project | Visualization | 1:N | Cascade delete |

### Pravila

1. **Brisanje organizacije** kaskadno izbriše:
   - Vse uporabnike
   - Vse projekte
   - Vse vizualizacije
   - Vse custom materiale

2. **Brisanje projekta** kaskadno izbriše:
   - Vse vizualizacije tega projekta

3. **Brisanje uporabnika** (assignedTo):
   - `assignedToId` se nastavi na `null` (SetNull)
   - Projekt ostane, a ni dodeljen

---

## 📊 Indeksi

Trenutno definirani:

```prisma
// Email je unique index
email String @unique

// Slug je unique index
slug String @unique
```

### Priporočeni dodatni indeksi (za produkcijo)

```prisma
model Project {
  // ...
  @@index([organizationId, status])
  @@index([organizationId, createdAt])
  @@index([assignedToId])
}

model Visualization {
  // ...
  @@index([projectId])
  @@index([organizationId, createdAt])
  @@index([status])
}

model Material {
  // ...
  @@index([organizationId, active])
  @@index([category])
}
```

---

## 🔄 Migracije

### Razvoj (db:push)

Za hitri razvoj uporabljamo `db:push`, ki sinhronizira shemo z bazo brez migracij:

```bash
bun run db:push
```

### Produkcija (migrate)

Za produkcijo uporabljamo migracije:

```bash
# Ustvari migracijo
bun run db:migrate --name opis_spremembe

# Apply migracije v produkciji
bun run db:migrate deploy

# Preveri status
bun run db:migrate status

# Ponastavi (POZOR: izbriše podatke!)
bun run db:reset
```

### Migracijske datoteke

```
prisma/
├── schema.prisma
├── migrations/
│   ├── 20260626_initial/
│   │   └── migration.sql
│   ├── 20260629_add_organization/
│   │   └── migration.sql
│   └── migration_lock.toml
└── seed.ts
```

### Primer migracijske skripte

```sql
-- 20260629_add_organization/migration.sql

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'trial',
    "maxUsers" INTEGER NOT NULL DEFAULT 1,
    "maxVisualizations" INTEGER NOT NULL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- AddColumn
ALTER TABLE "User" ADD COLUMN "organizationId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## 🔍 Prisma Studio

Prisma Studio je GUI za pregled in urejanje baze:

```bash
bunx prisma studio
```

Dostopno na http://localhost:5555

### Uporaba

- Pregled vseh tabel
- Urejanje zapisov
- Filtriranje in iskanje
- Import/export podatkov

---

## 🌱 Seed data

Za development je pripravljena seed skripta:

```bash
# Poženi seed
bunx tsx prisma/seed.ts
```

### Primer seed datoteke

```typescript
// prisma/seed.ts
import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  // Ustvari demo organizacijo
  const org = await db.organization.create({
    data: {
      name: 'Roksal d.o.o. Kranj',
      slug: 'roksal',
      plan: 'pro',
      maxUsers: 3,
      maxVisualizations: 200,
    },
  })

  // Ustvari admin uporabnika
  const passwordHash = await bcrypt.hash('admin123', 12)
  await db.user.create({
    data: {
      email: 'admin@roksal.si',
      name: 'Marko Marković',
      passwordHash,
      role: 'ADMIN',
      organizationId: org.id,
    },
  })

  // Ustvari demo projekt
  await db.project.create({
    data: {
      title: 'Balkon - Trubarjeva 5',
      customerName: 'Janez Novak',
      customerEmail: 'janez@firma.si',
      customerPhone: '+386 41 234 567',
      address: 'Trubarjeva 5, 2000 Maribor',
      status: 'V_TEKU',
      organizationId: org.id,
    },
  })

  console.log('✓ Seed podatki ustvarjeni')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
```

---

## 💾 Backup in restore

### SQLite (razvoj)

```bash
# Backup
cp db/custom.db backups/custom-$(date +%Y%m%d).db

# Restore
cp backups/custom-20260628.db db/custom.db

# Ali z bun
bun -e "
const fs = require('fs')
fs.copyFileSync('db/custom.db', 'backups/custom-' + Date.now() + '.db')
"
```

### PostgreSQL (produkcija)

```bash
# Dump
pg_dump $DATABASE_URL > backup.sql

# Compressed dump
pg_dump -Fc $DATABASE_URL > backup.dump

# Restore
psql $DATABASE_URL < backup.sql

# Restore compressed
pg_restore -d $DATABASE_URL backup.dump
```

### Avtomatski backup (cron)

```bash
# Vsak dan ob 03:00
0 3 * * * /path/to/backup-script.sh

# backup-script.sh
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR=/backups

# Backup
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/vizualizatorpro-$DATE.sql.gz

# Zadrži zadnjih 30 dni
find $BACKUP_DIR -name "vizualizatorpro-*.sql.gz" -mtime +30 -delete
```

---

## 🏭 Produkcijska baza

### PostgreSQL setup

1. **Spremeni Prisma provider:**

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Ustvari bazo:**

```bash
# Lokalno
createdb vizualizatorpro

# Ali prek psql
psql -c "CREATE DATABASE vizualizatorpro;"
```

3. **Nastavi DATABASE_URL:**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/vizualizatorpro?schema=public
```

4. **Zaženi migracije:**

```bash
bun run db:migrate deploy
```

### Priporočene produkcijske nastavitve

```sql
-- Povečaj povezave
ALTER SYSTEM SET max_connections = 100;

-- Povečaj shared_buffers
ALTER SYSTEM SET shared_buffers = '256MB';

-- Povečaj work_mem
ALTER SYSTEM SET work_mem = '4MB';

-- Reload konfiguracije
SELECT pg_reload_conf();
```

### Connection pooling (PgBouncer)

Za produkcijo priporočamo PgBouncer:

```ini
# /etc/pgbouncer/pgbouncer.ini
[databases]
vizualizatorpro = host=localhost port=5432 dbname=vizualizatorpro

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

```env
DATABASE_URL=postgresql://user:pass@localhost:6432/vizualizatorpro?schema=public
```

---

## 📊 Performance optimizacije

### Indeksi (za produkcijo)

```prisma
// V prisma/schema.prisma dodaj

model Project {
  // ...
  @@index([organizationId, status])
  @@index([organizationId, createdAt])
  @@index([assignedToId])
}

model Visualization {
  // ...
  @@index([projectId])
  @@index([organizationId, createdAt])
  @@index([status])
  @@index([category])
}

model Material {
  // ...
  @@index([organizationId, active])
  @@index([category])
}
```

### Hitri query-ji

```typescript
// ✅ DOBRO - samo potrebna polja
const projects = await db.project.findMany({
  where: { organizationId: user.organizationId },
  select: {
    id: true,
    title: true,
    customerName: true,
    status: true,
    createdAt: true,
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
})

// ❌ SLABO - vsa polja
const projects = await db.project.findMany()
```

### Paginacija

```typescript
const PAGE_SIZE = 20
const page = Number(searchParams.get('page')) || 1

const [items, total] = await Promise.all([
  db.project.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  }),
  db.project.count({ where: { organizationId: user.organizationId } }),
])
```

---

## 🚨 Troubleshooting

### Prisma client ni generiran

```bash
# Generiraj ročno
bun run db:generate

# Ali
bunx prisma generate
```

### Sprememba sheme ne deluje

```bash
# 1. Preveri sintakso
bunx prisma validate

# 2. Sinhroniziraj
bun run db:push

# 3. Restart dev server
```

### Baza je zaklenjena (SQLite)

```bash
# Preveri procese
lsof db/custom.db

# Ubij proces
kill -9 PID

# Ali počisti lock
rm db/custom.db-journal
```

---

© 2026 VizualizatorPRO. MIT License.
