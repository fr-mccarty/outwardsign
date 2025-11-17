'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Edit } from "lucide-react"
import type { Location } from '@/lib/types'
import Link from 'next/link'
import { deleteLocation } from '@/lib/actions/locations'
import { ModuleViewContainer } from '@/components/module-view-container'

interface LocationViewClientProps {
  location: Location
}

export function LocationViewClient({ location }: LocationViewClientProps) {
  // Action buttons
  const actionButtons = (
    <Button asChild className="w-full">
      <Link href={`/locations/${location.id}/edit`}>
        <Edit className="h-4 w-4 mr-2" />
        Edit Location
      </Link>
    </Button>
  )

  // Details section content
  const details = (
    <>
      {location.updated_at && (
        <div>
          <span className="font-medium">Last Updated:</span>{' '}
          {new Date(location.updated_at).toLocaleDateString()}
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={location}
      entityType="Location"
      modulePath="locations"
      actionButtons={actionButtons}
      details={details}
      onDelete={deleteLocation}
    >
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
    </ModuleViewContainer>
  )
}
