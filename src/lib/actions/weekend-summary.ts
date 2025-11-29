'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getWeddings, WeddingWithRelations } from './weddings'
import { getBaptisms, BaptismWithRelations } from './baptisms'
import { getFunerals, FuneralWithRelations } from './funerals'
import { getPresentations, PresentationWithRelations } from './presentations'
import { getQuinceaneras, QuinceaneraWithRelations } from './quinceaneras'
import { getMasses, MassWithNames } from './masses'
import { getMassRoleInstances, MassRoleInstanceWithRelations } from './mass-roles'
import { toLocalDateString } from '@/lib/utils/formatters'

export interface WeekendSummaryParams {
  sundayDate: string // ISO date string (YYYY-MM-DD)
  includeSacraments: boolean
  includeMasses: boolean
  includeMassRoles: boolean
}

export interface WeekendSummaryData {
  sundayDate: string
  saturdayDate: string

  // Sacraments
  weddings: WeddingWithRelations[]
  baptisms: BaptismWithRelations[]
  funerals: FuneralWithRelations[]
  presentations: PresentationWithRelations[]
  quinceaneras: QuinceaneraWithRelations[]

  // Masses
  masses: MassWithNames[]

  // Mass Roles (grouped by mass)
  massRoles: {
    massId: string
    massTitle: string
    roles: MassRoleInstanceWithRelations[]
  }[]
}

/**
 * Fetches all weekend data (Saturday through Sunday) based on the selected Sunday date
 */
export async function getWeekendSummaryData(
  params: WeekendSummaryParams
): Promise<WeekendSummaryData> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Calculate Saturday (day before Sunday)
  const sunday = new Date(params.sundayDate + 'T00:00:00')
  const saturday = new Date(sunday)
  saturday.setDate(saturday.getDate() - 1)

  const saturdayDate = toLocalDateString(saturday)
  const sundayDate = params.sundayDate

  // Initialize result
  const result: WeekendSummaryData = {
    sundayDate,
    saturdayDate,
    weddings: [],
    baptisms: [],
    funerals: [],
    presentations: [],
    quinceaneras: [],
    masses: [],
    massRoles: []
  }

  // Fetch sacraments if requested
  if (params.includeSacraments) {
    // Fetch all sacraments that have events during the weekend
    const [weddings, baptisms, funerals, presentations, quinceaneras] = await Promise.all([
      getWeddings(),
      getBaptisms(),
      getFunerals(),
      getPresentations(),
      getQuinceaneras()
    ])

    // Filter sacraments to only include those with events on Saturday or Sunday
    result.weddings = weddings.filter(w => {
      const eventDate = w.wedding_event?.start_date
      return eventDate && (eventDate === saturdayDate || eventDate === sundayDate)
    })

    result.baptisms = baptisms.filter(b => {
      const eventDate = b.baptism_event?.start_date
      return eventDate && (eventDate === saturdayDate || eventDate === sundayDate)
    })

    result.funerals = funerals.filter(f => {
      const eventDate = f.funeral_event?.start_date
      return eventDate && (eventDate === saturdayDate || eventDate === sundayDate)
    })

    result.presentations = presentations.filter(p => {
      const eventDate = p.presentation_event?.start_date
      return eventDate && (eventDate === saturdayDate || eventDate === sundayDate)
    })

    result.quinceaneras = quinceaneras.filter(q => {
      const eventDate = q.quinceanera_event?.start_date
      return eventDate && (eventDate === saturdayDate || eventDate === sundayDate)
    })
  }

  // Fetch masses if requested
  if (params.includeMasses) {
    const masses = await getMasses({
      start_date: saturdayDate,
      end_date: sundayDate
    })

    result.masses = masses.filter(m => {
      const eventDate = m.event?.start_date
      return eventDate && (eventDate === saturdayDate || eventDate === sundayDate)
    })
  }

  // Fetch mass roles if requested
  if (params.includeMassRoles && result.masses.length > 0) {
    // Get mass role instances for each mass
    const massRolePromises = result.masses.map(async (mass) => {
      const roles = await getMassRoleInstances(mass.id)
      return {
        massId: mass.id,
        massTitle: `${mass.event?.start_date} ${mass.event?.start_time || ''}`.trim(),
        roles
      }
    })

    result.massRoles = await Promise.all(massRolePromises)
  }

  return result
}
