/**
 * Tools Index
 *
 * Aggregates all tool modules and registers them with the registry.
 * Import this file once at application startup to register all tools.
 */

import { registerTools } from '../registry'
import type { CategorizedTool } from '../types'

// Import all tool modules
import { peopleTools } from './people'
import { familiesTools } from './families'
import { groupsTools } from './groups'
import { eventsTools } from './events'
import { massesTools } from './masses'
import { availabilityTools } from './availability'
import { contentTools } from './content'
import { locationsTools } from './locations'
import { settingsTools } from './settings'
import { documentationTools } from './documentation'
import { developerTools } from './developer'
import { parishionerTools } from './parishioner'

/**
 * All tools aggregated into a single array.
 */
export const allTools: CategorizedTool[] = [
  ...peopleTools,
  ...familiesTools,
  ...groupsTools,
  ...eventsTools,
  ...massesTools,
  ...availabilityTools,
  ...contentTools,
  ...locationsTools,
  ...settingsTools,
  ...documentationTools,
  ...developerTools,
  ...parishionerTools,
]

/**
 * Register all tools with the registry.
 * Call this once at application startup.
 */
export function initializeTools(): void {
  registerTools(allTools)
}

// Re-export individual tool arrays for selective imports
export {
  peopleTools,
  familiesTools,
  groupsTools,
  eventsTools,
  massesTools,
  availabilityTools,
  contentTools,
  locationsTools,
  settingsTools,
  documentationTools,
  developerTools,
  parishionerTools,
}
