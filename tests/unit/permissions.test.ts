/**
 * Unit tests for Permission Helper Functions
 *
 * Tests the pure permission checking functions that determine role-based access.
 * These tests replace the 480+ line E2E test with focused unit tests.
 */

import { describe, it, expect } from 'vitest'
import {
  canAccessModule,
  canManageParishSettings,
  canManageParishioners,
  canInviteParishioners,
  canManageTemplates,
  canEditModule,
  AVAILABLE_MODULES,
  type UserParishRole,
} from '@/lib/auth/permissions-client'

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

const createAdmin = (enabledModules: string[] = []): UserParishRole => ({
  roles: ['admin'],
  enabled_modules: enabledModules,
})

const createStaff = (enabledModules: string[] = []): UserParishRole => ({
  roles: ['staff'],
  enabled_modules: enabledModules,
})

const createMinistryLeader = (enabledModules: string[]): UserParishRole => ({
  roles: ['ministry-leader'],
  enabled_modules: enabledModules,
})

const createParishioner = (enabledModules: string[] = []): UserParishRole => ({
  roles: ['parishioner'],
  enabled_modules: enabledModules,
})

// ============================================================================
// AVAILABLE MODULES
// ============================================================================

describe('AVAILABLE_MODULES', () => {
  it('includes expected modules', () => {
    expect(AVAILABLE_MODULES).toContain('masses')
    expect(AVAILABLE_MODULES).toContain('groups')
    expect(AVAILABLE_MODULES).toContain('mass-intentions')
  })
})

// ============================================================================
// canAccessModule
// ============================================================================

describe('canAccessModule', () => {
  describe('Admin role', () => {
    it('can access all modules regardless of enabled_modules', () => {
      const admin = createAdmin([])
      expect(canAccessModule(admin, 'masses')).toBe(true)
      expect(canAccessModule(admin, 'groups')).toBe(true)
      expect(canAccessModule(admin, 'mass-intentions')).toBe(true)
    })
  })

  describe('Staff role', () => {
    it('can access all modules regardless of enabled_modules', () => {
      const staff = createStaff([])
      expect(canAccessModule(staff, 'masses')).toBe(true)
      expect(canAccessModule(staff, 'groups')).toBe(true)
      expect(canAccessModule(staff, 'mass-intentions')).toBe(true)
    })
  })

  describe('Ministry-leader role', () => {
    it('can only access enabled modules', () => {
      const leader = createMinistryLeader(['masses'])
      expect(canAccessModule(leader, 'masses')).toBe(true)
      expect(canAccessModule(leader, 'groups')).toBe(false)
      expect(canAccessModule(leader, 'mass-intentions')).toBe(false)
    })

    it('can access multiple enabled modules', () => {
      const leader = createMinistryLeader(['masses', 'groups'])
      expect(canAccessModule(leader, 'masses')).toBe(true)
      expect(canAccessModule(leader, 'groups')).toBe(true)
      expect(canAccessModule(leader, 'mass-intentions')).toBe(false)
    })

    it('cannot access any module if none are enabled', () => {
      const leader = createMinistryLeader([])
      expect(canAccessModule(leader, 'masses')).toBe(false)
      expect(canAccessModule(leader, 'groups')).toBe(false)
    })
  })

  describe('Parishioner role', () => {
    it('cannot access any modules', () => {
      const parishioner = createParishioner([])
      expect(canAccessModule(parishioner, 'masses')).toBe(false)
      expect(canAccessModule(parishioner, 'groups')).toBe(false)
      expect(canAccessModule(parishioner, 'mass-intentions')).toBe(false)
    })

    it('cannot access modules even if somehow enabled', () => {
      // Even if enabled_modules has values, parishioners still can't access
      const parishioner = createParishioner(['masses', 'groups'])
      expect(canAccessModule(parishioner, 'masses')).toBe(false)
      expect(canAccessModule(parishioner, 'groups')).toBe(false)
    })
  })
})

// ============================================================================
// canManageParishSettings
// ============================================================================

describe('canManageParishSettings', () => {
  it('allows admin to manage settings', () => {
    expect(canManageParishSettings(createAdmin())).toBe(true)
  })

  it('denies staff from managing settings', () => {
    expect(canManageParishSettings(createStaff())).toBe(false)
  })

  it('denies ministry-leader from managing settings', () => {
    expect(canManageParishSettings(createMinistryLeader(['masses']))).toBe(false)
  })

  it('denies parishioner from managing settings', () => {
    expect(canManageParishSettings(createParishioner())).toBe(false)
  })
})

// ============================================================================
// canManageParishioners
// ============================================================================

describe('canManageParishioners', () => {
  it('allows admin to manage parishioners', () => {
    expect(canManageParishioners(createAdmin())).toBe(true)
  })

  it('denies staff from managing parishioners', () => {
    expect(canManageParishioners(createStaff())).toBe(false)
  })

  it('denies ministry-leader from managing parishioners', () => {
    expect(canManageParishioners(createMinistryLeader(['masses']))).toBe(false)
  })

  it('denies parishioner from managing parishioners', () => {
    expect(canManageParishioners(createParishioner())).toBe(false)
  })
})

// ============================================================================
// canInviteParishioners
// ============================================================================

describe('canInviteParishioners', () => {
  it('allows admin to invite parishioners', () => {
    expect(canInviteParishioners(createAdmin())).toBe(true)
  })

  it('allows staff to invite parishioners', () => {
    expect(canInviteParishioners(createStaff())).toBe(true)
  })

  it('denies ministry-leader from inviting parishioners', () => {
    expect(canInviteParishioners(createMinistryLeader(['masses']))).toBe(false)
  })

  it('denies parishioner from inviting parishioners', () => {
    expect(canInviteParishioners(createParishioner())).toBe(false)
  })
})

// ============================================================================
// canManageTemplates
// ============================================================================

describe('canManageTemplates', () => {
  it('allows admin to manage templates', () => {
    expect(canManageTemplates(createAdmin())).toBe(true)
  })

  it('denies staff from managing templates', () => {
    expect(canManageTemplates(createStaff())).toBe(false)
  })

  it('denies ministry-leader from managing templates', () => {
    expect(canManageTemplates(createMinistryLeader(['masses']))).toBe(false)
  })

  it('denies parishioner from managing templates', () => {
    expect(canManageTemplates(createParishioner())).toBe(false)
  })
})

// ============================================================================
// canEditModule
// ============================================================================

describe('canEditModule', () => {
  it('allows admin to edit any module', () => {
    const admin = createAdmin()
    expect(canEditModule(admin, 'masses')).toBe(true)
    expect(canEditModule(admin, 'groups')).toBe(true)
  })

  it('allows staff to edit any module', () => {
    const staff = createStaff()
    expect(canEditModule(staff, 'masses')).toBe(true)
    expect(canEditModule(staff, 'groups')).toBe(true)
  })

  it('allows ministry-leader to edit only enabled modules', () => {
    const leader = createMinistryLeader(['masses'])
    expect(canEditModule(leader, 'masses')).toBe(true)
    expect(canEditModule(leader, 'groups')).toBe(false)
  })

  it('denies parishioner from editing any module', () => {
    const parishioner = createParishioner()
    expect(canEditModule(parishioner, 'masses')).toBe(false)
    expect(canEditModule(parishioner, 'groups')).toBe(false)
  })
})

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge cases', () => {
  it('handles user with multiple roles (admin + staff)', () => {
    const multiRole: UserParishRole = {
      roles: ['admin', 'staff'],
      enabled_modules: [],
    }
    expect(canAccessModule(multiRole, 'masses')).toBe(true)
    expect(canManageParishSettings(multiRole)).toBe(true)
  })

  it('handles empty roles array', () => {
    const noRole: UserParishRole = {
      roles: [],
      enabled_modules: ['masses'],
    }
    expect(canAccessModule(noRole, 'masses')).toBe(false)
    expect(canManageParishSettings(noRole)).toBe(false)
  })

  it('handles undefined enabled_modules gracefully', () => {
    const leader: UserParishRole = {
      roles: ['ministry-leader'],
      enabled_modules: undefined as unknown as string[],
    }
    // Should handle gracefully without throwing
    expect(canAccessModule(leader, 'masses')).toBe(false)
  })
})
