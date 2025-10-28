"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from "@/components/page-container"
import { Loading } from '@/components/loading'
import Link from "next/link"
import { Save, Plus, X } from "lucide-react"
import { getReading, updateReading, type CreateReadingData } from "@/lib/actions/readings"
import { useRouter } from "next/navigation"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { toast } from 'sonner'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditReadingPage({ params }: PageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [newCategory, setNewCategory] = useState("")
  const [readingId, setReadingId] = useState<string>('')
  const [formData, setFormData] = useState<CreateReadingData>({
    pericope: "",
    text: "",
    introduction: "",
    conclusion: "",
    categories: [],
    language: "",
    lectionary_id: ""
  })
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    const loadReading = async () => {
      try {
        const { id } = await params
        setReadingId(id)
        const reading = await getReading(id)
        
        if (!reading) {
          router.push('/readings')
          return
        }

        // Populate form with existing data
        setFormData({
          pericope: reading.pericope || "",
          text: reading.text || "",
          introduction: reading.introduction || "",
          conclusion: reading.conclusion || "",
          categories: reading.categories || [],
          language: reading.language || "",
          lectionary_id: reading.lectionary_id || ""
        })

        setBreadcrumbs([
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Readings", href: "/readings" },
          { label: reading.pericope || 'Reading', href: `/readings/${id}` }
        ])
      } catch (error) {
        console.error('Failed to load reading:', error)
        toast.error('Failed to load reading')
        router.push('/readings')
      } finally {
        setPageLoading(false)
      }
    }

    loadReading()
  }, [params, setBreadcrumbs, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateReading(readingId, formData)
      toast.success('Reading updated successfully')
      router.push(`/readings/${readingId}`)
    } catch (error) {
      console.error('Failed to update reading:', error)
      toast.error('Failed to update reading. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const addCategory = () => {
    if (newCategory.trim() && !formData.categories?.includes(newCategory.trim())) {
      setFormData({
        ...formData,
        categories: [...(formData.categories || []), newCategory.trim()]
      })
      setNewCategory("")
    }
  }

  const removeCategory = (categoryToRemove: string) => {
    setFormData({
      ...formData,
      categories: formData.categories?.filter(cat => cat !== categoryToRemove) || []
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCategory()
    }
  }

  if (pageLoading) {
    return (
      <PageContainer 
        title="Edit Reading"
        description="Loading reading information..."
        maxWidth="4xl"
      >
        <Loading />
      </PageContainer>
    )
  }

  return (
    <PageContainer 
      title="Edit Reading"
      description="Update the scripture reading or liturgical text details."
      cardTitle="Reading Details"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pericope">Pericope *</Label>
                <Input
                  id="pericope"
                  value={formData.pericope}
                  onChange={(e) => setFormData({...formData, pericope: e.target.value})}
                  placeholder="e.g., Matthew 5:1-12, Genesis 1:1-2:4"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The scripture reference or title of the reading
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lectionary_id">Lectionary ID</Label>
                <Input
                  id="lectionary_id"
                  value={formData.lectionary_id || ""}
                  onChange={(e) => setFormData({...formData, lectionary_id: e.target.value})}
                  placeholder="e.g., 1A, 25B, Easter Vigil"
                />
                <p className="text-xs text-muted-foreground">
                  Optional lectionary cycle reference
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={formData.language || ""}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                placeholder="e.g., English, Spanish, Latin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="introduction">Introduction (Optional)</Label>
              <Textarea
                id="introduction"
                value={formData.introduction || ""}
                onChange={(e) => setFormData({...formData, introduction: e.target.value})}
                placeholder="Optional introduction text read before the main reading..."
                rows={3}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Text read before the main reading (e.g., &quot;A reading from the Book of Genesis&quot;)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">Reading Text *</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({...formData, text: e.target.value})}
                placeholder="Enter the full text of the reading..."
                rows={12}
                className="font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                The complete text of the scripture reading or liturgical text
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conclusion">Conclusion (Optional)</Label>
              <Textarea
                id="conclusion"
                value={formData.conclusion || ""}
                onChange={(e) => setFormData({...formData, conclusion: e.target.value})}
                placeholder="Optional conclusion text read after the main reading..."
                rows={2}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Text read after the main reading (e.g., &quot;The Word of the Lord&quot;)
              </p>
            </div>

            <div className="space-y-4">
              <Label>Categories</Label>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a category (e.g., Gospel, Psalm, Wedding)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCategory}
                  disabled={!newCategory.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.categories && formData.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.categories.map((category) => (
                    <Badge key={category} variant="secondary" className="flex items-center gap-1">
                      {category}
                      <button
                        type="button"
                        onClick={() => removeCategory(category)}
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Categories help organize and filter your readings
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Reading Guidelines</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use standard biblical references for the pericope (e.g., &quot;John 3:16-21&quot;)</li>
                <li>• Introduction typically includes the source (e.g., &quot;A reading from the Book of Genesis&quot;)</li>
                <li>• Include paragraph breaks and formatting in the main text as needed</li>
                <li>• Conclusion usually includes response cues (e.g., &quot;The Word of the Lord&quot;)</li>
                <li>• Categories help organize readings by type, season, or occasion</li>
                <li>• Lectionary ID helps reference specific liturgical cycles</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/readings/${readingId}`}>Cancel</Link>
              </Button>
            </div>
          </form>
    </PageContainer>
  )
}