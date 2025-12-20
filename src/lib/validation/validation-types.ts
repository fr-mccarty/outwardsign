/**
 * Type definitions for the Event Type Validation System
 *
 * Used by the validation CLI tool to check that inputs, forms, and scripts
 * work together correctly across Masses, Events, and Special Liturgies.
 */

/**
 * Error when a script placeholder references a non-existent field
 */
export interface PlaceholderError {
  /** Name of the script containing the error */
  scriptName: string
  /** Name of the section containing the error */
  sectionName: string
  /** The placeholder text that couldn't be resolved */
  placeholder: string
  /** The property_name extracted from the placeholder */
  propertyName: string
}

/**
 * Error when a field references an invalid external resource
 */
export interface ReferenceError {
  /** Type of reference that failed */
  type: 'invalid_filter_tag' | 'invalid_list' | 'invalid_event_type'
  /** Name of the field with the invalid reference */
  fieldName: string
  /** The property_name of the field */
  propertyName: string
  /** The invalid ID or tag that was referenced */
  invalidValue: string
}

/**
 * Warning about potential issues (not blocking errors)
 */
export interface FieldWarning {
  /** Type of warning */
  type: 'unused_field' | 'required_not_used' | 'missing_primary_calendar'
  /** Name of the field with the warning */
  fieldName: string
  /** The property_name of the field */
  propertyName: string
  /** Additional context about the warning */
  message: string
}

/**
 * Validation result for a single event type
 */
export interface EventTypeValidationResult {
  /** Event type ID */
  id: string
  /** Event type name */
  name: string
  /** Event type slug */
  slug: string
  /** Number of input fields */
  fieldCount: number
  /** Number of scripts */
  scriptCount: number
  /** Critical errors that must be fixed */
  errors: (PlaceholderError | ReferenceError)[]
  /** Warnings that should be reviewed */
  warnings: FieldWarning[]
  /** Whether this event type passed validation (no errors) */
  isValid: boolean
}

/**
 * Overall validation result for all event types
 */
export interface ValidationReport {
  /** Timestamp of the validation run */
  timestamp: Date
  /** Results for each event type */
  eventTypes: EventTypeValidationResult[]
  /** Total number of event types checked */
  totalEventTypes: number
  /** Number of event types with errors */
  eventTypesWithErrors: number
  /** Number of event types with warnings only */
  eventTypesWithWarnings: number
  /** Number of event types that are clean */
  eventTypesClean: number
  /** Whether all event types passed validation */
  allValid: boolean
}

/**
 * Input field definition as stored in the database
 * (subset of fields needed for validation)
 */
export interface InputFieldDefinitionForValidation {
  property_name: string
  name: string
  type: string
  required?: boolean
  is_primary_calendar_event?: boolean
  filter_tags?: string[] | null
  list_id?: string | null
}

/**
 * Script section as stored in the database
 * (subset of fields needed for validation)
 */
export interface ScriptSectionForValidation {
  name: string
  content: string
}

/**
 * Script (content) as stored in the database
 * (subset of fields needed for validation)
 */
export interface ScriptForValidation {
  id: string
  name: string
  sections: ScriptSectionForValidation[]
}

/**
 * Event type with relations needed for validation
 */
export interface EventTypeForValidation {
  id: string
  name: string
  slug: string
  input_field_definitions: InputFieldDefinitionForValidation[]
  contents: ScriptForValidation[]
}
