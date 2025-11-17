export const APP_NAME = 'Outward Sign'
export const APP_TAGLINE = 'Bloom in Christ'
export const GITHUB_URL = 'https://github.com/fr-mccarty/outwardsign'

// Homepage language support
export const HOME_LANGUAGES = ['en', 'es'] as const
export type HomeLanguage = typeof HOME_LANGUAGES[number]
export const DEFAULT_HOME_LANGUAGE: HomeLanguage = 'en'

// Sex values (stored as uppercase in database)
export const SEX_VALUES = ['MALE', 'FEMALE'] as const
export type Sex = typeof SEX_VALUES[number]

// Sex labels for display
export const SEX_LABELS: Record<Sex, { en: string; es: string }> = {
  MALE: {
    en: 'Male',
    es: 'Masculino'
  },
  FEMALE: {
    en: 'Female',
    es: 'Femenino'
  }
}

// Status values (stored as uppercase in database) - shared across all modules who use a general approach
export const MODULE_STATUS_VALUES = ['PLANNING', 'ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED'] as const
export type ModuleStatus = typeof MODULE_STATUS_VALUES[number]

// Status labels for display - shared across all modules
export const MODULE_STATUS_LABELS: Record<string, { en: string; es: string }> = {
  PLANNING: { en: 'Planning', es: 'Planificación' },
  ACTIVE: { en: 'Active', es: 'Activo' },
  INACTIVE: { en: 'Inactive', es: 'Inactivo' },
  COMPLETED: { en: 'Completed', es: 'Completado' },
  CANCELLED: { en: 'Cancelled', es: 'Cancelado' },

  // Mass statuses (additional to module statuses)
  SCHEDULED: { en: 'Scheduled', es: 'Programado' },

  // Mass intention statuses
  REQUESTED: { en: 'Requested', es: 'Solicitado' },
  CONFIRMED: { en: 'Confirmed', es: 'Confirmado' },
  FULFILLED: { en: 'Fulfilled', es: 'Cumplido' }
}

// Event type values (stored as uppercase in database)
export const EVENT_TYPE_VALUES = [
  // Wedding-related events
  'WEDDING',
  'WEDDING_RECEPTION',
  'WEDDING_REHEARSAL',
  'WEDDING_REHEARSAL_DINNER',

  // Funeral-related events
  'FUNERAL',
  'FUNERAL_MEAL',

  // Quinceañera-related events
  'QUINCEANERA',
  'QUINCEANERA_RECEPTION',

  // Other sacramental events
  'PRESENTATION',
  'BAPTISM',
  'MASS',

  // General parish events
  'RECEPTION',
  'MEETING',
  'MEAL',
  'EVENT',
  'OTHER'
] as const
export type EventType = typeof EVENT_TYPE_VALUES[number]

// Event type labels for display
export const EVENT_TYPE_LABELS: Record<string, { en: string; es: string }> = {
  // Wedding-related events
  WEDDING: {
    en: 'Wedding',
    es: 'Boda'
  },
  WEDDING_RECEPTION: {
    en: 'Wedding Reception',
    es: 'Recepción de Boda'
  },
  WEDDING_REHEARSAL: {
    en: 'Wedding Rehearsal',
    es: 'Ensayo de Boda'
  },
  WEDDING_REHEARSAL_DINNER: {
    en: 'Wedding Rehearsal Dinner',
    es: 'Cena de Ensayo de Boda'
  },

  // Funeral-related events
  FUNERAL: {
    en: 'Funeral',
    es: 'Funeral'
  },
  FUNERAL_MEAL: {
    en: 'Funeral Meal',
    es: 'Comida Funeral'
  },

  // Quinceañera-related events
  QUINCEANERA: {
    en: 'Quinceañera',
    es: 'Quinceañera'
  },
  QUINCEANERA_RECEPTION: {
    en: 'Quinceañera Reception',
    es: 'Recepción de Quinceañera'
  },

  // Other sacramental events
  PRESENTATION: {
    en: 'Presentation',
    es: 'Presentación'
  },
  BAPTISM: {
    en: 'Baptism',
    es: 'Bautismo'
  },
  MASS: {
    en: 'Mass',
    es: 'Misa'
  },

  // General parish events
  RECEPTION: {
    en: 'Reception',
    es: 'Recepción'
  },
  MEETING: {
    en: 'Meeting',
    es: 'Reunión'
  },
  MEAL: {
    en: 'Meal',
    es: 'Comida'
  },
  EVENT: {
    en: 'Event',
    es: 'Evento'
  },
  OTHER: {
    en: 'Other',
    es: 'Otro'
  }
}

// Module Event Type Mapping
// Maps event types to their parent module for reverse lookup (event → module)
// Used to display module references on event detail pages
export const MODULE_EVENT_TYPE_MAP: Record<string, {
  module: 'weddings' | 'funerals' | 'presentations' | 'quinceaneras' | 'mass-intentions'
  column: string
  display: { en: string; es: string }
}> = {
  // Wedding module events
  WEDDING: {
    module: 'weddings',
    column: 'wedding_event_id',
    display: { en: 'Wedding', es: 'Boda' }
  },
  WEDDING_RECEPTION: {
    module: 'weddings',
    column: 'reception_event_id',
    display: { en: 'Wedding Reception', es: 'Recepción de Boda' }
  },
  WEDDING_REHEARSAL: {
    module: 'weddings',
    column: 'rehearsal_event_id',
    display: { en: 'Wedding Rehearsal', es: 'Ensayo de Boda' }
  },
  WEDDING_REHEARSAL_DINNER: {
    module: 'weddings',
    column: 'rehearsal_dinner_event_id',
    display: { en: 'Wedding Rehearsal Dinner', es: 'Cena de Ensayo de Boda' }
  },

  // Funeral module events
  FUNERAL: {
    module: 'funerals',
    column: 'funeral_event_id',
    display: { en: 'Funeral', es: 'Funeral' }
  },
  FUNERAL_MEAL: {
    module: 'funerals',
    column: 'funeral_meal_event_id',
    display: { en: 'Funeral Meal', es: 'Comida Funeral' }
  },

  // Presentation module events
  PRESENTATION: {
    module: 'presentations',
    column: 'presentation_event_id',
    display: { en: 'Presentation', es: 'Presentación' }
  },

  // Quinceañera module events
  QUINCEANERA: {
    module: 'quinceaneras',
    column: 'quinceanera_event_id',
    display: { en: 'Quinceañera', es: 'Quinceañera' }
  },
  QUINCEANERA_RECEPTION: {
    module: 'quinceaneras',
    column: 'quinceanera_reception_id',
    display: { en: 'Quinceañera Reception', es: 'Recepción de Quinceañera' }
  },

  // Mass Intentions (special case: uses liturgical_event_id)
  MASS: {
    module: 'mass-intentions',
    column: 'liturgical_event_id',
    display: { en: 'Mass Intention', es: 'Intención de Misa' }
  }
}

// Reading Categories
// Store uppercase keys (WEDDING, FUNERAL, BAPTISM) in the database
// Display localized labels using READING_CATEGORY_LABELS[category][lang]
// TODO: When implementing language selection, use: READING_CATEGORY_LABELS[category][selectedLanguage]
export const READING_CATEGORIES = ['WEDDING', 'FUNERAL', 'BAPTISM', 'QUINCEANERA', 'FIRST_READING', 'SECOND_READING', 'PSALM', 'GOSPEL'] as const
export type ReadingCategory = typeof READING_CATEGORIES[number]

export const READING_CATEGORY_LABELS: Record<string, { en: string; es: string }> = {
  WEDDING: {
    en: 'Wedding',
    es: 'Boda'
  },
  FUNERAL: {
    en: 'Funeral',
    es: 'Funeral'
  },
  BAPTISM: {
    en: 'Baptism',
    es: 'Bautismo'
  },
  QUINCEANERA: {
    en: 'Quinceañera',
    es: 'Quinceañera'
  },
  FIRST_READING: {
    en: 'First Reading',
    es: 'Primera Lectura'
  },
  SECOND_READING: {
    en: 'Second Reading',
    es: 'Segunda Lectura'
  },
  PSALM: {
    en: 'Psalm',
    es: 'Salmo'
  },
  GOSPEL: {
    en: 'Gospel',
    es: 'Evangelio'
  }
}

// Language values (stored as uppercase in database)
export const LANGUAGE_VALUES = ['ENGLISH', 'SPANISH', 'LATIN'] as const
export type Language = typeof LANGUAGE_VALUES[number]

// Language labels for display
export const LANGUAGE_LABELS: Record<string, { en: string; es: string }> = {
  ENGLISH: {
    en: 'English',
    es: 'Inglés'
  },
  SPANISH: {
    en: 'Spanish',
    es: 'Español'
  },
  LATIN: {
    en: 'Latin',
    es: 'Latín'
  }
}

// Mass Status Constants
export const MASS_STATUS_VALUES = ['ACTIVE', 'PLANNING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const
export type MassStatus = typeof MASS_STATUS_VALUES[number]

// Mass Template Constants
export const MASS_TEMPLATE_VALUES = ['mass-full-script-english', 'mass-full-script-spanish'] as const
export type MassTemplate = typeof MASS_TEMPLATE_VALUES[number]
export const MASS_DEFAULT_TEMPLATE: MassTemplate = 'mass-full-script-english'

export const MASS_TEMPLATE_LABELS: Record<MassTemplate, { en: string; es: string }> = {
  'mass-full-script-english': { en: 'Full Script (English)', es: 'Guion Completo (Inglés)' },
  'mass-full-script-spanish': { en: 'Full Script (Spanish)', es: 'Guion Completo (Español)' }
}

// Wedding Template Constants
export const WEDDING_TEMPLATE_VALUES = ['wedding-full-script-english', 'wedding-full-script-spanish'] as const
export type WeddingTemplate = typeof WEDDING_TEMPLATE_VALUES[number]
export const WEDDING_DEFAULT_TEMPLATE: WeddingTemplate = 'wedding-full-script-english'

export const WEDDING_TEMPLATE_LABELS: Record<WeddingTemplate, { en: string; es: string }> = {
  'wedding-full-script-english': { en: 'Full Ceremony Script (English)', es: 'Guión Completo de la Ceremonia (Inglés)' },
  'wedding-full-script-spanish': { en: 'Full Ceremony Script (Spanish)', es: 'Guión Completo de la Ceremonia (Español)' }
}

// Quinceañera Template Constants
export const QUINCEANERA_TEMPLATE_VALUES = ['quinceanera-full-script-english', 'quinceanera-full-script-spanish'] as const
export type QuinceaneraTemplate = typeof QUINCEANERA_TEMPLATE_VALUES[number]
export const QUINCEANERA_DEFAULT_TEMPLATE: QuinceaneraTemplate = 'quinceanera-full-script-english'

export const QUINCEANERA_TEMPLATE_LABELS: Record<QuinceaneraTemplate, { en: string; es: string }> = {
  'quinceanera-full-script-english': { en: 'Full Ceremony Script (English)', es: 'Guión Completo de la Ceremonia (Inglés)' },
  'quinceanera-full-script-spanish': { en: 'Full Ceremony Script (Spanish)', es: 'Guión Completo de la Ceremonia (Español)' }
}

// Funeral Template Constants
export const FUNERAL_TEMPLATE_VALUES = ['funeral-full-script-english', 'funeral-full-script-spanish'] as const
export type FuneralTemplate = typeof FUNERAL_TEMPLATE_VALUES[number]
export const FUNERAL_DEFAULT_TEMPLATE: FuneralTemplate = 'funeral-full-script-english'

export const FUNERAL_TEMPLATE_LABELS: Record<FuneralTemplate, { en: string; es: string }> = {
  'funeral-full-script-english': { en: 'Full Funeral Liturgy Script (English)', es: 'Guión Completo de la Liturgia Fúnebre (Inglés)' },
  'funeral-full-script-spanish': { en: 'Full Funeral Liturgy Script (Spanish)', es: 'Guión Completo de la Liturgia Fúnebre (Español)' }
}

// Baptism Template Constants
export const BAPTISM_TEMPLATE_VALUES = ['baptism-summary-english', 'baptism-summary-spanish'] as const
export type BaptismTemplate = typeof BAPTISM_TEMPLATE_VALUES[number]
export const BAPTISM_DEFAULT_TEMPLATE: BaptismTemplate = 'baptism-summary-english'

export const BAPTISM_TEMPLATE_LABELS: Record<BaptismTemplate, { en: string; es: string }> = {
  'baptism-summary-english': { en: 'Baptism Summary (English)', es: 'Resumen del Bautismo (Inglés)' },
  'baptism-summary-spanish': { en: 'Baptism Summary (Spanish)', es: 'Resumen del Bautismo (Español)' }
}

// Presentation Template Constants
export const PRESENTATION_TEMPLATE_VALUES = ['presentation-english', 'presentation-spanish', 'presentation-bilingual'] as const
export type PresentationTemplate = typeof PRESENTATION_TEMPLATE_VALUES[number]
export const PRESENTATION_DEFAULT_TEMPLATE: PresentationTemplate = 'presentation-english'

export const PRESENTATION_TEMPLATE_LABELS: Record<PresentationTemplate, { en: string; es: string }> = {
  'presentation-english': { en: 'Presentation in the Temple (English)', es: 'Presentación en el Templo (Inglés)' },
  'presentation-spanish': { en: 'Presentation in the Temple (Spanish)', es: 'Presentación en el Templo (Español)' },
  'presentation-bilingual': { en: 'Bilingual Presentation (English & Spanish)', es: 'Presentación Bilingüe (Inglés y Español)' }
}

// Mass Intention Template Constants
export const MASS_INTENTION_TEMPLATE_VALUES = ['mass-intention-summary-english', 'mass-intention-summary-spanish'] as const
export type MassIntentionTemplate = typeof MASS_INTENTION_TEMPLATE_VALUES[number]
export const MASS_INTENTION_DEFAULT_TEMPLATE: MassIntentionTemplate = 'mass-intention-summary-english'

export const MASS_INTENTION_TEMPLATE_LABELS: Record<MassIntentionTemplate, { en: string; es: string }> = {
  'mass-intention-summary-english': { en: 'Mass Intention Summary (English)', es: 'Resumen de Intención de Misa (Inglés)' },
  'mass-intention-summary-spanish': { en: 'Mass Intention Summary (Spanish)', es: 'Resumen de Intención de Misa (Español)' }
}

// Mass Intention Status Constants
export const MASS_INTENTION_STATUS_VALUES = ['REQUESTED', 'CONFIRMED', 'FULFILLED', 'CANCELLED'] as const
export type MassIntentionStatus = typeof MASS_INTENTION_STATUS_VALUES[number]

// ============================================================================
// PARISH ROLES
// ============================================================================
// User Parish Roles - Roles for parish team members (stored in parish_users table)

export const USER_PARISH_ROLE_VALUES = ['admin', 'staff', 'ministry-leader', 'parishioner'] as const
export type UserParishRoleType = typeof USER_PARISH_ROLE_VALUES[number]

export const USER_PARISH_ROLE_LABELS: Record<UserParishRoleType, { en: string; es: string }> = {
  admin: { en: 'Admin', es: 'Administrador' },
  staff: { en: 'Staff', es: 'Personal' },
  'ministry-leader': { en: 'Ministry Leader', es: 'Líder de Ministerio' },
  parishioner: { en: 'Parishioner', es: 'Feligrés' }
}

// ============================================================================
// MASS ROLES
// ============================================================================
// Mass roles are stored in the database as parish-specific entities.
// Each parish can create and manage their own mass roles in the mass_roles table.
// See: src/lib/actions/mass-roles.ts for CRUD operations
// Default roles are seeded during parish creation in src/lib/actions/setup.ts

// ============================================================================
// PETITION TEMPLATES
// ============================================================================
// Module categorization and language support for petition templates

// Petition Template Module Constants
export const PETITION_MODULE_VALUES = [
  'mass',
  'wedding',
  'funeral',
  'baptism',
  'presentation',
  'quinceanera',
  'mass-intention'
] as const

export type PetitionModule = typeof PETITION_MODULE_VALUES[number]

export const PETITION_MODULE_LABELS: Record<PetitionModule, { en: string; es: string }> = {
  'mass': { en: 'Mass', es: 'Misa' },
  'wedding': { en: 'Wedding', es: 'Boda' },
  'funeral': { en: 'Funeral', es: 'Funeral' },
  'baptism': { en: 'Baptism', es: 'Bautismo' },
  'presentation': { en: 'Presentation', es: 'Presentación' },
  'quinceanera': { en: 'Quinceañera', es: 'Quinceañera' },
  'mass-intention': { en: 'Mass Intention', es: 'Intención de Misa' }
}

// Petition Template Language Constants
export const PETITION_LANGUAGE_VALUES = ['en', 'es', 'bilingual'] as const
export type PetitionLanguage = typeof PETITION_LANGUAGE_VALUES[number]

export const PETITION_LANGUAGE_LABELS: Record<PetitionLanguage, { en: string; es: string }> = {
  'en': { en: 'English', es: 'Inglés' },
  'es': { en: 'Spanish', es: 'Español' },
  'bilingual': { en: 'Bilingual', es: 'Bilingüe' }
}
