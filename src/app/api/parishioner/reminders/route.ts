import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendCommitmentReminderEmail } from '@/lib/email'

/**
 * Send reminders for upcoming commitments (3 days ahead)
 * This API route should be triggered by a cron job
 *
 * Usage:
 * - Vercel Cron: Configure in vercel.json
 * - Manual trigger: GET /api/parishioner/reminders
 *
 * Authentication: Requires CRON_SECRET environment variable
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Calculate date 3 days from now
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    const targetDate = threeDaysFromNow.toISOString().split('T')[0]

    // Find all mass assignments for that date
    const { data: assignments, error } = await supabase
      .from('mass_assignments')
      .select(
        `
        id,
        role,
        person_id,
        mass:masses (
          id,
          date,
          time,
          name
        )
      `
      )

    if (error) {
      console.error('Error fetching mass assignments:', error)
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
    }

    // Filter assignments for target date
    const targetAssignments = assignments?.filter((a: any) => a.mass && a.mass.date === targetDate)

    if (!targetAssignments || targetAssignments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No assignments found for target date',
        date: targetDate,
        sent: 0,
      })
    }

    // Get person details for each assignment
    const personIds = targetAssignments.map((a: any) => a.person_id)
    const { data: people } = await supabase
      .from('people')
      .select('id, full_name, email, phone_number, parishioner_portal_enabled')
      .in('id', personIds)

    if (!people) {
      return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 })
    }

    const peopleMap = new Map(people.map((p) => [p.id, p]))

    let sentCount = 0
    const results = []

    // Send reminders
    for (const assignment of targetAssignments) {
      const person = peopleMap.get(assignment.person_id)
      if (!person || !person.parishioner_portal_enabled) {
        continue
      }

      const mass = assignment.mass as unknown as { id: string; date: string; time: string; name: string }

      const commitment = {
        role: assignment.role,
        date: new Date(mass.date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }),
        time: mass.time || 'TBD',
        location: 'Parish', // Location fetched from location_id if needed
      }

      // Determine language preference (TODO: add to people table)
      const language: 'en' | 'es' = 'en'

      // Send email reminder
      let sent = false
      if (person.email) {
        sent = await sendCommitmentReminderEmail(person.email, commitment, language)
      }

      if (sent) {
        sentCount++
        results.push({
          person: person.full_name,
          role: assignment.role,
          delivered: true,
        })
      } else {
        results.push({
          person: person.full_name,
          role: assignment.role,
          delivered: false,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} reminders for ${targetDate}`,
      date: targetDate,
      total: targetAssignments.length,
      sent: sentCount,
      results,
    })
  } catch (error) {
    console.error('Error sending reminders:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
