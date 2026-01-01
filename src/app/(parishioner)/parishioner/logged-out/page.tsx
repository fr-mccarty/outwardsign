export default function LoggedOutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold">Logged Out</h1>
          <p className="text-muted-foreground mt-4">
            You have been successfully logged out of the parishioner portal.
          </p>
        </div>

        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            To log in again, please use the link provided by your parish.
          </p>
        </div>
      </div>
    </div>
  )
}
