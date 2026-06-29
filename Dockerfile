# Dockerfile za VizualizatorPRO
# Multi-stage build za optimizacijo velikosti slike

# ============ Stage 1: Dependencies ============
FROM oven/bun:1 AS deps
WORKDIR /app

# Kopiraj samo package.json in lockfile za caching
COPY package.json bun.lock ./

# Namesti vse odvisnosti (vključno z dev)
RUN bun install --frozen-lockfile

# ============ Stage 2: Builder ============
FROM oven/bun:1 AS builder
WORKDIR /app

# Kopiraj odvisnosti iz prejšnje faze
COPY --from=deps /app/node_modules ./node_modules

# Kopiraj izvorno kodo
COPY . .

# Build aplikacije (standalone output za minimalno sliko)
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run db:generate
RUN bun run build

# ============ Stage 3: Runner ============
FROM oven/bun:1 AS runner
WORKDIR /app

# Nastavi production okolje
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Ustvari non-root uporabnika za varnost
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopiraj standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Kopiraj public folder (slike materialov, ikone, manifest)
COPY --from=builder /app/public ./public

# Kopiraj Prisma datoteke
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Ustvari mapo za bazo in uploads
RUN mkdir -p /app/db /app/public/uploads
RUN chown -R nextjs:nodejs /app

# Preklopi na non-root uporabnika
USER nextjs

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api || exit 1

# Zaženi aplikacijo
CMD ["bun", "server.js"]
