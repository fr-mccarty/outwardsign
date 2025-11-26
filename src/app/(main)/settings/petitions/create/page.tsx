import { PageContainer } from "@/components/page-container";
import PetitionTemplateForm from "../petition-template-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { requireSelectedParish } from "@/lib/auth/parish";
import { BreadcrumbSetter } from '@/components/breadcrumb-setter';

export const dynamic = 'force-dynamic'

export default async function CreatePetitionTemplatePage() {
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

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings" },
    { label: "Petitions", href: "/settings/petitions" },
    { label: "Create Template" }
  ]

  return (
    <>
      <BreadcrumbSetter breadcrumbs={breadcrumbs} />
      <PageContainer
        title="Create Petition Template"
        description="Create a new petition template for your liturgical celebrations"
      >
        <PetitionTemplateForm />
      </PageContainer>
    </>
  );
}