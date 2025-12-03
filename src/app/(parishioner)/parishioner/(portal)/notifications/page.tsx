import { requireParishionerAuth } from '@/lib/parishioner-auth/middleware'
import { NotificationsView } from './notifications-view'
import { getNotifications } from './actions'

export default async function ParishionerNotificationsPage() {
  const { personId } = await requireParishionerAuth()

  const notifications = await getNotifications(personId, 50, 0)

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <NotificationsView initialNotifications={notifications} personId={personId} />
    </div>
  )
}
