"use client"

import { MassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Edit, Calendar, User, DollarSign, FileText, Printer, FileDown } from "lucide-react"
import { MASS_INTENTION_STATUS_LABELS } from "@/lib/constants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MassIntentionViewClientProps {
  intention: MassIntentionWithRelations
}

export function MassIntentionViewClient({ intention }: MassIntentionViewClientProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatStipend = (cents: number | null | undefined) => {
    if (!cents) return 'No stipend'
    return `$${(cents / 100).toFixed(2)}`
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return 'secondary'
      case 'CONFIRMED':
        return 'default'
      case 'FULFILLED':
        return 'outline'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button asChild>
          <Link href={`/mass-intentions/${intention.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Intention
          </Link>
        </Button>

        <Button variant="outline" asChild>
          <Link href={`/print/mass-intentions/${intention.id}`} target="_blank">
            <Printer className="h-4 w-4 mr-2" />
            Print View
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={`/api/mass-intentions/${intention.id}/pdf`} download>
                Download PDF
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/api/mass-intentions/${intention.id}/word`} download>
                Download Word
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl">Mass Intention Details</CardTitle>
              <CardDescription className="mt-2">
                Created on {new Date(intention.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            {intention.status && (
              <Badge variant={getStatusVariant(intention.status)} className="text-sm">
                {MASS_INTENTION_STATUS_LABELS[intention.status as keyof typeof MASS_INTENTION_STATUS_LABELS]?.en || intention.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mass Offered For */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Mass Offered For</h3>
            <p className="text-lg">
              {intention.mass_offered_for || 'No intention specified'}
            </p>
          </div>

          {/* Requested By */}
          {intention.requested_by && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Requested By
              </h3>
              <p className="text-base">
                {intention.requested_by.first_name} {intention.requested_by.last_name}
              </p>
              {intention.requested_by.email && (
                <p className="text-sm text-muted-foreground mt-1">
                  {intention.requested_by.email}
                </p>
              )}
              {intention.requested_by.phone_number && (
                <p className="text-sm text-muted-foreground">
                  {intention.requested_by.phone_number}
                </p>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Requested
              </h3>
              <p className="text-base">
                {formatDate(intention.date_requested)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Received
              </h3>
              <p className="text-base">
                {formatDate(intention.date_received)}
              </p>
            </div>
          </div>

          {/* Stipend */}
          {intention.stipend_in_cents !== null && intention.stipend_in_cents !== undefined && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Stipend Amount
              </h3>
              <p className="text-lg font-semibold">
                {formatStipend(intention.stipend_in_cents)}
              </p>
            </div>
          )}

          {/* Notes */}
          {intention.note && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </h3>
              <p className="text-base whitespace-pre-wrap">
                {intention.note}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Linked Mass */}
      {intention.mass && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Mass</CardTitle>
            <CardDescription>
              This intention is linked to the following Mass
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Status: {intention.mass.status}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/masses/${intention.mass.id}`}>
                    View Mass
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
