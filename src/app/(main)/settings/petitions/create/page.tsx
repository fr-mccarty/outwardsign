import { PageContainer } from "@/components/page-container";
import PetitionTemplateForm from "../petition-template-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CreatePetitionTemplatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  return (
    <PageContainer 
      title="Create Petition Template" 
      description="Create a new petition template for your liturgical celebrations"
      maxWidth="3xl"
    >
      <PetitionTemplateForm />
    </PageContainer>
  );
}