import { describe, it, expect } from 'vitest'
import {
  ALL_MATERIALS,
  WPC_PROFILES,
  CERAMIC_TILES,
  getMaterialsByCategory,
  getMaterialById,
  CATEGORY_LABELS,
} from '@/lib/catalog'

describe('Catalog', () => {
  describe('ALL_MATERIALS', () => {
    it('should have 14 materials total', () => {
      expect(ALL_MATERIALS).toHaveLength(14)
    })

    it('should have all required fields', () => {
      ALL_MATERIALS.forEach((material) => {
        expect(material.id).toBeDefined()
        expect(material.name).toBeDefined()
        expect(material.category).toBeDefined()
        expect(material.description).toBeDefined()
        expect(material.referenceImage).toBeDefined()
        expect(material.promptHint).toBeDefined()
        expect(material.specifications).toBeDefined()
        expect(material.specifications.type).toBeDefined()
      })
    })

    it('should have unique IDs', () => {
      const ids = ALL_MATERIALS.map((m) => m.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('WPC_PROFILES', () => {
    it('should have 6 WPC profiles', () => {
      expect(WPC_PROFILES).toHaveLength(6)
    })

    it('should all have WPC_OGRAJA category', () => {
      WPC_PROFILES.forEach((profile) => {
        expect(profile.category).toBe('WPC_OGRAJA')
      })
    })

    it('should all have prices', () => {
      WPC_PROFILES.forEach((profile) => {
        expect(profile.pricePerSqm).toBeDefined()
        expect(profile.pricePerSqm).toBeGreaterThan(0)
      })
    })

    it('should include WPC H-Line', () => {
      const hLine = WPC_PROFILES.find((p) => p.id === 'wpc-h-line')
      expect(hLine).toBeDefined()
      expect(hLine?.name).toContain('H-Line')
    })

    it('should include Inox profile', () => {
      const inox = WPC_PROFILES.find((p) => p.id === 'inox-line')
      expect(inox).toBeDefined()
      expect(inox?.specifications.type).toContain('Inox')
    })

    it('should include glass railing', () => {
      const glass = WPC_PROFILES.find((p) => p.id === 'steklo-full')
      expect(glass).toBeDefined()
      expect(glass?.specifications.type).toContain('steklo')
    })
  })

  describe('CERAMIC_TILES', () => {
    it('should have 8 ceramic tiles', () => {
      expect(CERAMIC_TILES).toHaveLength(8)
    })

    it('should all have KERAMIKA category', () => {
      CERAMIC_TILES.forEach((tile) => {
        expect(tile.category).toBe('KERAMIKA')
      })
    })

    it('should include wood look porcelain', () => {
      const wood = CERAMIC_TILES.find((t) => t.id === 'keramika-wood-look')
      expect(wood).toBeDefined()
      expect(wood?.name).toContain('Wood')
    })

    it('should include marble effect', () => {
      const marble = CERAMIC_TILES.find((t) => t.id === 'keramika-marble')
      expect(marble).toBeDefined()
      expect(marble?.name).toContain('Marmor')
    })

    it('should include mosaic', () => {
      const mosaic = CERAMIC_TILES.find((t) => t.id === 'keramika-mosaic')
      expect(mosaic).toBeDefined()
      expect(mosaic?.name).toContain('Mozaik')
    })
  })

  describe('getMaterialsByCategory', () => {
    it('should return WPC materials for WPC_OGRAJA', () => {
      const result = getMaterialsByCategory('WPC_OGRAJA')
      expect(result).toHaveLength(6)
      result.forEach((m) => expect(m.category).toBe('WPC_OGRAJA'))
    })

    it('should return ceramic materials for KERAMIKA', () => {
      const result = getMaterialsByCategory('KERAMIKA')
      expect(result).toHaveLength(8)
      result.forEach((m) => expect(m.category).toBe('KERAMIKA'))
    })

    it('should return empty array for unknown category', () => {
      const result = getMaterialsByCategory('UNKNOWN' as any)
      expect(result).toHaveLength(0)
    })
  })

  describe('getMaterialById', () => {
    it('should find material by valid ID', () => {
      const material = getMaterialById('wpc-h-line')
      expect(material).toBeDefined()
      expect(material?.id).toBe('wpc-h-line')
      expect(material?.name).toBe('WPC H-Line Vodoravno')
    })

    it('should return undefined for invalid ID', () => {
      const material = getMaterialById('non-existent-id')
      expect(material).toBeUndefined()
    })

    it('should find all WPC materials by ID', () => {
      WPC_PROFILES.forEach((profile) => {
        const found = getMaterialById(profile.id)
        expect(found).toBeDefined()
        expect(found?.id).toBe(profile.id)
      })
    })

    it('should find all ceramic materials by ID', () => {
      CERAMIC_TILES.forEach((tile) => {
        const found = getMaterialById(tile.id)
        expect(found).toBeDefined()
        expect(found?.id).toBe(tile.id)
      })
    })
  })

  describe('CATEGORY_LABELS', () => {
    it('should have all 4 categories', () => {
      expect(Object.keys(CATEGORY_LABELS)).toHaveLength(4)
    })

    it('should have Slovenian labels', () => {
      expect(CATEGORY_LABELS.WPC_OGRAJA).toBe('Balkonske ograje')
      expect(CATEGORY_LABELS.KERAMIKA).toBe('Keramika in ploščice')
      expect(CATEGORY_LABELS.BARVA).toBe('Barvne kombinacije')
      expect(CATEGORY_LABELS.FAZADA).toBe('Fasada')
    })
  })

  describe('Material specifications', () => {
    it('should have warranty for WPC profiles', () => {
      WPC_PROFILES.forEach((profile) => {
        expect(profile.specifications.warranty).toBeDefined()
        expect(profile.specifications.warranty).toContain('let')
      })
    })

    it('should have dimensions for all materials', () => {
      ALL_MATERIALS.forEach((material) => {
        if (material.specifications.dimensions) {
          expect(typeof material.specifications.dimensions).toBe('string')
          expect(material.specifications.dimensions.length).toBeGreaterThan(0)
        }
      })
    })

    it('should have color options', () => {
      ALL_MATERIALS.forEach((material) => {
        if (material.specifications.color) {
          expect(typeof material.specifications.color).toBe('string')
        }
      })
    })
  })

  describe('Price validation', () => {
    it('should have reasonable prices (between 30 and 400 €/m²)', () => {
      ALL_MATERIALS.forEach((material) => {
        if (material.pricePerSqm) {
          expect(material.pricePerSqm).toBeGreaterThanOrEqual(30)
          expect(material.pricePerSqm).toBeLessThanOrEqual(400)
        }
      })
    })

    it('should have WPC cheaper than Inox', () => {
      const wpc = WPC_PROFILES.find((p) => p.id === 'wpc-h-line')
      const inox = WPC_PROFILES.find((p) => p.id === 'inox-line')
      expect(wpc?.pricePerSqm ?? 0).toBeLessThan(inox?.pricePerSqm ?? 0)
    })

    it('should have glass as most expensive railing', () => {
      const glass = WPC_PROFILES.find((p) => p.id === 'steklo-full')
      const maxPrice = Math.max(...WPC_PROFILES.map((p) => p.pricePerSqm || 0))
      expect(glass?.pricePerSqm).toBe(maxPrice)
    })
  })
})
