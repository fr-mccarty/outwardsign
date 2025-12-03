import { redirect } from 'next/navigation'
import { validateMagicLink } from '@/lib/parishioner-auth/actions'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ParishionerAuthPage({ searchParams }: PageProps) {
  const params = await searchParams
  const token = params.token

  if (!token) {
    redirect('/parishioner/login?error=no_token')
  }

  const result = await validateMagicLink(token)

  if (!result.success) {
    redirect(`/parishioner/login?error=${encodeURIComponent(result.error || 'Invalid link')}`)
  }

  // Successfully authenticated, redirect to calendar
  redirect('/parishioner/calendar')
}
