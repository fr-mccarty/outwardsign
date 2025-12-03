import { BreadcrumbSetter } from '@/components/breadcrumb-setter'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getBaptismWithRelations } from '@/lib/actions/baptisms'
import { BaptismFormWrapper } from '../../baptism-form-wrapper'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditBaptismPage({ params }: PageProps) {
  const supabase = await createClient()

  // Check authentication server-side
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const baptism = await getBaptismWithRelations(id)

  if (!baptism) {
    notFound()
  }

  // Build dynamic title from child name
  const child = (baptism as any).child
  let title = "Baptism"

  if (child?.last_name) {
    title = `${child.first_name || ''} ${child.last_name}-Baptism`.trim()
  } else if (child?.first_name) {
    title = `${child.first_name}-Baptism`
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Our Baptisms", href: "/baptisms" },
    { label: "Edit" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <BaptismFormWrapper
        baptism={baptism}
        title={title}
        description="Update baptism information."
      />
    </>
  )
}
