interface PageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginErrorPage({ searchParams }: PageProps) {
  const { error } = await searchParams

  const errorMessages: Record<string, string> = {
    no_token: 'No authentication token was provided.',
    not_authenticated: 'You need to log in to access this page.',
    parish_not_found: 'The parish could not be found.',
    default: 'An error occurred during login.',
  }

  const message = error ? (errorMessages[error] || decodeURIComponent(error)) : errorMessages.default

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold text-destructive">Login Error</h1>
          <p className="text-muted-foreground mt-4">{message}</p>
        </div>

        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            Please contact your parish office for assistance or try again with a valid link.
          </p>
        </div>
      </div>
    </div>
  )
}
