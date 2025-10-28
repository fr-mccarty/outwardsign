'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageContainer } from '@/components/page-container'
import { ArrowLeft, Download, BookOpen, Database, AlertCircle, CheckCircle } from 'lucide-react'
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import Link from 'next/link'
import { importReadings, getReadingsStats } from '@/lib/actions/import-readings'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface ImportStats {
  totalReadings: number
  categories: string[]
  translations: string[]
}

export default function ReadingSettingsPage() {
  const { setBreadcrumbs } = useBreadcrumbs()
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importMessage, setImportMessage] = useState('')
  const [importStats, setImportStats] = useState<ImportStats | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/settings" },
      { label: "Reading Settings" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getReadingsStats()
        setImportStats(stats)
      } catch (error) {
        console.error('Failed to load reading stats:', error)
      }
    }
    loadStats()
  }, [])

  const handleImport = async () => {
    setIsImporting(true)
    setImportStatus('idle')
    setImportMessage('')

    try {
      const loadingToast = toast.loading('Importing readings...')
      const result = await importReadings()
      
      // Dismiss loading toast
      toast.dismiss(loadingToast)
      
      const message = `Successfully imported ${result.imported} readings (${result.skipped} already existed)`
      setImportStatus('success')
      setImportMessage(message)
      
      // Show toast notification
      if (result.imported > 0) {
        toast.success(`Imported ${result.imported} new readings!`)
      } else if (result.skipped > 0) {
        toast.info(`All ${result.skipped} readings already exist in your collection`)
      } else {
        toast.info('No readings were imported')
      }
      
      // Show errors if any
      if (result.errors.length > 0) {
        result.errors.forEach(error => toast.error(error))
      }
      
      // Refresh stats after import
      const stats = await getReadingsStats()
      setImportStats(stats)
    } catch (error) {
      // Dismiss any existing loading toast
      toast.dismiss()
      
      setImportStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Failed to import readings'
      setImportMessage(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <PageContainer 
      title="Reading Settings"
      description="Import liturgical readings and manage your reading collections."
      maxWidth="4xl"
    >
      <Button variant="ghost" size="sm" asChild>
        <Link href="/settings">
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
      </Button>
      
      <div>
        <h1 className="text-3xl font-bold">Reading Settings</h1>
        <p className="text-muted-foreground">
          Import liturgical readings and manage your reading collections.
        </p>
      </div>

      {/* Import Status Alert */}
      {importStatus !== 'idle' && (
        <Alert className={importStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {importStatus === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={importStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
            {importMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Reading Statistics */}
      {importStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Current Reading Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{importStats.totalReadings}</div>
                <div className="text-sm text-muted-foreground">Total Readings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{importStats.categories.length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{importStats.translations.length}</div>
                <div className="text-sm text-muted-foreground">Translations</div>
              </div>
            </div>
            
            {importStats.categories.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Available Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {importStats.categories.map(category => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Readings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Import Readings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Import a comprehensive collection of readings from our curated database. 
            This includes readings for weddings, funerals, and other liturgical celebrations with 
            proper introductions and conclusions.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">What will be imported:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Wedding readings (Old Testament, Psalms, New Testament, Gospel)</li>
              <li>• Funeral readings (Old Testament, Psalms, New Testament, Gospel)</li>
              <li>• Complete biblical texts with proper liturgical introductions</li>
              <li>• Categorized by liturgical context and biblical book</li>
              <li>• Formatted for liturgical proclamation</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-900 mb-2">Important Notes:</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• This will add readings to your personal collection</li>
              <li>• Duplicate readings will be skipped automatically</li>
              <li>• You can edit or delete imported readings after import</li>
              <li>• Import may take a few moments to complete</li>
            </ul>
          </div>

          <Button 
            onClick={handleImport} 
            disabled={isImporting}
            className="w-full"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            {isImporting ? 'Importing Readings...' : 'Import Readings'}
          </Button>
        </CardContent>
      </Card>

      {/* Reading Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Reading Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Manage your reading collection and organize readings for different liturgical occasions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" asChild className="justify-between h-auto p-4">
              <Link href="/readings">
                <div className="text-left">
                  <div className="font-medium">View All Readings</div>
                  <div className="text-sm text-muted-foreground">Browse and search your complete reading collection</div>
                </div>
                <BookOpen className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="justify-between h-auto p-4">
              <Link href="/readings/create">
                <div className="text-left">
                  <div className="font-medium">Add New Reading</div>
                  <div className="text-sm text-muted-foreground">Create custom readings for special occasions</div>
                </div>
                <BookOpen className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}