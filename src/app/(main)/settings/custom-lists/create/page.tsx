import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'
import { CustomListCreateClient } from './custom-list-create-client'

export default async function CreateCustomListPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  await requireSelectedParish()

  return <CustomListCreateClient />
}
