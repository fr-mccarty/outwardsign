import { PageContainer } from '@/components/page-container'
import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getWedding } from '@/lib/actions/weddings'
import { WeddingForm } from '../../wedding-form'

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
  const wedding = await getWedding(id)

  if (!wedding) {
    notFound()
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Weddings", href: "/weddings" },
    { label: "Edit" }
  ]

  return (
    <PageContainer
      title="Edit Wedding"
      description="Update wedding information."
      maxWidth="4xl"
    >
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <WeddingForm wedding={wedding} />
    </PageContainer>
  )
}
