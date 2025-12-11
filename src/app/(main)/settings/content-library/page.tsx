import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ContentLibraryList } from './content-library-list'
import { getContents } from '@/lib/actions/contents'

interface PageProps {
  searchParams: Promise<{
    search?: string
    language?: string
    page?: string
  }>
}

export default async function ContentLibraryPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await requireSelectedParish()
  const params = await searchParams

  // Parse search params
  const search = params.search || ''
  const language = params.language as 'en' | 'es' | undefined
  const page = parseInt(params.page || '1', 10)
  const limit = 20
  const offset = (page - 1) * limit

  // Fetch contents with filters
  const result = await getContents({
    search: search || undefined,
    language,
    limit,
    offset,
  })

  return (
    <ContentLibraryList
      initialContents={result.items}
      initialTotalCount={result.totalCount}
      initialPage={page}
    />
  )
}
