import { notFound } from 'next/navigation'
import { getParishBySlug } from '@/lib/parishioner-auth/parish-lookup'
import { MagicLinkLoginForm } from './magic-link-login-form'

interface PageProps {
  params: Promise<{ parish_slug: string }>
  searchParams: Promise<{ error?: string }>
}

export default async function ParishionerLoginPage({ params, searchParams }: PageProps) {
  const { parish_slug } = await params
  const { error } = await searchParams

  // Look up parish by slug
  const parish = await getParishBySlug(parish_slug)

  if (!parish) {
    notFound()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{parish.name}</h1>
          <p className="text-lg text-muted-foreground mt-1">Parishioner Portal</p>
          <p className="text-muted-foreground mt-2">
            Enter your email to receive a magic link
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
            {decodeURIComponent(error)}
          </div>
        )}

        <MagicLinkLoginForm parishId={parish.id} parishSlug={parish.slug} />
      </div>
    </div>
  )
}
