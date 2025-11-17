import { createClient } from '@/lib/supabase/server'
import { MODULE_EVENT_TYPE_MAP } from '@/lib/constants'
import type { Event } from '@/lib/types'

export interface ModuleReference {
  moduleType: 'weddings' | 'funerals' | 'presentations' | 'quinceaneras' | 'mass-intentions'
  modulePath: string
  moduleId: string
  moduleDisplay: { en: string; es: string }
  summary: {
    title: string
    details: string[]
    status?: string
  }
}

/**
 * Get module reference for an event by querying backwards
 * Returns module information if this event is linked to a module record
 */
export async function getEventModuleReference(event: Event): Promise<ModuleReference | null> {
  // Check if this event type is linked to a module
  const moduleMapping = MODULE_EVENT_TYPE_MAP[event.event_type]
  if (!moduleMapping) {
    return null // This event type doesn't link to any module
  }

  const supabase = await createClient()
  const { module, column } = moduleMapping

  try {
    // Query the module table for a record where the event column matches this event ID
    const { data, error } = await supabase
      .from(module)
      .select('*')
      .eq(column, event.id)
      .single()

    if (error || !data) {
      return null // No module record found for this event
    }

    // Fetch related people to build better summaries
    const enrichedData = await enrichModuleData(supabase, module, data)

    // Build summary based on module type
    const summary = buildModuleSummary(module, enrichedData)

    return {
      moduleType: module,
      modulePath: `/${module}/${data.id}`,
      moduleId: data.id,
      moduleDisplay: moduleMapping.display,
      summary
    }
  } catch (error) {
    console.error('Error fetching module reference:', error)
    return null
  }
}

/**
 * Enrich module data with related people information
 */
async function enrichModuleData(supabase: any, moduleType: string, data: any): Promise<any> {
  const enriched = { ...data }

  try {
    // Fetch people based on module type
    switch (moduleType) {
      case 'weddings':
        const [bride, groom] = await Promise.all([
          data.bride_id ? supabase.from('people').select('*').eq('id', data.bride_id).single() : Promise.resolve({ data: null }),
          data.groom_id ? supabase.from('people').select('*').eq('id', data.groom_id).single() : Promise.resolve({ data: null })
        ])
        enriched.bride = bride.data
        enriched.groom = groom.data
        break

      case 'funerals':
        const [deceased, familyContact] = await Promise.all([
          data.deceased_id ? supabase.from('people').select('*').eq('id', data.deceased_id).single() : Promise.resolve({ data: null }),
          data.family_contact_id ? supabase.from('people').select('*').eq('id', data.family_contact_id).single() : Promise.resolve({ data: null })
        ])
        enriched.deceased = deceased.data
        enriched.family_contact = familyContact.data
        break

      case 'presentations':
        const [child, mother, father] = await Promise.all([
          data.child_id ? supabase.from('people').select('*').eq('id', data.child_id).single() : Promise.resolve({ data: null }),
          data.mother_id ? supabase.from('people').select('*').eq('id', data.mother_id).single() : Promise.resolve({ data: null }),
          data.father_id ? supabase.from('people').select('*').eq('id', data.father_id).single() : Promise.resolve({ data: null })
        ])
        enriched.child = child.data
        enriched.mother = mother.data
        enriched.father = father.data
        break

      case 'quinceaneras':
        const [quinceanera, quinceaneraFamilyContact] = await Promise.all([
          data.quinceanera_id ? supabase.from('people').select('*').eq('id', data.quinceanera_id).single() : Promise.resolve({ data: null }),
          data.family_contact_id ? supabase.from('people').select('*').eq('id', data.family_contact_id).single() : Promise.resolve({ data: null })
        ])
        enriched.quinceanera = quinceanera.data
        enriched.family_contact = quinceaneraFamilyContact.data
        break
    }
  } catch (error) {
    console.error('Error enriching module data:', error)
  }

  return enriched
}

/**
 * Build a summary of the module for display on event pages
 */
function buildModuleSummary(
  moduleType: string,
  moduleData: any
): { title: string; details: string[]; status?: string } {
  switch (moduleType) {
    case 'weddings':
      return buildWeddingSummary(moduleData)

    case 'funerals':
      return buildFuneralSummary(moduleData)

    case 'presentations':
      return buildPresentationSummary(moduleData)

    case 'quinceaneras':
      return buildQuinceaneraSummary(moduleData)

    case 'mass-intentions':
      return buildMassIntentionSummary(moduleData)

    default:
      return {
        title: 'Module Record',
        details: ['View full details'],
        status: moduleData.status
      }
  }
}

/**
 * Build wedding summary
 */
function buildWeddingSummary(wedding: any): { title: string; details: string[]; status?: string } {
  const details: string[] = []

  // Add bride and groom names
  if (wedding.bride) {
    const brideName = `${wedding.bride.first_name} ${wedding.bride.last_name}`.trim()
    details.push(`Bride: ${brideName}`)
  }
  if (wedding.groom) {
    const groomName = `${wedding.groom.first_name} ${wedding.groom.last_name}`.trim()
    details.push(`Groom: ${groomName}`)
  }

  return {
    title: 'Wedding Celebration',
    details: details.length > 0 ? details : ['View full wedding details'],
    status: wedding.status
  }
}

/**
 * Build funeral summary
 */
function buildFuneralSummary(funeral: any): { title: string; details: string[]; status?: string } {
  const details: string[] = []

  if (funeral.deceased) {
    const deceasedName = `${funeral.deceased.first_name} ${funeral.deceased.last_name}`.trim()
    details.push(`Deceased: ${deceasedName}`)
  }
  if (funeral.family_contact) {
    const contactName = `${funeral.family_contact.first_name} ${funeral.family_contact.last_name}`.trim()
    details.push(`Family Contact: ${contactName}`)
  }

  return {
    title: 'Funeral Service',
    details: details.length > 0 ? details : ['View full funeral details'],
    status: funeral.status
  }
}

/**
 * Build presentation summary
 */
function buildPresentationSummary(presentation: any): { title: string; details: string[]; status?: string } {
  const details: string[] = []

  if (presentation.child) {
    const childName = `${presentation.child.first_name} ${presentation.child.last_name}`.trim()
    details.push(`Child: ${childName}`)
  }
  if (presentation.mother) {
    const motherName = `${presentation.mother.first_name} ${presentation.mother.last_name}`.trim()
    details.push(`Mother: ${motherName}`)
  }
  if (presentation.father) {
    const fatherName = `${presentation.father.first_name} ${presentation.father.last_name}`.trim()
    details.push(`Father: ${fatherName}`)
  }
  if (presentation.is_baptized) {
    details.push('Child is baptized')
  }

  return {
    title: 'Presentation',
    details: details.length > 0 ? details : ['View full presentation details'],
    status: presentation.status
  }
}

/**
 * Build quinceañera summary
 */
function buildQuinceaneraSummary(quinceanera: any): { title: string; details: string[]; status?: string } {
  const details: string[] = []

  if (quinceanera.quinceanera) {
    const quinceaneraName = `${quinceanera.quinceanera.first_name} ${quinceanera.quinceanera.last_name}`.trim()
    details.push(`Quinceañera: ${quinceaneraName}`)
  }
  if (quinceanera.family_contact) {
    const contactName = `${quinceanera.family_contact.first_name} ${quinceanera.family_contact.last_name}`.trim()
    details.push(`Family Contact: ${contactName}`)
  }

  return {
    title: 'Quinceañera Celebration',
    details: details.length > 0 ? details : ['View full quinceañera details'],
    status: quinceanera.status
  }
}

/**
 * Build mass intention summary
 */
function buildMassIntentionSummary(massIntention: any): { title: string; details: string[]; status?: string } {
  const details: string[] = []

  if (massIntention.intention_for_id) {
    details.push(`Intention for: ${massIntention.intention_for_id}`)
  }
  if (massIntention.offered_by_id) {
    details.push(`Offered by: ${massIntention.offered_by_id}`)
  }
  if (massIntention.amount_donated) {
    details.push(`Donation: $${massIntention.amount_donated}`)
  }

  return {
    title: 'Mass Intention',
    details: details.length > 0 ? details : ['View full mass intention details'],
    status: massIntention.status
  }
}
