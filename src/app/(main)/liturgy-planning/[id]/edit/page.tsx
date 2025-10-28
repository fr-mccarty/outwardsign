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
import { getLiturgyPlan, updateLiturgyPlan } from "@/lib/actions/liturgy-planning"
import { useRouter, useParams } from "next/navigation"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { PageContainer } from '@/components/page-container'

export default function EditLiturgyPlanPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    liturgy_type: "mass",
    preface: "",
    special_notes: ""
  })
  const [prayers, setPrayers] = useState<string[]>([''])
  const [readings, setReadings] = useState<string[]>([''])
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const plan = await getLiturgyPlan(id)
        if (plan) {
          setFormData({
            title: plan.title,
            date: plan.date,
            liturgy_type: plan.liturgy_type,
            preface: plan.preface || "",
            special_notes: plan.special_notes || ""
          })
          setPrayers((plan.prayers as string[]) || [''])
          setReadings((plan.readings as string[]) || [''])
          
          // Set breadcrumbs with plan title
          setBreadcrumbs([
            { label: "Dashboard", href: "/dashboard" },
            { label: "Liturgy Planning", href: "/liturgy-planning" },
            { label: plan.title, href: `/liturgy-planning/${id}` },
            { label: "Edit" }
          ])
        } else {
          router.push("/liturgy-planning")
        }
      } catch {
        router.push("/liturgy-planning")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadPlan()
  }, [id, router, setBreadcrumbs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateLiturgyPlan(id, {
        ...formData,
        prayers: prayers.filter(p => p.trim()),
        readings: readings.filter(r => r.trim())
      })
      router.push(`/liturgy-planning/${id}`)
    } catch {
      alert("Failed to update liturgy plan. Please try again.")
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

  if (isLoadingData) {
    return (
      <PageContainer
        title="Loading..."
        description="Loading liturgy plan details"
        maxWidth="4xl"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/liturgy-planning">
              <ArrowLeft className="h-4 w-4" />
              Back to Plans
            </Link>
          </Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Edit Liturgy Plan"
      description="Update liturgical celebration details"
      maxWidth="4xl"
    >
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/liturgy-planning/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Plan
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
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

            <div className="space-y-2">
              <Label htmlFor="liturgy_type">Liturgy Type</Label>
              <Select value={formData.liturgy_type} onValueChange={(value) => setFormData({...formData, liturgy_type: value})}>
                <SelectTrigger>
                  <SelectValue />
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
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/liturgy-planning/${id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  )
}