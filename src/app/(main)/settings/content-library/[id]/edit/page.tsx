import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'
import { getContentById } from '@/lib/actions/contents'
import { ContentFormWrapper } from '../../content-form-wrapper'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditContentPage({ params }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await requireSelectedParish()

  const { id } = await params
  const content = await getContentById(id)

  if (!content) {
    notFound()
  }

  return <ContentFormWrapper content={content} />
}
