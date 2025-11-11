export const APP_NAME = 'Outward Sign'
export const APP_TAGLINE = 'Bloom in Christ'
export const GITHUB_URL = 'https://github.com/fr-mccarty/outwardsign'

// Homepage language support
export const HOME_LANGUAGES = ['en', 'es'] as const
export type HomeLanguage = typeof HOME_LANGUAGES[number]
export const DEFAULT_HOME_LANGUAGE: HomeLanguage = 'en'

export const DEFAULT_PETITION_CONTEXT_SUNDAY_ENGLISH = `For our Holy Father, Pope Leo, our Bishop, and all the clergy.
For our nation's leaders and all who serve in public office.
For peace in our world and protection of the innocent.
For the unemployed and those struggling with financial hardship.
For the sick and those who minister to them.
For our young people and all who guide them.
For our deceased parishioners and all who have gone before us.
For our parish community and all our special intentions.`

export const DEFAULT_PETITION_CONTEXT_SUNDAY_SPANISH = `Por nuestro Santo Padre, el Papa Leo, nuestro Obispo, y todo el clero.
Roguemos al Señor.
Por los líderes de nuestra nación y todos los que sirven en cargos públicos.
Roguemos al Señor.
Por la paz en nuestro mundo y la protección de los inocentes.
Roguemos al Señor.
Por los desempleados y aquellos que luchan con dificultades económicas.
Roguemos al Señor.
Por los enfermos y aquellos que los atienden.
Roguemos al Señor.
Por nuestros jóvenes y todos los que los guían.
Roguemos al Señor.
Por nuestros feligreses fallecidos y todos los que nos han precedido.
Roguemos al Señor.
Por nuestra comunidad parroquial y todas nuestras intenciones especiales.
Roguemos al Señor.`

export const DEFAULT_PETITION_CONTEXT_DAILY = `For our Holy Father, Pope Leo, our Bishop, and all the clergy.
For peace in our world and an end to all violence and hatred.
For the sick, the suffering, and those who care for them.
For our deceased brothers and sisters, especially those who have recently died.
For our community and all our intentions.`

export const DEFAULT_PETITION_CONTEXT_WEDDING_ENGLISH = `That he will bless their covenant
as he chose to sanctify marriage at Cana in Galilee,
let us pray to the Lord.
That they be granted perfect and fruitful love,
peace and strength,
and that they bear faithful witness to the name of Christian,
let us pray to the Lord.
That the Christian people
may grow in virtue day by day
and that all who are burdened by any need
may receive the help of grace from above,
let us pray to the Lord.
That the grace of the Sacrament
will be renewed by the Holy Spirit
in all married persons here present,
let us pray to the Lord.`

export const DEFAULT_PETITION_CONTEXT_WEDDING_SPANISH = `Por sus familiares y amigos
y por todos los que les han ayudado a Hegar a este dia.
Roguemos al Senor.
Por todos los jovenes
que se preparan para el Matrimonio, y por
todos aquellos
a quienes Dios ha llamado a otra vocacidn.
Roguemos al Senor.
Por todas las familias del mundo,
y por la paz entre todos los seres humanos.
Roguemos al Senor.
Por nuestros parientes y amigos difuntos,
y por todos los fieles que han muerto.
Roguemos al Senor.`

export const DEFAULT_PETITION_CONTEXT_FUNERAL_ENGLISH = `For [Name of Deceased], that they may rest in eternal peace.
For the family and friends who mourn, that they may find comfort in God's love.
For all the faithful departed, especially those who have no one to pray for them.
For those who minister to the grieving and dying.
For our community, that we may support one another in times of loss.
For all who are sick and approaching death.
For ourselves, that we may be prepared for our own journey to eternal life.`

export const DEFAULT_PETITION_CONTEXT_FUNERAL_SPANISH = `Por [Nombre del Difunto], para que descanse en paz eterna.
Roguemos al Señor.
Por la familia y amigos que lloran, para que encuentren consuelo en el amor de Dios.
Roguemos al Señor.
Por todos los fieles difuntos, especialmente por aquellos que no tienen quien rece por ellos.
Roguemos al Señor.
Por aquellos que ministran a los afligidos y moribundos.
Roguemos al Señor.
Por nuestra comunidad, para que nos apoyemos unos a otros en tiempos de pérdida.
Roguemos al Señor.
Por todos los que están enfermos y se acercan a la muerte.
Roguemos al Señor.
Por nosotros mismos, para que estemos preparados para nuestro propio viaje a la vida eterna.
Roguemos al Señor.`

export const DEFAULT_PETITION_CONTEXT_QUINCEANERA_ENGLISH = `For [Name], that she may grow in faith and wisdom as she begins this new chapter of her life.
For her family, that they may continue to guide and support her with love and faith.
For all young women entering adulthood, that they may find strength in God's grace.
For our parish youth, that they may be inspired by this celebration of faith.
For those who have helped prepare this celebration, that they may be blessed.
For our community, that we may support one another in faith and love.`

export const DEFAULT_PETITION_CONTEXT_QUINCEANERA_SPANISH = `Por [Nombre], para que crezca en fe y sabiduría al comenzar este nuevo capítulo de su vida.
Roguemos al Señor.
Por su familia, para que continúen guiándola y apoyándola con amor y fe.
Roguemos al Señor.
Por todas las jóvenes que entran a la edad adulta, para que encuentren fuerza en la gracia de Dios.
Roguemos al Señor.
Por los jóvenes de nuestra parroquia, para que se inspiren en esta celebración de fe.
Roguemos al Señor.
Por aquellos que han ayudado a preparar esta celebración, para que sean bendecidos.
Roguemos al Señor.
Por nuestra comunidad, para que nos apoyemos unos a otros en fe y amor.
Roguemos al Señor.`

export const DEFAULT_PETITION_CONTEXT_PRESENTATION_ENGLISH = `For [Child Name], that they may grow in faith and in the knowledge of God's love.
For the parents, that they may be faithful witnesses of Christ to their child.
For all families, that they may find strength and joy in their faith journey together.
For our parish community, that we may support one another in living out our baptismal promises.
For all children, that they may be protected and blessed by God's grace.`

export const DEFAULT_PETITION_CONTEXT_PRESENTATION_SPANISH = `Por [Nombre del Niño/a], para que crezca en la fe y en el conocimiento del amor de Dios.
Roguemos al Señor.
Por los padres, para que sean testigos fieles de Cristo para su hijo/a.
Roguemos al Señor.
Por todas las familias, para que encuentren fuerza y alegría en su camino de fe juntos.
Roguemos al Señor.
Por nuestra comunidad parroquial, para que nos apoyemos unos a otros en vivir nuestras promesas bautismales.
Roguemos al Señor.
Por todos los niños, para que sean protegidos y bendecidos por la gracia de Dios.
Roguemos al Señor.`

// Status values (stored as uppercase in database) - shared across all modules
export const MODULE_STATUS_VALUES = ['ACTIVE', 'INACTIVE', 'COMPLETED'] as const

// Status labels for display - shared across all modules
export const MODULE_STATUS_LABELS: Record<string, { en: string; es: string }> = {
  ACTIVE: {
    en: 'Active',
    es: 'Activo'
  },
  INACTIVE: {
    en: 'Inactive',
    es: 'Inactivo'
  },
  COMPLETED: {
    en: 'Completed',
    es: 'Completado'
  }
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
  'MEETING',
  'EVENT',
  'OTHER'
] as const

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
  MEETING: {
    en: 'Meeting',
    es: 'Reunión'
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
export const MASS_STATUS_VALUES = ['PLANNING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const
export type MassStatus = typeof MASS_STATUS_VALUES[number]

export const MASS_STATUS_LABELS: Record<MassStatus, { en: string; es: string }> = {
  PLANNING: { en: 'Planning', es: 'Planificación' },
  SCHEDULED: { en: 'Scheduled', es: 'Programado' },
  COMPLETED: { en: 'Completed', es: 'Completado' },
  CANCELLED: { en: 'Cancelled', es: 'Cancelado' }
}

// Mass Template Constants
export const MASS_TEMPLATE_VALUES = ['mass-full-script-english', 'mass-full-script-spanish', 'mass-readings-only'] as const
export type MassTemplate = typeof MASS_TEMPLATE_VALUES[number]

export const MASS_TEMPLATE_LABELS: Record<MassTemplate, { en: string; es: string }> = {
  'mass-full-script-english': { en: 'Full Script (English)', es: 'Guion Completo (Inglés)' },
  'mass-full-script-spanish': { en: 'Full Script (Spanish)', es: 'Guion Completo (Español)' },
  'mass-readings-only': { en: 'Readings Only', es: 'Solo Lecturas' }
}

// Mass Intention Status Constants
export const MASS_INTENTION_STATUS_VALUES = ['REQUESTED', 'CONFIRMED', 'FULFILLED', 'CANCELLED'] as const
export type MassIntentionStatus = typeof MASS_INTENTION_STATUS_VALUES[number]

export const MASS_INTENTION_STATUS_LABELS: Record<MassIntentionStatus, { en: string; es: string }> = {
  REQUESTED: { en: 'Requested', es: 'Solicitado' },
  CONFIRMED: { en: 'Confirmed', es: 'Confirmado' },
  FULFILLED: { en: 'Fulfilled', es: 'Cumplido' },
  CANCELLED: { en: 'Cancelled', es: 'Cancelado' }
}

// Role Labels (for display purposes)
export const ROLE_LABELS: Record<string, { en: string; es: string }> = {
  LECTOR: { en: 'Lector', es: 'Lector' },
  EMHC: { en: 'Extraordinary Minister of Holy Communion', es: 'Ministro Extraordinario de la Comunión' },
  ALTAR_SERVER: { en: 'Altar Server', es: 'Monaguillo' },
  CANTOR: { en: 'Cantor', es: 'Cantor' },
  USHER: { en: 'Usher', es: 'Ujier' },
  SACRISTAN: { en: 'Sacristan', es: 'Sacristán' },
  MUSIC_MINISTER: { en: 'Music Minister', es: 'Ministro de Música' }
}
