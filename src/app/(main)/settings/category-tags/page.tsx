import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'
import { getCategoryTagsWithUsageCount } from '@/lib/actions/category-tags'
import { CategoryTagsList } from './category-tags-list'

export default async function CategoryTagsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await requireSelectedParish()

  // Fetch tags with usage count
  const tags = await getCategoryTagsWithUsageCount()

  return <CategoryTagsList initialTags={tags} />
}
