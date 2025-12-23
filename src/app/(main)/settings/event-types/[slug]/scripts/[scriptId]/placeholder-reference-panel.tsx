'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import type { InputFieldDefinition } from '@/lib/types/event-types'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface PlaceholderReferencePanelProps {
  inputFields: InputFieldDefinition[]
}

export function PlaceholderReferencePanel({ inputFields }: PlaceholderReferencePanelProps) {
  const t = useTranslations()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(fieldId)
      toast.success(t('eventType.scripts.placeholders.copied'))
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error(t('eventType.scripts.placeholders.copyError'))
    }
  }

  const formatFieldType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="border rounded-md p-4 bg-card sticky top-4">
      <h3 className="text-sm font-semibold mb-3">{t('eventType.scripts.placeholders.title')}</h3>
      <p className="text-xs text-muted-foreground mb-4">
        {t('eventType.scripts.placeholders.description')}
      </p>

      {inputFields.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          {t('eventType.scripts.placeholders.noFields')}
        </p>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {inputFields.map((field) => (
            <div
              key={field.id}
              className="border rounded-md p-3 space-y-2 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{field.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatFieldType(field.type)}
                  </div>
                </div>
              </div>

              {/* Placeholder */}
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                  {`{{${field.property_name}}}`}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={() => copyToClipboard(`{{${field.property_name}}}`, field.id)}
                >
                  {copiedId === field.id ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>

              {/* For person fields, show nested properties */}
              {field.type === 'person' && (
                <div className="text-xs text-muted-foreground space-y-1 pl-2 border-l-2 border-muted">
                  <div className="flex items-center justify-between gap-2">
                    <code className="flex-1 truncate">{`{{${field.property_name}.full_name}}`}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => copyToClipboard(`{{${field.property_name}.full_name}}`, `${field.id}-full_name`)}
                    >
                      {copiedId === `${field.id}-full_name` ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <code className="flex-1 truncate">{`{{${field.property_name}.first_name}}`}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => copyToClipboard(`{{${field.property_name}.first_name}}`, `${field.id}-first_name`)}
                    >
                      {copiedId === `${field.id}-first_name` ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <code className="flex-1 truncate">{`{{${field.property_name}.last_name}}`}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => copyToClipboard(`{{${field.property_name}.last_name}}`, `${field.id}-last_name`)}
                    >
                      {copiedId === `${field.id}-last_name` ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
