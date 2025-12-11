import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'
import { getCategoryTagById } from '@/lib/actions/category-tags'
import { CategoryTagFormWrapper } from '../../category-tag-form-wrapper'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditCategoryTagPage({ params }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await requireSelectedParish()

  const { id } = await params
  const tag = await getCategoryTagById(id)

  if (!tag) {
    notFound()
  }

  return <CategoryTagFormWrapper tag={tag} />
}
