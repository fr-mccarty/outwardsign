"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Save, Plus, X } from "lucide-react"
import { createLiturgyPlan } from "@/lib/actions/liturgy-planning"
import { useRouter } from "next/navigation"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { PageContainer } from '@/components/page-container'

export default function CreateLiturgyPlanPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Liturgy Planning", href: "/liturgy-planning" },
      { label: "Create Plan" }
    ])
  }, [setBreadcrumbs])
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    liturgy_type: "mass",
    preface: "",
    special_notes: ""
  })
  const [prayers, setPrayers] = useState<string[]>([''])
  const [readings, setReadings] = useState<string[]>([''])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createLiturgyPlan({
        ...formData,
        prayers: prayers.filter(p => p.trim()),
        readings: readings.filter(r => r.trim())
      })
      router.push("/liturgy-planning")
    } catch {
      alert("Failed to create liturgy plan. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const addPrayer = () => setPrayers([...prayers, ''])
  const removePrayer = (index: number) => setPrayers(prayers.filter((_, i) => i !== index))
  const updatePrayer = (index: number, value: string) => {
    const updated = [...prayers]
    updated[index] = value
    setPrayers(updated)
  }

  const addReading = () => setReadings([...readings, ''])
  const removeReading = (index: number) => setReadings(readings.filter((_, i) => i !== index))
  const updateReading = (index: number, value: string) => {
    const updated = [...readings]
    updated[index] = value
    setReadings(updated)
  }

  return (
    <PageContainer
      title="Create Liturgy Plan"
      description="Plan a complete liturgical celebration with prayers, readings, and instructions"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/liturgy-planning">
            <ArrowLeft className="h-4 w-4" />
            Back to Plans
          </Link>
        </Button>

        <Card>
        <CardHeader>
          <CardTitle>Liturgy Plan Details</CardTitle>
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
                  placeholder="e.g., Sunday Mass - 1st Sunday of Advent"
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

            <div className="space-y-2">
              <Label htmlFor="liturgy_type">Liturgy Type</Label>
              <Select value={formData.liturgy_type} onValueChange={(value) => setFormData({...formData, liturgy_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select liturgy type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mass">Mass</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="funeral">Funeral</SelectItem>
                  <SelectItem value="baptism">Baptism</SelectItem>
                  <SelectItem value="confirmation">Confirmation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Prayers</Label>
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
                    placeholder="Prayer name or description"
                  />
                  {prayers.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removePrayer(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
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

            <div className="space-y-2">
              <Label htmlFor="preface">Preface</Label>
              <Input
                id="preface"
                value={formData.preface}
                onChange={(e) => setFormData({...formData, preface: e.target.value})}
                placeholder="e.g., Preface of Advent I"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_notes">Special Notes</Label>
              <Textarea
                id="special_notes"
                value={formData.special_notes}
                onChange={(e) => setFormData({...formData, special_notes: e.target.value})}
                placeholder="Special instructions, variations, or notes for this celebration..."
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Creating..." : "Create Plan"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/liturgy-planning">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}