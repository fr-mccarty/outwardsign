import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'
import { CategoryTagFormWrapper } from '../category-tag-form-wrapper'

export default async function CreateCategoryTagPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await requireSelectedParish()

  return <CategoryTagFormWrapper />
}
