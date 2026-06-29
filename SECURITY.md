# 🔒 Politika varnosti

## 🛡️ Prijavljenje ranljivosti

Varnost je za nas prioriteta. Če odkriješ varnostno ranljivost, prosimo da jo prijaviš na odgovoren način.

### ❌ NE odpri javnega GitHub issue-ja

Varnostne ranljivosti **ne** prijavljaj preko javnih GitHub issue-jev, da preprečimo izkoriščanje pred popravkom.

### ✅ Prijavi na zaseben način

Pošlji email na **security@vizualizatorpro.si** z naslednjimi informacijami:

- Opis ranljivosti
- Koraki za reproduciranje
- Morebitni PoC (proof of concept)
- Vpliv ranljivosti (npr. XSS, SQL injection, IDOR, itd.)
- Tvoj kontakt za povratno informacijo

### 📋 Pričakovanja

- **Odziv**: v 48 urah potrdimo prejem
- **Ocenitev**: v 5 dneh ti sporočimo ali gre za varnostno težavo
- **Popravek**: odvisno od resnosti
  - Kritične: 1-7 dni
  - Visoke: 1-14 dni
  - Srednje: 1-30 dni
  - Nizke: naslednji release
- **Zahvala**: za legitimne prijave te bomo omenili v release notesih (če dovoliš)

## 🔐 Podprte verzije

Samo najnovejša verzija je podprta z varnostnimi popravki.

| Verzija | Podprta          |
| ------- | ---------------- |
| 1.3.x   | ✅ Trenutna      |
| < 1.3   | ❌ Nepodprta    |

## 🛠️ Kaj obravnavamo kot varnostno ranljivost

### Kritične / Visoke
- Remote Code Execution (RCE)
- SQL Injection
- Authentication bypass
- IDOR (Insecure Direct Object References)
- XSS (Cross-Site Scripting) v produkciji
- CSRF na občutljivih akcijah
- Kompromitirana gesla ali tokeni
- Server-side request forgery (SSRF)

### Srednje / Nizke
- Informacijsko razkritje (npr. stack traces)
- Missing rate limiting na občutljivih endpointih
- Insecure direct object references z minimalnim vplivom
- Missing security headers

## ❌ Kaj NI varnostna ranljivost

- CSRF na neobčutljivih akcijah
- Self-XSS ali clickjacking brez pravega vpliva
- Missing rate limiting na javnih API-jih
- Bugs v izgledu (CSS)
- Zahtevki za nove funkcionalnosti

## 🔧 Varnostne najboljše prakse (za self-hosting)

Če gostuješ VizualizatorPRO sam, priporočamo:

### 1. HTTPS obvezen
```bash
# Uporabi Let's Encrypt za brezplačni SSL
certbot --nginx -d vizualizatorpro.tvojadomena.si
```

### 2. Okoljske spremenljivke
- **NIKOLI** ne commitaj `.env` datoteke (že v .gitignore)
- Generiraj močan `NEXTAUTH_SECRET`:
  ```bash
  openssl rand -base64 32
  ```
- Rotiraj API ključe vsaj na 6 mesecev

### 3. Baza podatkov
- Uporabljaj PostgreSQL v produkciji (ne SQLite)
- Redno backupiraj bazo
- Omeji dostop do baze na application server

### 4. Admin geslo
- Spremeni privzeto admin geslo `vizualizator-pro-2026`
- Uporabljaj env variable: `ADMIN_PASSWORD=močno-geslo`

### 5. Rate limiting
V produkciji dodaj rate limiting (npr. preko Upstash Redis):
- API endpointi: 100 requestov/minut na IP
- Login endpoint: 5 poskusov/15 minut na IP

### 6. Security headers
Uporabi naslednje headerje v `next.config.ts`:
```typescript
const nextConfig = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(self), geolocation=(self)' },
      ],
    }]
  }
}
```

## 📋 GDPR in zasebnost

Aplikacija zbira naslednje osebne podatke:
- **Stranke**: ime, email, telefon (preko lead forma)
- **Uporabniki**: email, ime, vloga, geslo (hashed)
- **Slike**: fotografije balkonov/prostorov

### Pravice uporabnikov (GDPR)
- Dostop do lastnih podatkov
- Popravek napačnih podatkov
- Brisanje računa in vseh povezanih podatkov
- Izvoz podatkov v strokovno berljivi obliki

Za zahteve glede GDPR piši na **privacy@vizualizatorpro.si**.

## 🏆 Bug bounty

Trenutno ne ponujamo denarnega bug bounty-ja, vendar bomo:
- javno zahvalili v release notesih
- dodali tvoje ime v [SECURITY.md hall of fame](#-hall-of-fame)
- po potrebi poslali VizualizatorPRO swag

## 🏅 Hall of Fame

Hvala naslednjim raziskovalcem varnosti:

*(Še ni prijav)**

---

© 2026 VizualizatorPRO. Vse pravice pridržane.
