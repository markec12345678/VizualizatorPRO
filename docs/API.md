# 📡 API dokumentacija

> Celovita REST API dokumentacija za VizualizatorPRO

## 📑 Kazalo

- [Avtentikacija](#avtentikacija)
- [Base URL](#base-url)
- [Rate limiting](#rate-limiting)
- [Endpointi](#endpointi)
  - [AI vizualizacija](#ai-vizualizacija)
  - [Lead management](#lead-management)
  - [Materiali](#materiali)
  - [Avtentikacija](#avtentikacija-1)
  - [Organizacija](#organizacija)
  - [Dashboard](#dashboard)
  - [Health check](#health-check)
- [Error handling](#error-handling)
- [Webhooks (prihodnje)](#webhooks-prihodnje)

---

## 🔐 Avtentikacija

### Session-based (NextAuth.js)

Večina API endpointov zahteva veljaven NextAuth session. Session se vzpostavi preko:

```
POST /api/auth/callback/credentials
Content-Type: application/x-www-form-urlencoded

email=uporabnik@firma.si&password=geslo123&csrfToken=...&callbackUrl=/api/auth/session
```

Po uspešni prijavi se nastavi cookie `next-auth.session-token`, ki se avtomatsko pošilja z vsakim zahtevkom.

### Bearer token (prihodnje)

Za API kliente (skripte, mobilne aplikacije) bo omogočen tudi Bearer token:

```http
Authorization: Bearer <api_key>
```

### Vloge uporabnikov

| Vloga | Dovoljenja |
|-------|------------|
| `ADMIN` | Vse + manage users + delete |
| `VODJA` | Manage projects + assign |
| `MONTER` | Lastni projekti + vizualizacije |
| `SKLADISCE` | Upravljanje zaloge |

---

## 🌐 Base URL

```
Produkcija: https://vizualizatorpro.si/api
Razvoj:     http://localhost:3000/api
```

---

## ⚡ Rate limiting

| Endpoint | Limit |
|----------|-------|
| `/api/visualize` | 10 requestov/min (free), 100/min (pro) |
| `/api/lead` | 5 requestov/min na IP |
| `/api/auth/*` | 5 poskusov/15 minut na IP |
| Ostali | 100 requestov/min |

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1672531200
```

---

## 📋 Endpointi

### AI vizualizacija

#### `POST /api/visualize`

Generira AI vizualizacijo materiala na sliki balkona/prostora.

**Avtentikacija:** Ni potrebna (javni endpoint), priporočena za custom materiale

**Request body:**
```json
{
  "originalImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "materialId": "wpc-h-line",
  "projectId": "clxxx...",         // opcijsko
  "customPrompt": "dodaj rastline"  // opcijsko
}
```

**Parametri:**
| Parameter | Tip | Obvezen | Opis |
|-----------|-----|---------|------|
| `originalImage` | string | ✅ | Base64 data URL slike (max 8MB) |
| `materialId` | string | ✅ | ID materiala iz kataloga |
| `projectId` | string | ❌ | ID projekta za shranjevanje |
| `customPrompt` | string | ❌ | Dodatna navodila za AI |

**Response (200):**
```json
{
  "success": true,
  "visualizationId": "clxxx1234567",
  "resultImage": "data:image/png;base64,iVBORw0KGgo...",
  "processingTime": 12,
  "mode": "replicate",
  "material": {
    "id": "wpc-h-line",
    "name": "WPC H-Line Vodoravno",
    "category": "WPC_OGRAJA"
  }
}
```

**Response (400):**
```json
{
  "error": "Manjkajoči podatki: originalImage in materialId sta obvezna"
}
```

**Mode vrednosti:**
- `replicate` - Replicate ControlNet (najboljša kakovost)
- `zai-fallback` - Z.ai GLM-5.2 image generation
- `demo` - Demo mode (vrne original)

**Primer (curl):**
```bash
curl -X POST https://vizualizatorpro.si/api/visualize \
  -H "Content-Type: application/json" \
  -d '{
    "originalImage": "data:image/jpeg;base64,...",
    "materialId": "wpc-h-line"
  }'
```

**Primer (JavaScript):**
```javascript
const response = await fetch('/api/visualize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    originalImage: base64Image,
    materialId: 'wpc-h-line',
  }),
})

const data = await response.json()
console.log(data.resultImage)
```

---

#### `GET /api/visualize`

Vrne statistike vizualizacij.

**Response (200):**
```json
{
  "status": "active",
  "totalVisualizations": 145,
  "completed": 142,
  "failed": 3,
  "successRate": 97
}
```

---

### Lead management

#### `POST /api/lead`

Sprejme lead iz spletne strani, shrani v bazo in pošlje email obvestila.

**Avtentikacija:** Ni potrebna (javni endpoint)

**Request body:**
```json
{
  "name": "Janez Novak",
  "email": "janez@firma.si",
  "phone": "+386 41 234 567",        // opcijsko
  "company": "Moja firma d.o.o.",     // opcijsko
  "notes": "Zanima me 10m balkon",    // opcijsko
  "materialInterest": "WPC H-Line Vodoravno"  // opcijsko
}
```

**Response (200):**
```json
{
  "success": true,
  "projectId": "clxxx1234567",
  "message": "Lead uspešno sprejet. Kontaktirali vas bomo v 24 urah."
}
```

**Response (400):**
```json
{
  "error": "Ime in email sta obvezna"
}
```

**Email obvestila:**
1. Admin dobi email z vsemi podatki lead-a
2. Stranka dobi potrditveni email

---

#### `GET /api/lead`

Vrne vse leade (za admin panel).

**Avtentikacija:** ✅ Admin

**Query parametri:**
| Parameter | Tip | Default | Opis |
|-----------|-----|---------|------|
| `page` | int | 1 | Številka strani |
| `limit` | int | 50 | Število rezultatov na stran |

**Response (200):**
```json
{
  "total": 23,
  "leads": [
    {
      "id": "clxxx123",
      "name": "Janez Novak",
      "email": "janez@firma.si",
      "phone": "+386 41 234 567",
      "company": "Moja firma d.o.o.",
      "notes": "Zanima me WPC H-Line",
      "createdAt": "2026-06-29T10:30:00.000Z"
    }
  ]
}
```

---

### Materiali

#### `GET /api/materials`

Vrne statični katalog materialov.

**Query parametri:**
| Parameter | Tip | Opis |
|-----------|-----|------|
| `category` | string | Filtriraj po kategoriji (`WPC_OGRAJA`, `KERAMIKA`, `BARVA`, `FAZADA`) |

**Response (200):**
```json
{
  "total": 14,
  "categories": {
    "WPC_OGRAJA": "Balkonske ograje",
    "KERAMIKA": "Keramika in ploščice",
    "BARVA": "Barvne kombinacije",
    "FAZADA": "Fasada"
  },
  "materials": [
    {
      "id": "wpc-h-line",
      "name": "WPC H-Line Vodoravno",
      "category": "WPC_OGRAJA",
      "categoryLabel": "Balkonske ograje",
      "description": "Modern WPC profil...",
      "pricePerSqm": 185,
      "referenceImage": "/materials/wpc-h-line.jpg",
      "specifications": {
        "type": "WPC kompozit",
        "dimensions": "180×25 mm letev",
        "color": "Teak / Graphite",
        "warranty": "25 let"
      }
    }
  ]
}
```

---

#### `GET /api/materials/custom`

Vrne custom materiale (lastne materiale firme).

**Response (200):**
```json
{
  "total": 3,
  "materials": [
    {
      "id": "clxxx123",
      "name": "Premium WPC Teak",
      "category": "WPC_OGRAJA",
      "description": "Lastni profil",
      "pricePerSqm": 210,
      "referenceImage": "/uploads/custom-123.jpg",
      "specifications": {
        "type": "WPC kompozit",
        "color": "Teak"
      }
    }
  ]
}
```

---

#### `POST /api/materials/custom`

Doda nov custom material v katalog.

**Avtentikacija:** ✅ Uporabnik (prijavljen)

**Request body:**
```json
{
  "name": "Premium WPC Teak",
  "category": "WPC_OGRAJA",
  "description": "Lastni profil z izboljšano zaščito",
  "pricePerSqm": "210",
  "promptHint": "premium WPC composite teak wood balcony railing",
  "referenceImage": "data:image/jpeg;base64,...",
  "specifications": {
    "type": "WPC kompozit",
    "dimensions": "180×25 mm",
    "color": "Teak",
    "warranty": "25 let"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "material": {
    "id": "clxxx123",
    "name": "Premium WPC Teak",
    "category": "WPC_OGRAJA",
    "referenceImage": "/uploads/custom-123.jpg",
    "promptHint": "premium WPC composite..."
  }
}
```

---

### Avtentikacija

#### `POST /api/auth/register`

Registrira novo organizacijo (firmo) in admin uporabnika.

**Request body:**
```json
{
  "organizationName": "Roksal d.o.o. Kranj",
  "slug": "roksal",
  "email": "admin@roksal.si",
  "password": "močno-geslo-123",
  "name": "Marko Marković"
}
```

**Response (201):**
```json
{
  "success": true,
  "organization": {
    "id": "clxxx123",
    "name": "Roksal d.o.o. Kranj",
    "slug": "roksal",
    "plan": "trial"
  },
  "user": {
    "email": "admin@roksal.si",
    "name": "Marko Marković",
    "role": "ADMIN"
  },
  "message": "Organizacija uspešno registrirana. Lahko se prijavite."
}
```

**Validacije:**
- Email mora biti veljaven format
- Geslo min 6 znakov
- Slug mora biti unikaten
- Email mora biti unikaten

---

#### `GET /api/auth/session`

Vrne trenutno sejo (NextAuth endpoint).

**Response (200) - prijavljen:**
```json
{
  "user": {
    "id": "clxxx123",
    "email": "admin@roksal.si",
    "name": "Marko Marković",
    "role": "ADMIN",
    "organizationId": "clxxx456",
    "organizationName": "Roksal d.o.o. Kranj",
    "organizationPlan": "trial"
  },
  "expires": "2026-07-29T10:30:00.000Z"
}
```

**Response (200) - neprijavljen:**
```json
{}
```

---

### Organizacija

#### `POST /api/organization/invite`

Admin doda novega uporabnika v organizacijo.

**Avtentikacija:** ✅ Admin

**Request body:**
```json
{
  "email": "marko@roksal.si",
  "name": "Marko Monter",
  "password": "začasno-geslo",
  "role": "MONTER"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "clxxx123",
    "email": "marko@roksal.si",
    "name": "Marko Monter",
    "role": "MONTER",
    "createdAt": "2026-06-29T10:30:00.000Z"
  },
  "message": "Uporabnik marko@roksal.si uspešno dodan v organizacijo"
}
```

**Validacije:**
- Samo ADMIN lahko kliče
- Email mora biti unikaten
- Geslo min 6 znakov
- Preverja omejitve paketa (max uporabnikov)

---

#### `DELETE /api/organization/invite?userId=clxxx123`

Admin odstrani uporabnika iz organizacije.

**Avtentikacija:** ✅ Admin

**Query parametri:**
| Parameter | Tip | Opis |
|-----------|-----|------|
| `userId` | string | ID uporabnika za odstranitev |

**Response (200):**
```json
{
  "success": true,
  "message": "Uporabnik odstranjen iz organizacije"
}
```

**Pravila:**
- Ne moreš odstraniti samega sebe
- Uporabnik mora biti v isti organizaciji

---

### Dashboard

#### `GET /api/dashboard`

Vrne vse statistike za prijavljenega uporabnika in organizacijo.

**Avtentikacija:** ✅ Uporabnik

**Response (200):**
```json
{
  "organization": {
    "id": "clxxx123",
    "name": "Roksal d.o.o. Kranj",
    "slug": "roksal",
    "plan": "trial",
    "maxUsers": 1,
    "maxVisualizations": 10
  },
  "user": {
    "id": "clxxx456",
    "email": "admin@roksal.si",
    "name": "Marko Marković",
    "role": "ADMIN"
  },
  "stats": {
    "totalProjects": 5,
    "totalVisualizations": 8,
    "totalLeads": 3,
    "totalTeamMembers": 1,
    "totalCustomMaterials": 2,
    "vizLast30Days": 8,
    "leadsLast30Days": 3
  },
  "usage": {
    "visualizations": {
      "used": 8,
      "max": 10,
      "percent": 80,
      "remaining": 2
    },
    "teamMembers": {
      "used": 1,
      "max": 1,
      "remaining": 0
    }
  },
  "recentProjects": [...],
  "recentVisualizations": [...],
  "teamMembers": [...]
}
```

---

### Health check

#### `GET /api`

Preprost health check endpoint.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-06-29T10:30:00.000Z",
  "version": "1.3.0"
}
```

---

## ❌ Error handling

### Standardni error format

```json
{
  "error": "Opis napake",
  "details": "Dodatne podrobnosti (opcijsko)",
  "code": "ERROR_CODE"  // opcijsko
}
```

### HTTP status kode

| Koda | Pomen | Primer |
|------|-------|--------|
| 200 | OK | Uspešen GET |
| 201 | Created | Uspešen POST (nov resource) |
| 400 | Bad Request | Neveljaven input |
| 401 | Unauthorized | Ni prijavljen |
| 403 | Forbidden | Nima dovoljenj |
| 404 | Not Found | Resource ne obstaja |
| 409 | Conflict | Duplikat (email, slug) |
| 429 | Too Many Requests | Rate limit presežen |
| 500 | Internal Server Error | Server napaka |

### Pogoste napake

**401 Unauthorized:**
```json
{ "error": "Nisi prijavljen" }
```

**403 Forbidden:**
```json
{ "error": "Samo admin lahko doda nove uporabnike" }
```

**400 Bad Request:**
```json
{ "error": "Manjkajoči podatki: email, password in role so obvezni" }
```

**409 Conflict:**
```json
{ "error": "Email je že registriran" }
```

**429 Too Many Requests:**
```json
{
  "error": "Preveč zahtevkov. Poskusi znova čez 60 sekund.",
  "retryAfter": 60
}
```

---

## 🔔 Webhooks (prihodnje)

V načrtu so webhook-i za integracije z zunanjimi sistemi:

### Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `lead.created` | Nov lead | Lead objekt |
| `visualization.completed` | AI vizualizacija končana | Visualization objekt |
| `organization.upgraded` | Paket nadgrajen | Organization objekt |
| `user.invited` | Nov uporabnik dodan | User objekt |

### Setup (prihodnje)

```bash
POST /api/webhooks
{
  "url": "https://tvoja-aplikacija.si/webhook",
  "events": ["lead.created", "visualization.completed"],
  "secret": "whsec_..."
}
```

Webhook-i bodo podpisani z HMAC SHA-256:
```
X-Webhook-Signature: sha256=abc123...
```

---

## 📚 SDK-ji (prihodnje)

### JavaScript/TypeScript

```typescript
import { VizualizatorPro } from '@vizualizatorpro/sdk'

const client = new VizualizatorPro({
  apiKey: 'vp_live_...',
})

const result = await client.visualize({
  originalImage: base64,
  materialId: 'wpc-h-line',
})
```

### Python

```python
from vizualizatorpro import VizualizatorPro

client = VizualizatorPro(api_key='vp_live_...')

result = client.visualize(
    original_image=base64,
    material_id='wpc-h-line',
)
```

---

## 🧪 Testiranje API-ja

### Postman Collection

Prenesi Postman collection:
```
docs/postman/VizualizatorPRO.postman_collection.json
```

### cURL primeri

```bash
# Health check
curl https://vizualizatorpro.si/api

# AI vizualizacija
curl -X POST https://vizualizatorpro.si/api/visualize \
  -H "Content-Type: application/json" \
  -d '{"originalImage":"data:image/jpeg;base64,...","materialId":"wpc-h-line"}'

# Lead submission
curl -X POST https://vizualizatorpro.si/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Janez","email":"janez@firma.si"}'

# Registracija firme
curl -X POST https://vizualizatorpro.si/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"organizationName":"Firma","slug":"firma","email":"admin@firma.si","password":"geslo123"}'
```

---

## 📊 Rate limit headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1672531200
```

Ko presežeš limit:
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1672531200
Retry-After: 60
```

---

© 2026 VizualizatorPRO. MIT License.
