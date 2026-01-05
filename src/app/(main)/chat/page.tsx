import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ChatView } from './chat-view'
import { PageContainer } from '@/components/page-container'
import { DescriptionWithDocLink } from '@/components/description-with-doc-link'

export default async function StaffChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const parishId = await requireSelectedParish()

  return (
    <PageContainer
      title="AI Assistant"
      description={
        <DescriptionWithDocLink
          description="Chat with AI to query and manage parish data."
          href="/docs/ai-assistant"
          linkText="View documentation"
        />
      }
    >
      <ChatView userId={user.id} parishId={parishId} />
    </PageContainer>
  )
}
