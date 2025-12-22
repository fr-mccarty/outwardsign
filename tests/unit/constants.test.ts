/**
 * Unit tests for Constants and Helper Functions
 *
 * Tests the pure utility functions and constant lookups.
 */

import { describe, it, expect } from 'vitest'
import {
  getLiturgicalGradeLabel,
  getLiturgicalContextFromGrade,
  SEX_VALUES,
  SEX_LABELS,
  MODULE_STATUS_VALUES,
  MODULE_STATUS_LABELS,
  LITURGICAL_LANGUAGE_VALUES,
  LITURGICAL_LANGUAGE_LABELS,
  LITURGICAL_COLOR_VALUES,
  LITURGICAL_COLOR_LABELS,
  DAYS_OF_WEEK_VALUES,
  DAYS_OF_WEEK_LABELS,
  LITURGICAL_CONTEXT_VALUES,
  LITURGICAL_CONTEXT_LABELS,
  USER_PARISH_ROLE_VALUES,
  USER_PARISH_ROLE_LABELS,
} from '@/lib/constants'

// ============================================================================
// getLiturgicalGradeLabel
// ============================================================================

describe('getLiturgicalGradeLabel', () => {
  it('returns correct English label for known grades', () => {
    expect(getLiturgicalGradeLabel('SOLEMNITY', 'en')).toBe('Solemnity')
    expect(getLiturgicalGradeLabel('FEAST', 'en')).toBe('Feast')
    expect(getLiturgicalGradeLabel('Memorial', 'en')).toBe('Memorial')
    expect(getLiturgicalGradeLabel('weekday', 'en')).toBe('Weekday')
  })

  it('returns correct Spanish label for known grades', () => {
    expect(getLiturgicalGradeLabel('SOLEMNITY', 'es')).toBe('Solemnidad')
    expect(getLiturgicalGradeLabel('FEAST', 'es')).toBe('Fiesta')
    expect(getLiturgicalGradeLabel('Memorial', 'es')).toBe('Memoria')
    expect(getLiturgicalGradeLabel('weekday', 'es')).toBe('Día de Semana')
  })

  it('defaults to English when language not specified', () => {
    expect(getLiturgicalGradeLabel('SOLEMNITY')).toBe('Solemnity')
    expect(getLiturgicalGradeLabel('FEAST')).toBe('Feast')
  })

  it('handles special cases like optional memorial', () => {
    expect(getLiturgicalGradeLabel('optional memorial', 'en')).toBe('Optional Memorial')
    expect(getLiturgicalGradeLabel('optional memorial', 'es')).toBe('Memoria Opcional')
  })

  it('handles precedence case', () => {
    expect(getLiturgicalGradeLabel('celebration with precedence over solemnities', 'en'))
      .toBe('Celebration with Precedence over Solemnities')
  })

  it('capitalizes unknown grades as fallback', () => {
    expect(getLiturgicalGradeLabel('unknown grade', 'en')).toBe('Unknown Grade')
    expect(getLiturgicalGradeLabel('some new value', 'en')).toBe('Some New Value')
  })
})

// ============================================================================
// getLiturgicalContextFromGrade
// ============================================================================

describe('getLiturgicalContextFromGrade', () => {
  it('returns SUNDAY for Sundays regardless of grade', () => {
    expect(getLiturgicalContextFromGrade(1, true)).toBe('SUNDAY')
    expect(getLiturgicalContextFromGrade(4, true)).toBe('SUNDAY')
    expect(getLiturgicalContextFromGrade(7, true)).toBe('SUNDAY')
  })

  it('returns SOLEMNITY for grades 1-2', () => {
    expect(getLiturgicalContextFromGrade(1, false)).toBe('SOLEMNITY')
    expect(getLiturgicalContextFromGrade(2, false)).toBe('SOLEMNITY')
  })

  it('returns FEAST for grades 3-4', () => {
    expect(getLiturgicalContextFromGrade(3, false)).toBe('FEAST')
    expect(getLiturgicalContextFromGrade(4, false)).toBe('FEAST')
  })

  it('returns MEMORIAL for grades 5-6', () => {
    expect(getLiturgicalContextFromGrade(5, false)).toBe('MEMORIAL')
    expect(getLiturgicalContextFromGrade(6, false)).toBe('MEMORIAL')
  })

  it('returns WEEKDAY for grade 7 or higher', () => {
    expect(getLiturgicalContextFromGrade(7, false)).toBe('WEEKDAY')
    expect(getLiturgicalContextFromGrade(8, false)).toBe('WEEKDAY')
    expect(getLiturgicalContextFromGrade(100, false)).toBe('WEEKDAY')
  })
})

// ============================================================================
// Constant Arrays
// ============================================================================

describe('Constant Arrays', () => {
  it('SEX_VALUES contains expected values', () => {
    expect(SEX_VALUES).toContain('MALE')
    expect(SEX_VALUES).toContain('FEMALE')
    expect(SEX_VALUES).toHaveLength(2)
  })

  it('MODULE_STATUS_VALUES contains expected statuses', () => {
    expect(MODULE_STATUS_VALUES).toContain('PLANNING')
    expect(MODULE_STATUS_VALUES).toContain('ACTIVE')
    expect(MODULE_STATUS_VALUES).toContain('INACTIVE')
    expect(MODULE_STATUS_VALUES).toContain('COMPLETED')
    expect(MODULE_STATUS_VALUES).toContain('CANCELLED')
  })

  it('LITURGICAL_LANGUAGE_VALUES contains ISO codes', () => {
    expect(LITURGICAL_LANGUAGE_VALUES).toContain('en')
    expect(LITURGICAL_LANGUAGE_VALUES).toContain('es')
    expect(LITURGICAL_LANGUAGE_VALUES).toContain('la')
    expect(LITURGICAL_LANGUAGE_VALUES).toHaveLength(3)
  })

  it('LITURGICAL_COLOR_VALUES contains all colors', () => {
    expect(LITURGICAL_COLOR_VALUES).toContain('WHITE')
    expect(LITURGICAL_COLOR_VALUES).toContain('RED')
    expect(LITURGICAL_COLOR_VALUES).toContain('PURPLE')
    expect(LITURGICAL_COLOR_VALUES).toContain('GREEN')
    expect(LITURGICAL_COLOR_VALUES).toContain('GOLD')
    expect(LITURGICAL_COLOR_VALUES).toContain('ROSE')
    expect(LITURGICAL_COLOR_VALUES).toContain('BLACK')
  })

  it('DAYS_OF_WEEK_VALUES starts with Sunday', () => {
    expect(DAYS_OF_WEEK_VALUES[0]).toBe('SUNDAY')
    expect(DAYS_OF_WEEK_VALUES).toHaveLength(7)
  })

  it('LITURGICAL_CONTEXT_VALUES contains all contexts', () => {
    expect(LITURGICAL_CONTEXT_VALUES).toContain('SUNDAY')
    expect(LITURGICAL_CONTEXT_VALUES).toContain('SOLEMNITY')
    expect(LITURGICAL_CONTEXT_VALUES).toContain('FEAST')
    expect(LITURGICAL_CONTEXT_VALUES).toContain('MEMORIAL')
    expect(LITURGICAL_CONTEXT_VALUES).toContain('WEEKDAY')
  })

  it('USER_PARISH_ROLE_VALUES contains all roles', () => {
    expect(USER_PARISH_ROLE_VALUES).toContain('admin')
    expect(USER_PARISH_ROLE_VALUES).toContain('staff')
    expect(USER_PARISH_ROLE_VALUES).toContain('ministry-leader')
    expect(USER_PARISH_ROLE_VALUES).toContain('parishioner')
  })
})

// ============================================================================
// Label Lookups
// ============================================================================

describe('Label Lookups', () => {
  it('SEX_LABELS has bilingual labels', () => {
    expect(SEX_LABELS.MALE.en).toBe('Male')
    expect(SEX_LABELS.MALE.es).toBe('Masculino')
    expect(SEX_LABELS.FEMALE.en).toBe('Female')
    expect(SEX_LABELS.FEMALE.es).toBe('Femenino')
  })

  it('MODULE_STATUS_LABELS has bilingual labels', () => {
    expect(MODULE_STATUS_LABELS.ACTIVE.en).toBe('Active')
    expect(MODULE_STATUS_LABELS.ACTIVE.es).toBe('Activo')
    expect(MODULE_STATUS_LABELS.CANCELLED.en).toBe('Cancelled')
    expect(MODULE_STATUS_LABELS.CANCELLED.es).toBe('Cancelado')
  })

  it('LITURGICAL_LANGUAGE_LABELS has bilingual labels', () => {
    expect(LITURGICAL_LANGUAGE_LABELS.en.en).toBe('English')
    expect(LITURGICAL_LANGUAGE_LABELS.en.es).toBe('Inglés')
    expect(LITURGICAL_LANGUAGE_LABELS.es.en).toBe('Spanish')
    expect(LITURGICAL_LANGUAGE_LABELS.es.es).toBe('Español')
    expect(LITURGICAL_LANGUAGE_LABELS.la.en).toBe('Latin')
  })

  it('LITURGICAL_COLOR_LABELS has bilingual labels', () => {
    expect(LITURGICAL_COLOR_LABELS.WHITE.en).toBe('White')
    expect(LITURGICAL_COLOR_LABELS.WHITE.es).toBe('Blanco')
    expect(LITURGICAL_COLOR_LABELS.PURPLE.en).toBe('Purple')
    expect(LITURGICAL_COLOR_LABELS.PURPLE.es).toBe('Morado')
  })

  it('DAYS_OF_WEEK_LABELS has bilingual labels', () => {
    expect(DAYS_OF_WEEK_LABELS.SUNDAY.en).toBe('Sunday')
    expect(DAYS_OF_WEEK_LABELS.SUNDAY.es).toBe('Domingo')
    expect(DAYS_OF_WEEK_LABELS.SATURDAY.en).toBe('Saturday')
    expect(DAYS_OF_WEEK_LABELS.SATURDAY.es).toBe('Sábado')
  })

  it('USER_PARISH_ROLE_LABELS has bilingual labels', () => {
    expect(USER_PARISH_ROLE_LABELS.admin.en).toBe('Admin')
    expect(USER_PARISH_ROLE_LABELS.admin.es).toBe('Administrador')
    expect(USER_PARISH_ROLE_LABELS['ministry-leader'].en).toBe('Ministry Leader')
    expect(USER_PARISH_ROLE_LABELS['ministry-leader'].es).toBe('Líder de Ministerio')
  })

  it('LITURGICAL_CONTEXT_LABELS has bilingual labels', () => {
    expect(LITURGICAL_CONTEXT_LABELS.SOLEMNITY.en).toBe('Solemnity')
    expect(LITURGICAL_CONTEXT_LABELS.SOLEMNITY.es).toBe('Solemnidad')
    expect(LITURGICAL_CONTEXT_LABELS.WEEKDAY.en).toBe('Weekday')
    expect(LITURGICAL_CONTEXT_LABELS.WEEKDAY.es).toBe('Día de Semana')
  })
})
