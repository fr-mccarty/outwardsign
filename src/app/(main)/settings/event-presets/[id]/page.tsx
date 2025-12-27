import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'
import { getPreset } from '@/lib/actions/event-presets'
import { EventPresetViewClient } from './event-preset-view-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EventPresetViewPage({ params }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await requireSelectedParish()

  const { id } = await params
  const preset = await getPreset(id)

  if (!preset) {
    notFound()
  }

  return <EventPresetViewClient preset={preset} />
}
