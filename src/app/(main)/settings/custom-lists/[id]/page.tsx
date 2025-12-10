import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'
import { getCustomListWithItems } from '@/lib/actions/custom-lists'
import { CustomListDetailClient } from './custom-list-detail-client'

interface CustomListDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CustomListDetailPage({ params }: CustomListDetailPageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  await requireSelectedParish()

  const resolvedParams = await params
  const customList = await getCustomListWithItems(resolvedParams.id)

  if (!customList) {
    notFound()
  }

  return <CustomListDetailClient customList={customList} />
}
