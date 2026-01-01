import { requireParishionerAuth } from '@/lib/parishioner-auth/middleware'
import { ChatView } from './chat-view'

interface PageProps {
  params: Promise<{ parish_slug: string }>
}

export default async function ParishionerChatPage({ params }: PageProps) {
  const { parish_slug } = await params
  const { personId, parishId } = await requireParishionerAuth(parish_slug)

  return (
    <div className="container mx-auto p-4 max-w-4xl h-full">
      <ChatView personId={personId} parishId={parishId} />
    </div>
  )
}
