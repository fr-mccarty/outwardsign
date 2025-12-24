import PetitionTemplateForm from "../../petition-template-form"
import { getPetitionTemplateById } from '@/lib/actions/petition-templates'
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { requireSelectedParish } from "@/lib/auth/parish"

export const dynamic = 'force-dynamic'

export default async function EditPetitionTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const selectedParishId = await requireSelectedParish()
  const { data: userParish } = await supabase
    .from('parish_users')
    .select('roles')
    .eq('parish_id', selectedParishId)
    .eq('user_id', user.id)
    .single()

  if (!userParish || !userParish.roles.includes('admin')) {
    redirect('/dashboard')
  }

  const template = await getPetitionTemplateById(id)
  if (!template) {
    notFound()
  }

  return <PetitionTemplateForm template={template} />
}
