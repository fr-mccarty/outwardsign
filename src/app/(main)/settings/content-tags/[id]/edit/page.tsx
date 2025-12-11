import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'
import { getContentTagById } from '@/lib/actions/content-tags'
import { ContentTagFormWrapper } from '../../content-tag-form-wrapper'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditContentTagPage({ params }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await requireSelectedParish()

  const { id } = await params
  const tag = await getContentTagById(id)

  if (!tag) {
    notFound()
  }

  return <ContentTagFormWrapper tag={tag} />
}
