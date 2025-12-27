import { notFound } from 'next/navigation'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getPreset } from '@/lib/actions/event-presets'
import { EventPresetEditClient } from './event-preset-edit-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditEventPresetPage({ params }: PageProps) {
  // Check authentication and admin permissions
  await checkSettingsAccess()

  const { id } = await params
  const preset = await getPreset(id)

  if (!preset) {
    notFound()
  }

  return <EventPresetEditClient preset={preset} />
}
