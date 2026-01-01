import { requireParishionerAuth } from '@/lib/parishioner-auth/middleware'
import { NotificationsView } from './notifications-view'
import { getNotifications } from './actions'

interface PageProps {
  params: Promise<{ parish_slug: string }>
}

export default async function ParishionerNotificationsPage({ params }: PageProps) {
  const { parish_slug } = await params
  const { personId } = await requireParishionerAuth(parish_slug)

  // Fetch initial notifications
  const initialNotifications = await getNotifications(personId, 20, 0)

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <NotificationsView personId={personId} initialNotifications={initialNotifications} />
    </div>
  )
}
