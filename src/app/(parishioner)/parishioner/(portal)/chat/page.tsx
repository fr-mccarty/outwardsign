import { requireParishionerAuth } from '@/lib/parishioner-auth/middleware'
import { ChatView } from './chat-view'

export default async function ParishionerChatPage() {
  const { personId, parishId } = await requireParishionerAuth()

  return (
    <div className="container mx-auto p-4 max-w-4xl h-full">
      <ChatView personId={personId} parishId={parishId} />
    </div>
  )
}
