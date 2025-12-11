import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'
import { getContentById } from '@/lib/actions/contents'
import { ContentViewClient } from './content-view-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ContentViewPage({ params }: PageProps) {
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

  return <ContentViewClient content={content} />
}
