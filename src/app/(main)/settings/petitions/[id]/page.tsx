import { PageContainer } from "@/components/page-container";
import PetitionTemplateForm from "../petition-template-form";
import { getPetitionTemplateById } from '@/lib/actions/petition-templates';
import { getPetitionContextSettings } from '@/lib/actions/petition-settings';
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { requireSelectedParish } from "@/lib/auth/parish";

export const dynamic = 'force-dynamic'

export default async function EditPetitionTemplatePage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get petition settings for this template
  const settings = await getPetitionContextSettings();
  const templateSettings = settings[id] || '';

  return (
    <PageContainer
      title="Edit Petition Template"
      description="Update your petition template and default text"
      maxWidth="3xl"
    >
      <PetitionTemplateForm template={template} templateSettings={templateSettings} />
    </PageContainer>
  );
}