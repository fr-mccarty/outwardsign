import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'
import { getCustomLists } from '@/lib/actions/custom-lists'
import { CustomListsListClient } from './custom-lists-list-client'

export default async function CustomListsPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  await requireSelectedParish()

  const customLists = await getCustomLists()

  return <CustomListsListClient initialData={customLists} />
}
