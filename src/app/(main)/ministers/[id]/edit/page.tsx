"use client"

import { useState, useEffect } from "react"
import { PageContainer } from "@/components/page-container"
import { Loading } from '@/components/loading'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { Save } from "lucide-react"
import { getMinister, updateMinister } from "@/lib/actions/ministers"
import { useRouter, useParams } from "next/navigation"
import { useBreadcrumbs } from '@/components/breadcrumb-context'

export default function EditMinisterPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    notes: "",
    is_active: true
  })
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    const loadMinister = async () => {
      try {
        const minister = await getMinister(id)
        if (minister) {
          setFormData({
            name: minister.name,
            email: minister.email || "",
            phone: minister.phone || "",
            role: minister.role,
            notes: minister.notes || "",
            is_active: minister.is_active
          })
          
          // Set breadcrumbs with minister name
          setBreadcrumbs([
            { label: "Dashboard", href: "/dashboard" },
            { label: "Ministers Directory", href: "/ministers" },
            { label: minister.name, href: `/ministers/${id}` },
            { label: "Edit" }
          ])
        } else {
          router.push("/ministers")
        }
      } catch {
        router.push("/ministers")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadMinister()
  }, [id, router, setBreadcrumbs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateMinister(id, formData)
      router.push(`/ministers/${id}`)
    } catch {
      alert("Failed to update minister. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <PageContainer 
        title="Edit Minister"
        description="Loading minister information..."
        maxWidth="2xl"
      >
        <Loading />
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Edit Minister"
      description="Update minister information and contact details."
      cardTitle="Minister Information"
      maxWidth="2xl"
    >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  placeholder="e.g., Priest, Deacon, Lector, etc."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional information, availability, special notes..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/ministers/${id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
    </PageContainer>
  )
}