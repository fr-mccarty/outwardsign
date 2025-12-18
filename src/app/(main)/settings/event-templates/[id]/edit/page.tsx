import { notFound } from 'next/navigation'
import { checkSettingsAccess } from '@/lib/auth/permissions'
import { getTemplate } from '@/lib/actions/master-event-templates'
import { EventTemplateEditClient } from './event-template-edit-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditEventTemplatePage({ params }: PageProps) {
  // Check authentication and admin permissions
  await checkSettingsAccess()

  const { id } = await params
  const template = await getTemplate(id)

  if (!template) {
    notFound()
  }

  return <EventTemplateEditClient template={template} />
}
