'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/content-card'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/link-button'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { seedSampleData, type SeedDataResult } from '@/lib/actions/seed-data'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { CheckCircle, AlertCircle, Loader2, ArrowLeft, Users, Home, Church, Heart, HeartHandshake, Cross, BookOpen } from 'lucide-react'

export function SeedDataClient() {
  const t = useTranslations()
  const [isSeeding, setIsSeeding] = useState(false)
  const [showSeedConfirm, setShowSeedConfirm] = useState(false)
  const [seedResult, setSeedResult] = useState<SeedDataResult | null>(null)

  const handleSeedData = async () => {
    setIsSeeding(true)
    setSeedResult(null)

    try {
      const result = await seedSampleData()
      setSeedResult(result)

      if (result.success) {
        toast.success(t('settings.developerTools.seedSuccess'))
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error seeding data:', error)
      toast.error(t('settings.developerTools.seedError'))
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <LinkButton href="/settings/developer-tools">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Developer Tools
        </LinkButton>
      </div>

      {/* What Gets Created */}
      <Card>
        <CardHeader>
          <CardTitle>What Gets Created</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">People</p>
                <p className="text-sm text-muted-foreground">
                  Parishioners with names, emails, phone numbers, and ministry roles
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Families</p>
                <p className="text-sm text-muted-foreground">
                  Family units linking people together as households
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Church className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Masses</p>
                <p className="text-sm text-muted-foreground">
                  Scheduled masses with dates, times, and assigned ministers
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Heart className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Mass Intentions</p>
                <p className="text-sm text-muted-foreground">
                  Prayer intentions attached to specific masses
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <HeartHandshake className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Weddings</p>
                <p className="text-sm text-muted-foreground">
                  Sample wedding liturgies with bride, groom, and wedding party
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Cross className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Funerals</p>
                <p className="text-sm text-muted-foreground">
                  Sample funeral liturgies with deceased info and participants
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Scripture Readings</p>
                <p className="text-sm text-muted-foreground">
                  Content library items for first readings, psalms, and gospels
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seed Action */}
      <Card>
        <CardHeader>
          <CardTitle>Run Seeder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Click the button below to populate your parish with sample data. This process typically
              takes 10-30 seconds depending on your connection.
            </p>
            <p className="text-warning">
              <strong>Note:</strong> Seeding is additive and won&apos;t delete existing data. Running
              multiple times may create duplicate records.
            </p>
          </div>

          <Button
            onClick={() => setShowSeedConfirm(true)}
            disabled={isSeeding}
            size="lg"
          >
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Data...
              </>
            ) : (
              'Seed Sample Data'
            )}
          </Button>

          {seedResult && (
            <div className={`p-4 rounded-lg border ${
              seedResult.success
                ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {seedResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <span className={`font-medium ${
                  seedResult.success
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {seedResult.message}
                </span>
              </div>
              <div className="text-sm grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2 rounded bg-background">
                  <p className="text-muted-foreground text-xs">People</p>
                  <p className="font-medium">{seedResult.details.people}</p>
                </div>
                <div className="p-2 rounded bg-background">
                  <p className="text-muted-foreground text-xs">Families</p>
                  <p className="font-medium">{seedResult.details.families}</p>
                </div>
                <div className="p-2 rounded bg-background">
                  <p className="text-muted-foreground text-xs">Masses</p>
                  <p className="font-medium">{seedResult.details.masses}</p>
                </div>
                <div className="p-2 rounded bg-background">
                  <p className="text-muted-foreground text-xs">Intentions</p>
                  <p className="font-medium">{seedResult.details.massIntentions}</p>
                </div>
                <div className="p-2 rounded bg-background">
                  <p className="text-muted-foreground text-xs">Weddings</p>
                  <p className="font-medium">{seedResult.details.weddings}</p>
                </div>
                <div className="p-2 rounded bg-background">
                  <p className="text-muted-foreground text-xs">Funerals</p>
                  <p className="font-medium">{seedResult.details.funerals}</p>
                </div>
                <div className="p-2 rounded bg-background">
                  <p className="text-muted-foreground text-xs">Readings</p>
                  <p className="font-medium">{seedResult.details.readings}</p>
                </div>
                <div className="p-2 rounded bg-background">
                  <p className="text-muted-foreground text-xs">Group Members</p>
                  <p className="font-medium">{seedResult.details.groupMemberships}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showSeedConfirm}
        onOpenChange={setShowSeedConfirm}
        onConfirm={handleSeedData}
        title="Seed Sample Data?"
        description="This will create sample people, families, masses, and liturgies in your parish. This action is additive and won't delete existing data."
        confirmLabel="Seed Data"
      />
    </div>
  )
}
