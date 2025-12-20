/**
 * Unit tests for Lucide Icon Mapping
 *
 * Tests the icon name to component mapping.
 */

import { describe, it, expect } from 'vitest'
import { getLucideIcon, LUCIDE_ICON_MAP } from '@/lib/utils/lucide-icons'
import { FileText, Heart, Cross, Baby } from 'lucide-react'

describe('LUCIDE_ICON_MAP', () => {
  it('contains expected event type icons', () => {
    expect(LUCIDE_ICON_MAP.Heart).toBeDefined()
    expect(LUCIDE_ICON_MAP.Cross).toBeDefined()
    expect(LUCIDE_ICON_MAP.Droplet).toBeDefined()
    expect(LUCIDE_ICON_MAP.Baby).toBeDefined()
    expect(LUCIDE_ICON_MAP.Flame).toBeDefined()
  })

  it('contains UI/navigation icons', () => {
    expect(LUCIDE_ICON_MAP.Calendar).toBeDefined()
    expect(LUCIDE_ICON_MAP.Users).toBeDefined()
    expect(LUCIDE_ICON_MAP.Settings).toBeDefined()
    expect(LUCIDE_ICON_MAP.Home).toBeDefined()
  })

  it('contains additional common icons', () => {
    expect(LUCIDE_ICON_MAP.Star).toBeDefined()
    expect(LUCIDE_ICON_MAP.Bell).toBeDefined()
    expect(LUCIDE_ICON_MAP.Mail).toBeDefined()
    expect(LUCIDE_ICON_MAP.Phone).toBeDefined()
  })
})

describe('getLucideIcon', () => {
  it('returns correct icon for valid name', () => {
    expect(getLucideIcon('Heart')).toBe(Heart)
    expect(getLucideIcon('Cross')).toBe(Cross)
    expect(getLucideIcon('Baby')).toBe(Baby)
  })

  it('returns FileText as fallback for unknown icon', () => {
    expect(getLucideIcon('UnknownIcon')).toBe(FileText)
    expect(getLucideIcon('')).toBe(FileText)
    expect(getLucideIcon('NotARealIcon')).toBe(FileText)
  })

  it('is case sensitive', () => {
    // Icon names are case-sensitive in the map
    expect(getLucideIcon('heart')).toBe(FileText) // lowercase should fail
    expect(getLucideIcon('Heart')).toBe(Heart) // PascalCase works
  })
})
