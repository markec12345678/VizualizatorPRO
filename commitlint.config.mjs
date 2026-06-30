/**
 * Commitlint konfiguracija za VizualizatorPRO
 * 
 * Prisili conventional commits format:
 * <type>[scope]: <description>
 * 
 * Tipi: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
 * 
 * Primeri:
 *   feat: dodaj AR vizualizacijo
 *   fix(api): popravi napako v visualize endpointu
 *   docs: posodobi README z badges
 *   chore(deps): posodobi odvisnosti
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Tip (obvezen, en od dovoljenih)
    'type-enum': [
      2,
      'always',
      [
        'feat',      // Nova funkcionalnost
        'fix',       // Bug fix
        'docs',      // Dokumentacija
        'style',     // Formatiranje (brez sprememb kode)
        'refactor',  // Refaktoriranje
        'perf',      // Performance izboljšave
        'test',      // Testi
        'build',     // Build sistem / odvisnosti
        'ci',        // CI/CD
        'chore',     // Vzdrževanje
        'revert',    // Revert commita
        'security',  // Varnostni popravki
        'i18n',      // Prevodi
        'a11y',      // Accessibility
        'seo',       // SEO
      ],
    ],
    // Obvezen type
    'type-empty': [2, 'never'],
    // Max 10 znakov za type
    'type-length': [2, 'always', { max: 10 }],
    
    // Subject (obvezen)
    'subject-empty': [2, 'never'],
    // Max 72 znakov za subject
    'subject-length': [2, 'always', { max: 72 }],
    // Brez pike na koncu
    'subject-full-stop': [2, 'never', '.'],
    // Samo male črke (razen acronimov)
    'subject-case': [0], // Onemogočeno - dovolimo slovenščino
    
    // Header (type + subject) max 100 znakov
    'header-max-length': [2, 'always', 100],
    
    // Body (opcijsko, max 100 znakov na vrstico)
    'body-max-line-length': [1, 'always', 100],
    
    // Footer (opcijsko)
    'footer-max-line-length': [1, 'always', 100],
  },
}
