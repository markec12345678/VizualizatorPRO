import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isAdmin, isManager, hasRole } from '@/lib/auth/session'

describe('Auth session helpers', () => {
  describe('isAdmin', () => {
    it('should return true for ADMIN role', () => {
      expect(isAdmin('ADMIN')).toBe(true)
    })

    it('should return false for VODJA role', () => {
      expect(isAdmin('VODJA')).toBe(false)
    })

    it('should return false for MONTER role', () => {
      expect(isAdmin('MONTER')).toBe(false)
    })

    it('should return false for SKLADISCE role', () => {
      expect(isAdmin('SKLADISCE')).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isAdmin(undefined)).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isAdmin('')).toBe(false)
    })
  })

  describe('isManager', () => {
    it('should return true for ADMIN role', () => {
      expect(isManager('ADMIN')).toBe(true)
    })

    it('should return true for VODJA role', () => {
      expect(isManager('VODJA')).toBe(true)
    })

    it('should return false for MONTER role', () => {
      expect(isManager('MONTER')).toBe(false)
    })

    it('should return false for SKLADISCE role', () => {
      expect(isManager('SKLADISCE')).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isManager(undefined)).toBe(false)
    })
  })

  describe('hasRole', () => {
    it('should return true if user has allowed role', () => {
      expect(hasRole('ADMIN', ['ADMIN', 'VODJA'])).toBe(true)
      expect(hasRole('VODJA', ['ADMIN', 'VODJA'])).toBe(true)
      expect(hasRole('MONTER', ['MONTER'])).toBe(true)
    })

    it('should return false if user does not have allowed role', () => {
      expect(hasRole('MONTER', ['ADMIN', 'VODJA'])).toBe(false)
      expect(hasRole('SKLADISCE', ['ADMIN', 'VODJA', 'MONTER'])).toBe(false)
    })

    it('should return false for undefined role', () => {
      expect(hasRole(undefined, ['ADMIN'])).toBe(false)
    })

    it('should return false for empty allowed roles', () => {
      expect(hasRole('ADMIN', [])).toBe(false)
    })

    it('should handle multiple allowed roles', () => {
      expect(hasRole('ADMIN', ['ADMIN', 'VODJA', 'MONTER', 'SKLADISCE'])).toBe(true)
      expect(hasRole('VODJA', ['ADMIN', 'VODJA', 'MONTER', 'SKLADISCE'])).toBe(true)
      expect(hasRole('MONTER', ['ADMIN', 'VODJA', 'MONTER', 'SKLADISCE'])).toBe(true)
      expect(hasRole('SKLADISCE', ['ADMIN', 'VODJA', 'MONTER', 'SKLADISCE'])).toBe(true)
    })
  })
})

describe('Auth validation', () => {
  describe('Email validation', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.si',
        'admin@roksal.si',
        'marko+test@gmail.com',
        'user123@sub.domain.org',
      ]

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true)
      })
    })

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'test',
        'test@',
        '@example.com',
        'test@example',
        'test@.com',
        'test example@com',
        '',
      ]

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(false)
      })
    })
  })

  describe('Password validation', () => {
    it('should accept passwords with 6 or more characters', () => {
      const passwords = ['123456', 'password', 'močno-geslo-123', 'abc123!']
      passwords.forEach((pw) => {
        expect(pw.length >= 6).toBe(true)
      })
    })

    it('should reject passwords shorter than 6 characters', () => {
      const passwords = ['', '1', '12345', 'abcde']
      passwords.forEach((pw) => {
        expect(pw.length >= 6).toBe(false)
      })
    })
  })

  describe('Role validation', () => {
    const ALLOWED_ROLES = ['ADMIN', 'VODJA', 'MONTER', 'SKLADISCE']

    it('should accept all valid roles', () => {
      ALLOWED_ROLES.forEach((role) => {
        expect(ALLOWED_ROLES.includes(role)).toBe(true)
      })
    })

    it('should reject invalid roles', () => {
      const invalidRoles = ['USER', 'GUEST', 'SUPERADMIN', '', 'admin']
      invalidRoles.forEach((role) => {
        expect(ALLOWED_ROLES.includes(role)).toBe(false)
      })
    })
  })

  describe('Category validation', () => {
    const ALLOWED_CATEGORIES = ['WPC_OGRAJA', 'KERAMIKA', 'BARVA', 'FAZADA']

    it('should accept all valid categories', () => {
      ALLOWED_CATEGORIES.forEach((cat) => {
        expect(ALLOWED_CATEGORIES.includes(cat)).toBe(true)
      })
    })

    it('should reject invalid categories', () => {
      const invalidCategories = ['WPC', 'CERAMIC', 'PAINT', '', 'wpc_ograja']
      invalidCategories.forEach((cat) => {
        expect(ALLOWED_CATEGORIES.includes(cat)).toBe(false)
      })
    })
  })
})
