import type { LiturgicalLanguage, ModuleStatus, MassStatus, MassIntentionStatus, Sex } from './constants'
// Note: Event type definitions are now in this file directly (not re-exported from ./types/event-types)
// to avoid duplicate export conflicts and ensure type consistency across the codebase.

export interface Petition {
  id: string
  parish_id: string
  title: string
  date: string
  language: LiturgicalLanguage
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
  language: LiturgicalLanguage
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

// Parish-related interfaces
export interface Parish {
  id: string
  name: string
  city: string
  state?: string | null
  country?: string
  created_at: string
}

export interface ParishSettings {
  id: string
  parish_id: string
  mass_intention_offering_quick_amount: Array<{amount: number, label: string}>
  donations_quick_amount: Array<{amount: number, label: string}>
  liturgical_locale: string
  created_at: string
  updated_at: string
}

export interface ParishUser {
  user_id: string
  parish_id: string
  roles: string[]
  enabled_modules: string[]
  created_at: string
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
  group_role_id?: string
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
  first_name_pronunciation?: string
  last_name: string
  last_name_pronunciation?: string
  full_name: string  // Auto-generated: first_name || ' ' || last_name
  full_name_pronunciation: string  // Auto-generated: COALESCE(first_name_pronunciation, first_name) || ' ' || COALESCE(last_name_pronunciation, last_name)
  phone_number?: string
  email?: string
  street?: string
  city?: string
  state?: string
  zipcode?: string
  sex?: Sex
  note?: string
  avatar_url?: string  // Storage path to profile photo in person-avatars bucket
  // Parishioner portal fields
  preferred_communication_channel?: 'email' | 'sms'
  parishioner_portal_enabled?: boolean
  last_portal_access?: string
  preferred_language?: 'en' | 'es'
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
  status: ModuleStatus
  template_id?: string
  liturgical_readings_id?: string
  petitions_id?: string
  notes?: string
  created_at: string
  updated_at: string
}

// EventType represents user-defined event categories (Wedding, Funeral, Baptism, etc.)
// The old hardcoded modules have been replaced with dynamic event types
export interface EventType {
  id: string
  parish_id: string
  name: string
  description: string | null
  icon: string // Lucide icon name
  slug: string | null // URL-safe identifier (e.g., "weddings", "funerals")
  order: number
  system_type: 'mass-liturgy' | 'special-liturgy' | 'parish-event' // System type for categorization
  show_on_public_calendar: boolean // Whether events appear in public .ics calendar feeds
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  parish_id: string
  name: string
  description?: string
  responsible_party_id: string | null
  event_type_id?: string | null
  related_event_type?: string | null // System-defined from constants (WEDDING, FUNERAL, etc.)
  start_date?: string
  start_time?: string
  end_date?: string
  end_time?: string
  timezone: string
  is_all_day: boolean
  location_id?: string | null
  language?: LiturgicalLanguage
  event_template_id?: string
  note?: string
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  parish_id: string
  name: string
  description?: string | null
  street?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  phone_number?: string | null
  created_at: string
  updated_at: string
}

export interface GroupRole {
  id: string
  parish_id: string
  name: string
  description?: string
  note?: string
  is_active: boolean
  display_order?: number
  created_at: string
  updated_at: string
}

export interface Mass {
  id: string
  parish_id: string
  event_id?: string
  presider_id?: string
  homilist_id?: string
  liturgical_event_id?: string
  mass_time_template_item_id?: string
  event_type_id?: string | null
  field_values?: Record<string, any>
  status?: MassStatus
  mass_template_id?: string
  name?: string
  description?: string
  announcements?: string
  note?: string
  petitions?: string
  liturgical_color?: string
  created_at: string
  updated_at: string
}

export interface MassIntention {
  id: string
  parish_id: string
  calendar_event_id?: string  // References calendar_events table (specific mass times)
  mass_offered_for?: string
  requested_by_id?: string
  date_received?: string
  date_requested?: string
  stipend_in_cents?: number
  status?: MassIntentionStatus
  mass_intention_template_id?: string
  note?: string
  created_at: string
  updated_at: string
}

// User-Defined Event Types System

// Input field types for dynamic event forms
export type InputFieldType =
  | 'person'
  | 'group'
  | 'location'
  | 'list_item'
  | 'document'
  | 'content'
  | 'petition'
  | 'calendar_event'  // Renamed from 'occasion'
  | 'text'
  | 'rich_text'
  | 'date'
  | 'time'
  | 'datetime'
  | 'number'
  | 'yes_no'
  | 'mass-intention'
  | 'spacer'

export interface EventTypeWithRelations extends EventType {
  input_field_definitions: InputFieldDefinition[]
  scripts: Script[]
}

export interface CreateEventTypeData {
  name: string
  description?: string | null
  icon: string
  slug?: string | null
  system_type: 'mass-liturgy' | 'special-liturgy' | 'parish-event'
}

export interface UpdateEventTypeData {
  name?: string
  description?: string | null
  icon?: string
  slug?: string | null
  system_type?: 'mass-liturgy' | 'special-liturgy' | 'parish-event'
}

// Input Field Definitions (fields for event types)
export interface InputFieldDefinition {
  id: string
  event_type_id: string
  name: string                    // User-defined label (e.g., "First Reader", "Deceased")
  property_name: string           // Template variable name (e.g., "first_reader", "deceased") - lowercase, underscores only
  type: InputFieldType
  required: boolean
  list_id: string | null
  input_filter_tags: string[] | null
  is_key_person: boolean
  is_primary: boolean
  is_per_calendar_event: boolean  // If true, expects occurrence-level assignments; if false, template-level
  order: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface InputFieldDefinitionWithRelations extends InputFieldDefinition {
  custom_list?: CustomList | null
}

export interface CreateInputFieldDefinitionData {
  event_type_id: string
  name: string
  property_name: string           // Template variable name (lowercase, underscores only)
  type: InputFieldType
  required: boolean
  list_id?: string | null
  input_filter_tags?: string[] | null
  is_key_person?: boolean
  is_primary?: boolean
  is_per_calendar_event?: boolean
}

export interface UpdateInputFieldDefinitionData {
  name?: string
  property_name?: string          // Template variable name (lowercase, underscores only)
  type?: InputFieldType
  required?: boolean
  list_id?: string | null
  input_filter_tags?: string[] | null
  is_key_person?: boolean
  is_primary?: boolean
  is_per_calendar_event?: boolean
}

// Custom Lists (parish-defined option sets)
export interface CustomList {
  id: string
  parish_id: string
  name: string
  slug: string
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface CustomListWithItems extends CustomList {
  items: CustomListItem[]
}

export interface CreateCustomListData {
  name: string
}

export interface UpdateCustomListData {
  name?: string
}

// Custom List Items
export interface CustomListItem {
  id: string
  list_id: string
  value: string
  order: number
  deleted_at: string | null
  created_at: string
}

export interface CreateCustomListItemData {
  value: string
}

export interface UpdateCustomListItemData {
  value?: string
}

// Scripts (exportable documents for event types)
export interface Script {
  id: string
  event_type_id: string
  name: string
  description: string | null
  order: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface ScriptWithSections extends Script {
  sections: Section[]
}

export interface CreateScriptData {
  event_type_id: string
  name: string
  description?: string | null
}

export interface UpdateScriptData {
  name?: string
  description?: string | null
}

// Section types
export type SectionType = 'text' | 'petition'

// Sections (rich text blocks within scripts)
export interface Section {
  id: string
  script_id: string
  name: string
  section_type: SectionType
  content: string // Markdown with custom syntax (for text type) or empty (for petition type)
  page_break_after: boolean
  order: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateSectionData {
  name: string
  section_type?: SectionType
  content?: string
  page_break_after?: boolean
}

export interface UpdateSectionData {
  name?: string
  section_type?: SectionType
  content?: string
  page_break_after?: boolean
}

// ========================================
// PARISH EVENTS (formerly ParishEvent, DynamicEvent)
// ========================================
// Parish events are containers for sacraments (Weddings, Funerals, etc.)
// They store dynamic field values and have manual minister assignment

export type ParishEventStatus = 'PLANNING' | 'ACTIVE' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'

// ========================================
// PEOPLE EVENT ASSIGNMENTS
// ========================================
// Unified storage for all person-to-event assignments
// calendar_event_id NULL = template-level (applies to all occurrences)
// calendar_event_id populated = occurrence-level (specific to one calendar event)

export interface PeopleEventAssignment {
  id: string
  master_event_id: string
  calendar_event_id: string | null  // NULL for template, populated for occurrence
  field_definition_id: string
  person_id: string
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PeopleEventAssignmentWithPerson extends PeopleEventAssignment {
  person: Person
  field_definition: InputFieldDefinition
}

export interface CreatePeopleEventAssignmentData {
  master_event_id: string
  calendar_event_id?: string | null
  field_definition_id: string
  person_id: string
  notes?: string | null
}

export interface UpdatePeopleEventAssignmentData {
  person_id?: string
  notes?: string | null
}

export interface ParishEvent {
  id: string
  parish_id: string
  event_type_id: string
  liturgical_calendar_id: string | null
  field_values: Record<string, any> // JSON object
  status: ParishEventStatus  // Event status
  liturgical_color: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ResolvedFieldValue {
  field_name: string
  field_type: InputFieldType
  raw_value: any
  // Content is defined later in file - TypeScript handles forward references within the same file
  resolved_value?: Person | Group | Location | ParishEvent | CustomListItem | Document | Content | Petition | CalendarEvent | null
}

/**
 * Parish info for script placeholders
 */
export interface ParishInfo {
  name: string
  city: string
  state: string
}

export interface ParishEventWithRelations extends ParishEvent {
  event_type: EventTypeWithRelations  // Includes input_field_definitions and scripts
  calendar_events: CalendarEvent[]  // RENAMED from occasions
  people_event_assignments?: PeopleEventAssignmentWithPerson[]  // Unified person assignments
  resolved_fields: Record<string, ResolvedFieldValue>
  parish?: ParishInfo
}

export interface CreateParishEventData {
  field_values: Record<string, any>
  status: string
  liturgical_color?: string | null
  calendar_events?: CreateCalendarEventData[]
}

export interface UpdateParishEventData {
  field_values?: Record<string, any>
  status?: string | null
  liturgical_color?: string | null
  calendar_events?: (CreateCalendarEventData | UpdateCalendarEventData)[]
}

// ========================================
// CALENDAR EVENTS (formerly Occasion)
// ========================================
// Calendar events are scheduled items that appear on the calendar
// Every calendar_event must belong to a master_event (no standalone events)
// Titles are computed from master_event + input_field_definition.name

export interface CalendarEvent {
  id: string
  parish_id: string  // For RLS
  master_event_id: string  // NOT NULL - every calendar event must have a parent
  input_field_definition_id: string  // Links to the field definition (e.g., Rehearsal, Ceremony)
  start_datetime: string  // ISO 8601 datetime with timezone
  end_datetime: string | null  // Optional end datetime
  location_id: string | null
  show_on_calendar: boolean  // Whether this event should appear on the parish public calendar
  is_cancelled: boolean  // True if this specific calendar event is cancelled
  is_all_day: boolean  // True if this is an all-day event (no specific time, only date)
  deleted_at: string | null
  created_at: string
  location?: Location | null
}

export interface CalendarEventWithRelations extends CalendarEvent {
  master_event?: ParishEvent | null  // Parent parish event
  input_field_definition?: InputFieldDefinition | null  // The field definition for label
}

export interface CreateCalendarEventData {
  master_event_id?: string  // Optional - set by server when creating as part of event
  input_field_definition_id: string  // Required - links to field definition
  start_datetime: string  // Required - ISO 8601 datetime
  end_datetime?: string | null  // Optional
  location_id?: string | null
  show_on_calendar?: boolean
  is_cancelled?: boolean
  is_all_day?: boolean  // Optional - defaults to false
}

export interface UpdateCalendarEventData {
  id?: string
  start_datetime?: string
  end_datetime?: string | null
  location_id?: string | null
  show_on_calendar?: boolean
  is_cancelled?: boolean
  is_all_day?: boolean
}

// ========================================
// EVENT PRESETS
// ========================================
// Presets for events that can be reused when creating new events

export interface CalendarEventPresetData {
  location_id: string | null
  is_all_day: boolean
  duration_days: number | null  // For multi-day all-day events
}

export interface PresetData {
  field_values: Record<string, any>
  presider_id: string | null
  homilist_id: string | null
  calendar_events: Record<string, CalendarEventPresetData>
}

export interface EventPreset {
  id: string
  parish_id: string
  event_type_id: string
  name: string
  description: string | null
  preset_data: PresetData
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface EventPresetWithRelations extends EventPreset {
  event_type: EventType
}

export interface CreateEventPresetData {
  event_type_id: string
  name: string
  description?: string | null
  preset_data: PresetData
}

export interface UpdateEventPresetData {
  name?: string
  description?: string | null
}


// Documents (file uploads)
export interface Document {
  id: string
  parish_id: string
  file_path: string
  file_name: string
  file_type: string
  file_size: number
  uploaded_at: string
  deleted_at: string | null
}

// Content Library Types

export interface Content {
  id: string
  parish_id: string
  title: string
  body: string // Markdown
  language: 'en' | 'es'
  description: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

// Category Tags (shared tagging system - replaces ContentTag)
export interface CategoryTag {
  id: string
  parish_id: string
  name: string
  slug: string
  sort_order: number
  color: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface CategoryTagWithUsageCount extends CategoryTag {
  usage_count: number // Count of entities with this tag
}

export interface CreateCategoryTagData {
  name: string
  slug?: string
  sort_order?: number
  color?: string | null
}

export interface UpdateCategoryTagData {
  name?: string
  slug?: string
  sort_order?: number
  color?: string | null
}

// Tag Assignments (polymorphic)
export type TagEntityType = 'content' | 'petition' | 'petition_template'

export interface TagAssignment {
  id: string
  tag_id: string
  entity_type: TagEntityType
  entity_id: string
  created_at: string
}

export interface CreateTagAssignmentData {
  tag_id: string
  entity_type: TagEntityType
  entity_id: string
}

// Deprecated type alias - kept for backward compatibility during migration
export type ContentTag = CategoryTag

export interface ContentTagAssignment {
  id: string
  content_id: string
  tag_id: string
  created_at: string
}

// WithRelations types

export interface ContentWithTags extends Content {
  tags?: CategoryTag[] // Changed from ContentTag to CategoryTag
}

export interface PetitionWithTags extends Petition {
  tags?: CategoryTag[]
}

// Petition Template with tags
// Note: Base PetitionContextTemplate is defined in petition-templates.ts
export interface PetitionTemplateWithTags {
  id: string
  title: string
  description?: string
  context: string
  parish_id: string
  module?: string
  language?: string
  is_default?: boolean
  created_at: string
  updated_at: string
  tags?: CategoryTag[]
}

export interface ContentTagWithUsageCount extends CategoryTag {
  usage_count: number // Count of content items with this tag
}

// Create/Update data types

export interface CreateContentData {
  title: string
  body: string
  language: 'en' | 'es'
  description?: string | null
  tag_ids?: string[] // Array of tag IDs to assign
}

export interface UpdateContentData {
  title?: string
  body?: string
  language?: 'en' | 'es'
  description?: string | null
  tag_ids?: string[] // Replaces all existing tag assignments
}

export interface CreateContentTagData {
  name: string
  slug?: string // Auto-generated from name if not provided
  sort_order?: number // Auto-calculated if not provided
  color?: string | null
}

export interface UpdateContentTagData {
  name?: string
  slug?: string
  sort_order?: number
  color?: string | null
}
