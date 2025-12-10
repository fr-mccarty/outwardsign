import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'
import { getCustomListWithItemsBySlug } from '@/lib/actions/custom-lists'
import { CustomListDetailClient } from './custom-list-detail-client'

interface CustomListDetailPageProps {
  params: Promise<{ slug: string }>
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
  const customList = await getCustomListWithItemsBySlug(resolvedParams.slug)

  if (!customList) {
    notFound()
  }

  return <CustomListDetailClient customList={customList} />
}
