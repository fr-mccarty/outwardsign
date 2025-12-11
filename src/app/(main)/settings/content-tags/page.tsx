import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'
import { getContentTagsWithUsageCount } from '@/lib/actions/content-tags'
import { ContentTagsList } from './content-tags-list'

export default async function ContentTagsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await requireSelectedParish()

  // Fetch tags with usage count
  const tags = await getContentTagsWithUsageCount()

  return <ContentTagsList initialTags={tags} />
}
