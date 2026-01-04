'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { ContentCard } from '@/components/content-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FormInput } from '@/components/form-input'
import { FormDialog } from '@/components/form-dialog'
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Eye,
  Clock,
  User,
  Database,
} from 'lucide-react'
import {
  type AuditLog,
  type AuditLogFilterParams,
  rollbackToAuditLog,
  canRestoreAuditLog,
} from '@/lib/actions/audit-logs'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { formatDateRelative, formatDatePretty } from '@/lib/utils/formatters'
import type { PaginatedResult } from '@/lib/actions/server-action-utils'

interface ActivityLogClientProps {
  initialLogs: PaginatedResult<AuditLog>
  tableNames: string[]
  currentFilters: AuditLogFilterParams
  currentPage: number
}

const TABLE_NAME_LABELS: Record<string, string> = {
  people: 'People',
  families: 'Families',
  family_members: 'Family Members',
  groups: 'Groups',
  group_members: 'Group Members',
  master_events: 'Events',
  calendar_events: 'Calendar Events',
  people_event_assignments: 'Event Assignments',
  locations: 'Locations',
  contents: 'Content Library',
  scripts: 'Scripts',
  sections: 'Sections',
  documents: 'Documents',
  event_types: 'Event Types',
  category_tags: 'Tags',
  parish_settings: 'Parish Settings',
  custom_lists: 'Custom Lists',
  custom_list_items: 'Custom List Items',
  mass_intentions: 'Mass Intentions',
  person_blackout_dates: 'Blackout Dates',
}

const OPERATION_LABELS: Record<string, string> = {
  INSERT: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  RESTORE: 'Restored',
}

const SOURCE_LABELS: Record<string, string> = {
  application: 'Application',
  ai_chat: 'AI Chat',
  mcp: 'MCP',
  system: 'System',
  migration: 'Migration',
}

export function ActivityLogClient({
  initialLogs,
  tableNames,
  currentFilters,
  currentPage,
}: ActivityLogClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [logs] = useState(initialLogs)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    table_name: currentFilters.table_name || '',
    operation: currentFilters.operation || '',
    source: currentFilters.source || '',
    date_from: currentFilters.date_from || '',
    date_to: currentFilters.date_to || '',
  })

  // Detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  // Rollback confirmation
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false)
  const [logToRollback, setLogToRollback] = useState<AuditLog | null>(null)
  const [canRollback, setCanRollback] = useState(false)
  const [rollbackReason, setRollbackReason] = useState('')

  const totalPages = Math.ceil(logs.totalCount / (currentFilters.limit || 50))

  const handleApplyFilters = () => {
    const params = new URLSearchParams()
    if (filters.table_name) params.set('table_name', filters.table_name)
    if (filters.operation) params.set('operation', filters.operation)
    if (filters.source) params.set('source', filters.source)
    if (filters.date_from) params.set('date_from', filters.date_from)
    if (filters.date_to) params.set('date_to', filters.date_to)
    params.set('page', '1')

    router.push(`/settings/parish/activity-log?${params.toString()}`)
    setFilterOpen(false)
  }

  const handleClearFilters = () => {
    setFilters({
      table_name: '',
      operation: '',
      source: '',
      date_from: '',
      date_to: '',
    })
    router.push('/settings/parish/activity-log')
    setFilterOpen(false)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/settings/parish/activity-log?${params.toString()}`)
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
      router.refresh()
    } catch (error) {
      console.error('Error performing rollback:', error)
      toast.error('Failed to rollback change')
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

  const getSourceVariant = (source: string): 'default' | 'secondary' | 'outline' => {
    switch (source) {
      case 'ai_chat':
      case 'mcp':
        return 'outline'
      case 'system':
      case 'migration':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const hasActiveFilters =
    filters.table_name || filters.operation || filters.source || filters.date_from || filters.date_to

  const renderLogItem = (log: AuditLog) => (
    <div
      key={log.id}
      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant={getOperationVariant(log.operation)} className="text-xs">
            {OPERATION_LABELS[log.operation] || log.operation}
          </Badge>
          <span className="font-medium">
            {TABLE_NAME_LABELS[log.table_name] || log.table_name}
          </span>
          <Badge variant={getSourceVariant(log.source)} className="text-xs">
            {SOURCE_LABELS[log.source] || log.source}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {log.user_email || 'System'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDateRelative(log.created_at)}
          </span>
          {log.changes && Object.keys(log.changes).length > 0 && (
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              {Object.keys(log.changes).length} field(s) changed
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(log)}>
          <Eye className="h-4 w-4" />
        </Button>
        {(log.operation === 'UPDATE' || log.operation === 'DELETE') && (
          <Button variant="ghost" size="sm" onClick={() => handleOpenRollback(log)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <>
      <PageContainer
        title="Activity Log"
        description="View all changes made to your parish data. Track who changed what and when."
      >
        {/* Filters */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant={hasActiveFilters ? 'default' : 'outline'} onClick={() => setFilterOpen(true)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={handleClearFilters}>
                Clear
              </Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {logs.items.length} of {logs.totalCount} entries
          </div>
        </div>

        {/* Log List */}
        <ContentCard>
          {logs.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity logs found. Changes to your parish data will appear here.
            </div>
          ) : (
            <div className="space-y-3">{logs.items.map(renderLogItem)}</div>
          )}
        </ContentCard>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </PageContainer>

      {/* Filter Dialog */}
      <FormDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filter Activity Log"
        description="Filter the activity log by table, operation, source, or date range."
        onSubmit={handleApplyFilters}
        submitLabel="Apply Filters"
        loadingLabel="Applying..."
      >
        <div className="space-y-4 py-4">
          <FormInput
            id="filter-table"
            label="Table"
            inputType="select"
            value={filters.table_name}
            onChange={(value) => setFilters((f) => ({ ...f, table_name: value }))}
            options={[
              { value: '', label: 'All Tables' },
              ...tableNames.map((t) => ({
                value: t,
                label: TABLE_NAME_LABELS[t] || t,
              })),
            ]}
          />
          <FormInput
            id="filter-operation"
            label="Operation"
            inputType="select"
            value={filters.operation}
            onChange={(value) => setFilters((f) => ({ ...f, operation: value }))}
            options={[
              { value: '', label: 'All Operations' },
              { value: 'INSERT', label: 'Created' },
              { value: 'UPDATE', label: 'Updated' },
              { value: 'DELETE', label: 'Deleted' },
              { value: 'RESTORE', label: 'Restored' },
            ]}
          />
          <FormInput
            id="filter-source"
            label="Source"
            inputType="select"
            value={filters.source}
            onChange={(value) => setFilters((f) => ({ ...f, source: value }))}
            options={[
              { value: '', label: 'All Sources' },
              { value: 'application', label: 'Application' },
              { value: 'ai_chat', label: 'AI Chat' },
              { value: 'mcp', label: 'MCP' },
              { value: 'system', label: 'System' },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="filter-date-from"
              label="From Date"
              inputType="date"
              value={filters.date_from}
              onChange={(value) => setFilters((f) => ({ ...f, date_from: value }))}
            />
            <FormInput
              id="filter-date-to"
              label="To Date"
              inputType="date"
              value={filters.date_to}
              onChange={(value) => setFilters((f) => ({ ...f, date_to: value }))}
            />
          </div>
        </div>
      </FormDialog>

      {/* Detail Dialog */}
      <FormDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        title="Change Details"
        description={`${OPERATION_LABELS[selectedLog?.operation || ''] || selectedLog?.operation} - ${TABLE_NAME_LABELS[selectedLog?.table_name || ''] || selectedLog?.table_name}`}
        onSubmit={() => setDetailDialogOpen(false)}
        submitLabel="Close"
        loadingLabel="Close"
      >
        {selectedLog && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">User:</span>{' '}
                {selectedLog.user_email || 'System'}
              </div>
              <div>
                <span className="font-medium">Source:</span>{' '}
                {SOURCE_LABELS[selectedLog.source] || selectedLog.source}
              </div>
              <div>
                <span className="font-medium">Date:</span>{' '}
                {formatDatePretty(selectedLog.created_at)}
              </div>
              <div>
                <span className="font-medium">Record ID:</span>{' '}
                <code className="text-xs bg-muted px-1 rounded">{selectedLog.record_id}</code>
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
        itemName={`${OPERATION_LABELS[logToRollback?.operation || '']} on ${TABLE_NAME_LABELS[logToRollback?.table_name || ''] || logToRollback?.table_name}`}
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
    </>
  )
}
