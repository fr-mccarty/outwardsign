/**
 * System Types for Unified Event Data Model
 *
 * Defines the three system types that categorize all parish activities:
 * - mass: Regular and special Masses
 * - special-liturgy: Non-Mass liturgical celebrations (including sacraments like Weddings, Baptisms, etc.)
 * - event: Non-liturgical parish activities
 */

export const SYSTEM_TYPE_VALUES = ['mass', 'special-liturgy', 'event'] as const;
export type SystemType = typeof SYSTEM_TYPE_VALUES[number];

export interface SystemTypeMetadata {
  slug: SystemType;
  name_en: string;
  name_es: string;
  icon: string;
}

export const SYSTEM_TYPE_METADATA: Record<SystemType, SystemTypeMetadata> = {
  mass: {
    slug: 'mass',
    name_en: 'Masses',
    name_es: 'Misas',
    icon: 'BookOpen',
  },
  'special-liturgy': {
    slug: 'special-liturgy',
    name_en: 'Special Liturgies',
    name_es: 'Liturgias Especiales',
    icon: 'Star',
  },
  event: {
    slug: 'event',
    name_en: 'Events',
    name_es: 'Eventos',
    icon: 'CalendarDays',
  },
} as const;
