'use client'

import { useState } from 'react'
import { TiptapEditor } from '@/components/tiptap-editor'
import { parseContentToHTML } from '@/lib/utils/content-processor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/content-card'
import type { InputFieldDefinition } from '@/lib/types'

// Sample content to start with (now HTML)
const SAMPLE_CONTENT = `<p><span style="font-size: 1.25em"><strong>Welcome to the Render Test</strong></span></p>
<p>This is a <strong>bold</strong> statement and this is <em>italic</em> text.</p>
<p><span style="color: #c41e3a">This text should appear in liturgical red.</span></p>
<p>Regular text continues here.</p>
<p><span style="font-size: 0.875em">This is small text for notes or instructions.</span></p>
<p style="text-align: center">This paragraph is centered.</p>
<p>Placeholder examples: {{bride.full_name}}, {{groom.first_name}}, {{parish.name}}</p>`

// Mock field definitions for the editor toolbar
const MOCK_FIELD_DEFINITIONS: InputFieldDefinition[] = [
  {
    id: '1',
    name: 'Bride',
    property_name: 'bride',
    type: 'person',
    order: 0,
    required: false,
    event_type_id: 'mock',
    list_id: null,
    is_key_person: true,
    is_primary: false,
    is_per_calendar_event: false,
    input_filter_tags: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Groom',
    property_name: 'groom',
    type: 'person',
    order: 1,
    required: false,
    event_type_id: 'mock',
    list_id: null,
    is_key_person: true,
    is_primary: false,
    is_per_calendar_event: false,
    input_filter_tags: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Wedding Date',
    property_name: 'wedding_date',
    type: 'date',
    order: 2,
    required: false,
    event_type_id: 'mock',
    list_id: null,
    is_key_person: false,
    is_primary: false,
    is_per_calendar_event: false,
    input_filter_tags: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Location',
    property_name: 'location',
    type: 'location',
    order: 3,
    required: false,
    event_type_id: 'mock',
    list_id: null,
    is_key_person: false,
    is_primary: false,
    is_per_calendar_event: false,
    input_filter_tags: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export function RenderTestClient() {
  const [content, setContent] = useState(SAMPLE_CONTENT)

  // Process content through sanitizer
  const htmlContent = parseContentToHTML(content)

  return (
    <div className="space-y-6">
      {/* Section 1: Rich Text Editor */}
      <Card>
        <CardHeader>
          <CardTitle>1. Rich Text Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <TiptapEditor
            value={content}
            onChange={setContent}
            availableFields={MOCK_FIELD_DEFINITIONS}
            placeholder="Enter content here..."
          />
        </CardContent>
      </Card>

      {/* Section 2: Raw HTML Source */}
      <Card>
        <CardHeader>
          <CardTitle>2. Raw HTML Source</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap font-mono text-sm p-4 border rounded-md bg-muted text-foreground overflow-x-auto">
            {content}
          </pre>
        </CardContent>
      </Card>

      {/* Section 3: Rendered HTML with Styles */}
      <Card>
        <CardHeader>
          <CardTitle>3. Rendered Output</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none dark:prose-invert p-4 border rounded-md bg-card"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
