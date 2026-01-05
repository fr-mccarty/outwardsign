'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/page-container'
import { ContentCard } from '@/components/content-card'
import { ListCard } from '@/components/list-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LinkButton } from '@/components/link-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreVertical,
  ShieldOff,
  Send,
  User,
  Users,
  Clock,
  Activity,
} from 'lucide-react'
import {
  getParishionerPortalStats,
  getActiveParishionerSessions,
  getPortalEnabledParishioners,
  revokeSession,
  revokeAllSessions,
  sendParishionerMagicLink,
  type PortalStats,
  type ParishionerSession,
  type PortalEnabledParishioner,
} from '@/lib/actions/parishioner-portal'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { formatDateRelative } from '@/lib/utils/formatters'

interface ParishionerPortalSettingsClientProps {
  initialStats: PortalStats
  initialSessions: ParishionerSession[]
  initialParishioners: PortalEnabledParishioner[]
}

export function ParishionerPortalSettingsClient({
  initialStats,
  initialSessions,
  initialParishioners,
}: ParishionerPortalSettingsClientProps) {
  const [stats, setStats] = useState<PortalStats>(initialStats)
  const [sessions, setSessions] = useState<ParishionerSession[]>(initialSessions)
  const [parishioners, setParishioners] = useState<PortalEnabledParishioner[]>(initialParishioners)

  // Revoke single session dialog
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [sessionToRevoke, setSessionToRevoke] = useState<ParishionerSession | null>(null)

  // Revoke all sessions dialog
  const [revokeAllDialogOpen, setRevokeAllDialogOpen] = useState(false)

  async function loadData() {
    try {
      const [newStats, newSessions, newParishioners] = await Promise.all([
        getParishionerPortalStats(),
        getActiveParishionerSessions(),
        getPortalEnabledParishioners(),
      ])
      setStats(newStats)
      setSessions(newSessions)
      setParishioners(newParishioners)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to refresh data')
    }
  }

  const handleOpenRevokeDialog = (session: ParishionerSession) => {
    setSessionToRevoke(session)
    setRevokeDialogOpen(true)
  }

  const handleConfirmRevoke = async () => {
    if (!sessionToRevoke) return

    try {
      const result = await revokeSession(sessionToRevoke.id)
      if (result.success) {
        toast.success('Session revoked')
        setSessionToRevoke(null)
        await loadData()
      } else {
        toast.error(result.error || 'Failed to revoke session')
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error revoking session:', error)
      throw error
    }
  }

  const handleConfirmRevokeAll = async () => {
    try {
      const result = await revokeAllSessions()
      if (result.success) {
        toast.success(`Revoked ${result.count} session${result.count !== 1 ? 's' : ''}`)
        await loadData()
      } else {
        toast.error(result.error || 'Failed to revoke sessions')
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error revoking all sessions:', error)
      throw error
    }
  }

  const handleSendMagicLink = async (personId: string, personName: string) => {
    try {
      const result = await sendParishionerMagicLink(personId)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error sending magic link:', error)
      toast.error(`Failed to send magic link to ${personName}`)
    }
  }

  const renderSessionItem = (session: ParishionerSession) => {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{session.person?.full_name || 'Unknown'}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {session.email_or_phone}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {session.last_accessed_at
              ? `Last accessed ${formatDateRelative(session.last_accessed_at)}`
              : 'Never accessed'}
            {' • '}
            Expires {formatDateRelative(session.expires_at)}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <LinkButton
                href={`/people/${session.person_id}`}
                variant="ghost"
                className="w-full justify-start px-2 h-8 font-normal"
              >
                <User className="h-4 w-4 mr-2" />
                View Person
              </LinkButton>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleOpenRevokeDialog(session)}
              className="text-destructive"
            >
              <ShieldOff className="h-4 w-4 mr-2" />
              Revoke Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  const renderParishionerItem = (person: PortalEnabledParishioner) => {
    const hasEmail = !!person.email

    return (
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{person.full_name}</span>
            <Badge variant="secondary" className="text-xs">
              Portal Enabled
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {person.email || person.phone_number || 'No contact info'}
          </div>
          {person.last_portal_access && (
            <div className="text-xs text-muted-foreground mt-2">
              Last access: {formatDateRelative(person.last_portal_access)}
            </div>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <LinkButton
                href={`/people/${person.id}`}
                variant="ghost"
                className="w-full justify-start px-2 h-8 font-normal"
              >
                <User className="h-4 w-4 mr-2" />
                View Person
              </LinkButton>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSendMagicLink(person.id, person.full_name)}
              disabled={!hasEmail}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Login Link
              {!hasEmail && <span className="ml-2 text-xs">(No email)</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <>
      <PageContainer
        title="Parishioner Portal"
        description="Manage parishioner portal access and active sessions. The portal allows parishioners to view their sacrament information and schedules."
      >
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ContentCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEnabled}</p>
                <p className="text-sm text-muted-foreground">Portal Enabled</p>
              </div>
            </div>
          </ContentCard>

          <ContentCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeSessions}</p>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
              </div>
            </div>
          </ContentCard>

          <ContentCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.recentLogins}</p>
                <p className="text-sm text-muted-foreground">Logins (7 days)</p>
              </div>
            </div>
          </ContentCard>
        </div>

        {/* Active Sessions */}
        <ContentCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Active Sessions ({sessions.length})</h3>
              <p className="text-sm text-muted-foreground">
                Currently logged-in parishioners with valid sessions
              </p>
            </div>
            {sessions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRevokeAllDialogOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                <ShieldOff className="h-4 w-4 mr-2" />
                Revoke All
              </Button>
            )}
          </div>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No active sessions
            </p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id}>{renderSessionItem(session)}</div>
              ))}
            </div>
          )}
        </ContentCard>

        {/* Portal-Enabled Parishioners */}
        <ListCard
          title={`Portal-Enabled Parishioners (${parishioners.length})`}
          description="People with portal access enabled. Manage individual access from their profile page."
          items={parishioners}
          renderItem={renderParishionerItem}
          getItemId={(person) => person.id}
          emptyMessage="No parishioners have portal access enabled. Enable portal access from a person's profile page."
        />
      </PageContainer>

      {/* Revoke Session Confirmation Dialog */}
      <ConfirmationDialog
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
        title="Revoke Session"
        itemName={sessionToRevoke?.person?.full_name}
        confirmLabel="Revoke"
        onConfirm={handleConfirmRevoke}
      >
        <p className="text-sm text-muted-foreground">
          This will immediately log out this parishioner. They will need to request a new login link
          to access the portal again.
        </p>
      </ConfirmationDialog>

      {/* Revoke All Sessions Confirmation Dialog */}
      <ConfirmationDialog
        open={revokeAllDialogOpen}
        onOpenChange={setRevokeAllDialogOpen}
        title="Revoke All Sessions"
        itemName={`${sessions.length} active session${sessions.length !== 1 ? 's' : ''}`}
        confirmLabel="Revoke All"
        onConfirm={handleConfirmRevokeAll}
      >
        <p className="text-sm text-muted-foreground">
          This will immediately log out all parishioners. They will each need to request a new login
          link to access the portal again.
        </p>
      </ConfirmationDialog>
    </>
  )
}
