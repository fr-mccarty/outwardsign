import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'
import { getTemplate } from '@/lib/actions/master-event-templates'
import { EventTemplateViewClient } from './event-template-view-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EventTemplateViewPage({ params }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await requireSelectedParish()

  const { id } = await params
  const template = await getTemplate(id)

  if (!template) {
    notFound()
  }

  return <EventTemplateViewClient template={template} />
}
