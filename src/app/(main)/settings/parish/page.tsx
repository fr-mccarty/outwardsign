import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ParishSettingsPage() {
  // Redirect to the new general settings page
  redirect('/settings/parish/general')
}
