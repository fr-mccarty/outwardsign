import { PageContainer } from "@/components/page-container";
import PetitionTemplateForm from "../petition-template-form";
import { getPetitionTemplateById } from '@/lib/actions/petition-templates';
import { getPetitionContextSettings } from '@/lib/actions/petition-settings';
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic'

export default async function EditPetitionTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
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