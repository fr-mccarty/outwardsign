export interface Petition {
  id: string
  parish_id: string
  title: string
  date: string
  language: string
  text?: string // Main petition text content
  details?: string // Additional details for the petition
  template?: string // Reference to template used
  created_at: string
  updated_at: string
  // Deprecated fields for backward compatibility
  generated_content?: string // Alias for text
  petition_text?: string // Alias for text  
  context?: string // Deprecated - data now in details
}

export interface PetitionContext {
  id: string
  petition_id: string
  parish_id: string
  details: string
  created_at: string
  updated_at: string
}

export interface CreatePetitionData {
  title: string
  date: string
  language: string
  details: string
  templateId?: string // Optional petition template ID to copy from
  template?: string // Optional template content directly
}

export interface PetitionSettings {
  id: string
  parish_id: string
  daily_mass: string
  sunday_mass: string
  wedding: string
  funeral: string
  created_at: string
  updated_at: string
}

export interface Minister {
  id: string
  parish_id: string
  name: string
  email?: string
  phone?: string
  role: string
  availability: Record<string, unknown>
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateMinisterData {
  name: string
  email?: string
  phone?: string
  role: string
  availability?: Record<string, unknown>
  notes?: string
  is_active?: boolean
}

export interface LiturgyPlan {
  id: string
  parish_id: string
  title: string
  date: string
  liturgy_type: string
  prayers: unknown[]
  preface?: string
  readings: unknown[]
  special_notes?: string
  created_at: string
  updated_at: string
}

export interface CreateLiturgyPlanData {
  title: string
  date: string
  liturgy_type: string
  prayers?: unknown[]
  preface?: string
  readings?: unknown[]
  special_notes?: string
}

export interface LiturgicalCalendarEntry {
  id: string
  parish_id: string
  title: string
  date: string
  liturgical_season?: string
  liturgical_rank?: string
  color?: string
  readings: unknown[]
  special_prayers: unknown[]
  notes?: string
  is_custom: boolean
  created_at: string
  updated_at: string
}

export interface CreateCalendarEntryData {
  title: string
  date: string
  liturgical_season?: string
  liturgical_rank?: string
  color?: string
  readings?: unknown[]
  special_prayers?: unknown[]
  notes?: string
  is_custom?: boolean
}

export interface ReadingCollection {
  id: string
  parish_id: string
  name: string
  description?: string
  occasion_type: string
  is_template: boolean
  created_at: string
  updated_at: string
}

export interface CreateReadingCollectionData {
  name: string
  description?: string
  occasion_type: string
  is_template?: boolean
}

export interface IndividualReading {
  id: string
  parish_id?: string
  pericope: string
  title: string
  category: string
  translation_id: number
  sort_order: number
  introduction?: string
  text: string
  conclusion?: string
  is_template: boolean
  created_at: string
  updated_at: string
}

export interface CreateIndividualReadingData {
  pericope: string
  title: string
  category: string
  translation_id?: number
  sort_order?: number
  introduction?: string
  reading_text: string
  conclusion?: string
  is_template?: boolean
}

export interface ReadingCollectionItem {
  id: string
  collection_id: string
  reading_id: string
  position: number
  lector_name?: string
  do_not_print: boolean
  notes?: string
  created_at: string
}

export interface CreateReadingCollectionItemData {
  collection_id: string
  reading_id: string
  position?: number
  lector_name?: string
  do_not_print?: boolean
  notes?: string
}

export interface ReadingCollectionWithItems {
  id: string
  parish_id?: string
  name: string
  description?: string
  occasion_type: string
  is_template: boolean
  created_at: string
  updated_at: string
  items: Array<{
    id: string
    position: number
    lector_name?: string
    do_not_print: boolean
    notes?: string
    reading: IndividualReading
  }>
}

// Parish-related interfaces
export interface Parish {
  id: string
  name: string
  city: string
  state: string
  created_at: string
}

export interface ParishSettings {
  id: string
  parish_id: string
  mass_intention_offering_quick_amounts: Array<{amount: number, label: string}>
  donations_quick_amounts: Array<{amount: number, label: string}>
  created_at: string
  updated_at: string
}

export interface ParishUser {
  user_id: string
  parish_id: string
  roles: string[]
}

export interface UserSettings {
  id: string
  user_id: string
  selected_parish_id: string | null
  language: string
  created_at: string
  updated_at: string
}

// Translation/Version definitions
export interface Translation {
  id: number
  name: string
  abbreviation: string
}

// Liturgical category definitions
export type LiturgicalCategory = 
  | 'marriage-1'      // Marriage First Reading
  | 'marriage-2'      // Marriage Second Reading
  | 'marriage-psalm'  // Marriage Psalm
  | 'marriage-gospel' // Marriage Gospel
  | 'funeral-1'       // Funeral First Reading
  | 'funeral-psalm'   // Funeral Psalm
  | 'funeral-gospel'  // Funeral Gospel
  | 'baptism-1'       // Baptism First Reading
  | 'baptism-psalm'   // Baptism Psalm
  | 'baptism-2'       // Baptism Second Reading
  | 'baptism-gospel'  // Baptism Gospel
  | 'confirmation-1'  // Confirmation First Reading
  | 'confirmation-psalm' // Confirmation Psalm
  | 'confirmation-2'  // Confirmation Second Reading
  | 'confirmation-gospel' // Confirmation Gospel
  | 'mass-1'          // Mass First Reading
  | 'mass-psalm'      // Mass Psalm
  | 'mass-2'          // Mass Second Reading
  | 'mass-gospel'     // Mass Gospel
  | 'other'           // Other/Custom

// Helper constants
export const TRANSLATIONS: Translation[] = [
  { id: 1, name: 'New American Bible Revised Edition', abbreviation: 'NABRE' },
  { id: 2, name: 'Revised Standard Version', abbreviation: 'RSV' },
  { id: 3, name: 'New Revised Standard Version', abbreviation: 'NRSV' },
]

export const LITURGICAL_CATEGORIES: Record<string, LiturgicalCategory[]> = {
  'wedding': ['marriage-1', 'marriage-psalm', 'marriage-2', 'marriage-gospel'],
  'funeral': ['funeral-1', 'funeral-psalm', 'funeral-gospel'],
  'baptism': ['baptism-1', 'baptism-psalm', 'baptism-2', 'baptism-gospel'],
  'confirmation': ['confirmation-1', 'confirmation-psalm', 'confirmation-2', 'confirmation-gospel'],
  'mass': ['mass-1', 'mass-psalm', 'mass-2', 'mass-gospel'],
}

// Liturgical Reading types
export interface LiturgicalReading {
  id: string
  parish_id: string
  title: string
  description?: string
  date?: string
  first_reading_id?: string
  first_reading_lector?: string
  psalm_id?: string
  psalm_lector?: string
  second_reading_id?: string
  second_reading_lector?: string
  gospel_reading_id?: string
  gospel_lector?: string
  sung_petitions?: boolean
  created_at: string
}

export interface CreateLiturgicalReadingData {
  title: string
  description?: string
  date?: string
  first_reading_id?: string
  first_reading_lector?: string
  psalm_id?: string
  psalm_lector?: string
  second_reading_id?: string
  second_reading_lector?: string
  gospel_reading_id?: string
  gospel_lector?: string
  sung_petitions?: boolean
}

// Additional parish-based interfaces
export interface Category {
  id: string
  parish_id: string
  name: string
  description?: string
  sort_order: number
  created_at: string
}

export interface CreateCategoryData {
  name: string
  description?: string
  sort_order?: number
}

export interface Group {
  id: string
  parish_id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  person_id: string
  role?: string
  joined_at: string
  person?: {
    id: string
    first_name: string
    last_name: string
    email?: string
  }
}

export interface Person {
  id: string
  parish_id: string
  first_name: string
  last_name: string
  phone_number?: string
  email?: string
  street?: string
  city?: string
  state?: string
  zipcode?: string
  sex?: 'Male' | 'Female'
  notes?: string
  created_at: string
  updated_at: string
}

export interface Ministry {
  id: string
  parish_id: string
  name: string
  description?: string
  requirements?: string
  created_at: string
  updated_at: string
}

export interface LiturgicalEventTemplate {
  id: string
  parish_id: string
  name: string
  description?: string
  template_data: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface LiturgicalEvent {
  id: string
  parish_id: string
  name: string
  description?: string
  event_date: string
  start_time?: string
  end_time?: string
  location?: string
  status: string
  template_id?: string
  liturgical_readings_id?: string
  petitions_id?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Reading {
  id: string
  parish_id: string
  pericope: string
  text: string
  introduction?: string
  conclusion?: string
  language?: string
  lectionary_id?: string
  categories?: string[]
  created_at: string
  updated_at: string
}

export interface Presentation {
  id: string
  parish_id: string
  presentation_event_id?: string
  child_id?: string
  mother_id?: string
  father_id?: string
  coordinator_id?: string
  is_baptized: boolean
  status?: string
  note?: string
  presentation_template_id?: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  parish_id: string
  name: string
  description?: string
  responsible_party_id: string
  event_type: string
  start_date?: string
  start_time?: string
  end_date?: string
  end_time?: string
  location?: string
  language?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Wedding {
  id: string
  parish_id: string
  wedding_event_id?: string
  bride_id?: string
  groom_id?: string
  coordinator_id?: string
  presider_id?: string
  homilist_id?: string
  lead_musician_id?: string
  cantor_id?: string
  reception_event_id?: string
  rehearsal_event_id?: string
  rehearsal_dinner_event_id?: string
  witness_1_id?: string
  witness_2_id?: string
  status?: string
  first_reading_id?: string
  psalm_id?: string
  psalm_reader_id?: string
  psalm_is_sung?: boolean
  second_reading_id?: string
  gospel_reading_id?: string
  gospel_reader_id?: string
  first_reader_id?: string
  second_reader_id?: string
  petitions_read_by_second_reader?: boolean
  petition_reader_id?: string
  petitions?: string
  announcements?: string
  notes?: string
  wedding_template_id?: string
  created_at: string
  updated_at: string
}

export interface Funeral {
  id: string
  parish_id: string
  funeral_event_id?: string
  funeral_meal_event_id?: string
  deceased_id?: string
  family_contact_id?: string
  coordinator_id?: string
  presider_id?: string
  homilist_id?: string
  lead_musician_id?: string
  cantor_id?: string
  status?: string
  first_reading_id?: string
  psalm_id?: string
  psalm_reader_id?: string
  psalm_is_sung?: boolean
  second_reading_id?: string
  gospel_reading_id?: string
  gospel_reader_id?: string
  first_reader_id?: string
  second_reader_id?: string
  petitions_read_by_second_reader?: boolean
  petition_reader_id?: string
  petitions?: string
  announcements?: string
  note?: string
  funeral_template_id?: string
  created_at: string
  updated_at: string
}

export interface Quinceanera {
  id: string
  parish_id: string
  quinceanera_event_id?: string
  quinceanera_reception_id?: string
  quinceanera_id?: string
  family_contact_id?: string
  coordinator_id?: string
  presider_id?: string
  homilist_id?: string
  lead_musician_id?: string
  cantor_id?: string
  status?: string
  first_reading_id?: string
  psalm_id?: string
  psalm_reader_id?: string
  psalm_is_sung?: boolean
  second_reading_id?: string
  gospel_reading_id?: string
  gospel_reader_id?: string
  first_reader_id?: string
  second_reader_id?: string
  petitions_read_by_second_reader?: boolean
  petition_reader_id?: string
  petitions?: string
  announcements?: string
  note?: string
  quinceanera_template_id?: string
  created_at: string
  updated_at: string
}

export interface Baptism {
  id: string
  parish_id: string
  baptized_person_id?: string
  place_of_birth?: string
  mother_id?: string
  father_id?: string
  godmother_id?: string
  godfather_id?: string
  presider_id?: string
  baptism_event_id?: string
  first_reading_id?: string
  psalm_id?: string
  second_reading_id?: string
  gospel_reading_id?: string
  first_reader_id?: string
  psalm_reader_id?: string
  second_reader_id?: string
  petitions?: string
  announcements?: string
  notes?: string
  baptism_template_id?: string
  status?: string
  created_at: string
  updated_at: string
}