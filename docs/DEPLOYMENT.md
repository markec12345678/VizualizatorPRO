# 🚀 Deployment

> Celovita navodila za deployment VizualizatorPRO v produkcijo

## 📑 Kazalo

- [Hitri začetek](#hitri-zacetek)
- [Vercel (priporočeno)](#vercel-priporoceno)
- [Docker (self-hosted)](#docker-self-hosted)
- [VPS z Docker Compose](#vps-z-docker-compose)
- [Brez Dockerja (Node.js)](#brez-dockerja-nodejs)
- [Mobilna aplikacija](#mobilna-aplikacija)
- [Postavitev okoljskih spremenljivk](#postavitev-okoljskih-spremenljivk)
- [Domain in HTTPS](#domain-in-https)
- [Monitoring in logging](#monitoring-in-logging)
- [Backup](#backup)
- [Nadgradnja](#nadgradnja)

---

## 🚀 Hitri začetek

| Metoda | Težavnost | Čas | Najboljše za |
|--------|-----------|-----|--------------|
| **Vercel** | 🟢 Enostavno | 5 min | Hitri začetek, demo, MVP |
| **Docker** | 🟡 Srednje | 15 min | Self-hosting, kontrola |
| **VPS + Compose** | 🟡 Srednje | 30 min | Produkcija z HTTPS |
| **Brez Dockerja** | 🔴 Zahtevno | 20 min | Specifične potrebe |

---

## ☁️ Vercel (priporočeno)

Najhitrejši način za deployment. Brezplačni tier je dovolj za začetek.

### 1. Priprava

```bash
# Push na GitHub (če še ni)
git push origin main
```

### 2. Deploy preko Vercel dashboarda

1. Pojdi na https://vercel.com/new
2. Import repozitorij `markec12345678/VizualizatorPRO`
3. Framework Preset: **Next.js**
4. Build Command: `bun run build` (samodejno zaznano)
5. Output Directory: `.next` (samodejno)

### 3. Okoljske spremenljivke

V Vercel dashboardu dodaj:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `file:./db/vercel.db` (za SQLite) ali PostgreSQL URL |
| `NEXTAUTH_SECRET` | Generiraj z `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://tvoja-domena.vercel.app` |
| `REPLICATE_API_TOKEN` | Tvoj Replicate token |
| `RESEND_API_KEY` | Tvoj Resend API key |
| `FROM_EMAIL` | `info@vizualizatorpro.si` |
| `NOTIFICATION_EMAIL` | `admin@vizualizatorpro.si` |

### 4. Deploy!

Klikni **Deploy**. V 2 minutah bo aplikacija živa na:
```
https://vizualizatorpro.vercel.app
```

### 5. Custom domena (opcijsko)

1. V Vercel dashboard: Settings → Domains
2. Dodaj `vizualizatorpro.si`
3. Spremeni DNS A record:
   ```
   A    @    76.76.21.21
   CNAME www  cname.vercel-dns.com
   ```
4. Vercel avtomatsko pridobi SSL certifikat

### CI/CD

Vercel avtomatsko deploya ob vsakem push-u na `main` branch. Preview deployi se ustvarijo za PR-je.

---

## 🐳 Docker (self-hosted)

### Hitri začetek

```bash
# 1. Kloniraj
git clone https://github.com/markec12345678/VizualizatorPRO.git
cd VizualizatorPRO

# 2. Pripravi .env
cp .env.example .env
# Uredi .env in izpolni API ključe

# 3. Zaženi
docker-compose up -d

# 4. Preveri
curl http://localhost:3000/api
```

### Samostojni Docker build

```bash
# Build
docker build -t vizualizatorpro:latest .

# Zaženi
docker run -d \
  --name vizualizatorpro \
  -p 3000:3000 \
  -v vizualizatorpro_db:/app/db \
  -v vizualizatorpro_uploads:/app/public/uploads \
  -e NEXTAUTH_SECRET=$(openssl rand -base64 32) \
  -e NEXTAUTH_URL=https://tvoja.si \
  -e REPLICATE_API_TOKEN=your_token \
  -e RESEND_API_KEY=your_key \
  --restart unless-stopped \
  vizualizatorpro:latest
```

### GitHub Container Registry (GHCR)

CI/CD avtomatsko objavi sliko na GHCR ob vsakem release-u.

```bash
# Pull
docker pull ghcr.io/markec12345678/vizualizatorpro:latest

# Zaženi
docker run -d -p 3000:3000 ghcr.io/markec12345678/vizualizatorpro:latest
```

---

## 🖥️ VPS z Docker Compose

Za produkcijo na lastnem VPS (npr. Hetzner, DigitalOcean, Linode).

### 1. Pripravi VPS

```bash
# Priključi se na VPS
ssh root@tvoj-vps-ip

# Namesti Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Namesti Docker Compose
apt-get install docker-compose-plugin

# Ustvari uporabnika
adduser vizualizator
usermod -aG docker vizualizator
su - vizualizator
```

### 2. Kloniraj repozitorij

```bash
git clone https://github.com/markec12345678/VizualizatorPRO.git
cd VizualizatorPRO
```

### 3. Pripravi .env

```bash
cp .env.example .env
nano .env
```

```env
DATABASE_URL=file:/app/db/custom.db
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://vizualizatorpro.si
REPLICATE_API_TOKEN=...
RESEND_API_KEY=...
FROM_EMAIL=info@vizualizatorpro.si
NOTIFICATION_EMAIL=admin@vizualizatorpro.si
```

### 4. Spremeni Caddyfile

```bash
nano Caddyfile
```

Zamenjaj `vizualizatorpro.si` z dejansko domeno.

### 5. Nastavi DNS

```
A    @    IP_TVOJEGA_VPS
A    www  IP_TVOJEGA_VPS
```

### 6. Zaženi s production profilom

```bash
docker-compose --profile production up -d
```

Caddy avtomatsko:
- Pridobi Let's Encrypt SSL certifikat
- Obnovlja certifikate vsakih 60 dni
- Redirection HTTP → HTTPS
- Security headers
- Gzip kompresijo

### 7. Preveri

```bash
# Status
docker-compose ps

# Logi
docker-compose logs -f app
docker-compose logs -f caddy

# Test
curl https://vizualizatorpro.si/api
```

---

## 🌳 Brez Dockerja (Node.js)

### 1. Namesti Node.js 20+ in Bun

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Bun
curl -fsSL https://bun.sh/install | bash
```

### 2. Kloniraj in namesti

```bash
git clone https://github.com/markec12345678/VizualizatorPRO.git
cd VizualizatorPRO
bun install
```

### 3. Pripravi .env

```bash
cp .env.example .env
# Uredi .env
```

### 4. Build in zaženi

```bash
# Generiraj Prisma client
bun run db:generate

# Push shemo
bun run db:push

# Build
bun run build

# Zaženi
bun run start
```

### 5. PM2 (process manager)

```bash
# Namesti PM2
npm install -g pm2

# Zaženi
pm2 start "bun run start" --name vizualizatorpro

# Avto-restart ob reboot
pm2 startup
pm2 save
```

### 6. Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name vizualizatorpro.si;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. SSL z Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d vizualizatorpro.si -d www.vizualizatorpro.si
```

---

## 📱 Mobilna aplikacija

Za deployment na App Store in Google Play glej [MOBILE.md](../MOBILE.md).

---

## 🔐 Postavitev okoljskih spremenljivk

### Obvezne

| Variable | Opis | Primer |
|----------|------|--------|
| `DATABASE_URL` | Povezava na bazo | `file:./db/custom.db` |
| `NEXTAUTH_SECRET` | Skrivni ključ za JWT | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL aplikacije | `https://vizualizatorpro.si` |

### AI vizualizacija (opcijsko)

| Variable | Opis | Kje dobiti |
|----------|------|------------|
| `REPLICATE_API_TOKEN` | Replicate API token | https://replicate.com |
| Brez tega | Deluje z Z.ai GLM-5.2 fallback | - |

### Email (opcijsko)

| Variable | Opis | Kje dobiti |
|----------|------|------------|
| `RESEND_API_KEY` | Resend API key | https://resend.com |
| `FROM_EMAIL` | Email pošiljatelja | `info@vizualizatorpro.si` |
| `NOTIFICATION_EMAIL` | Email prejemnika (admin) | `admin@vizualizatorpro.si` |
| Brez tega | Emaili se samo log-ajo | - |

### Generiranje NEXTAUTH_SECRET

```bash
# macOS / Linux
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Bun
bun -e "console.log(bun.randomBytes(32).toString('base64'))"
```

---

## 🌐 Domain in HTTPS

### DNS konfiguracija

```
Tip    Ime               Vrednost
A      @                 123.45.67.89
A      www               123.45.67.89
CNAME  api               vizualizatorpro.si
MX     @                 mail.tvoja-domena.si
TXT    @                 v=spf1 include:_spf.resend.com ~all
```

### SSL certifikati

| Metoda | Avtomatska obnova | Težavnost |
|--------|-------------------|-----------|
| Caddy | ✅ Da | 🟢 Enostavno |
| Let's Encrypt + Certbot | ✅ Da | 🟡 Srednje |
| Vercel | ✅ Da | 🟢 Enostavno |
| Cloudflare | ✅ Da | 🟢 Enostavno |

---

## 📊 Monitoring in logging

### Logi

#### Docker
```bash
# Spremljaj loge v realnem času
docker-compose logs -f app
docker-compose logs -f caddy

# Zadnjih 100 vrstic
docker-compose logs --tail 100 app
```

#### PM2
```bash
pm2 logs vizualizatorpro
pm2 monit
```

### Health check

```bash
# Preprost health check
curl https://vizualizatorpro.si/api

# Z cronom (vsako minuto)
* * * * * curl -f https://vizualizatorpro.si/api || echo "DOWN" | mail -s "VizualizatorPRO DOWN" admin@vizualizatorpro.si
```

### Monitoring (priporočeno)

| Orodje | Namen | Cena |
|--------|-------|------|
| [UptimeRobot](https://uptimerobot.com) | Uptime monitoring | Brezplačno |
| [Sentry](https://sentry.io) | Error tracking | Brezplačni tier |
| [PostHog](https://posthog.com) | Analytics | Brezplačni tier |
| [Grafana](https://grafana.com) | Dashboard | Self-hosted |

---

## 💾 Backup

### Baza podatkov (SQLite)

```bash
# Ročni backup
cp db/custom.db backups/custom-$(date +%Y%m%d).db

# Avtomatski backup (cron vsak dan ob 03:00)
0 3 * * * cp /path/to/db/custom.db /backups/custom-$(date +\%Y\%m\%d).db

# Ali z backup skripto
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
docker-compose exec -T app sqlite3 /app/db/custom.db ".backup /backups/backup-$DATE.db"
# Zadrži zadnjih 30 dni
find /backups -name "backup-*.db" -mtime +30 -delete
```

### Uploads (slike materialov)

```bash
# Backup uploads mape
rsync -avz public/uploads/ backups/uploads/

# Ali na S3
aws s3 sync public/uploads/ s3://tvoj-bucket/uploads/
```

### Baza v PostgreSQL (produkcija)

```bash
# Dump
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

---

## 🔄 Nadgradnja

### Docker Compose

```bash
# Prenesi najnovejše
git pull origin main

# rebuild in ponovno zaženi
docker-compose down
docker-compose build
docker-compose up -d

# Ali krajše
docker-compose up -d --build
```

### Vercel

Avtomatsko ob vsakem push-u na `main`. Za ročni deploy:
```bash
vercel --prod
```

### Brez Dockerja

```bash
git pull origin main
bun install
bun run db:push
bun run build
pm2 restart vizualizatorpro
```

### Migracije baze

```bash
# Preveri stanje
bun run db:migrate status

# Ustvari novo migracijo
bun run db:migrate --name add_new_feature

# Apply v produkciji
bun run db:migrate deploy
```

---

## 🚨 Troubleshooting

### Aplikacija ne deluje

```bash
# 1. Preveri loge
docker-compose logs app

# 2. Preveri status
docker-compose ps

# 3. Preveri bazo
docker-compose exec app bun run db:push

# 4. Restart
docker-compose restart app
```

### SSL ne deluje

```bash
# Preveri Caddy loge
docker-compose logs caddy

# Preveri DNS
dig vizualizatorpro.si

# Preveri port 80 in 443
sudo ufw status
```

### Baza je poškodovana

```bash
# 1. Ustavi aplikacijo
docker-compose down

# 2. Backup poškodovane baze
cp db/custom.db backups/corrupted-$(date +%Y%m%d).db

# 3. Obnovi iz backup-a
cp backups/backup-20260628.db db/custom.db

# 4. Zaženi
docker-compose up -d
```

---

## 📞 Podpora

Če naletiš na težave:

1. Preveri [GitHub Issues](https://github.com/markec12345678/VizualizatorPRO/issues)
2. Preveri [Discussions](https://github.com/markec12345678/VizualizatorPRO/discussions)
3. Odpri nov issue z [bug report predlogo](https://github.com/markec12345678/VizualizatorPRO/issues/new?template=bug_report.md)

---

© 2026 VizualizatorPRO. MIT License.
