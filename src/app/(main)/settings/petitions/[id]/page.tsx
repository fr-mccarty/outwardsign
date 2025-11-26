import { PageContainer } from "@/components/page-container";
import { PetitionTemplateViewClient } from "./petition-template-view-client";
import { getPetitionTemplateById } from '@/lib/actions/petition-templates';
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { requireSelectedParish } from "@/lib/auth/parish";
import { BreadcrumbSetter } from '@/components/breadcrumb-setter';

export const dynamic = 'force-dynamic'

export default async function ViewPetitionTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check admin permissions
  const selectedParishId = await requireSelectedParish();
  const { data: userParish } = await supabase
    .from('parish_users')
    .select('roles')
    .eq('parish_id', selectedParishId)
    .eq('user_id', user.id)
    .single();

  if (!userParish || !userParish.roles.includes('admin')) {
    redirect('/dashboard');
  }

  const template = await getPetitionTemplateById(id);

  if (!template) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings" },
    { label: "Petitions", href: "/settings/petitions" },
    { label: template.title }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PageContainer
        title={template.title}
        description="Petition template details"
      >
        <PetitionTemplateViewClient template={template} />
      </PageContainer>
    </>
  );
}