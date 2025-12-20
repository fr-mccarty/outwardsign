/**
 * Unit tests for Console Helper Functions
 *
 * Tests message validation and output formatting.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logSuccess, logWarning, logError, logInfo } from '@/lib/utils/console'

describe('Console Helpers', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('logSuccess', () => {
    it('logs with [OK] prefix', () => {
      logSuccess('Operation completed')
      expect(consoleSpy).toHaveBeenCalledWith('[OK] Operation completed')
    })

    it('accepts letters and numbers', () => {
      expect(() => logSuccess('Created 5 users')).not.toThrow()
      expect(() => logSuccess('Version 2.0 released')).not.toThrow()
    })

    it('accepts Spanish characters', () => {
      expect(() => logSuccess('Creación de niño exitosa')).not.toThrow()
      expect(() => logSuccess('Quinceañera created')).not.toThrow()
    })

    it('accepts keyboard symbols', () => {
      expect(() => logSuccess('File: test.txt (100%)')).not.toThrow()
      expect(() => logSuccess("User's file created - OK!")).not.toThrow()
    })

    it('rejects emojis', () => {
      expect(() => logSuccess('Done! 🎉')).toThrow(/prohibited characters/)
      expect(() => logSuccess('✅ Complete')).toThrow(/prohibited characters/)
    })
  })

  describe('logWarning', () => {
    it('logs with warning prefix', () => {
      logWarning('No data found')
      expect(consoleSpy).toHaveBeenCalledWith('⚠️ No data found')
    })

    it('accepts valid messages', () => {
      expect(() => logWarning('File not found, using default')).not.toThrow()
    })

    it('rejects invalid characters', () => {
      expect(() => logWarning('Warning 🔔')).toThrow(/prohibited characters/)
    })
  })

  describe('logError', () => {
    it('logs with error prefix', () => {
      logError('Operation failed')
      expect(consoleSpy).toHaveBeenCalledWith('❌ Operation failed')
    })

    it('accepts valid messages', () => {
      expect(() => logError('Database connection failed')).not.toThrow()
    })

    it('rejects invalid characters', () => {
      expect(() => logError('Error 💥')).toThrow(/prohibited characters/)
    })
  })

  describe('logInfo', () => {
    it('logs without prefix', () => {
      logInfo('Starting process...')
      expect(consoleSpy).toHaveBeenCalledWith('Starting process...')
    })

    it('accepts valid messages', () => {
      expect(() => logInfo('Loading data...')).not.toThrow()
      expect(() => logInfo('Step 1/5: Validating input')).not.toThrow()
    })

    it('rejects invalid characters', () => {
      expect(() => logInfo('→ Next step')).toThrow(/prohibited characters/)
    })
  })

  describe('Message validation', () => {
    it('accepts newlines and tabs', () => {
      expect(() => logInfo('Line 1\nLine 2\tTabbed')).not.toThrow()
    })

    it('accepts all standard keyboard symbols', () => {
      const symbols = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
      expect(() => logInfo(`Symbols: ${symbols}`)).not.toThrow()
    })

    it('accepts accented Spanish characters', () => {
      const spanish = 'áéíóúÁÉÍÓÚñÑüÜ'
      expect(() => logInfo(`Spanish: ${spanish}`)).not.toThrow()
    })
  })
})
