/**
 * System Types for Unified Event Data Model
 *
 * Defines the three system types that categorize all parish activities:
 * - mass-liturgy: Regular and special Masses
 * - special-liturgy: Non-Mass liturgical celebrations (including sacraments like Weddings, Baptisms, etc.)
 * - parish-event: Non-liturgical parish activities
 */

export const SYSTEM_TYPE_VALUES = ['mass-liturgy', 'special-liturgy', 'parish-event'] as const;
export type SystemType = typeof SYSTEM_TYPE_VALUES[number];

export interface SystemTypeMetadata {
  slug: SystemType;
  name_en: string;
  name_es: string;
  icon: string;
}

export const SYSTEM_TYPE_METADATA: Record<SystemType, SystemTypeMetadata> = {
  'mass-liturgy': {
    slug: 'mass-liturgy',
    name_en: 'Mass Liturgies',
    name_es: 'Liturgias de Misa',
    icon: 'BookOpen',
  },
  'special-liturgy': {
    slug: 'special-liturgy',
    name_en: 'Special Liturgies',
    name_es: 'Liturgias Especiales',
    icon: 'Star',
  },
  'parish-event': {
    slug: 'parish-event',
    name_en: 'Parish Events',
    name_es: 'Eventos Parroquiales',
    icon: 'CalendarDays',
  },
} as const;
