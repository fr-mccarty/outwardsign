/**
 * Event Type Validator
 *
 * Core validation logic for checking that inputs, forms, and scripts
 * work together correctly.
 *
 * Validates:
 * - Script placeholders reference valid field property_names
 * - input_filter_tags reference valid category_tags
 * - list_id references valid custom_lists
 * - Required fields are used in scripts (warning if not)
 * - Unused fields are detected (warning)
 */

import { findInvalidPlaceholders, extractPropertyNames } from './placeholder-extractor'
import type {
  ValidationReport,
  EventTypeValidationResult,
  PlaceholderError,
  ReferenceError,
  FieldWarning,
  EventTypeForValidation,
} from './validation-types'

/** Property name format: lowercase letters, numbers, and underscores only */
const PROPERTY_NAME_REGEX = /^[a-z][a-z0-9_]*$/

/**
 * Validate a single event type
 */
export function validateEventType(
  eventType: EventTypeForValidation,
  validCategoryTagSlugs: Set<string>,
  validCustomListIds: Set<string>
): EventTypeValidationResult {
  const errors: (PlaceholderError | ReferenceError)[] = []
  const warnings: FieldWarning[] = []

  const fields = eventType.input_field_definitions || []
  const scripts = eventType.contents || []

  // Build set of valid property names from field definitions
  const validPropertyNames = new Set(fields.map((f) => f.property_name))

  // Track which property names are used in scripts
  const usedPropertyNames = new Set<string>()

  // 1. Validate property name format
  for (const field of fields) {
    if (!PROPERTY_NAME_REGEX.test(field.property_name)) {
      warnings.push({
        type: 'unused_field', // Using closest type for format issues
        fieldName: field.name,
        propertyName: field.property_name,
        message: `Invalid property_name format: "${field.property_name}" (must be lowercase letters, numbers, underscores only, starting with a letter)`,
      })
    }
  }

  // 2. Validate placeholders in all scripts/sections
  for (const script of scripts) {
    for (const section of script.sections || []) {
      // Extract property names used in this section
      const sectionPropertyNames = extractPropertyNames(section.content)
      sectionPropertyNames.forEach((name) => usedPropertyNames.add(name))

      // Find invalid placeholders
      const invalidPlaceholders = findInvalidPlaceholders(
        section.content,
        validPropertyNames
      )

      for (const placeholder of invalidPlaceholders) {
        errors.push({
          scriptName: script.name,
          sectionName: section.name,
          placeholder: placeholder.fullMatch,
          propertyName: placeholder.propertyName,
        })
      }
    }
  }

  // 3. Validate input_filter_tags, list_id
  for (const field of fields) {
    // Validate input_filter_tags for content type fields
    if (field.type === 'content' && field.input_filter_tags && field.input_filter_tags.length > 0) {
      for (const tag of field.input_filter_tags) {
        if (!validCategoryTagSlugs.has(tag)) {
          errors.push({
            type: 'invalid_tag',
            fieldName: field.name,
            propertyName: field.property_name,
            invalidValue: tag,
          })
        }
      }
    }

    // Validate list_id for list_item type fields
    if (field.type === 'list_item' && field.list_id) {
      if (!validCustomListIds.has(field.list_id)) {
        errors.push({
          type: 'invalid_list',
          fieldName: field.name,
          propertyName: field.property_name,
          invalidValue: field.list_id,
        })
      }
    }
  }

  // 4. Check for unused fields (warning)
  for (const field of fields) {
    // Skip spacer fields - they are visual only
    if (field.type === 'spacer') continue

    if (!usedPropertyNames.has(field.property_name)) {
      warnings.push({
        type: 'unused_field',
        fieldName: field.name,
        propertyName: field.property_name,
        message: `Field is never used in any script`,
      })
    }
  }

  // 5. Check for required fields not used in scripts (warning)
  for (const field of fields) {
    if (field.required && !usedPropertyNames.has(field.property_name)) {
      warnings.push({
        type: 'required_not_used',
        fieldName: field.name,
        propertyName: field.property_name,
        message: `Required field is not used in any script`,
      })
    }
  }

  // 6. Check calendar_event fields for is_primary
  const calendarFields = fields.filter((f) => f.type === 'calendar_event')
  if (calendarFields.length > 0) {
    const hasPrimary = calendarFields.some((f) => f.is_primary_calendar_event)
    if (!hasPrimary) {
      warnings.push({
        type: 'missing_primary_calendar',
        fieldName: calendarFields[0].name,
        propertyName: calendarFields[0].property_name,
        message: `No calendar_event field is marked as primary (is_primary_calendar_event)`,
      })
    }
  }

  return {
    id: eventType.id,
    name: eventType.name,
    slug: eventType.slug,
    fieldCount: fields.length,
    scriptCount: scripts.length,
    errors,
    warnings,
    isValid: errors.length === 0,
  }
}

/**
 * Validate all event types and generate a report
 */
export function validateAllEventTypes(
  eventTypes: EventTypeForValidation[],
  validCategoryTagSlugs: Set<string>,
  validCustomListIds: Set<string>
): ValidationReport {
  const results: EventTypeValidationResult[] = []

  for (const eventType of eventTypes) {
    const result = validateEventType(
      eventType,
      validCategoryTagSlugs,
      validCustomListIds
    )
    results.push(result)
  }

  const eventTypesWithErrors = results.filter((r) => r.errors.length > 0).length
  const eventTypesWithWarnings = results.filter(
    (r) => r.errors.length === 0 && r.warnings.length > 0
  ).length
  const eventTypesClean = results.filter(
    (r) => r.errors.length === 0 && r.warnings.length === 0
  ).length

  return {
    timestamp: new Date(),
    eventTypes: results,
    totalEventTypes: eventTypes.length,
    eventTypesWithErrors,
    eventTypesWithWarnings,
    eventTypesClean,
    allValid: eventTypesWithErrors === 0,
  }
}

/**
 * Format a validation report for CLI output
 */
export function formatValidationReport(report: ValidationReport): string {
  const lines: string[] = []

  lines.push('Event Type Validation Report')
  lines.push('============================')
  lines.push('')

  for (const eventType of report.eventTypes) {
    const statusIcon = eventType.isValid
      ? eventType.warnings.length > 0
        ? '⚠'
        : '✓'
      : '✗'

    lines.push(
      `${statusIcon} ${eventType.name} (${eventType.fieldCount} fields, ${eventType.scriptCount} scripts)`
    )

    if (eventType.errors.length > 0) {
      lines.push('  ✗ ERRORS:')
      for (const error of eventType.errors) {
        if ('scriptName' in error) {
          // PlaceholderError
          lines.push(
            `    - Script "${error.scriptName}" section "${error.sectionName}" has invalid placeholder: ${error.placeholder}`
          )
        } else {
          // ReferenceError
          lines.push(
            `    - Field "${error.fieldName}" has invalid ${error.type.replace('invalid_', '')}: "${error.invalidValue}"`
          )
        }
      }
    }

    if (eventType.warnings.length > 0) {
      lines.push('  ⚠ WARNINGS:')
      for (const warning of eventType.warnings) {
        lines.push(`    - ${warning.message} (field: "${warning.fieldName}")`)
      }
    }

    if (eventType.isValid && eventType.warnings.length === 0) {
      lines.push('  ✓ All placeholders resolve to valid fields')
      lines.push('  ✓ All references are valid')
    }

    lines.push('')
  }

  lines.push('Summary')
  lines.push('-------')
  lines.push(`Total event types: ${report.totalEventTypes}`)
  lines.push(`  With errors: ${report.eventTypesWithErrors}`)
  lines.push(`  With warnings only: ${report.eventTypesWithWarnings}`)
  lines.push(`  Clean: ${report.eventTypesClean}`)
  lines.push('')

  if (report.allValid) {
    lines.push('✓ All event types passed validation')
  } else {
    lines.push(
      `✗ ${report.eventTypesWithErrors} event type(s) have errors that must be fixed`
    )
  }

  return lines.join('\n')
}
