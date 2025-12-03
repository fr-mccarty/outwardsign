import { MagicLinkLoginForm } from './magic-link-login-form'

export default function ParishionerLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Parishioner Portal</h1>
          <p className="text-muted-foreground mt-2">
            Enter your email or phone number to receive a magic link
          </p>
        </div>

        <MagicLinkLoginForm />
      </div>
    </div>
  )
}
