export type MaterialCategory = 'WPC_OGRAJA' | 'KERAMIKA' | 'BARVA' | 'FAZADA'

export interface CatalogMaterial {
  id: string
  category: MaterialCategory
  name: string
  description: string
  pricePerSqm?: number
  referenceImage: string
  promptHint: string
  specifications: {
    type: string
    dimensions?: string
    color?: string
    ralCode?: string
    warranty?: string
  }
}

export const WPC_PROFILES: CatalogMaterial[] = [
  {
    id: 'wpc-h-line',
    category: 'WPC_OGRAJA',
    name: 'WPC H-Line Vodoravno',
    description: 'Modern WPC profil z vodoravnimi letevami. Premium kompozitni material iz lesnih vlaken in polimerov. Brez vzdrževanja, odporen na vremenske vplive, garancija 25 let.',
    pricePerSqm: 185,
    referenceImage: '/materials/wpc-h-line.jpg',
    promptHint: 'modern horizontal WPC composite decking slats balcony railing, warm wood tones, clean horizontal lines, premium composite material, gaps between slats, contemporary minimalist design',
    specifications: {
      type: 'WPC kompozit',
      dimensions: '180×25 mm letev, razmik 110 mm',
      color: 'Teak / Graphite / Anthracite',
      warranty: '25 let',
    },
  },
  {
    id: 'wpc-v-line',
    category: 'WPC_OGRAJA',
    name: 'WPC V-Line Pokončno',
    description: 'WPC profil s pokončnimi letevami. Elegantna vertikalna kompozicija, idealna za sodobne balkone. Visoka odpornost na UV in vlago.',
    pricePerSqm: 195,
    referenceImage: '/materials/wpc-v-line.jpg',
    promptHint: 'modern vertical WPC composite balusters balcony railing, vertical slats, premium composite wood material, warm natural tones, contemporary design, gaps between vertical slats',
    specifications: {
      type: 'WPC kompozit',
      dimensions: '90×90 mm palice, razmik 110 mm',
      color: 'Teak / Graphite / Anthracite',
      warranty: '25 let',
    },
  },
  {
    id: 'wpc-panel',
    category: 'WPC_OGRAJA',
    name: 'WPC Panel Full',
    description: 'Full-panel WPC ograja brez odprtin. Maksimalna privatnost in zaščita pred vetrom. Sodoben izgled z elegantnimi linijami.',
    pricePerSqm: 215,
    referenceImage: '/materials/wpc-panel.jpg',
    promptHint: 'modern full panel WPC composite balcony railing, solid panels no gaps, premium wood composite material, warm wood color, contemporary privacy screen design',
    specifications: {
      type: 'WPC kompozit',
      dimensions: '180×25 mm panel, brez odprtin',
      color: 'Teak / Graphite / Anthracite',
      warranty: '25 let',
    },
  },
  {
    id: 'inox-line',
    category: 'WPC_OGRAJA',
    name: 'Inox Line Premium',
    description: 'Nerjaveče jeklo AISI 304, ščetlana površina. Visoka odpornost, minimalističen videz. Premium izbira za luksuzne balkone.',
    pricePerSqm: 295,
    referenceImage: '/materials/inox-line.jpg',
    promptHint: 'premium brushed stainless steel inox railing balcony, modern minimalist horizontal lines, sleek metal finish, contemporary luxury design, thin metal cables',
    specifications: {
      type: 'Inox AISI 304',
      dimensions: 'Profile 40×10 mm, kabel 6mm',
      color: 'Ščetlan inox (RAL 9006)',
      warranty: '15 let',
    },
  },
  {
    id: 'steklo-full',
    category: 'WPC_OGRAJA',
    name: 'Steklena ograja Full',
    description: 'Laminirano varnostno steklo 8+8mm, brez okvirja. Popoln pregled, maksimalna prosojnost. Premium izbira za panoramske poglede.',
    pricePerSqm: 345,
    referenceImage: '/materials/steklo-full.jpg',
    promptHint: 'frameless laminated glass balcony railing, transparent safety glass panels, modern minimalist design, stainless steel clamps, panoramic view, premium architecture',
    specifications: {
      type: 'Laminirano steklo 8+8mm',
      dimensions: '1100mm višina, profili inox',
      color: 'Prosojno / Smirgel',
      warranty: '10 let',
    },
  },
  {
    id: 'alu-klasik',
    category: 'WPC_OGRAJA',
    name: 'ALU Klasik',
    description: 'Aluminijasti profil klasične oblike, prašno barvan v RAL barvo. Vsestranska in cenovno dostopna rešitev.',
    pricePerSqm: 145,
    referenceImage: '/materials/alu-klasik.jpg',
    promptHint: 'classic aluminum balcony railing, powder coated metal, vertical balusters, traditional European balcony design, anthracite grey color, painted metal',
    specifications: {
      type: 'Aluminij',
      dimensions: '16×16 mm palice, razmik 110 mm',
      color: 'RAL 7016 / 9005 / 8017',
      warranty: '10 let',
    },
  },
]

export const CERAMIC_TILES: CatalogMaterial[] = [
  {
    id: 'keramika-wood-look',
    category: 'KERAMIKA',
    name: 'Wood Look Porcelan',
    description: 'Porcelanat z leseno teksturo. Realističen videz lesa z vso trajnostjo keramike. Toplotno odporen, enostavno čiščenje.',
    pricePerSqm: 38,
    referenceImage: '/materials/keramika-wood.jpg',
    promptHint: 'ceramic porcelain tiles with wood plank pattern on balcony floor, realistic wood texture, warm oak color, modern large format tiles, contemporary outdoor flooring',
    specifications: {
      type: 'Porcelanat',
      dimensions: '120×20 cm',
      color: 'Oak / Teak / Walnut',
    },
  },
  {
    id: 'keramika-stone',
    category: 'KERAMIKA',
    name: 'Stone Effect Porcelan',
    description: 'Porcelanat z naravno kamnito teksturo. Rustikalni videz z urbanim šarmom. Protidrsna površina R11.',
    pricePerSqm: 42,
    referenceImage: '/materials/keramika-stone.jpg',
    promptHint: 'ceramic porcelain tiles with natural stone texture on balcony floor, slate stone pattern, grey tones, anti-slip matte finish, contemporary outdoor flooring',
    specifications: {
      type: 'Porcelanat',
      dimensions: '60×60 cm',
      color: 'Siva / Antracit / Peščena',
    },
  },
  {
    id: 'keramika-marble',
    category: 'KERAMIKA',
    name: 'Marmor Effect Premium',
    description: 'Poliran porcelanat z marmornim vzorcem. Luksuzni videz po dostopni ceni. Idealen za notranje prostore in zastekljene balkone.',
    pricePerSqm: 65,
    referenceImage: '/materials/keramika-marble.jpg',
    promptHint: 'polished porcelain marble effect tiles on floor, Carrara marble pattern, white with grey veins, luxurious glossy finish, large format slabs, elegant interior',
    specifications: {
      type: 'Porcelanat poliran',
      dimensions: '80×80 cm',
      color: 'Carrara / Calacatta / Emperador',
    },
  },
  {
    id: 'keramika-mosaic',
    category: 'KERAMIKA',
    name: 'Mozaik Mediterranean',
    description: 'Mozaik ploščice v mediteranskem slogu. Barvite kompozicije, idealne za poudarke in stenske obloge.',
    pricePerSqm: 75,
    referenceImage: '/materials/keramika-mozaik.jpg',
    promptHint: 'mediterranean mosaic tiles on wall, small colorful ceramic pieces, blue and white pattern, moroccan style, decorative accent wall, traditional craftsmanship',
    specifications: {
      type: 'Mozaik keramika',
      dimensions: '5×5 cm mozaične kocke',
      color: 'Modra/Bela/Terra',
    },
  },
  {
    id: 'keramika-metro',
    category: 'KERAMIKA',
    name: 'Metro Subway Premium',
    description: 'Klasične metro ploščice v moderni izvedbi. Sijoča površina, časovno preverjen dizajn. Idealen za kuhinje in kopalnice.',
    pricePerSqm: 45,
    referenceImage: '/materials/keramika-metro.jpg',
    promptHint: 'subway metro tiles on wall, classic brick pattern, glossy white ceramic tiles, beveled edges, contemporary kitchen backsplash, timeless design',
    specifications: {
      type: 'Keramika glazirana',
      dimensions: '7.5×15 cm',
      color: 'Bela / Siva / Menta',
    },
  },
  {
    id: 'keramika-terracotta',
    category: 'KERAMIKA',
    name: 'Terra Cotta Rustical',
    description: 'Naravna terakota, ročno izdelana. Topli mediteranski toni, rustikalni čar. Za tradicionalne in mediteranske prostore.',
    pricePerSqm: 55,
    referenceImage: '/materials/keramika-terracotta.jpg',
    promptHint: 'terracotta tiles on floor, warm orange clay color, handcrafted rustic finish, traditional mediterranean flooring, natural variation in color, vintage charm',
    specifications: {
      type: 'Terakota',
      dimensions: '30×30 cm',
      color: 'Terra / Opeka / Antik',
    },
  },
  {
    id: 'keramika-cement',
    category: 'KERAMIKA',
    name: 'Cement Tiles Modern',
    description: 'Cementne ploščice z geometrijskimi vzorci. Sodoben industrijski videz, ročno izdelane. Edinstven značaj vsake ploščice.',
    pricePerSqm: 68,
    referenceImage: '/materials/keramika-cement.jpg',
    promptHint: 'encaustic cement tiles on floor, geometric pattern, black and white diamond design, contemporary boho style, handcrafted vintage look, decorative floor',
    specifications: {
      type: 'Cementne ploščice',
      dimensions: '20×20 cm',
      color: 'Črno-bela / Sivčka / Terra',
    },
  },
  {
    id: 'keramika-large-format',
    category: 'KERAMIKA',
    name: 'Large Format Slim',
    description: 'Velik format 120×280cm, le 6mm debeline. Brez vizualnih motenj, maksimalna eleganca. Sodoben premium izbor.',
    pricePerSqm: 92,
    referenceImage: '/materials/keramika-large.jpg',
    promptHint: 'large format slim porcelain tiles on wall, seamless surface, minimalist modern design, neutral beige color, contemporary luxury interior, no visible grout lines',
    specifications: {
      type: 'Slim porcelanat',
      dimensions: '120×280 cm, 6mm',
      color: 'Bež / Siva / Črna',
    },
  },
]

export const ALL_MATERIALS: CatalogMaterial[] = [...WPC_PROFILES, ...CERAMIC_TILES]

export function getMaterialsByCategory(category: MaterialCategory): CatalogMaterial[] {
  return ALL_MATERIALS.filter(m => m.category === category)
}

export function getMaterialById(id: string): CatalogMaterial | undefined {
  return ALL_MATERIALS.find(m => m.id === id)
}

export const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  WPC_OGRAJA: 'Balkonske ograje',
  KERAMIKA: 'Keramika in ploščice',
  BARVA: 'Barvne kombinacije',
  FAZADA: 'Fasada',
}
