import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ErrorTestClient } from "./error-test-client"

export default async function ErrorTestPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <ErrorTestClient />
}
