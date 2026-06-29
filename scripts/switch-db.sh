#!/bin/bash
# Skripta za preklop med SQLite in PostgreSQL
# 
# Uporaba:
#   ./scripts/switch-db.sh sqlite     # Razvoj (SQLite)
#   ./scripts/switch-db.sh postgres   # Produkcija (PostgreSQL)

set -e

SCHEMA_DIR="prisma"
SQLITE_SCHEMA="$SCHEMA_DIR/schema.sqlite.prisma"
POSTGRES_SCHEMA="$SCHEMA_DIR/schema.postgres.prisma"
ACTIVE_SCHEMA="$SCHEMA_DIR/schema.prisma"

if [ "$1" = "sqlite" ]; then
    echo "📦 Preklapljam na SQLite..."
    cp "$SQLITE_SCHEMA" "$ACTIVE_SCHEMA" 2>/dev/null || {
        # Če SQLite shema ne obstaja, ustvari iz trenutne
        cat > "$SQLITE_SCHEMA" << 'SQLEOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
SQLEOF
        echo "✓ SQLite shema ustvarjena. Ročno posodobi $ACTIVE_SCHEMA"
    }
    echo "✓ Aktiven: SQLite"
    echo "  DATABASE_URL=file:./db/custom.db"
    
elif [ "$1" = "postgres" ]; then
    echo "🐘 Preklapljam na PostgreSQL..."
    if [ ! -f "$POSTGRES_SCHEMA" ]; then
        echo "❌ PostgreSQL shema ne obstaja. Ustvari jo iz SQLite sheme."
        exit 1
    fi
    cp "$POSTGRES_SCHEMA" "$ACTIVE_SCHEMA"
    echo "✓ Aktiven: PostgreSQL"
    echo "  DATABASE_URL=postgresql://user:pass@host:5432/dbname?schema=public"
    
else
    echo "Uporaba: $0 <sqlite|postgres>"
    echo ""
    echo "Primeri:"
    echo "  $0 sqlite     # Razvoj z SQLite"
    echo "  $0 postgres   # Produkcija z PostgreSQL"
    exit 1
fi

echo ""
echo "Po preklopu zaženi:"
echo "  bun run db:generate    # Generiraj Prisma client"
echo "  bun run db:push        # Sinhroniziraj shemo (SQLite)"
echo "  bun run db:migrate deploy  # Apply migracije (PostgreSQL)"
