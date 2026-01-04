'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FormDialog } from '@/components/form-dialog'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { Clock, User, RotateCcw, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import {
  getRecordHistory,
  rollbackToAuditLog,
  canRestoreAuditLog,
  type AuditLog,
} from '@/lib/actions/audit-logs'
import { formatDateRelative, formatDatePretty } from '@/lib/utils/formatters'
import { toast } from 'sonner'

interface ChangeHistoryPanelProps {
  /** Database table name (e.g., 'people', 'master_events') */
  tableName: string
  /** Record ID to show history for */
  recordId: string
  /** Optional title override */
  title?: string
  /** Whether to start collapsed */
  defaultCollapsed?: boolean
  /** Callback when a restore is completed */
  onRestore?: () => void
}

const OPERATION_LABELS: Record<string, string> = {
  INSERT: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  RESTORE: 'Restored',
}

const SOURCE_LABELS: Record<string, string> = {
  application: 'App',
  ai_chat: 'AI',
  mcp: 'MCP',
  system: 'System',
  migration: 'Migration',
}

export function ChangeHistoryPanel({
  tableName,
  recordId,
  title = 'Change History',
  defaultCollapsed = true,
  onRestore,
}: ChangeHistoryPanelProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<AuditLog[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)

  // Detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  // Rollback confirmation
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false)
  const [logToRollback, setLogToRollback] = useState<AuditLog | null>(null)
  const [canRollback, setCanRollback] = useState(false)
  const [rollbackReason, setRollbackReason] = useState('')

  useEffect(() => {
    async function fetchHistory() {
      if (!collapsed && !hasLoaded) {
        try {
          setLoading(true)
          const data = await getRecordHistory(tableName, recordId)
          setHistory(data)
          setHasLoaded(true)
        } catch (error) {
          console.error('Error loading history:', error)
          toast.error('Failed to load change history')
        } finally {
          setLoading(false)
        }
      }
    }
    fetchHistory()
  }, [collapsed, hasLoaded, tableName, recordId])

  async function loadHistory() {
    try {
      setLoading(true)
      const data = await getRecordHistory(tableName, recordId)
      setHistory(data)
      setHasLoaded(true)
    } catch (error) {
      console.error('Error loading history:', error)
      toast.error('Failed to load change history')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setDetailDialogOpen(true)
  }

  const handleOpenRollback = async (log: AuditLog) => {
    const result = await canRestoreAuditLog(log.id)
    setCanRollback(result.canRestore)
    setRollbackReason(result.reason || '')
    setLogToRollback(log)
    setRollbackDialogOpen(true)
  }

  const handleConfirmRollback = async () => {
    if (!logToRollback) return

    try {
      const result = await rollbackToAuditLog(logToRollback.id)
      toast.success(result.message)
      setRollbackDialogOpen(false)
      setLogToRollback(null)
      await loadHistory()
      onRestore?.()
      router.refresh()
    } catch (error) {
      console.error('Error performing rollback:', error)
      toast.error('Failed to restore previous state')
      throw error
    }
  }

  const getOperationVariant = (
    operation: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (operation) {
      case 'INSERT':
        return 'default'
      case 'UPDATE':
        return 'secondary'
      case 'DELETE':
        return 'destructive'
      case 'RESTORE':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="border rounded-lg">
      {/* Header - always visible */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{title}</span>
          {hasLoaded && (
            <Badge variant="secondary" className="text-xs">
              {history.length} changes
            </Badge>
          )}
        </div>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Content - collapsible */}
      {!collapsed && (
        <div className="border-t p-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No change history available for this record.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((log, index) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 ${index > 0 ? 'pt-3 border-t' : ''}`}
                >
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-primary' : 'bg-muted-foreground'
                      }`}
                    />
                    {index < history.length - 1 && (
                      <div className="w-px h-full bg-border mt-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getOperationVariant(log.operation)} className="text-xs">
                        {OPERATION_LABELS[log.operation] || log.operation}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {SOURCE_LABELS[log.source] || log.source}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{log.user_email || 'System'}</span>
                      <span>•</span>
                      <span>{formatDateRelative(log.created_at)}</span>
                    </div>
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Changed: {Object.keys(log.changes).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleViewDetails(log)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    {(log.operation === 'UPDATE' || log.operation === 'DELETE') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleOpenRollback(log)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Dialog */}
      <FormDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        title="Change Details"
        description={`${OPERATION_LABELS[selectedLog?.operation || ''] || selectedLog?.operation} on ${formatDatePretty(selectedLog?.created_at || '')}`}
        onSubmit={() => setDetailDialogOpen(false)}
        submitLabel="Close"
        loadingLabel="Close"
      >
        {selectedLog && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">User:</span> {selectedLog.user_email || 'System'}
              </div>
              <div>
                <span className="font-medium">Source:</span>{' '}
                {SOURCE_LABELS[selectedLog.source] || selectedLog.source}
              </div>
            </div>

            {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Changed Fields:</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(selectedLog.changes).map(([field, values]) => (
                    <div key={field} className="p-2 bg-muted rounded text-sm">
                      <div className="font-medium">{field}</div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <span className="text-xs text-muted-foreground">Before:</span>
                          <div className="text-xs break-all">
                            {JSON.stringify(values.old) || '(empty)'}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">After:</span>
                          <div className="text-xs break-all">
                            {JSON.stringify(values.new) || '(empty)'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </FormDialog>

      {/* Rollback Confirmation Dialog */}
      <ConfirmationDialog
        open={rollbackDialogOpen}
        onOpenChange={setRollbackDialogOpen}
        title="Restore Previous State"
        itemName={`change from ${formatDatePretty(logToRollback?.created_at || '')}`}
        confirmLabel="Restore"
        onConfirm={handleConfirmRollback}
        confirmDisabled={!canRollback}
      >
        {canRollback ? (
          <p className="text-sm text-muted-foreground">
            This will restore the record to its state before this change was made. A new audit log
            entry will be created to track this restoration.
          </p>
        ) : (
          <p className="text-sm text-destructive">{rollbackReason}</p>
        )}
      </ConfirmationDialog>
    </div>
  )
}
