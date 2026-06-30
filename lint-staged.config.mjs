/**
 * lint-staged konfiguracija za VizualizatorPRO
 * 
 * Zažene se ob pre-commit hook-u samo na spremenjenih datotekah.
 * Pospeši commit proces - ne preverja celotnega projekta.
 */
export default {
  // TypeScript / JavaScript datoteke - preveri z ESLint (0 errors, warnings OK)
  '*.{ts,tsx,js,jsx,mjs,cjs}': [
    'eslint --fix',
  ],
  
  // CSS / Tailwind datoteke
  '*.{css,scss}': [
    'eslint --fix',
  ],
  
  // JSON datoteke - preveri sintakso
  '*.json': [
    'prettier --check',
  ],
  
  // Markdown datoteke
  '*.md': [
    'prettier --check',
  ],
  
  // Prisma shema
  '*.prisma': [
    'prisma format',
  ],
  
  // Package.json - preveri format
  'package.json': [
    'prettier --check',
  ],
}
