import { PageContainer } from '@/components/page-container';
import { getPetitionTemplates, ensureDefaultContexts } from '@/lib/actions/petition-templates';
import PetitionTemplateList from './petition-template-list';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { requireSelectedParish } from '@/lib/auth/parish';

export const dynamic = 'force-dynamic'

export default async function PetitionSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
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

  // Ensure initial contexts are created
  await ensureDefaultContexts();
  const templates = await getPetitionTemplates();

  return (
    <PageContainer
      title="Petition Templates"
      description="Manage petition templates for your liturgical celebrations. Create custom contexts as needed."
      maxWidth="6xl"
    >
      <PetitionTemplateList templates={templates} />
    </PageContainer>
  );
}