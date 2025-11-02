import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getWeddingWithRelations } from '@/lib/actions/weddings'
import { WeddingFormWrapper } from '../../wedding-form-wrapper'
import { Button } from '@/components/ui/button'
import { Eye, Save } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditWeddingPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const wedding = await getWeddingWithRelations(id)

  if (!wedding) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Weddings", href: "/weddings" },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <WeddingFormWrapper
        wedding={wedding}
        title="Edit Wedding"
        description="Update wedding information."
        saveButtonLabel="Save Wedding"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/weddings/${id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Wedding
              </Link>
            </Button>
            <Button type="submit" form="wedding-form">
              <Save className="h-4 w-4 mr-2" />
              Update Wedding
            </Button>
          </>
        }
      />
    </>
  )
}
