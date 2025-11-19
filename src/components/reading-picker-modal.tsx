'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Filter, Check, Eye } from "lucide-react"
import type { IndividualReading } from '@/lib/actions/readings'
import { toast } from 'sonner'
import { READING_CATEGORIES, READING_CATEGORY_LABELS, LITURGICAL_LANGUAGE_VALUES, LITURGICAL_LANGUAGE_LABELS } from '@/lib/constants'

interface ReadingPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (reading: IndividualReading | null) => void
  selectedReading?: IndividualReading | null
  readings: IndividualReading[]
  title: string
  preselectedCategories?: string[]
}

export function ReadingPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedReading,
  readings,
  title,
  preselectedCategories = []
}: ReadingPickerModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [hasInitializedCategories, setHasInitializedCategories] = useState(false)
  const [previewReading, setPreviewReading] = useState<IndividualReading | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // Load saved language preference from localStorage
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('reading-picker-language')
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage)
    }
  }, [])


  // Save language preference to localStorage when it changes
  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)
    localStorage.setItem('reading-picker-language', language)
  }

  // Get relevant readings based on selected categories
  const relevantReadings = useMemo(() => {
    // If specific categories are selected, show ONLY readings that have ALL selected categories (AND logic)
    if (selectedCategories.length > 0) {
      console.log('🎯 Category filter active - showing readings with ALL selected categories (AND logic):', selectedCategories)

      // Convert display labels to database keys
      const selectedDatabaseKeys = selectedCategories.map(label => {
        // Find the database key for this label
        const entry = Object.entries(READING_CATEGORY_LABELS).find(
          ([key, labels]) => labels.en === label
        )
        return entry ? entry[0] : null
      }).filter(Boolean) as string[]

      console.log('Selected database keys:', selectedDatabaseKeys)

      return readings.filter(reading => {
        // Get all categories for this reading (from categories array in database)
        const readingDatabaseCategories = new Set<string>()

        // Add all categories from categories array (these are stored as database keys like 'WEDDING', 'FIRST_READING')
        if (reading.categories && reading.categories.length > 0) {
          reading.categories.forEach(cat => {
            if (cat) {
              readingDatabaseCategories.add(cat.toUpperCase())
            }
          })
        }

        // Check if reading has ALL selected categories (AND logic)
        const hasAllCategories = selectedDatabaseKeys.every(selectedKey =>
          readingDatabaseCategories.has(selectedKey)
        )

        console.log('Category check:', {
          pericope: reading.pericope,
          readingCategories: Array.from(readingDatabaseCategories),
          selectedKeys: selectedDatabaseKeys,
          hasAllCategories
        })

        return hasAllCategories
      })
    }

    // If no categories selected, show all readings
    return readings
  }, [readings, selectedCategories])

  // Get available languages from constants
  const availableLanguages = useMemo(() => {
    return [...LITURGICAL_LANGUAGE_VALUES]
  }, [])

  // Get display labels for categories
  const categoryLabels = READING_CATEGORIES.map(cat => READING_CATEGORY_LABELS[cat].en)

  const getReadingLanguage = useCallback((reading: IndividualReading): string => {
    // Return lowercase ISO code (en, es, la)
    return (reading.language || 'en').toLowerCase()
  }, [])

  // Pre-select categories when picker opens (only once)
  React.useEffect(() => {
    if (isOpen && !hasInitializedCategories) {
      const categoriesToSelect: string[] = []

      // Match preselected categories with available categories
      if (preselectedCategories.length > 0) {
        preselectedCategories.forEach(preselectedCat => {
          // Try to find an exact match or case-insensitive match in category labels
          const matchingPreselected = categoryLabels.find(cat =>
            cat === preselectedCat || cat.toLowerCase() === preselectedCat.toLowerCase()
          )

          if (matchingPreselected && !categoriesToSelect.includes(matchingPreselected)) {
            categoriesToSelect.push(matchingPreselected)
          }
        })
      }

      if (categoriesToSelect.length > 0) {
        console.log('Pre-selecting categories:', categoriesToSelect, 'from preselectedCategories:', preselectedCategories)
        setSelectedCategories(categoriesToSelect)
      }

      setHasInitializedCategories(true)
    }
  }, [isOpen, preselectedCategories, categoryLabels, hasInitializedCategories])

  // Reset initialization flag when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setHasInitializedCategories(false)
    }
  }, [isOpen])

  // Filter readings
  const filteredReadings = useMemo(() => {
    console.log('🔍 Starting filteredReadings calculation')
    console.log('📊 relevantReadings count:', relevantReadings.length)
    console.log('🌐 selectedLanguage:', selectedLanguage)
    console.log('📂 selectedCategories:', selectedCategories)

    const filtered = relevantReadings.filter(reading => {
      // Language filter
      if (selectedLanguage !== 'all') {
        const readingLanguage = getReadingLanguage(reading)
        // Compare case-insensitively
        if (readingLanguage.toLowerCase() !== selectedLanguage.toLowerCase()) {
          console.log('Filtered out by language:', reading.pericope, 'readingLang:', readingLanguage, 'selectedLang:', selectedLanguage)
          return false
        }
      }

      return true
    })

    console.log('Final filtered count:', filtered.length)

    return filtered
  }, [relevantReadings, selectedLanguage, selectedCategories, getReadingLanguage])

  const handleSelect = (reading: IndividualReading | null) => {
    onSelect(reading)
    onClose()
  }

  const clearFilters = () => {
    // Reset to saved language preference or 'all' if none saved
    const savedLanguage = localStorage.getItem('reading-picker-language') || 'all'
    setSelectedLanguage(savedLanguage)

    // Re-select the preselected categories
    const categoriesToSelect: string[] = []
    if (preselectedCategories.length > 0) {
      preselectedCategories.forEach(preselectedCat => {
        const matchingPreselected = categoryLabels.find(cat =>
          cat === preselectedCat || cat.toLowerCase() === preselectedCat.toLowerCase()
        )
        if (matchingPreselected && !categoriesToSelect.includes(matchingPreselected)) {
          categoriesToSelect.push(matchingPreselected)
        }
      })
    }

    setSelectedCategories(categoriesToSelect)
  }

  const handlePreviewReading = (reading: IndividualReading, e: React.MouseEvent) => {
    e.stopPropagation()
    setPreviewReading(reading)
    setShowPreviewModal(true)
  }


  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // Debug: Log readings and filtering
  React.useEffect(() => {
    if (isOpen) {
      console.log('Reading picker modal opened')
      console.log('Total readings:', readings.length)
      console.log('Preselected categories:', preselectedCategories)
      console.log('Available languages:', availableLanguages)

      // Show unique categories for debugging
      const uniqueCategories = [...new Set(readings.map(r => r.category))].sort()
      console.log('Unique categories found:', uniqueCategories)

      console.log('Filtered relevant readings:', relevantReadings.length)
      if (relevantReadings.length > 0) {
        console.log('Sample relevant readings:', relevantReadings.slice(0, 3).map(r => ({
          pericope: r.pericope,
          category: r.category,
          categories: r.categories
        })))
      }
    }
  }, [isOpen, preselectedCategories, readings, relevantReadings, availableLanguages])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="h-[85vh] max-h-[85vh] w-[95vw] max-w-[900px] lg:max-w-[1100px] flex flex-col overflow-hidden p-0"
        >
          <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {title}
            </DialogTitle>
          </DialogHeader>

        {/* Filters */}
        <div className="space-y-3 border-b pb-3 px-4 pt-4 flex-shrink-0">
          {/* Language Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Language</Label>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full sm:w-1/2">
                <SelectValue placeholder="Select language">
                  {selectedLanguage === 'all' ? 'All Languages' : LITURGICAL_LANGUAGE_LABELS[selectedLanguage]?.en || selectedLanguage}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {availableLanguages.map(lang => (
                  <SelectItem key={lang} value={lang}>{LITURGICAL_LANGUAGE_LABELS[lang].en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Categories</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryLabels.map(category => (
                <Button
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCategory(category)}
                  className="text-xs h-7 flex-shrink-0"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground truncate">
                {filteredReadings.length} of {relevantReadings.length} readings
                {selectedCategories.length > 0 && (
                  <span className="ml-2 text-primary hidden sm:inline">
                    • {selectedCategories.length} filter{selectedCategories.length > 1 ? 's' : ''}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Reading List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <div className="space-y-4 pb-4">
            {/* Reading options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredReadings.slice(0, 50).map((reading) => (
                <div
                  key={reading.id}
                  className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-colors relative ${
                    selectedReading?.id === reading.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleSelect(reading)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="font-medium text-base flex-1 pr-2">
                      {reading.pericope}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => handlePreviewReading(reading, e)}
                        title="Preview reading"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      {selectedReading?.id === reading.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>

                  {reading.text && (
                    <div className="text-sm text-foreground line-clamp-2">
                      {reading.text.substring(0, 120)}
                      {reading.text.length > 120 && '...'}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredReadings.length > 50 && (
              <div className="text-center py-4">
                <div className="text-sm text-muted-foreground">
                  Showing 50 of {filteredReadings.length} readings. Use filters to narrow your search.
                </div>
              </div>
            )}

            {filteredReadings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div className="font-medium">No readings found</div>
                <div className="text-sm">Try adjusting your search or filters</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 px-4 sm:px-6 pb-6 border-t flex-shrink-0">
          <div className="text-sm text-muted-foreground truncate min-w-0">
            {selectedReading ? `Selected: ${selectedReading.pericope}` : 'No reading selected'}
          </div>
          <div className="flex gap-2 justify-end flex-shrink-0">
            <Button variant="outline" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button onClick={() => handleSelect(selectedReading || null)} size="sm">
              Confirm Selection
            </Button>
          </div>
        </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {previewReading?.pericope || 'Reading Preview'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {previewReading && (
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  {previewReading.title && (
                    <h2 className="text-lg font-semibold">{previewReading.title}</h2>
                  )}
                </div>

                {/* Reading Text */}
                {previewReading.text && (
                  <div className="text-base leading-relaxed whitespace-pre-wrap">
                    {previewReading.text}
                  </div>
                )}

                {!previewReading.text && (
                  <div className="text-muted-foreground italic">
                    No reading text available.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowPreviewModal(false)
              handleSelect(previewReading)
            }}>
              Select This Reading
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}