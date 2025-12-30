'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/content-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LinkButton } from '@/components/link-button'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  type ScriptWithSectionsForDebug,
} from '@/lib/actions/developer-tools'
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  FileText,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

/**
 * Extract placeholders from content string
 */
function extractPlaceholders(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g
  const placeholders: string[] = []
  let match

  while ((match = regex.exec(content)) !== null) {
    const placeholder = match[1].trim()
    if (!placeholders.includes(placeholder)) {
      placeholders.push(placeholder)
    }
  }

  return placeholders
}

/**
 * Highlight placeholders in content with colored spans
 */
function highlightPlaceholders(content: string, isValidFn: (p: string) => boolean): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(\{\{[^}]+\}\})/g
  let lastIndex = 0
  let match

  const tempContent = content
  regex.lastIndex = 0

  while ((match = regex.exec(tempContent)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(tempContent.substring(lastIndex, match.index))
    }

    // Extract the placeholder name (without braces)
    const fullMatch = match[1]
    const placeholderName = fullMatch.slice(2, -2).trim()
    const isValid = isValidFn(placeholderName)

    // Add the highlighted placeholder
    parts.push(
      <span
        key={match.index}
        className={`px-1 rounded ${
          isValid
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}
      >
        {fullMatch}
      </span>
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < tempContent.length) {
    parts.push(tempContent.substring(lastIndex))
  }

  return parts
}

interface ContentItem {
  id: string
  title: string
  body: string
  language: string
  tags: string[]
}

interface Props {
  script: ScriptWithSectionsForDebug
  fieldDefinitions: Array<{
    id: string
    name: string
    property_name: string
    type: string
    required: boolean
    order: number
  }>
  contentItems: Record<string, ContentItem[]>
}

export function ScriptStructureClient({ script, fieldDefinitions, contentItems }: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [selectedContentIndex, setSelectedContentIndex] = useState<Record<string, number>>({})

  // Build a map of property_name -> field info for quick lookup
  const fieldMap = new Map(fieldDefinitions.map(f => [f.property_name, f]))

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const expandAll = () => {
    setExpandedSections(new Set(script.sections.map(s => s.id)))
  }

  const collapseAll = () => {
    setExpandedSections(new Set())
  }

  // Check if a placeholder is valid (exists in field definitions)
  const isValidPlaceholder = (placeholder: string): boolean => {
    // Extract the field name (before any dot notation)
    const fieldName = placeholder.split('.')[0].split('|')[0].trim()

    // Parish placeholders are always valid
    if (fieldName === 'parish') return true

    return fieldMap.has(fieldName)
  }

  // Get the field type for a placeholder
  const getFieldType = (placeholder: string): string | null => {
    const fieldName = placeholder.split('.')[0].split('|')[0].trim()
    return fieldMap.get(fieldName)?.type || null
  }

  // Get the selected content item for a field (defaults to first)
  const getSelectedContentForField = (fieldName: string): ContentItem | null => {
    const items = contentItems[fieldName] || []
    if (items.length === 0) return null
    const index = selectedContentIndex[fieldName] ?? 0
    return items[index] || items[0]
  }

  // Select a content item for a field
  const selectContentItem = (fieldName: string, index: number) => {
    setSelectedContentIndex(prev => ({ ...prev, [fieldName]: index }))
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <LinkButton href="/settings/developer-tools">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Developer Tools
        </LinkButton>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Script Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {script.name}
            </CardTitle>
            <LinkButton
              href={`/settings/event-types/${script.event_type.slug}/scripts/${script.id}`}
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Edit Script
            </LinkButton>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Event Type:</span>{' '}
              <Link
                href={`/settings/event-types/${script.event_type.slug}`}
                className="text-primary hover:underline"
              >
                {script.event_type.name}
              </Link>
            </div>
            <div>
              <span className="text-muted-foreground">Sections:</span>{' '}
              {script.sections.length}
            </div>
            {script.description && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Description:</span>{' '}
                {script.description}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Field Definitions Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Available Fields ({fieldDefinitions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {fieldDefinitions.map((field) => (
              <Badge
                key={field.id}
                variant="outline"
                className="font-mono text-xs"
              >
                {field.property_name}
                <span className="ml-1 text-muted-foreground">({field.type})</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sections List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Sections ({script.sections.length})</h2>

        {script.sections.map((section, index) => {
          const placeholders = extractPlaceholders(section.content)
          const isExpanded = expandedSections.has(section.id)
          const hasInvalidPlaceholders = placeholders.some(p => !isValidPlaceholder(p))

          // Find content placeholders and their nested templates
          const contentPlaceholders = placeholders.filter(p => {
            const fieldName = p.split('.')[0].split('|')[0].trim()
            return getFieldType(fieldName) === 'content'
          })

          return (
            <Collapsible
              key={section.id}
              open={isExpanded}
              onOpenChange={() => toggleSection(section.id)}
            >
              <Card className={cn('!py-0', hasInvalidPlaceholders && 'border-amber-500')}>
                <CollapsibleTrigger className="w-full text-left block px-6 py-6 cursor-pointer hover:bg-accent/50 transition-colors rounded-t-xl">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="text-muted-foreground text-sm">
                          {index + 1}.
                        </span>
                        <CardTitle className="text-base">{section.name}</CardTitle>
                        {section.section_type && (
                          <Badge variant="secondary" className="text-xs">
                            {section.section_type}
                          </Badge>
                        )}
                        {section.page_break_after && (
                          <Badge variant="outline" className="text-xs">
                            Page Break
                          </Badge>
                        )}
                        {contentPlaceholders.length > 0 && (
                          <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900">
                            <BookOpen className="h-3 w-3 mr-1" />
                            Content Library
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {hasInvalidPlaceholders ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : placeholders.length > 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : null}
                        <Badge variant="outline">
                          {placeholders.length} placeholder{placeholders.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="border-t pt-4 pb-6 space-y-4">
                    {/* Placeholders */}
                    {placeholders.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Placeholders Used:</h4>
                        <div className="flex flex-wrap gap-2">
                          {placeholders.map((placeholder, i) => {
                            const isValid = isValidPlaceholder(placeholder)
                            const fieldType = getFieldType(placeholder)
                            return (
                              <Badge
                                key={i}
                                variant={isValid ? 'outline' : 'destructive'}
                                className="font-mono text-xs"
                              >
                                {`{{${placeholder}}}`}
                                {fieldType && (
                                  <span className="ml-1 opacity-70">({fieldType})</span>
                                )}
                                {!isValid && (
                                  <AlertTriangle className="ml-1 h-3 w-3" />
                                )}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Section Template */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Section Template:</h4>
                      <div className="bg-muted rounded-lg p-3 overflow-x-auto">
                        <pre className="text-xs whitespace-pre-wrap font-mono">
                          {highlightPlaceholders(
                            section.content.length > 2000
                              ? section.content.substring(0, 2000) + '...'
                              : section.content,
                            isValidPlaceholder
                          )}
                        </pre>
                      </div>
                    </div>

                    {/* Content Templates - Show the actual template structure for content fields */}
                    {contentPlaceholders.length > 0 && (
                      <div className="space-y-4">
                        {contentPlaceholders.map((placeholder) => {
                          const fieldName = placeholder.split('.')[0].split('|')[0].trim()
                          const selectedContent = getSelectedContentForField(fieldName)
                          const items = contentItems[fieldName] || []
                          const currentIndex = selectedContentIndex[fieldName] ?? 0

                          if (!selectedContent) {
                            return (
                              <div key={placeholder} className="border rounded-lg p-3 bg-amber-50 dark:bg-amber-950">
                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                  <BookOpen className="h-4 w-4" />
                                  <span className="font-mono text-sm">{`{{${fieldName}}}`}</span>
                                  <span className="text-sm">- No content templates found</span>
                                </div>
                              </div>
                            )
                          }

                          const nestedPlaceholders = extractPlaceholders(selectedContent.body)

                          return (
                            <div key={placeholder} className="border rounded-lg overflow-hidden">
                              <div className="bg-blue-50 dark:bg-blue-950 p-3 border-b">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  <span className="font-mono text-sm font-medium text-blue-800 dark:text-blue-200">
                                    {`{{${fieldName}}}`}
                                  </span>
                                  <span className="text-sm text-blue-600 dark:text-blue-400">
                                    Content Template
                                  </span>
                                </div>
                              </div>

                              <div className="p-3 space-y-3">
                                {/* Clickable content options */}
                                {items.length > 1 && (
                                  <div>
                                    <h5 className="text-xs font-medium text-muted-foreground mb-2">
                                      Select content to view:
                                    </h5>
                                    <div className="flex flex-wrap gap-1">
                                      {items.map((item, idx) => (
                                        <Button
                                          key={item.id}
                                          variant={currentIndex === idx ? 'default' : 'outline'}
                                          size="sm"
                                          className="text-xs h-7"
                                          onClick={() => selectContentItem(fieldName, idx)}
                                        >
                                          {item.title}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Nested placeholders in this content */}
                                {nestedPlaceholders.length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-medium text-muted-foreground mb-2">
                                      Placeholders within this content:
                                    </h5>
                                    <div className="flex flex-wrap gap-1">
                                      {nestedPlaceholders.map((p, i) => (
                                        <Badge
                                          key={i}
                                          variant={isValidPlaceholder(p) ? 'outline' : 'destructive'}
                                          className="font-mono text-xs"
                                        >
                                          {`{{${p}}}`}
                                          {!isValidPlaceholder(p) && (
                                            <AlertTriangle className="ml-1 h-3 w-3" />
                                          )}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Content template body */}
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-xs font-medium text-muted-foreground">
                                      Template structure ({selectedContent.title}):
                                    </h5>
                                    <LinkButton
                                      href={`/settings/content-library/${selectedContent.id}/edit`}
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs gap-1"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      Edit Content
                                    </LinkButton>
                                  </div>
                                  <div className="bg-muted rounded-lg p-3 overflow-x-auto max-h-64 overflow-y-auto">
                                    <pre className="text-xs whitespace-pre-wrap font-mono">
                                      {highlightPlaceholders(selectedContent.body, isValidPlaceholder)}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Link to edit section */}
                    <div className="border-t pt-3">
                      <LinkButton
                        href={`/settings/event-types/${script.event_type.slug}/scripts/${script.id}/sections/${section.id}`}
                        size="sm"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Edit Section
                      </LinkButton>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}
      </div>
    </div>
  )
}
