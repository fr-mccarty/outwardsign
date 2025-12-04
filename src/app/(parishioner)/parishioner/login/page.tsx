import { MagicLinkLoginForm } from './magic-link-login-form'

interface PageProps {
  searchParams: Promise<{ parish?: string }>
}

export default async function ParishionerLoginPage({ searchParams }: PageProps) {
  const params = await searchParams
  const parishId = params.parish || '00000000-0000-0000-0000-000000000000'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Parishioner Portal</h1>
          <p className="text-muted-foreground mt-2">
            Enter your email to receive a magic link
          </p>
        </div>

        <MagicLinkLoginForm parishId={parishId} />
      </div>
    </div>
  )
}
