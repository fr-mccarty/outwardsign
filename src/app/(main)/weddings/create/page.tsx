import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WeddingFormWrapper } from '../wedding-form-wrapper'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

export default async function CreateWeddingPage() {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Weddings", href: "/weddings" },
    { label: "Create" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <WeddingFormWrapper
        title="Create Wedding"
        description="Add a new wedding celebration to your parish."
        saveButtonLabel="Create Wedding"
        actions={
          <Button type="submit" form="wedding-form">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        }
      />
    </>
  )
}
