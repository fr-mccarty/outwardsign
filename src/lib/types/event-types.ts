/**
 * TypeScript Types for User-Defined Event Types System
 *
 * This file contains type definitions for the flexible event types system
 * that allows parishes to define their own event structures, fields, and scripts.
 */

/**
 * System Type
 * Used to organize event types in the UI (sidebar navigation)
 */
export type SystemType = 'mass' | 'special-liturgy' | 'event'

/**
 * Field types available for input field definitions
 */
export type InputFieldType =
  | 'person'          // References people table
  | 'group'           // References groups table
  | 'location'        // References locations table
  | 'list_item'       // References custom_list_items table
  | 'document'        // References documents table
  | 'text'            // JSON string
  | 'rich_text'       // JSON string (multiline)
  | 'content'         // References contents table (content library)
  | 'petition'        // References petitions table
  | 'calendar_event'  // Calendar event input (date/time/location grouped)
  | 'date'            // JSON date string (YYYY-MM-DD)
  | 'time'            // JSON time string (HH:MM:SS)
  | 'datetime'        // JSON datetime string (ISO 8601)
  | 'number'          // JSON number
  | 'yes_no'          // JSON boolean
  | 'mass-intention'  // JSON string (Mass intentions textarea)
  | 'spacer'          // Non-data field (visual section divider)

/**
 * Event Type
 * User-defined category like "Wedding", "Funeral", "Baptism", etc.
 */
export interface EventType {
  id: string
  parish_id: string
  name: string
  description: string | null      // Optional description of the event type
  icon: string                    // Lucide icon name
  slug: string | null             // URL-safe identifier (e.g., "weddings", "funerals")
  order: number                   // Display order in sidebar
  system_type: SystemType         // System type for UI organization (mass, special-liturgy, event)
  role_definitions?: { roles: Array<{ id: string; name: string; required: boolean }> } | null  // JSON-B role definitions
  deleted_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Event Type with related data
 */
export interface EventTypeWithRelations extends EventType {
  input_field_definitions: InputFieldDefinition[]
  scripts: Script[]
}

/**
 * Input Field Definition
 * Defines a field that events of this type will have
 */
export interface InputFieldDefinition {
  id: string
  event_type_id: string
  name: string                    // User-defined label (e.g., "First Reader", "Deceased")
  property_name: string           // Template variable name (e.g., "first_reader", "deceased") - lowercase, underscores only
  type: InputFieldType
  required: boolean
  list_id: string | null          // For list_item type
  is_key_person: boolean          // Only for person type, marks as searchable
  is_primary: boolean             // Only for calendar_event type, marks as primary calendar event
  filter_tags?: string[] | null   // For content type - array of tag slugs for default filtering
  order: number                   // Display order in form
  deleted_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Input Field Definition with related data
 */
export interface InputFieldDefinitionWithRelations extends InputFieldDefinition {
  custom_list?: CustomList | null
}

/**
 * Custom List
 * Parish-defined option set (e.g., "Wedding Songs", "Readings")
 */
export interface CustomList {
  id: string
  parish_id: string
  name: string
  slug: string
  deleted_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Custom List with items
 */
export interface CustomListWithItems extends CustomList {
  items: CustomListItem[]
}

/**
 * Custom List Item
 * Individual option in a custom list
 */
export interface CustomListItem {
  id: string
  list_id: string
  value: string                   // The option text
  order: number                   // Display order in dropdown
  deleted_at: string | null
  created_at: string
}

/**
 * Script
 * Ordered collection of sections, exportable document
 */
export interface Script {
  id: string
  event_type_id: string
  name: string                    // e.g., "English Program", "Spanish Program"
  description: string | null      // Optional description of the script
  order: number                   // Display order in UI
  deleted_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Script with sections
 */
export interface ScriptWithSections extends Script {
  sections: Section[]
}

/**
 * Section
 * Rich text block with placeholders, belongs to one script
 */
export interface Section {
  id: string
  script_id: string
  name: string                    // Section heading
  content: string                 // Markdown with custom syntax
  page_break_after: boolean       // Insert page break after this section
  order: number                   // Display order in script
  deleted_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Event
 * Instance of an event type with dynamic field values
 */
export interface Event {
  id: string
  parish_id: string
  event_type_id: string
  field_values: Record<string, any>  // JSON object with field values
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/**
 * Parish info for script placeholders
 */
export interface ParishInfo {
  name: string
  city: string
  state: string
}

/**
 * Event with related data and resolved field values
 */
export interface EventWithRelations extends Event {
  event_type: EventType
  calendar_events: Occasion[]  // RENAMED from occasions
  resolved_fields: Record<string, ResolvedFieldValue>
  parish?: ParishInfo
}

/**
 * Resolved field value with type information
 */
export interface ResolvedFieldValue {
  field_name: string
  field_type: InputFieldType
  raw_value: any
  resolved_value?: any  // Person | Group | Location | Event | CustomListItem | Document | null
}

/**
 * Occasion
 * Date/time/location entry attached to an event
 */
export interface Occasion {
  id: string
  master_event_id: string | null  // RENAMED from event_id (nullable for standalone events)
  parish_id: string               // NEW - For standalone events
  label: string                   // e.g., "Rehearsal", "Ceremony", "Reception"
  date: string | null             // Date string (YYYY-MM-DD)
  time: string | null             // Time string (HH:MM:SS)
  location_id: string | null
  is_primary: boolean             // One occasion marked as primary per event
  is_standalone: boolean          // NEW - True if not linked to a master event
  deleted_at: string | null
  created_at: string
}

/**
 * Occasion with location
 */
export interface OccasionWithLocation extends Occasion {
  location?: any | null
}

/**
 * Document
 * File attachment (DOCX, PDF, etc.)
 */
export interface Document {
  id: string
  parish_id: string
  file_path: string               // Supabase Storage path
  file_name: string               // Original filename
  file_type: string               // MIME type
  file_size: number               // Bytes
  uploaded_at: string
  deleted_at: string | null
}

/**
 * Create/Update Data Types
 */

export interface CreateEventTypeData {
  name: string
  description?: string | null
  icon: string
  slug?: string | null
  system_type: SystemType
  // order calculated automatically
}

export interface UpdateEventTypeData {
  name?: string
  description?: string | null
  icon?: string
  slug?: string | null
  system_type?: SystemType
}

export interface CreateInputFieldDefinitionData {
  event_type_id: string
  name: string
  property_name: string           // Template variable name (lowercase, underscores only)
  type: InputFieldType
  required: boolean
  list_id?: string | null
  is_key_person?: boolean
  is_primary?: boolean
}

export interface UpdateInputFieldDefinitionData {
  name?: string
  property_name?: string          // Template variable name (lowercase, underscores only)
  type?: InputFieldType
  required?: boolean
  list_id?: string | null
  is_key_person?: boolean
  is_primary?: boolean
}

export interface CreateCustomListData {
  name: string
}

export interface UpdateCustomListData {
  name?: string
}

export interface CreateCustomListItemData {
  value: string
  // order calculated automatically
}

export interface UpdateCustomListItemData {
  value?: string
}

export interface CreateScriptData {
  event_type_id: string
  name: string
  description?: string | null
  // order calculated automatically
}

export interface UpdateScriptData {
  name?: string
  description?: string | null
}

export interface CreateSectionData {
  name: string
  content: string
  page_break_after?: boolean
  // order calculated automatically
}

export interface UpdateSectionData {
  name?: string
  content?: string
  page_break_after?: boolean
}

export interface CreateEventData {
  event_type_id: string
  field_values: Record<string, any>
  occasions?: CreateOccasionData[]
}

export interface UpdateEventData {
  field_values?: Record<string, any>
  occasions?: (CreateOccasionData | UpdateOccasionData)[]
}

export interface CreateOccasionData {
  label: string
  date?: string | null
  time?: string | null
  location_id?: string | null
  is_primary?: boolean
}

export interface UpdateOccasionData extends CreateOccasionData {
  id?: string
}
