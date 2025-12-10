'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
// Temporarily disabled - old modules removed in favor of dynamic events
// import { getWeddings, WeddingWithRelations } from './weddings'
// import { getBaptisms, BaptismWithRelations } from './baptisms'
// import { getFunerals, FuneralWithRelations } from './funerals'
// import { getPresentations, PresentationWithRelations } from './presentations'
// import { getQuinceaneras, QuinceaneraWithRelations } from './quinceaneras'
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

  // Sacraments - temporarily empty until migrated to dynamic events
  // weddings: WeddingWithRelations[]
  // baptisms: BaptismWithRelations[]
  // funerals: FuneralWithRelations[]
  // presentations: PresentationWithRelations[]
  // quinceaneras: QuinceaneraWithRelations[]

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
  await requireSelectedParish()
  await ensureJWTClaims()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _supabase = await createClient()

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
    // Sacraments temporarily disabled - will be replaced with dynamic events
    // weddings: [],
    // baptisms: [],
    // funerals: [],
    // presentations: [],
    // quinceaneras: [],
    masses: [],
    massRoles: []
  }

  // Sacraments temporarily disabled - will be replaced with dynamic events
  // if (params.includeSacraments) {
  //   // Fetch all sacraments that have events during the weekend
  //   const [weddings, baptisms, funerals, presentations, quinceaneras] = await Promise.all([
  //     getWeddings(),
  //     getBaptisms(),
  //     getFunerals(),
  //     getPresentations(),
  //     getQuinceaneras()
  //   ])
  //   ...
  // }

  // Suppress unused variable warning
  void params.includeSacraments

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
