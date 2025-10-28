"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { ArrowLeft, Save, Plus, X } from "lucide-react"
import { getCalendarEntry, updateCalendarEntry } from "@/lib/actions/calendar"
import { useRouter, useParams } from "next/navigation"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { PageContainer } from '@/components/page-container'

export default function EditCalendarPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    liturgical_season: "",
    liturgical_rank: "",
    color: "",
    notes: "",
    is_custom: true
  })
  const [readings, setReadings] = useState<string[]>([''])
  const [prayers, setPrayers] = useState<string[]>([''])
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    const loadEntry = async () => {
      try {
        const entry = await getCalendarEntry(id)
        if (entry) {
          setFormData({
            title: entry.title,
            date: entry.date,
            liturgical_season: entry.liturgical_season || "",
            liturgical_rank: entry.liturgical_rank || "",
            color: entry.color || "",
            notes: entry.notes || "",
            is_custom: entry.is_custom
          })
          setReadings((entry.readings as string[]) || [''])
          setPrayers((entry.special_prayers as string[]) || [''])
          
          // Set breadcrumbs with entry title
          setBreadcrumbs([
            { label: "Dashboard", href: "/dashboard" },
            { label: "Liturgical Calendar", href: "/calendar" },
            { label: entry.title, href: `/calendar/${id}` },
            { label: "Edit" }
          ])
        } else {
          router.push("/calendar")
        }
      } catch {
        router.push("/calendar")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadEntry()
  }, [id, router, setBreadcrumbs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateCalendarEntry(id, {
        ...formData,
        readings: readings.filter(r => r.trim()),
        special_prayers: prayers.filter(p => p.trim())
      })
      router.push(`/calendar/${id}`)
    } catch {
      alert("Failed to update calendar entry. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const addReading = () => setReadings([...readings, ''])
  const removeReading = (index: number) => setReadings(readings.filter((_, i) => i !== index))
  const updateReading = (index: number, value: string) => {
    const updated = [...readings]
    updated[index] = value
    setReadings(updated)
  }

  const addPrayer = () => setPrayers([...prayers, ''])
  const removePrayer = (index: number) => setPrayers(prayers.filter((_, i) => i !== index))
  const updatePrayer = (index: number, value: string) => {
    const updated = [...prayers]
    updated[index] = value
    setPrayers(updated)
  }

  if (isLoadingData) {
    return (
      <PageContainer
        title="Loading..."
        description="Loading calendar event details"
        maxWidth="4xl"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/calendar">
              <ArrowLeft className="h-4 w-4" />
              Back to Calendar
            </Link>
          </Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Edit Calendar Event"
      description="Update liturgical celebration details"
      maxWidth="4xl"
    >
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/calendar/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Liturgical Season</Label>
                <Select value={formData.liturgical_season} onValueChange={(value) => setFormData({...formData, liturgical_season: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="advent">Advent</SelectItem>
                    <SelectItem value="christmas">Christmas</SelectItem>
                    <SelectItem value="ordinary">Ordinary Time</SelectItem>
                    <SelectItem value="lent">Lent</SelectItem>
                    <SelectItem value="easter">Easter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Liturgical Rank</Label>
                <Select value={formData.liturgical_rank} onValueChange={(value) => setFormData({...formData, liturgical_rank: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="solemnity">Solemnity</SelectItem>
                    <SelectItem value="feast">Feast</SelectItem>
                    <SelectItem value="memorial">Memorial</SelectItem>
                    <SelectItem value="optional_memorial">Optional Memorial</SelectItem>
                    <SelectItem value="weekday">Weekday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Liturgical Color</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({...formData, color: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="rose">Rose</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Readings</Label>
                <Button type="button" variant="outline" size="sm" onClick={addReading}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Reading
                </Button>
              </div>
              {readings.map((reading, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={reading}
                    onChange={(e) => updateReading(index, e.target.value)}
                    placeholder="Reading reference"
                  />
                  {readings.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeReading(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Special Prayers</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPrayer}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Prayer
                </Button>
              </div>
              {prayers.map((prayer, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={prayer}
                    onChange={(e) => updatePrayer(index, e.target.value)}
                    placeholder="Special prayer"
                  />
                  {prayers.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removePrayer(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_custom"
                checked={formData.is_custom}
                onCheckedChange={(checked) => setFormData({...formData, is_custom: checked})}
              />
              <Label htmlFor="is_custom">Custom Event</Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/calendar/${id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  )
}