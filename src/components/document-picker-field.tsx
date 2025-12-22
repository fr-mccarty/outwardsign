'use client'

import { useState, useRef, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FileText, Upload, X, Download, Loader2 } from 'lucide-react'
import { uploadDocument, getDocument, getDocumentSignedUrl } from '@/lib/actions/documents'
import type { Document } from '@/lib/types'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { cn } from '@/lib/utils'

interface DocumentPickerFieldProps {
  label: string
  value: string | null // document ID
  onValueChange: (documentId: string | null, document: Document | null) => void
  description?: string
  placeholder?: string
  required?: boolean
  testId?: string
  accept?: string // file input accept attribute
  error?: string // Validation error message
}

// Format file size for display
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Get file type icon label
function getFileTypeLabel(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'PDF'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Word'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Excel'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'PowerPoint'
  if (mimeType.includes('image')) return 'Image'
  if (mimeType.includes('text')) return 'Text'
  return 'File'
}

export function DocumentPickerField({
  label,
  value,
  onValueChange,
  description,
  placeholder = 'Upload a document',
  required = false,
  testId,
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif',
  error,
}: DocumentPickerFieldProps) {
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const labelId = testId || label.toLowerCase().replace(/\s+/g, '-')

  // Load document details when value changes
  useEffect(() => {
    if (value) {
      loadDocument(value)
    } else {
      setDocument(null)
    }
  }, [value])

  const loadDocument = async (documentId: string) => {
    try {
      setLoading(true)
      const doc = await getDocument(documentId)
      setDocument(doc)
    } catch (error) {
      console.error('Error loading document:', error)
      setDocument(null)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const newDocument = await uploadDocument(file)
      setDocument(newDocument)
      onValueChange(newDocument.id, newDocument)
      toast.success('Document uploaded successfully')
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload document')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setShowRemoveConfirm(true)
  }

  const confirmRemove = () => {
    setDocument(null)
    onValueChange(null, null)
    setShowRemoveConfirm(false)
  }

  const handleDownload = async () => {
    if (!value) return

    try {
      const url = await getDocumentSignedUrl(value)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error getting download URL:', error)
      toast.error('Failed to get download link')
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={labelId}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        data-testid={`${labelId}-input`}
      />

      {loading ? (
        <div className={cn("flex items-center gap-2 p-3 border rounded-md bg-muted/50", error && "border-destructive dark:border-destructive")}>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading document...</span>
        </div>
      ) : document ? (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex-1 flex items-center justify-between p-3 border rounded-md bg-muted/50",
              error && "border-destructive dark:border-destructive"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{document.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {getFileTypeLabel(document.file_type)} • {formatFileSize(document.file_size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              title="Download document"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            data-testid={`${labelId}-clear`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={uploading}
          className={cn("w-full justify-start", error && "border-destructive dark:border-destructive")}
          data-testid={`${labelId}-trigger`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {placeholder}
            </>
          )}
        </Button>
      )}

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <ConfirmationDialog
        open={showRemoveConfirm}
        onOpenChange={setShowRemoveConfirm}
        onConfirm={confirmRemove}
        title="Remove Document?"
        description="Are you sure you want to remove this document from the field? The document will still exist in storage but won't be linked to this event."
        confirmLabel="Remove"
        cancelLabel="Cancel"
      />
    </div>
  )
}
