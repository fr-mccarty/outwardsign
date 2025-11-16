"use client"

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookOpen, Edit, Copy, Trash2 } from "lucide-react"
import { deleteReading, type Reading } from "@/lib/actions/readings"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { ReadingCategoryLabel } from '@/components/reading-category-label'
import { LANGUAGE_LABELS } from '@/lib/constants'

interface ReadingViewClientProps {
  reading: Reading
}

export function ReadingViewClient({ reading }: ReadingViewClientProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteReading(reading.id)
      toast.success('Reading deleted successfully')
      setDeleteDialogOpen(false)
      router.push('/readings')
    } catch (error) {
      console.error('Failed to delete reading:', error)
      toast.error('Failed to delete reading. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyText = () => {
    const fullText = `${reading.pericope}\n\n${reading.text}`
    navigator.clipboard.writeText(fullText)
    toast.success('Reading text copied to clipboard')
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Side Panel */}
      <div className="w-full md:w-80 space-y-4 print:hidden order-1 md:order-2">
        <Card>
          <CardContent className="pt-4 px-4 pb-2 space-y-3">
            <Button asChild className="w-full" variant="default">
              <Link href={`/readings/${reading.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Reading
              </Link>
            </Button>

            <Button
              className="w-full"
              variant="outline"
              onClick={handleCopyText}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Text
            </Button>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Reading</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this reading? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="pt-4 border-t space-y-2 text-sm">
              {reading.language && (
                <div>
                  <span className="font-medium">Language:</span>{' '}
                  {LANGUAGE_LABELS[reading.language]?.en || reading.language}
                </div>
              )}
              {reading.categories && reading.categories.length > 0 && (
                <div>
                  <span className="font-medium">Categories:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {reading.categories.map(category => (
                      <ReadingCategoryLabel
                        key={category}
                        category={category}
                        variant="secondary"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="text-xs text-muted-foreground pt-1 border-t">
                Created: {new Date(reading.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 order-2 md:order-1 space-y-6">
        {/* Reading Text */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Reading Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 p-6 rounded-lg">
              <div className="space-y-4">
                {reading.pericope && (
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-primary">
                      {reading.pericope}
                    </h3>
                  </div>
                )}
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                    {reading.text}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reading Information */}
        <Card>
          <CardHeader>
            <CardTitle>Reading Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                  Word Count
                </h4>
                <p className="text-sm">
                  {reading.text ? reading.text.split(' ').length : 0} words
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                  Character Count
                </h4>
                <p className="text-sm">
                  {reading.text ? reading.text.length : 0} characters
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                  Reading ID
                </h4>
                <p className="text-xs font-mono text-muted-foreground">
                  {reading.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
