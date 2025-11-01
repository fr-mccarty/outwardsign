'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, BookOpen, Filter, X, Check } from "lucide-react"
import type { IndividualReading } from '@/lib/actions/readings'
import { toast } from 'sonner'
import { READING_CATEGORIES, READING_CATEGORY_LABELS } from '@/lib/constants'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('relevance')
  const [hasInitializedCategories, setHasInitializedCategories] = useState(false)

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
      return readings.filter(reading => {
        // Get all categories for this reading (both primary category and categories array)
        const allReadingCategories = new Set<string>()

        // Add primary category
        if (reading.category) {
          allReadingCategories.add(reading.category.toLowerCase())
        }

        // Add all categories from categories array
        if (reading.categories && reading.categories.length > 0) {
          reading.categories.forEach(cat => {
            if (cat) {
              allReadingCategories.add(cat.toLowerCase())
            }
          })
        }

        // Check if reading has ALL selected categories (AND logic)
        const hasAllCategories = selectedCategories.every(selectedCat =>
          allReadingCategories.has(selectedCat.toLowerCase())
        )

        console.log('Category check:', {
          pericope: reading.pericope,
          readingCategories: Array.from(allReadingCategories),
          selectedCategories: selectedCategories.map(c => c.toLowerCase()),
          hasAllCategories
        })

        return hasAllCategories
      })
    }

    // If no categories selected, show all readings
    return readings
  }, [readings, selectedCategories])

  // Get unique languages and categories for filters
  const availableLanguages = useMemo(() => {
    const languages = new Set<string>()
    
    if (readings.length === 0) {
      // If no readings, provide basic language options
      languages.add('English')
      languages.add('Spanish')
      languages.add('Latin')
    } else {
      // Use all readings to get languages, not just filtered ones
      readings.forEach(reading => {
        const language = reading.language || 'English'
        languages.add(language)
      })
      // Always ensure we have at least English as an option
      languages.add('English')
    }
    
    return Array.from(languages).sort()
  }, [readings])

  // Get display labels for categories
  const categoryLabels = READING_CATEGORIES.map(cat => READING_CATEGORY_LABELS[cat].en)

  const getReadingLanguage = useCallback((reading: IndividualReading): string => {
    return reading.language || 'English'
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

  // Filter and sort readings
  const filteredReadings = useMemo(() => {
    console.log('🔍 Starting filteredReadings calculation')
    console.log('📊 relevantReadings count:', relevantReadings.length)
    console.log('🔎 searchTerm:', searchTerm)
    console.log('🌐 selectedLanguage:', selectedLanguage)
    console.log('📂 selectedCategories:', selectedCategories)

    const filtered = relevantReadings.filter(reading => {
      // Text search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matches = 
          reading.pericope?.toLowerCase().includes(searchLower) ||
          reading.reading_text?.toLowerCase().includes(searchLower) ||
          reading.introduction?.toLowerCase().includes(searchLower) ||
          reading.category?.toLowerCase().includes(searchLower)
        if (!matches) {
          console.log('Filtered out by search:', reading.pericope, 'searchTerm:', searchTerm)
          return false
        }
      }

      // Language filter
      if (selectedLanguage !== 'all') {
        const readingLanguage = getReadingLanguage(reading)
        if (readingLanguage !== selectedLanguage) {
          console.log('Filtered out by language:', reading.pericope, 'readingLang:', readingLanguage, 'selectedLang:', selectedLanguage)
          return false
        }
      }

      // Category filtering is now handled in relevantReadings, so this section is removed

      return true
    })
    
    console.log('Final filtered count:', filtered.length)

    // Sort readings
    if (sortBy === 'pericope') {
      filtered.sort((a, b) => (a.pericope || '').localeCompare(b.pericope || ''))
    } else if (sortBy === 'category') {
      filtered.sort((a, b) => (a.category || '').localeCompare(b.category || ''))
    } else if (['first-reading', 'psalm', 'second-reading', 'gospel'].includes(sortBy)) {
      // Sort by specific reading type - prioritize readings that have this category
      const categoryMap: Record<string, string[]> = {
        'first-reading': ['first reading', 'first', '1st'],
        'psalm': ['psalm', 'responsorial'],
        'second-reading': ['second reading', 'second', '2nd'],
        'gospel': ['gospel']
      }
      const keywords = categoryMap[sortBy] || []

      filtered.sort((a, b) => {
        // Check if reading has this category (in either category field or categories array)
        const aHasCategory = keywords.some(keyword => {
          const hasInCategory = a.category?.toLowerCase().includes(keyword)
          const hasInCategories = a.categories?.some(cat =>
            cat && cat.toLowerCase().includes(keyword)
          )
          return hasInCategory || hasInCategories
        })

        const bHasCategory = keywords.some(keyword => {
          const hasInCategory = b.category?.toLowerCase().includes(keyword)
          const hasInCategories = b.categories?.some(cat =>
            cat && cat.toLowerCase().includes(keyword)
          )
          return hasInCategory || hasInCategories
        })

        // Prioritize readings with the category
        if (aHasCategory && !bHasCategory) return -1
        if (!aHasCategory && bHasCategory) return 1
        return 0
      })
    }
    // Relevance sorting is default - no special sorting needed

    return filtered
  }, [relevantReadings, searchTerm, selectedLanguage, selectedCategories, sortBy, getReadingLanguage])

  const handleSelect = (reading: IndividualReading | null) => {
    onSelect(reading)
    onClose()
  }

  const clearFilters = () => {
    setSearchTerm('')
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
    setSortBy('relevance')
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
          className="h-[90vh] max-h-[90vh] w-[95vw] max-w-[900px] lg:max-w-[1100px] flex flex-col overflow-hidden p-0"
        >
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {title}
            </DialogTitle>
          </DialogHeader>

        {/* Filters */}
        <div className="space-y-3 border-b pb-3 px-4 flex-shrink-0">
          {/* Search and controls row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search readings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-20 sm:w-24 h-9">
                  <SelectValue placeholder="Lang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {availableLanguages.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-24 sm:w-28 h-9">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="first-reading">First Reading</SelectItem>
                  <SelectItem value="psalm">Psalm</SelectItem>
                  <SelectItem value="second-reading">Second Reading</SelectItem>
                  <SelectItem value="gospel">Gospel</SelectItem>
                  <SelectItem value="pericope">Pericope</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="ghost" size="sm" onClick={clearFilters} className="px-2 h-9">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Categories</Label>
              {selectedCategories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategories([])}
                  className="text-xs text-muted-foreground h-6 px-2 flex-shrink-0"
                >
                  Clear all ({selectedCategories.length})
                </Button>
              )}
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
                    {selectedReading?.id === reading.id && (
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground mb-2">
                    {reading.category}
                  </div>

                  {reading.reading_text && (
                    <div className="text-sm text-gray-700 line-clamp-2">
                      {reading.reading_text.substring(0, 120)}
                      {reading.reading_text.length > 120 && '...'}
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
    </>
  )
}