'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Edit, Trash2 } from "lucide-react"
import type { Location } from '@/lib/types'
import Link from 'next/link'
import { PageContainer } from '@/components/page-container'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteLocation } from '@/lib/actions/locations'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LocationViewClientProps {
  location: Location
}

export function LocationViewClient({ location }: LocationViewClientProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteLocation(location.id)
      toast.success('Location deleted successfully')
      router.push('/locations')
    } catch (error) {
      console.error('Failed to delete location:', error)
      toast.error('Failed to delete location. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const actions = (
    <>
      <Button variant="outline" asChild>
        <Link href={`/locations/${location.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Link>
      </Button>
      <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </>
  )

  return (
    <>
      <PageContainer
        title={location.name}
        description="Location details"
        maxWidth="4xl"
        actions={actions}
      >
        <div className="space-y-6">
          {/* Description */}
          {location.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {location.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Address */}
          {(location.street || location.city || location.state || location.country) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  {location.street && <p>{location.street}</p>}
                  {(location.city || location.state) && (
                    <p>
                      {[location.city, location.state].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {location.country && <p>{location.country}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          {location.phone_number && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="font-medium text-muted-foreground uppercase tracking-wide text-xs mb-1">
                    Phone Number
                  </p>
                  <p>{location.phone_number}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Created At
                  </h4>
                  <p className="text-sm">
                    {new Date(location.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                    Last Updated
                  </h4>
                  <p className="text-sm">
                    {new Date(location.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Location</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{location.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
