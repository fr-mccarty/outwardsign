"use client"

import { useState, useEffect } from "react"
import { PageContainer } from "@/components/page-container"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FormField } from '@/components/form-field'
import Link from "next/link"
import { Save } from "lucide-react"
import { createMinister } from "@/lib/actions/ministers"
import { useRouter } from "next/navigation"
import { useBreadcrumbs } from '@/components/breadcrumb-context'

export default function CreateMinisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Ministers Directory", href: "/ministers" },
      { label: "Add Minister" }
    ])
  }, [setBreadcrumbs])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    notes: "",
    is_active: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createMinister(formData)
      router.push("/ministers")
    } catch {
      alert("Failed to create minister. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageContainer 
      title="Add New Minister"
      description="Add contact information for a new minister or volunteer."
      cardTitle="Minister Information"
      maxWidth="2xl"
    >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormField
                  id="name"
                  label="Name"
                  value={formData.name}
                  onChange={(value) => setFormData({...formData, name: value})}
                  required
                />
              </div>
              <div>
                <FormField
                  id="role"
                  label="Role"
                  value={formData.role}
                  onChange={(value) => setFormData({...formData, role: value})}
                  placeholder="e.g., Priest, Deacon, Lector, etc."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormField
                  id="email"
                  label="Email"
                  inputType="email"
                  value={formData.email}
                  onChange={(value) => setFormData({...formData, email: value})}
                />
              </div>
              <div>
                <FormField
                  id="phone"
                  label="Phone"
                  value={formData.phone}
                  onChange={(value) => setFormData({...formData, phone: value})}
                />
              </div>
            </div>

            <FormField
              id="notes"
              label="Notes"
              inputType="textarea"
              value={formData.notes}
              onChange={(value) => setFormData({...formData, notes: value})}
              placeholder="Additional information, availability, special notes..."
              rows={3}
            />

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
                {isLoading ? "Creating..." : "Create Minister"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/ministers">Cancel</Link>
              </Button>
            </div>
          </form>
    </PageContainer>
  )
}