#!/usr/bin/env tsx
/**
 * Event Type Validation Script
 *
 * Validates that inputs, forms, and scripts work together correctly
 * across all event types (Masses, Events, Special Liturgies).
 *
 * Usage:
 *   npm run validate
 *   npm run validate -- --parish=<parish_id>
 *
 * Exit codes:
 *   0 - All event types passed validation
 *   1 - One or more event types have errors
 *
 * Note: Uses service role key to access all parishes
 */

import { createClient } from '@supabase/supabase-js'
import {
  validateAllEventTypes,
  formatValidationReport,
} from '../src/lib/validation/event-type-validator'
import type { EventTypeForValidation } from '../src/lib/validation/validation-types'
import { logSuccess, logError, logInfo } from '../src/lib/utils/console'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  logError('Missing required environment variables:')
  logError('   - NEXT_PUBLIC_SUPABASE_URL')
  logError('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Parse command line arguments
function parseArgs(): { parishId?: string } {
  const args: { parishId?: string } = {}

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--parish=')) {
      args.parishId = arg.replace('--parish=', '')
    }
  }

  return args
}

async function fetchEventTypes(parishId?: string): Promise<EventTypeForValidation[]> {
  // First, get all event types
  let eventTypesQuery = supabase
    .from('event_types')
    .select('id, name, slug')
    .is('deleted_at', null)
    .order('name')

  if (parishId) {
    eventTypesQuery = eventTypesQuery.eq('parish_id', parishId)
  }

  const { data: eventTypesData, error: eventTypesError } = await eventTypesQuery

  if (eventTypesError) {
    logError(`Failed to fetch event types: ${eventTypesError.message}`)
    process.exit(1)
  }

  const eventTypes = eventTypesData || []
  const results: EventTypeForValidation[] = []

  // For each event type, fetch input field definitions and scripts
  for (const eventType of eventTypes) {
    // Fetch input field definitions
    const { data: fieldsData, error: fieldsError } = await supabase
      .from('input_field_definitions')
      .select('property_name, name, type, required, is_primary, filter_tags, list_id')
      .eq('event_type_id', eventType.id)
      .is('deleted_at', null)
      .order('order', { ascending: true })

    if (fieldsError) {
      logError(`Failed to fetch fields for ${eventType.name}: ${fieldsError.message}`)
      process.exit(1)
    }

    // Fetch scripts with sections
    const { data: scriptsData, error: scriptsError } = await supabase
      .from('scripts')
      .select('id, name, sections(name, content)')
      .eq('event_type_id', eventType.id)
      .is('deleted_at', null)
      .order('order', { ascending: true })

    if (scriptsError) {
      logError(`Failed to fetch scripts for ${eventType.name}: ${scriptsError.message}`)
      process.exit(1)
    }

    // Transform data to match our validation types
    results.push({
      id: eventType.id,
      name: eventType.name,
      slug: eventType.slug,
      input_field_definitions: (fieldsData || []).map((field) => ({
        property_name: field.property_name,
        name: field.name,
        type: field.type,
        required: field.required,
        is_primary_calendar_event: field.is_primary,
        filter_tags: field.filter_tags,
        list_id: field.list_id,
      })),
      contents: (scriptsData || []).map((script) => ({
        id: script.id,
        name: script.name,
        sections: (script.sections || []).map((section: { name: string; content: string }) => ({
          name: section.name,
          content: section.content,
        })),
      })),
    })
  }

  return results
}

async function fetchCategoryTagSlugs(parishId?: string): Promise<Set<string>> {
  let query = supabase.from('category_tags').select('slug')

  if (parishId) {
    query = query.eq('parish_id', parishId)
  }

  const { data, error } = await query

  if (error) {
    logError(`Failed to fetch category tags: ${error.message}`)
    process.exit(1)
  }

  return new Set((data || []).map((t: { slug: string }) => t.slug))
}

async function fetchCustomListIds(parishId?: string): Promise<Set<string>> {
  let query = supabase.from('custom_lists').select('id').is('deleted_at', null)

  if (parishId) {
    query = query.eq('parish_id', parishId)
  }

  const { data, error } = await query

  if (error) {
    logError(`Failed to fetch custom lists: ${error.message}`)
    process.exit(1)
  }

  return new Set((data || []).map((l: { id: string }) => l.id))
}

async function fetchEventTypeIds(parishId?: string): Promise<Set<string>> {
  let query = supabase.from('event_types').select('id').is('deleted_at', null)

  if (parishId) {
    query = query.eq('parish_id', parishId)
  }

  const { data, error } = await query

  if (error) {
    logError(`Failed to fetch event type IDs: ${error.message}`)
    process.exit(1)
  }

  return new Set((data || []).map((et: { id: string }) => et.id))
}

async function main() {
  const args = parseArgs()

  logInfo('')
  logInfo('='.repeat(60))
  logInfo('Event Type Validation')
  logInfo('='.repeat(60))
  logInfo('')

  if (args.parishId) {
    logInfo(`Filtering by parish: ${args.parishId}`)
    logInfo('')
  }

  // Fetch all required data
  logInfo('Fetching event types with fields and scripts...')
  const eventTypes = await fetchEventTypes(args.parishId)
  logInfo(`Found ${eventTypes.length} event type(s)`)

  logInfo('Fetching category tags...')
  const categoryTagSlugs = await fetchCategoryTagSlugs(args.parishId)
  logInfo(`Found ${categoryTagSlugs.size} category tag(s)`)

  logInfo('Fetching custom lists...')
  const customListIds = await fetchCustomListIds(args.parishId)
  logInfo(`Found ${customListIds.size} custom list(s)`)

  logInfo('Fetching event type IDs...')
  const eventTypeIds = await fetchEventTypeIds(args.parishId)
  logInfo(`Found ${eventTypeIds.size} event type(s)`)

  logInfo('')
  logInfo('Running validation...')
  logInfo('')

  // Run validation
  const report = validateAllEventTypes(
    eventTypes,
    categoryTagSlugs,
    customListIds,
    eventTypeIds
  )

  // Output report
  console.log(formatValidationReport(report))

  // Exit with appropriate code
  if (report.allValid) {
    logSuccess('')
    logSuccess('Validation completed successfully!')
    process.exit(0)
  } else {
    logError('')
    logError('Validation failed with errors.')
    process.exit(1)
  }
}

main().catch((error) => {
  logError(`Unexpected error: ${error.message}`)
  process.exit(1)
})
