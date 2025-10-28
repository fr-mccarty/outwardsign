'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormField } from '@/components/ui/form-field'
import { PageContainer } from '@/components/page-container'
import { Loading } from '@/components/loading'
import { Info, Save, RotateCcw } from 'lucide-react'
import { savePromptTemplate, getPromptTemplate } from '@/lib/actions/definitions'
import { getDefaultPromptTemplate } from '@/lib/template-utils'
import { useBreadcrumbs } from '@/components/breadcrumb-context'

const TEMPLATE_VARIABLES = [
  { name: '{{TITLE}}', description: 'The title of the petition set' },
  { name: '{{LANGUAGE}}', description: 'The language for the petitions (English, Spanish, French, Latin)' },
  { name: '{{DETAILS}}', description: 'The community details provided by the user' },
  { name: '{{TEMPLATE_CONTENT}}', description: 'The selected petition template content' },
]

export default function DefinitionsPage() {
  const [promptTemplate, setPromptTemplate] = useState('')
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Petition Definitions" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    // Load the default template for display only
    setPromptTemplate(getDefaultPromptTemplate())
  }, [])

  return (
    <PageContainer 
      title="Petition Definitions"
      description="Customize the AI prompt template used to generate liturgical petitions."
      maxWidth="4xl"
    >
      <div>
        <h1 className="text-3xl font-bold">Petition Definitions</h1>
        <p className="text-muted-foreground mt-2">
          Customize the AI prompt template used to generate liturgical petitions.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Template Variables:</strong> The following placeholders are used in the prompt template:
          <ul className="mt-2 space-y-1">
            {TEMPLATE_VARIABLES.map((variable) => (
              <li key={variable.name} className="text-sm">
                <code className="bg-muted px-1 rounded">{variable.name}</code> - {variable.description}
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Current Prompt Template</CardTitle>
          <p className="text-sm text-muted-foreground">
            This is the default prompt template used to generate liturgical petitions. Custom templates are not currently supported.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            id="promptTemplate"
            label="AI Prompt Template (Read Only)"
            inputType="textarea"
            value={promptTemplate}
            onChange={() => {}} // Read only
            rows={25}
            placeholder="Loading template..."
            className="font-mono text-sm"
            resize={true}
            disabled={true}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}