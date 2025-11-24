export const APP_NAME = 'Outward Sign'
export const APP_TAGLINE = 'Bloom in Christ'
export const GITHUB_URL = 'https://github.com/fr-mccarty/outwardsign'

// Page layout
export const PAGE_MAX_WIDTH_CLASS = 'max-w-6xl'

// Homepage language support
export const HOME_LANGUAGES = ['en', 'es'] as const
export type HomeLanguage = typeof HOME_LANGUAGES[number]
export const DEFAULT_HOME_LANGUAGE: HomeLanguage = 'en'

// General Language type (used for UI language, petition language, etc.)
// Lowercase ISO codes: en, es
export type Language = HomeLanguage

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

// Related Event Type values (stored as uppercase in database)
// These are SYSTEM-DEFINED and READ-ONLY - used when events are linked to modules
// Users cannot modify these; they are auto-populated when creating events from sacrament modules
export const RELATED_EVENT_TYPE_VALUES = [
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
] as const
export type RelatedEventType = typeof RELATED_EVENT_TYPE_VALUES[number]

// Related Event Type labels for display (system-defined, read-only)
export const RELATED_EVENT_TYPE_LABELS: Record<string, { en: string; es: string }> = {
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
  }
}

// Module Related Event Type Mapping
// Maps RELATED event types (system-defined) to their parent module for reverse lookup (event → module)
// Used to display module references on event detail pages
// These are read-only and correspond to RELATED_EVENT_TYPE_VALUES above
export const MODULE_RELATED_EVENT_TYPE_MAP: Record<string, {
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

// Liturgical Language values (lowercase ISO codes in database)
// Used for events, masses, and readings
// Lowercase ISO codes: en, es, la (Latin)
export const LITURGICAL_LANGUAGE_VALUES = ['en', 'es', 'la'] as const
export type LiturgicalLanguage = typeof LITURGICAL_LANGUAGE_VALUES[number]

// Liturgical Language labels for display
export const LITURGICAL_LANGUAGE_LABELS: Record<string, { en: string; es: string }> = {
  en: {
    en: 'English',
    es: 'Inglés'
  },
  es: {
    en: 'Spanish',
    es: 'Español'
  },
  la: {
    en: 'Latin',
    es: 'Latín'
  }
}

// Mass Status Constants
export const MASS_STATUS_VALUES = ['ACTIVE', 'PLANNING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const
export type MassStatus = typeof MASS_STATUS_VALUES[number]

// Liturgical Color Constants
export const LITURGICAL_COLOR_VALUES = ['WHITE', 'RED', 'PURPLE', 'GREEN', 'GOLD', 'ROSE', 'BLACK'] as const
export type LiturgicalColor = typeof LITURGICAL_COLOR_VALUES[number]

export const LITURGICAL_COLOR_LABELS: Record<string, { en: string; es: string }> = {
  WHITE: { en: 'White', es: 'Blanco' },
  RED: { en: 'Red', es: 'Rojo' },
  PURPLE: { en: 'Purple', es: 'Morado' },
  GREEN: { en: 'Green', es: 'Verde' },
  GOLD: { en: 'Gold', es: 'Oro' },
  ROSE: { en: 'Rose', es: 'Rosa' },
  BLACK: { en: 'Black', es: 'Negro' }
}

// Days of Week Constants (shared across modules)
export const DAYS_OF_WEEK_VALUES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const
export type DayOfWeek = typeof DAYS_OF_WEEK_VALUES[number]

export const DAYS_OF_WEEK_LABELS: Record<DayOfWeek, { en: string; es: string }> = {
  SUNDAY: { en: 'Sunday', es: 'Domingo' },
  MONDAY: { en: 'Monday', es: 'Lunes' },
  TUESDAY: { en: 'Tuesday', es: 'Martes' },
  WEDNESDAY: { en: 'Wednesday', es: 'Miércoles' },
  THURSDAY: { en: 'Thursday', es: 'Jueves' },
  FRIDAY: { en: 'Friday', es: 'Viernes' },
  SATURDAY: { en: 'Saturday', es: 'Sábado' }
}

// Liturgical Days of Week Constants (includes MOVABLE for feasts/holy days)
export const LITURGICAL_DAYS_OF_WEEK_VALUES = ['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'MOVABLE'] as const
export type LiturgicalDayOfWeek = typeof LITURGICAL_DAYS_OF_WEEK_VALUES[number]

export const LITURGICAL_DAYS_OF_WEEK_LABELS: Record<LiturgicalDayOfWeek, { en: string; es: string }> = {
  SUNDAY: { en: 'Sunday', es: 'Domingo' },
  MONDAY: { en: 'Monday', es: 'Lunes' },
  TUESDAY: { en: 'Tuesday', es: 'Martes' },
  WEDNESDAY: { en: 'Wednesday', es: 'Miércoles' },
  THURSDAY: { en: 'Thursday', es: 'Jueves' },
  FRIDAY: { en: 'Friday', es: 'Viernes' },
  SATURDAY: { en: 'Saturday', es: 'Sábado' },
  MOVABLE: { en: 'Movable', es: 'Movible' }
}

// Liturgical Context Constants (for role template mapping)
// Used to match role templates to liturgical events based on grade/type
export const LITURGICAL_CONTEXT_VALUES = ['SUNDAY', 'SOLEMNITY', 'FEAST', 'MEMORIAL', 'WEEKDAY'] as const
export type LiturgicalContext = typeof LITURGICAL_CONTEXT_VALUES[number]

export const LITURGICAL_CONTEXT_LABELS: Record<LiturgicalContext, { en: string; es: string }> = {
  SUNDAY: { en: 'Sunday', es: 'Domingo' },
  SOLEMNITY: { en: 'Solemnity', es: 'Solemnidad' },
  FEAST: { en: 'Feast', es: 'Fiesta' },
  MEMORIAL: { en: 'Memorial', es: 'Memoria' },
  WEEKDAY: { en: 'Weekday', es: 'Día de Semana' }
}

export const LITURGICAL_CONTEXT_DESCRIPTIONS: Record<LiturgicalContext, { en: string; es: string }> = {
  SUNDAY: { en: 'All Sundays throughout the year', es: 'Todos los domingos del año' },
  SOLEMNITY: { en: 'Highest rank celebrations (Easter, Christmas, etc.)', es: 'Celebraciones de rango más alto (Pascua, Navidad, etc.)' },
  FEAST: { en: 'Feasts of the Lord, Apostles, Evangelists', es: 'Fiestas del Señor, Apóstoles, Evangelistas' },
  MEMORIAL: { en: 'Obligatory and optional memorials of saints', es: 'Memorias obligatorias y opcionales de santos' },
  WEEKDAY: { en: 'Ordinary weekdays (ferial days)', es: 'Días de semana ordinarios (días feriales)' }
}

// Liturgical Grade Labels (from external calendar API)
// These map the raw grade_lcl values to properly formatted labels
export const LITURGICAL_GRADE_LABELS: Record<string, { en: string; es: string }> = {
  'celebration with precedence over solemnities': { en: 'Celebration with Precedence over Solemnities', es: 'Celebración con Precedencia sobre Solemnidades' },
  'commemoration': { en: 'Commemoration', es: 'Conmemoración' },
  'FEAST OF THE LORD': { en: 'Feast of the Lord', es: 'Fiesta del Señor' },
  'FEAST': { en: 'Feast', es: 'Fiesta' },
  'Memorial': { en: 'Memorial', es: 'Memoria' },
  'optional memorial': { en: 'Optional Memorial', es: 'Memoria Opcional' },
  'SOLEMNITY': { en: 'Solemnity', es: 'Solemnidad' },
  'weekday': { en: 'Weekday', es: 'Día de Semana' },
}

// Helper to get formatted liturgical grade label
export function getLiturgicalGradeLabel(gradeLcl: string, lang: 'en' | 'es' = 'en'): string {
  const label = LITURGICAL_GRADE_LABELS[gradeLcl]
  if (label) return label[lang]
  // Fallback: capitalize first letter of each word
  return gradeLcl.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

// Maps liturgical grade (1-7) to LiturgicalContext
// Grade 1-2: Triduum + Solemnities → SOLEMNITY
// Grade 3-4: Feasts → FEAST
// Grade 5-6: Memorials → MEMORIAL
// Grade 7: Weekdays → WEEKDAY
export function getLiturgicalContextFromGrade(grade: number, isSunday: boolean): LiturgicalContext {
  if (isSunday) return 'SUNDAY'
  if (grade <= 2) return 'SOLEMNITY'
  if (grade <= 4) return 'FEAST'
  if (grade <= 6) return 'MEMORIAL'
  return 'WEEKDAY'
}

// Months of Year Constants (shared across modules)
export const MONTHS_OF_YEAR_VALUES = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'] as const
export type MonthOfYear = typeof MONTHS_OF_YEAR_VALUES[number]

export const MONTHS_OF_YEAR_LABELS: Record<MonthOfYear, { en: string; es: string }> = {
  JANUARY: { en: 'January', es: 'Enero' },
  FEBRUARY: { en: 'February', es: 'Febrero' },
  MARCH: { en: 'March', es: 'Marzo' },
  APRIL: { en: 'April', es: 'Abril' },
  MAY: { en: 'May', es: 'Mayo' },
  JUNE: { en: 'June', es: 'Junio' },
  JULY: { en: 'July', es: 'Julio' },
  AUGUST: { en: 'August', es: 'Agosto' },
  SEPTEMBER: { en: 'September', es: 'Septiembre' },
  OCTOBER: { en: 'October', es: 'Octubre' },
  NOVEMBER: { en: 'November', es: 'Noviembre' },
  DECEMBER: { en: 'December', es: 'Diciembre' }
}

// Mass Times Schedule Type Constants
export const MASS_TIMES_SCHEDULE_TYPE_VALUES = ['WEEKEND', 'DAILY', 'HOLIDAY', 'SPECIAL'] as const
export type MassTimesScheduleType = typeof MASS_TIMES_SCHEDULE_TYPE_VALUES[number]

export const MASS_TIMES_SCHEDULE_TYPE_LABELS: Record<MassTimesScheduleType, { en: string; es: string }> = {
  WEEKEND: { en: 'Weekend', es: 'Fin de Semana' },
  DAILY: { en: 'Daily', es: 'Diario' },
  HOLIDAY: { en: 'Holiday', es: 'Día Festivo' },
  SPECIAL: { en: 'Special', es: 'Especial' }
}

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
export const QUINCEANERA_DEFAULT_TEMPLATE: QuinceaneraTemplate = 'quinceanera-full-script-spanish'

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
export const PRESENTATION_DEFAULT_TEMPLATE: PresentationTemplate = 'presentation-spanish'

export const PRESENTATION_TEMPLATE_LABELS: Record<PresentationTemplate, { en: string; es: string }> = {
  'presentation-english': { en: 'Presentation in the Temple (English)', es: 'Presentación en el Templo (Inglés)' },
  'presentation-spanish': { en: 'Presentation in the Temple (Spanish)', es: 'Presentación en el Templo (Español)' },
  'presentation-bilingual': { en: 'Bilingual Presentation (English & Spanish)', es: 'Presentación Bilingüe (Inglés y Español)' }
}

// Timezone Constants
export const DEFAULT_TIMEZONE = 'UTC' as const

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

// Mass Role Membership Type Constants
export const MASS_ROLE_MEMBERSHIP_TYPE_VALUES = ['MEMBER', 'LEADER'] as const
export type MassRoleMembershipType = typeof MASS_ROLE_MEMBERSHIP_TYPE_VALUES[number]

export const MASS_ROLE_MEMBERSHIP_TYPE_LABELS: Record<MassRoleMembershipType, { en: string; es: string }> = {
  MEMBER: { en: 'Member', es: 'Miembro' },
  LEADER: { en: 'Leader', es: 'Líder' }
}

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

// Active/Inactive Status Labels
export const ACTIVE_STATUS_LABELS = {
  en: 'Active',
  es: 'Activo'
}

export const INACTIVE_STATUS_LABELS = {
  en: 'Inactive',
  es: 'Inactivo'
}

// Dashboard Module Labels (for error messages and UI)
export const DASHBOARD_MODULE_LABELS: Record<string, { en: string; es: string }> = {
  masses: { en: 'Masses', es: 'Misas' },
  weddings: { en: 'Weddings', es: 'Bodas' },
  funerals: { en: 'Funerals', es: 'Funerales' },
  baptisms: { en: 'Baptisms', es: 'Bautismos' },
  presentations: { en: 'Presentations', es: 'Presentaciones' },
  quinceaneras: { en: 'Quinceañeras', es: 'Quinceañeras' },
  groups: { en: 'Groups', es: 'Grupos' },
  'mass-intentions': { en: 'Mass Intentions', es: 'Intenciones de Misa' }
}

// Documentation Home Page Labels
export const DOCUMENTATION_HOME_LABELS = {
  en: {
    title: 'Welcome to Outward Sign Documentation',
    subtitle: 'Everything you need to know about managing sacraments and sacramentals in your parish',
    gettingStarted: {
      title: 'Getting Started',
      description: 'New to Outward Sign? Start here to learn the basics',
      button: 'Get Started',
    },
    userGuides: {
      title: 'User Guides',
      description: 'Role-based guides for admins, staff, and parishioners',
      button: 'View Guides',
    },
    features: {
      title: 'Features',
      description: 'Explore weddings, funerals, masses, and more',
      button: 'Explore Features',
    },
    popularTopics: 'Popular Topics',
    topics: [
      { title: 'Planning a Wedding', href: '/documentation/en/features/weddings' },
      { title: 'Managing Mass Intentions', href: '/documentation/en/features/masses' },
      { title: 'Creating Events', href: '/documentation/en/user-guides/events' },
      { title: 'Managing People', href: '/documentation/en/user-guides/people' },
      { title: 'Setting up Your Parish', href: '/documentation/en/getting-started/parish-setup' },
      { title: 'Inviting Staff Members', href: '/documentation/en/user-guides/inviting-staff' },
    ],
  },
  es: {
    title: 'Bienvenido a la Documentación de Outward Sign',
    subtitle: 'Todo lo que necesita saber sobre la gestión de sacramentos y sacramentales en su parroquia',
    gettingStarted: {
      title: 'Comenzando',
      description: 'Nuevo en Outward Sign? Comience aquí para aprender lo básico',
      button: 'Comenzar',
    },
    userGuides: {
      title: 'Guías de Usuario',
      description: 'Guías basadas en roles para administradores, personal y feligreses',
      button: 'Ver Guías',
    },
    features: {
      title: 'Características',
      description: 'Explore bodas, funerales, misas y más',
      button: 'Explorar Características',
    },
    popularTopics: 'Temas Populares',
    topics: [
      { title: 'Planificación de una Boda', href: '/documentation/es/features/weddings' },
      { title: 'Gestión de Intenciones de Misa', href: '/documentation/es/features/masses' },
      { title: 'Creación de Eventos', href: '/documentation/es/user-guides/events' },
      { title: 'Gestión de Personas', href: '/documentation/es/user-guides/people' },
      { title: 'Configuración de su Parroquia', href: '/documentation/es/getting-started/parish-setup' },
      { title: 'Invitación de Miembros del Personal', href: '/documentation/es/user-guides/inviting-staff' },
    ],
  },
}

// Homepage (Landing Page) Translations
export const HOME_PAGE_TRANSLATIONS = {
  en: {
    nav: {
      features: "Features",
      sacraments: "Sacraments",
      howItWorks: "How it Works",
      documentation: "Documentation",
      login: "Login",
      getStarted: "Get Started"
    },
    hero: {
      forCatholicParishes: "For Catholic Parishes",
      freeOpenSource: "Free & Open Source",
      title: "Plan, Communicate, and Celebrate",
      titleHighlight: "Sacraments & Sacramentals with Excellence",
      subtitle: "The Sacraments and Sacramentals are the core activity of your parish. Stop juggling scattered documents, endless email chains, and last-minute scrambling. Prepare beautiful celebrations.",
      getStartedFree: "Get Started Free",
      seeHowItWorks: "See How It Works",
      disclaimer: "Free forever • No credit card required • Open source",
      problemStatement: "An outward sign instituted by Christ to give grace.",
      problemDescription: "This is the traditional Catholic definition of a sacrament. From weddings to funerals, baptisms to quinceañeras—with clear communication and proper preparation, you create moments of profound spiritual significance for individuals and the entire community."
    },
    features: {
      sectionTitle: "Everything You Need in One Place",
      sectionSubtitle: "From initial planning to the printed script in the sacristy—manage every aspect of sacrament and sacramental preparation with clarity and care.",
      sacramentManagement: {
        title: "Complete Sacrament & Sacramental Management",
        description: "Manage weddings, funerals, baptisms, presentations, and quinceañeras with dedicated workflows for each celebration type.",
        features: [
          "Custom forms for each sacrament type",
          "Track participants and family details",
          "Organize readings and liturgical elements"
        ]
      },
      scriptGeneration: {
        title: "Professional Script Generation",
        description: "Automatically generate beautiful, properly formatted liturgical scripts with readings, prayers, and all celebration details.",
        features: [
          "Complete liturgy scripts",
          "Readings with pericope references",
          "Customizable templates"
        ]
      },
      printExport: {
        title: "Print & Export Ready",
        description: "Export to PDF or Word for printing. Have beautifully formatted scripts ready in a binder for the presider to take to the sacristy.",
        features: [
          "One-click PDF generation",
          "Editable Word documents",
          "Professional typography"
        ]
      },
      calendar: {
        title: "Calendar Integration",
        description: "View all sacramental events in one calendar. Export to .ics feeds for seamless scheduling across your parish systems.",
        features: [
          "Unified parish calendar view",
          "Liturgical calendar integration",
          ".ics export for external calendars"
        ]
      },
      multilingual: {
        title: "Multilingual Support",
        description: "Serve diverse parish communities with built-in language management for all liturgical content and celebrations.",
        features: [
          "English and Spanish supported",
          "Bilingual script generation",
          "Language-specific templates"
        ]
      },
      teamCollaboration: {
        title: "Team Collaboration",
        description: "Invite team members with role-based permissions. Admins, staff, ministry-leaders, and parishioners each have appropriate access levels.",
        features: [
          "Parish team invitations with secure tokens",
          "Four-tier role system (admin, staff, ministry-leader, parishioner)",
          "Configurable module access for ministry leaders"
        ]
      },
      massScheduling: {
        title: "Mass Scheduling & Role Management",
        description: "Bulk schedule Masses over date ranges with automatic minister assignment based on preferences, availability, and workload balancing.",
        features: [
          "Wizard-based Mass scheduling for weeks or months",
          "Automatic minister assignment with preference tracking",
          "Template system for recurring role requirements"
        ]
      },
      ministryGroups: {
        title: "Ministry Groups & Directories",
        description: "Organize parish ministries and committees with role-based membership tracking and dedicated directory views.",
        features: [
          "Group member directory for ministry participants",
          "Mass role directory for liturgical ministers",
          "Role preferences and blackout date management"
        ]
      },
      freeOpenSource: {
        title: "Completely Free & Open Source",
        description: "Built for the Catholic community. Every parish deserves access to excellent sacrament preparation tools, regardless of budget. No subscriptions, no hidden fees, no limitations—ever.",
        noCost: {
          title: "No Cost",
          description: "Use all features free forever"
        },
        openSource: {
          title: "Open Source",
          description: "Transparent, community-driven code"
        },
        forAllParishes: {
          title: "For All Parishes",
          description: "Small or large, rural or urban"
        }
      }
    },
    sacraments: {
      sectionTitle: "Manage Every Sacrament & Sacramental",
      sectionSubtitle: "Dedicated workflows for each type of sacrament and sacramental your parish celebrates.",
      catechismQuote: "The sacraments are efficacious signs of grace, instituted by Christ and entrusted to the Church, by which divine life is dispensed to us.",
      catechismReference: "— Catechism of the Catholic Church (CCC 1131)",
      weddings: {
        title: "Weddings",
        description: "Bride, groom, ceremony planning, and celebration details"
      },
      funerals: {
        title: "Funerals",
        description: "Memorial planning, family support, and liturgy preparation"
      },
      baptisms: {
        title: "Baptisms",
        description: "Preparation classes, godparent tracking, celebration"
      },
      quinceaneras: {
        title: "Quinceañeras",
        description: "Cultural celebration planning and liturgical preparation"
      },
      presentations: {
        title: "Presentations",
        description: "Latino tradition celebrations and family coordination"
      }
    },
    howItWorks: {
      sectionTitle: "From Planning to Celebration",
      sectionSubtitle: "A simple, three-step process that takes you from initial planning to a beautifully prepared celebration.",
      step1: {
        title: "Plan Your Event",
        description: "Create the event, add participants, select readings and prayers. Build a complete celebration from start to finish."
      },
      step2: {
        title: "Prepare the Liturgy",
        description: "Select readings, add prayers, customize the celebration. The system generates a complete, properly formatted liturgical script."
      },
      step3: {
        title: "Print & Celebrate",
        description: "Export to PDF or Word, print the script, place it in a binder—ready for the presider to pick up and celebrate with confidence."
      }
    },
    printFeature: {
      title: "Ready for the Sacristy",
      description: "Being fully prepared means having the summary and script printed and ready in a binder for the priest, deacon, or church leader to confidently celebrate each sacrament and sacramental.",
      professionalTypography: {
        title: "Professional Typography",
        description: "Properly formatted for easy reading during liturgy"
      },
      completeScripts: {
        title: "Complete Scripts",
        description: "All readings, prayers, and celebration elements included"
      },
      exportOptions: {
        title: "Export Options",
        description: "PDF for printing, Word for editing and customization"
      },
      exampleExport: "Example Script",
      weddingCeremony: "Wedding Ceremony",
      firstReading: "First Reading",
      gospel: "Gospel",
      lector: "Lector",
      wordOfTheLord: "The word of the Lord.",
      thanksBe: "Thanks be to God.",
      fullScriptContinues: "+ Full script continues...",
      downloadPdf: "Download PDF",
      downloadWord: "Download Word"
    },
    whoItsFor: {
      sectionTitle: "Built for Parish Leaders",
      sectionSubtitle: "Designed with input from priests, deacons, and parish staff who understand the importance of beautiful, well-prepared celebrations of sacraments and sacramentals.",
      priestsDeacons: {
        title: "Priests & Deacons",
        description: "Celebrate confidently with complete, print-ready scripts"
      },
      pastoralAssociates: {
        title: "Pastoral Associates",
        description: "Coordinate families and staff throughout preparation"
      },
      liturgicalDirectors: {
        title: "Liturgical Directors",
        description: "Manage all parish liturgies from one platform"
      }
    },
    comingSoon: {
      sectionTitle: "Coming Soon",
      sectionSubtitle: "We're continuously improving Outward Sign with new features requested by parishes like yours.",
      coreSacraments: {
        title: "Additional Sacraments",
        description: "Confirmations, First Communion, and Anointing of the Sick modules"
      },
      ministryScheduling: {
        title: "Ministry Scheduling",
        description: "Assign lectors, altar servers, music ministers, and other liturgical roles to masses and sacramental celebrations with automatic conflict detection"
      },
      calendarEnhancements: {
        title: "Advanced Calendar",
        description: "Event conflict detection, recurring events, and improved parish calendar views"
      },
      notifications: {
        title: "Communication Tools",
        description: "Email and SMS notifications for families, staff, and participants"
      },
      reporting: {
        title: "Reports & Analytics",
        description: "Sacrament statistics dashboard and annual reports for parish planning"
      },
      parishionerPortal: {
        title: "Parishioner Portal",
        description: "Self-service portal for families to view and manage their sacrament information"
      }
    },
    gettingStarted: {
      title: "Ready to Get Started?",
      subtitle: "Join parishes across the country making sacrament preparation simple and beautiful. Here's how easy it is:",
      step1: {
        title: "Create Your Account",
        description: "Sign up with your email. No credit card needed, ever.",
        time: "2 minutes"
      },
      step2: {
        title: "Set Up Your Parish",
        description: "Add your parish name and basic information.",
        time: "5 minutes"
      },
      step3: {
        title: "Create Your First Event",
        description: "Follow the simple form to plan a wedding, funeral, or baptism.",
        time: "20 minutes"
      },
      step4: {
        title: "Print & Celebrate",
        description: "Export a beautiful script, print it, and you're ready for the celebration.",
        time: "2 minutes"
      },
      totalTime: "Total: 30 minutes from signup to your first printed script",
      ctaButton: "Start Now - It's Free"
    },
    finalCTA: {
      title: "Beautiful Liturgy Is Evangelization",
      subtitle: "Join parishes who are creating moments of profound spiritual significance through careful preparation, clear communication, and beautiful celebrations of these outward signs instituted by Christ to give grace.",
      getStartedFree: "Get Started Free",
      signInToYourParish: "Sign In to Your Parish",
      disclaimer: "100% Free Forever • No Credit Card • No Hidden Fees • Open Source"
    },
    footer: {
      madeWith: "Made with care for Catholic parishes",
      collaboration: "A collaborative effort between CatholicOS and Lolek Productions",
      freeForever: "Free Forever",
      openSource: "Open Source",
      viewOnGithub: "View on GitHub",
      license: "Licensed under MIT • Community-driven development"
    }
  },
  es: {
    nav: {
      features: "Características",
      sacraments: "Sacramentos",
      howItWorks: "Cómo Funciona",
      documentation: "Documentación",
      login: "Iniciar Sesión",
      getStarted: "Comenzar"
    },
    hero: {
      forCatholicParishes: "Para Parroquias Católicas",
      freeOpenSource: "Gratis y de Código Abierto",
      title: "Planifica, Comunica y Celebra",
      titleHighlight: "Sacramentos y Sacramentales con Excelencia",
      subtitle: "Los Sacramentos y Sacramentales son la actividad central de tu parroquia. Deja de hacer malabarismos con documentos dispersos, cadenas interminables de correos electrónicos y preparativos de último minuto. Prepara celebraciones hermosas.",
      getStartedFree: "Comenzar Gratis",
      seeHowItWorks: "Ver Cómo Funciona",
      disclaimer: "Gratis para siempre • No se requiere tarjeta de crédito • Código abierto",
      problemStatement: "Un signo visible instituido por Cristo para dar la gracia.",
      problemDescription: "Esta es la definición católica tradicional de un sacramento. Desde bodas hasta funerales, bautismos hasta quinceañeras—con comunicación clara y preparación adecuada, creas momentos de profundo significado espiritual para los individuos y toda la comunidad."
    },
    features: {
      sectionTitle: "Todo lo que Necesitas en un Solo Lugar",
      sectionSubtitle: "Desde la planificación inicial hasta el guion impreso en la sacristía—gestiona cada aspecto de la preparación de sacramentos y sacramentales con claridad y cuidado.",
      sacramentManagement: {
        title: "Gestión Completa de Sacramentos y Sacramentales",
        description: "Gestiona bodas, funerales, bautismos, presentaciones y quinceañeras con flujos de trabajo dedicados para cada tipo de celebración.",
        features: [
          "Formularios personalizados para cada tipo de sacramento",
          "Seguimiento de participantes y detalles familiares",
          "Organización de lecturas y elementos litúrgicos"
        ]
      },
      scriptGeneration: {
        title: "Generación Profesional de Guiones",
        description: "Genera automáticamente guiones litúrgicos hermosos y correctamente formateados con lecturas, oraciones y todos los detalles de la celebración.",
        features: [
          "Guiones litúrgicos completos",
          "Lecturas con referencias de perícopas",
          "Plantillas personalizables"
        ]
      },
      printExport: {
        title: "Listo para Imprimir y Exportar",
        description: "Exporta a PDF o Word para imprimir. Ten guiones bellamente formateados listos en una carpeta para que el presidente los lleve a la sacristía.",
        features: [
          "Generación de PDF con un clic",
          "Documentos Word editables",
          "Tipografía profesional"
        ]
      },
      calendar: {
        title: "Integración de Calendario",
        description: "Visualiza todos los eventos sacramentales en un solo calendario. Exporta a feeds .ics para una programación perfecta en todos los sistemas de tu parroquia.",
        features: [
          "Vista unificada del calendario parroquial",
          "Integración del calendario litúrgico",
          "Exportación .ics para calendarios externos"
        ]
      },
      multilingual: {
        title: "Soporte Multilingüe",
        description: "Sirve a comunidades parroquiales diversas con gestión integrada de idiomas para todo el contenido litúrgico y celebraciones.",
        features: [
          "Inglés y español disponibles",
          "Generación de guiones bilingües",
          "Plantillas específicas por idioma"
        ]
      },
      teamCollaboration: {
        title: "Colaboración en Equipo",
        description: "Invita miembros del equipo con permisos basados en roles. Administradores, personal, líderes ministeriales y feligreses tienen niveles de acceso apropiados.",
        features: [
          "Invitaciones de equipo parroquial con tokens seguros",
          "Sistema de cuatro niveles de roles",
          "Acceso configurable a módulos para líderes ministeriales"
        ]
      },
      massScheduling: {
        title: "Programación de Misas y Gestión de Roles",
        description: "Programa misas en masa durante períodos de fechas con asignación automática de ministros basada en preferencias, disponibilidad y equilibrio de carga.",
        features: [
          "Asistente de programación de misas para semanas o meses",
          "Asignación automática de ministros con seguimiento de preferencias",
          "Sistema de plantillas para requisitos de roles recurrentes"
        ]
      },
      ministryGroups: {
        title: "Grupos Ministeriales y Directorios",
        description: "Organiza ministerios y comités parroquiales con seguimiento de membresía basado en roles y vistas de directorio dedicadas.",
        features: [
          "Directorio de miembros de grupos para participantes ministeriales",
          "Directorio de roles de misa para ministros litúrgicos",
          "Gestión de preferencias de roles y fechas no disponibles"
        ]
      },
      freeOpenSource: {
        title: "Completamente Gratis y de Código Abierto",
        description: "Construido para la comunidad católica. Cada parroquia merece acceso a excelentes herramientas de preparación sacramental, independientemente del presupuesto. Sin suscripciones, sin tarifas ocultas, sin limitaciones—nunca.",
        noCost: {
          title: "Sin Costo",
          description: "Usa todas las funciones gratis para siempre"
        },
        openSource: {
          title: "Código Abierto",
          description: "Código transparente e impulsado por la comunidad"
        },
        forAllParishes: {
          title: "Para Todas las Parroquias",
          description: "Pequeñas o grandes, rurales o urbanas"
        }
      }
    },
    sacraments: {
      sectionTitle: "Gestiona Cada Sacramento y Sacramental",
      sectionSubtitle: "Flujos de trabajo dedicados para cada tipo de sacramento y sacramental que tu parroquia celebra.",
      catechismQuote: "Los sacramentos son signos eficaces de la gracia, instituidos por Cristo y confiados a la Iglesia, por los cuales nos es dispensada la vida divina.",
      catechismReference: "— Catecismo de la Iglesia Católica (CIC 1131)",
      weddings: {
        title: "Bodas",
        description: "Novia, novio, planificación de ceremonia y detalles de celebración"
      },
      funerals: {
        title: "Funerales",
        description: "Planificación de memorial, apoyo familiar y preparación litúrgica"
      },
      baptisms: {
        title: "Bautismos",
        description: "Clases de preparación, seguimiento de padrinos, celebración"
      },
      quinceaneras: {
        title: "Quinceañeras",
        description: "Planificación de celebración cultural y preparación litúrgica"
      },
      presentations: {
        title: "Presentaciones",
        description: "Celebraciones de tradición latina y coordinación familiar"
      }
    },
    howItWorks: {
      sectionTitle: "Desde la Planificación hasta la Celebración",
      sectionSubtitle: "Un proceso simple de tres pasos que te lleva desde la planificación inicial hasta una celebración bellamente preparada.",
      step1: {
        title: "Planifica tu Evento",
        description: "Crea el evento, añade participantes, selecciona lecturas y oraciones. Construye una celebración completa de principio a fin."
      },
      step2: {
        title: "Prepara la Liturgia",
        description: "Selecciona lecturas, añade oraciones, personaliza la celebración. El sistema genera un guion litúrgico completo y correctamente formateado."
      },
      step3: {
        title: "Imprime y Celebra",
        description: "Exporta a PDF o Word, imprime el guion, colócalo en una carpeta—listo para que el presidente lo recoja y celebre con confianza."
      }
    },
    printFeature: {
      title: "Listo para la Sacristía",
      description: "Estar completamente preparado significa tener el resumen y el guion impresos y listos en una carpeta para que el sacerdote, diácono o líder de la iglesia celebre con confianza cada sacramento y sacramental.",
      professionalTypography: {
        title: "Tipografía Profesional",
        description: "Correctamente formateado para lectura fácil durante la liturgia"
      },
      completeScripts: {
        title: "Guiones Completos",
        description: "Todas las lecturas, oraciones y elementos de celebración incluidos"
      },
      exportOptions: {
        title: "Opciones de Exportación",
        description: "PDF para imprimir, Word para editar y personalizar"
      },
      exampleExport: "Ejemplo de Guion",
      weddingCeremony: "Ceremonia de Boda",
      firstReading: "Primera Lectura",
      gospel: "Evangelio",
      lector: "Lector",
      wordOfTheLord: "Palabra de Dios.",
      thanksBe: "Te alabamos, Señor.",
      fullScriptContinues: "+ El guion completo continúa...",
      downloadPdf: "Descargar PDF",
      downloadWord: "Descargar Word"
    },
    whoItsFor: {
      sectionTitle: "Construido para Líderes Parroquiales",
      sectionSubtitle: "Diseñado con el aporte de sacerdotes, diáconos y personal parroquial que comprenden la importancia de celebraciones hermosas y bien preparadas de sacramentos y sacramentales.",
      priestsDeacons: {
        title: "Sacerdotes y Diáconos",
        description: "Celebra con confianza con guiones completos y listos para imprimir"
      },
      pastoralAssociates: {
        title: "Asociados Pastorales",
        description: "Coordina familias y personal durante toda la preparación"
      },
      liturgicalDirectors: {
        title: "Directores Litúrgicos",
        description: "Gestiona todas las liturgias parroquiales desde una plataforma"
      }
    },
    comingSoon: {
      sectionTitle: "Próximamente",
      sectionSubtitle: "Estamos mejorando continuamente Outward Sign con nuevas funciones solicitadas por parroquias como la tuya.",
      coreSacraments: {
        title: "Sacramentos Adicionales",
        description: "Módulos de Confirmaciones, Primera Comunión y Unción de los Enfermos"
      },
      ministryScheduling: {
        title: "Programación de Ministerios",
        description: "Asigna lectores, monaguillos, ministros de música y otros roles litúrgicos a misas y celebraciones sacramentales con detección automática de conflictos"
      },
      calendarEnhancements: {
        title: "Calendario Avanzado",
        description: "Detección de conflictos de eventos, eventos recurrentes y vistas mejoradas del calendario parroquial"
      },
      notifications: {
        title: "Herramientas de Comunicación",
        description: "Notificaciones por correo electrónico y SMS para familias, personal y participantes"
      },
      reporting: {
        title: "Informes y Análisis",
        description: "Panel de estadísticas de sacramentos e informes anuales para la planificación parroquial"
      },
      parishionerPortal: {
        title: "Portal de Feligreses",
        description: "Portal de autoservicio para que las familias vean y gestionen su información sacramental"
      }
    },
    gettingStarted: {
      title: "¿Listo para Comenzar?",
      subtitle: "Únete a parroquias en todo el país que hacen que la preparación sacramental sea simple y hermosa. Así de fácil es:",
      step1: {
        title: "Crea tu Cuenta",
        description: "Regístrate con tu correo electrónico. No necesitas tarjeta de crédito, nunca.",
        time: "2 minutos"
      },
      step2: {
        title: "Configura tu Parroquia",
        description: "Añade el nombre de tu parroquia e información básica.",
        time: "5 minutos"
      },
      step3: {
        title: "Crea tu Primer Evento",
        description: "Sigue el formulario simple para planificar una boda, funeral o bautismo.",
        time: "20 minutos"
      },
      step4: {
        title: "Imprime y Celebra",
        description: "Exporta un guion hermoso, imprímelo y estás listo para la celebración.",
        time: "2 minutos"
      },
      totalTime: "Total: 30 minutos desde el registro hasta tu primer guion impreso",
      ctaButton: "Comenzar Ahora - Es Gratis"
    },
    finalCTA: {
      title: "La Liturgia Hermosa Es Evangelización",
      subtitle: "Únete a las parroquias que están creando momentos de profundo significado espiritual a través de una preparación cuidadosa, comunicación clara y celebraciones hermosas de estos signos visibles instituidos por Cristo para dar la gracia.",
      getStartedFree: "Comenzar Gratis",
      signInToYourParish: "Inicia Sesión en tu Parroquia",
      disclaimer: "100% Gratis Para Siempre • Sin Tarjeta de Crédito • Sin Tarifas Ocultas • Código Abierto"
    },
    footer: {
      madeWith: "Hecho con cuidado para parroquias católicas",
      collaboration: "Un esfuerzo colaborativo entre CatholicOS y Lolek Productions",
      freeForever: "Gratis Para Siempre",
      openSource: "Código Abierto",
      viewOnGithub: "Ver en GitHub",
      license: "Licenciado bajo MIT • Desarrollo impulsado por la comunidad"
    }
  }
}

// Liturgical Calendar Constants
// Total width (in pixels) for liturgical color bars across all calendar views
// Individual bar width = LITURGICAL_COLOR_BAR_TOTAL_WIDTH / number of colors
export const LITURGICAL_COLOR_BAR_TOTAL_WIDTH = 12

// Liturgical Calendar API Color Mapping
// Maps color strings from the liturgical calendar API to our CSS variable color names
export const LITURGICAL_CALENDAR_API_COLOR_MAPPING: Record<string, string> = {
  'white': 'liturgy-white',
  'red': 'liturgy-red',
  'purple': 'liturgy-purple',
  'violet': 'liturgy-purple', // violet maps to purple
  'green': 'liturgy-green',
  'gold': 'liturgy-gold',
  'rose': 'liturgy-rose',
  'black': 'liturgy-black'
}
