'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, BookOpen, Filter, X, Check, Sparkles, Loader2 } from "lucide-react"
import type { IndividualReading } from '@/lib/actions/readings'
import { getReadingSuggestions, type ReadingSuggestion } from '@/lib/actions/claude'
import { toast } from 'sonner'

interface ReadingPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (reading: IndividualReading | null) => void
  selectedReading?: IndividualReading | null
  readings: IndividualReading[]
  title: string
  readingType: 'first' | 'psalm' | 'second' | 'gospel'
}

export function ReadingPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedReading,
  readings,
  title,
  readingType
}: ReadingPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('relevance')
  const [showAiDialog, setShowAiDialog] = useState(false)
  const [aiDescription, setAiDescription] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<ReadingSuggestion[]>([])
  const [isLoadingAi, setIsLoadingAi] = useState(false)
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

  // Get relevant readings based on type
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
    
    // Otherwise, use reading type-based filtering (original logic)
    const categoryFilters: Record<string, string[]> = {
      first: ['first', 'reading', '1', 'sunday', 'weekday', 'marriage', 'funeral', 'baptism', 'confirmation', 'mass'],
      psalm: ['psalm', 'responsorial'],
      second: ['second', 'reading', '2', 'sunday', 'weekday', 'marriage', 'funeral', 'baptism', 'confirmation', 'mass'],
      gospel: ['gospel']
    }
    
    const relevantCategories = categoryFilters[readingType] || []
    
    return readings.filter(reading => {
      const readingCategory = reading.category?.toLowerCase() || ''
      
      // Special handling for psalm type
      if (readingType === 'psalm') {
        // STRICT: Only show readings that have "Psalm" in their categories
        const hasCategories = reading.categories && reading.categories.length > 0
        const isPsalmInCategories = hasCategories && reading.categories?.some(cat => 
          cat && cat.toLowerCase().includes('psalm')
        )
        
        // Also check the display category for psalm/responsorial
        const isPsalmInDisplayCategory = readingCategory.includes('psalm') || 
                                        readingCategory.includes('responsorial') ||
                                        readingCategory.includes('canticle')
        
        // ONLY use category-based filtering, NOT content-based
        const result = isPsalmInCategories || isPsalmInDisplayCategory
        
        // Debug log for psalm filtering
        if (result) {
          console.log('Psalm reading ACCEPTED:', {
            pericope: reading.pericope,
            displayCategory: reading.category,
            allCategories: reading.categories,
            isPsalmInCategories,
            isPsalmInDisplayCategory
          })
        }
        
        return result
      }
      
      // For other types, use the existing logic but make it more flexible
      return relevantCategories.some(cat => 
        readingCategory.includes(cat.toLowerCase())
      ) || readingCategory === 'general' // Include general readings as fallback
    })
  }, [readings, readingType, selectedCategories])

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

  const availableCategories = useMemo(() => {
    console.log('🔄 Building availableCategories - START')
    const categories = new Set<string>()
    
    console.log('Processing', readings.length, 'readings for categories')
    
    // ONLY use the categories array from database - this exactly matches what's stored
    readings.forEach((reading, index) => {
      // Log raw data to understand database structure
      if (index < 3) {
        console.log(`Sample reading ${index + 1}:`, {
          pericope: reading.pericope,
          primaryCategory: reading.category,
          databaseCategories: reading.categories,
          categoryType: typeof reading.category,
          categoriesType: typeof reading.categories,
          categoriesIsArray: Array.isArray(reading.categories)
        })
      }
      
      // Add each category from the database categories array exactly as stored
      if (reading.categories && reading.categories.length > 0) {
        reading.categories.forEach(cat => {
          if (cat && typeof cat === 'string' && cat.trim()) {
            categories.add(cat.trim()) // Only trim whitespace, keep exact database value
          }
        })
      }
      
      // Also include the primary category if it exists and isn't already covered
      if (reading.category && typeof reading.category === 'string' && reading.category.trim()) {
        categories.add(reading.category.trim())
      }
    })
    
    const result = Array.from(categories).sort()
    console.log('🎯 Final availableCategories (exactly from database):', result)
    return result
  }, [readings])

  const getReadingLanguage = useCallback((reading: IndividualReading): string => {
    return reading.language || 'English'
  }, [])

  // Pre-select relevant category when picker opens (only once)
  React.useEffect(() => {
    if (isOpen && availableCategories.length > 0 && !hasInitializedCategories) {
      // Map reading types to category keywords (exact matches preferred)
      const categoryKeywords: Record<string, string[]> = {
        first: ['First', 'first', 'First Reading', '1st'],
        psalm: ['Psalm', 'psalm', 'Responsorial', 'responsorial'],
        second: ['Second', 'second', 'Second Reading', '2nd'],
        gospel: ['Gospel', 'gospel']
      }
      
      const keywords = categoryKeywords[readingType] || []
      
      // Find the first matching category (try exact match first, then partial)
      let matchingCategory = availableCategories.find(cat => 
        keywords.some(keyword => cat === keyword)
      )
      
      if (!matchingCategory) {
        // For partial matches, be more strict to prevent cross-type matches
        matchingCategory = availableCategories.find(cat => {
          const catLower = cat.toLowerCase()
          return keywords.some(keyword => {
            const keywordLower = keyword.toLowerCase()
            
            // Special handling to prevent "psalm" from matching "first" type
            if (readingType === 'first' && catLower.includes('psalm')) {
              return false
            }
            
            // Special handling to prevent "first" from matching "psalm" type  
            if (readingType === 'psalm' && (catLower.includes('first') || catLower.includes('second'))) {
              return false
            }
            
            // Special handling to prevent "second" or "first" from matching "gospel" type
            if (readingType === 'gospel' && (catLower.includes('first') || catLower.includes('second') || catLower.includes('psalm'))) {
              return false
            }
            
            // Special handling to prevent other types from matching "second" type
            if (readingType === 'second' && (catLower.includes('first') || catLower.includes('psalm') || catLower.includes('gospel'))) {
              return false
            }
            
            return catLower.includes(keywordLower)
          })
        })
      }
      
      if (matchingCategory) {
        console.log('Pre-selecting category:', matchingCategory, 'for readingType:', readingType)
        setSelectedCategories([matchingCategory])
        setHasInitializedCategories(true)
      } else {
        console.log('No matching category found for readingType:', readingType, 'available categories:', availableCategories)
        setHasInitializedCategories(true)
      }
    }
  }, [isOpen, readingType, availableCategories, hasInitializedCategories])

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
    
    // Debug: Show sample readings to understand data structure
    if (selectedCategories.includes('Funeral') && relevantReadings.length > 0) {
      console.log('🪦 FUNERAL CATEGORY SELECTED - Sample readings data:')
      relevantReadings.slice(0, 5).forEach((reading, index) => {
        console.log(`Reading ${index + 1}:`, {
          pericope: reading.pericope,
          primaryCategory: reading.category,
          allCategories: reading.categories,
          categoryIsString: typeof reading.category,
          categoriesIsArray: Array.isArray(reading.categories)
        })
      })
    }
    
    // If we have AI suggestions and sort is set to AI, prioritize those
    if (sortBy === 'ai-suggestions' && aiSuggestions.length > 0) {
      const suggestedIds = new Set(aiSuggestions.map(s => s.reading.id))
      const suggested = aiSuggestions.map(s => s.reading)
      const others = relevantReadings.filter(r => !suggestedIds.has(r.id))
      return [...suggested, ...others]
    }

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
    } else if (sortBy === 'ai-suggestions') {
      // AI suggestions are already in priority order
      return filtered
    } else if (sortBy === 'relevance') {
      // Sort by relevance to reading type
      const typeKeywords: Record<string, string[]> = {
        first: ['first', 'reading'],
        psalm: ['psalm'],
        second: ['second'],
        gospel: ['gospel']
      }
      const keywords = typeKeywords[readingType] || []
      
      filtered.sort((a, b) => {
        const aScore = keywords.reduce((score, keyword) => 
          score + (a.category?.toLowerCase().includes(keyword) ? 1 : 0), 0)
        const bScore = keywords.reduce((score, keyword) => 
          score + (b.category?.toLowerCase().includes(keyword) ? 1 : 0), 0)
        return bScore - aScore
      })
    }

    return filtered
  }, [relevantReadings, searchTerm, selectedLanguage, selectedCategories, sortBy, readingType, getReadingLanguage, aiSuggestions])

  const handleSelect = (reading: IndividualReading | null) => {
    onSelect(reading)
    onClose()
  }

  const clearFilters = () => {
    setSearchTerm('')
    // Reset to saved language preference or 'all' if none saved
    const savedLanguage = localStorage.getItem('reading-picker-language') || 'all'
    setSelectedLanguage(savedLanguage)
    
    // Re-select the appropriate category for each reading type after clearing
    const categoryKeywords: Record<string, string[]> = {
      first: ['First', 'first', 'First Reading', '1st'],
      psalm: ['Psalm', 'psalm', 'Responsorial', 'responsorial'],
      second: ['Second', 'second', 'Second Reading', '2nd'],
      gospel: ['Gospel', 'gospel']
    }
    
    const keywords = categoryKeywords[readingType] || []
    
    // Find matching category (try exact match first, then partial)
    let matchingCategory = availableCategories.find(cat => 
      keywords.some(keyword => cat === keyword)
    )
    
    if (!matchingCategory) {
      // For partial matches, be more strict to prevent cross-type matches
      matchingCategory = availableCategories.find(cat => {
        const catLower = cat.toLowerCase()
        return keywords.some(keyword => {
          const keywordLower = keyword.toLowerCase()
          
          // Special handling to prevent "psalm" from matching "first" type
          if (readingType === 'first' && catLower.includes('psalm')) {
            return false
          }
          
          // Special handling to prevent "first" from matching "psalm" type  
          if (readingType === 'psalm' && (catLower.includes('first') || catLower.includes('second'))) {
            return false
          }
          
          // Special handling to prevent "second" or "first" from matching "gospel" type
          if (readingType === 'gospel' && (catLower.includes('first') || catLower.includes('second') || catLower.includes('psalm'))) {
            return false
          }
          
          // Special handling to prevent other types from matching "second" type
          if (readingType === 'second' && (catLower.includes('first') || catLower.includes('psalm') || catLower.includes('gospel'))) {
            return false
          }
          
          return catLower.includes(keywordLower)
        })
      })
    }
    
    setSelectedCategories(matchingCategory ? [matchingCategory] : [])
    setSortBy('relevance')
    setAiSuggestions([])
    
    // Reset initialization flag so the category can be pre-selected again if needed
    setHasInitializedCategories(true)
  }

  const handleAiSuggestion = async () => {
    if (!aiDescription.trim()) {
      toast.error('Please describe what you\'re looking for')
      return
    }

    setIsLoadingAi(true)
    try {
      const suggestions = await getReadingSuggestions({
        description: aiDescription,
        readingType,
        availableReadings: relevantReadings
      })
      
      setAiSuggestions(suggestions)
      setShowAiDialog(false)
      
      if (suggestions.length === 0) {
        toast.info('No specific suggestions found. Try adjusting your description.')
      } else {
        toast.success(`Found ${suggestions.length} AI suggestions!`)
        // Clear other filters to show AI suggestions
        setSearchTerm('')
        setSelectedLanguage('all')
        setSelectedCategories([])
        setSortBy('ai-suggestions')
      }
    } catch (error) {
      console.error('AI suggestion error:', error)
      toast.error('Failed to get AI suggestions. Please try again.')
    } finally {
      setIsLoadingAi(false)
    }
  }


  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // Debug: Log readings and filtering for psalm type
  React.useEffect(() => {
    if (isOpen) {
      console.log(`${readingType} modal opened`)
      console.log('Total readings:', readings.length)
      console.log('Available languages:', availableLanguages)
      
      // Show unique categories for debugging
      const uniqueCategories = [...new Set(readings.map(r => r.category))].sort()
      console.log('Unique categories found:', uniqueCategories)
      
      // Look for readings that mention psalm in title/pericope
      const psalmLikeReadings = readings.filter(r => 
        r.pericope?.toLowerCase().includes('psalm') ||
        r.title?.toLowerCase().includes('psalm') ||
        r.reading_text?.toLowerCase().includes('psalm')
      )
      console.log('Readings that contain "psalm" in content:', psalmLikeReadings.length)
      console.log('Sample psalm-like readings:', psalmLikeReadings.slice(0, 3).map(r => ({
        pericope: r.pericope,
        title: r.title,
        category: r.category,
        categories: r.categories // Add this to see if categories array is populated
      })))
      
      // Check if ANY reading has a categories array
      const readingsWithCategories = readings.filter(r => r.categories && r.categories.length > 0)
      console.log('Readings with categories array:', readingsWithCategories.length)
      if (readingsWithCategories.length > 0) {
        console.log('Sample reading with categories:', {
          pericope: readingsWithCategories[0].pericope,
          categories: readingsWithCategories[0].categories
        })
        
        // Look specifically for readings with "Psalm" in categories
        const psalmReadings = readingsWithCategories.filter(r => 
          r.categories?.some(cat => cat && cat.toLowerCase().includes('psalm'))
        )
        console.log('Readings with "psalm" in categories array:', psalmReadings.length)
        if (psalmReadings.length > 0) {
          console.log('Sample psalm reading from categories:', {
            pericope: psalmReadings[0].pericope,
            categories: psalmReadings[0].categories
          })
          
          // Force show what categories are actually in there
          console.log('Raw categories from first psalm reading:', psalmReadings[0].categories)
          
          // Test the availableCategories logic directly on this reading
          console.log('Testing category processing on psalm reading:')
          if (psalmReadings[0].categories) {
            psalmReadings[0].categories.forEach(cat => {
              if (cat) {
                console.log('Raw category:', cat)
                const cleanCategory = cat
                  .replace(/[-_]/g, ' ')
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ')
                console.log('Clean category result:', cleanCategory)
              }
            })
          }
        }
      }
      
      // Show psalm-related categories specifically
      const psalmCategories = uniqueCategories.filter(cat => 
        cat && cat.toLowerCase().includes('psalm')
      )
      console.log('Psalm-related categories:', psalmCategories)
      
      console.log('Filtered relevant readings:', relevantReadings.length)
      console.log('Relevant readings details:', relevantReadings.map(r => ({
        pericope: r.pericope,
        category: r.category,
        categories: r.categories
      })))
      
      if (relevantReadings.length === 0 && readingType === 'psalm') {
        // Show why no psalms match
        const psalmReadings = readings.filter(r => 
          r.category && r.category.toLowerCase().includes('psalm')
        )
        console.log('Psalm readings found but filtered out:', psalmReadings.length)
        console.log('Sample psalm readings:', psalmReadings.slice(0, 5).map(r => ({
          pericope: r.pericope,
          category: r.category,
          categoryLower: r.category?.toLowerCase()
        })))
      }
    }
  }, [isOpen, readingType, readings, relevantReadings, availableLanguages])

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
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search readings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAiDialog(true)}
                  className="px-2 h-9 flex-shrink-0"
                  title="AI Reading Suggestions"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
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
                  <SelectItem value="pericope">Pericope</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  {aiSuggestions.length > 0 && (
                    <SelectItem value="ai-suggestions">AI Suggestions</SelectItem>
                  )}
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
            <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
              {availableCategories.map(category => (
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
                {aiSuggestions.length > 0 && (
                  <span className="ml-2 text-purple-600 hidden sm:inline">
                    • {aiSuggestions.length} AI
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
              {filteredReadings.slice(0, 50).map((reading) => {
                const aiSuggestion = aiSuggestions.find(s => s.reading.id === reading.id)
                return (
                  <div
                    key={reading.id}
                    className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-colors relative ${
                      selectedReading?.id === reading.id 
                        ? 'border-primary bg-primary/5' 
                        : aiSuggestion
                          ? 'border-purple-200 bg-purple-50/50 hover:border-purple-300'
                          : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleSelect(reading)}
                  >
                    {aiSuggestion && (
                      <div className="absolute top-2 right-2">
                        <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                          <Sparkles className="h-3 w-3" />
                          AI
                        </div>
                      </div>
                    )}
                    
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
                    
                    {aiSuggestion && (
                      <div className="text-sm text-purple-700 mb-2 font-medium">
                        {aiSuggestion.reason}
                      </div>
                    )}
                    
                    {reading.reading_text && (
                      <div className="text-sm text-gray-700 line-clamp-2">
                        {reading.reading_text.substring(0, 120)}
                        {reading.reading_text.length > 120 && '...'}
                      </div>
                    )}
                  </div>
                )
              })}
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

      {/* AI Suggestion Dialog */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Reading Suggestions
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-description" className="text-sm font-medium">
                Describe what you&apos;re looking for
              </Label>
              <Textarea
                id="ai-description"
                placeholder="e.g., &apos;readings about hope and perseverance for a difficult time&apos; or &apos;joyful passages for a wedding celebration&apos;"
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                rows={3}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Be specific about the theme, occasion, or mood you&apos;re seeking
              </p>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAiDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAiSuggestion}
                disabled={isLoadingAi || !aiDescription.trim()}
              >
                {isLoadingAi && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Get Suggestions
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}