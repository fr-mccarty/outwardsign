"use client"

import { useState, useEffect } from "react"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { Save, Plus, X } from "lucide-react"
import { createCalendarEntry } from "@/lib/actions/calendar"
import { useRouter } from "next/navigation"
import { useBreadcrumbs } from '@/components/breadcrumb-context'

export default function CreateCalendarPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Liturgical Calendar", href: "/calendar" },
      { label: "Create Event" }
    ])
  }, [setBreadcrumbs])
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createCalendarEntry({
        ...formData,
        readings: readings.filter(r => r.trim()),
        special_prayers: prayers.filter(p => p.trim())
      })
      router.push("/calendar?view=month")
    } catch {
      alert("Failed to create calendar entry. Please try again.")
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

  return (
    <PageContainer 
      title="Add Calendar Event"
      description="Add a liturgical celebration or special event to the calendar."
      cardTitle="Event Details"
      maxWidth="4xl"
    >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Christmas Day, Saint Joseph"
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
                <Label htmlFor="liturgical_season">Liturgical Season</Label>
                <Select value={formData.liturgical_season} onValueChange={(value) => setFormData({...formData, liturgical_season: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advent">Advent</SelectItem>
                    <SelectItem value="christmas">Christmas</SelectItem>
                    <SelectItem value="ordinary">Ordinary Time</SelectItem>
                    <SelectItem value="lent">Lent</SelectItem>
                    <SelectItem value="easter">Easter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="liturgical_rank">Liturgical Rank</Label>
                <Select value={formData.liturgical_rank} onValueChange={(value) => setFormData({...formData, liturgical_rank: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solemnity">Solemnity</SelectItem>
                    <SelectItem value="feast">Feast</SelectItem>
                    <SelectItem value="memorial">Memorial</SelectItem>
                    <SelectItem value="optional_memorial">Optional Memorial</SelectItem>
                    <SelectItem value="weekday">Weekday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Liturgical Color</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({...formData, color: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
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
                    placeholder="Reading reference (e.g., Isaiah 40:1-5, 9-11)"
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
                    placeholder="Special prayer or intention"
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
                placeholder="Additional notes, special instructions, or information..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_custom"
                checked={formData.is_custom}
                onCheckedChange={(checked) => setFormData({...formData, is_custom: checked})}
              />
              <Label htmlFor="is_custom">Custom Event (uncheck for universal calendar entries)</Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Creating..." : "Create Event"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/calendar?view=month">Cancel</Link>
              </Button>
            </div>
          </form>
    </PageContainer>
  )
}