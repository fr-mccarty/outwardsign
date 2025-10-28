'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { FormField } from '@/components/ui/form-field'
import { Search, Grid3X3, X, Plus } from 'lucide-react'
import { type Category, createCategory } from '@/lib/actions/categories'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface CategorySelectorProps {
  categories: Category[]
  selectedCategoryIds: string[]
  onCategoryToggle: (categoryId: string, selected: boolean) => void
  onCategoryCreated?: (category: Category) => void
  placeholder?: string
  label?: string
  description?: string
}

export function CategorySelector({
  categories,
  selectedCategoryIds,
  onCategoryToggle,
  onCategoryCreated,
  placeholder = "Search categories...",
  label = "Categories",
  description = "Select categories to organize your reading"
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: "",
    description: ""
  })
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue])
  
  const selectedCategories = categories.filter(cat => selectedCategoryIds.includes(cat.id))
  
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(debouncedSearchValue.toLowerCase()))
  )

  const exactMatch = categories.find(cat => 
    cat.name.toLowerCase() === debouncedSearchValue.toLowerCase()
  )

  const showCreateOption = debouncedSearchValue.trim() && !exactMatch

  const handleSelect = (category: Category) => {
    const isSelected = selectedCategoryIds.includes(category.id)
    onCategoryToggle(category.id, !isSelected)
    setSearchValue("")
    setOpen(false)
  }

  const removeCategory = (categoryId: string) => {
    onCategoryToggle(categoryId, false)
  }

  const handleCreateCategory = useCallback(async () => {
    if (!newCategoryForm.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setIsCreating(true)
    try {
      const newCategory = await createCategory({
        name: newCategoryForm.name.trim(),
        description: newCategoryForm.description.trim() || undefined
      })
      
      // Select the newly created category
      onCategoryToggle(newCategory.id, true)
      onCategoryCreated?.(newCategory)
      
      toast.success('Category created successfully!')
      setCreateModalOpen(false)
      setNewCategoryForm({ name: "", description: "" })
    } catch (error) {
      console.error('Failed to create category:', error)
      toast.error('Failed to create category')
    } finally {
      setIsCreating(false)
    }
  }, [newCategoryForm, onCategoryToggle, onCategoryCreated])

  const handleQuickCreate = useCallback(async () => {
    if (!debouncedSearchValue.trim()) return

    setIsCreating(true)
    try {
      const newCategory = await createCategory({
        name: debouncedSearchValue.trim()
      })
      
      onCategoryToggle(newCategory.id, true)
      onCategoryCreated?.(newCategory)
      
      toast.success(`Category "${newCategory.name}" created!`)
      setSearchValue("")
      setOpen(false)
    } catch (error) {
      console.error('Failed to create category:', error)
      toast.error('Failed to create category')
    } finally {
      setIsCreating(false)
    }
  }, [debouncedSearchValue, onCategoryToggle, onCategoryCreated])

  const openCreateModal = () => {
    setNewCategoryForm({ 
      name: debouncedSearchValue.trim(), 
      description: "" 
    })
    setCreateModalOpen(true)
    setOpen(false)
  }

  return (
    <div className="space-y-3">
      {label && (
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      
      {/* Selected categories display */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <Badge key={category.id} variant="secondary" className="flex items-center gap-1">
              {category.name}
              <button
                type="button"
                onClick={() => removeCategory(category.id)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input with typeahead */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-start text-left font-normal"
              >
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                {searchValue || placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder={placeholder}
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList>
                  <CommandEmpty>
                    {showCreateOption ? (
                      <div className="py-2 px-2">
                        <p className="text-xs text-muted-foreground mb-2">
                          No matching categories found.
                        </p>
                        <div className="space-y-1">
                          <Button
                            size="sm"
                            onClick={handleQuickCreate}
                            disabled={isCreating}
                            className="w-full h-8 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {isCreating ? 'Creating...' : `Create "${debouncedSearchValue}"`}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={openCreateModal}
                            disabled={isCreating}
                            className="w-full h-7 text-xs"
                          >
                            Add description...
                          </Button>
                        </div>
                      </div>
                    ) : (
                      "No categories found."
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredCategories.map((category) => (
                      <CommandItem
                        key={category.id}
                        value={category.name}
                        onSelect={() => handleSelect(category)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{category.name}</span>
                          {category.description && (
                            <span className="text-xs text-muted-foreground">
                              {category.description}
                            </span>
                          )}
                        </div>
                        {selectedCategoryIds.includes(category.id) && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </CommandItem>
                    ))}
                    {showCreateOption && filteredCategories.length > 0 && (
                      <>
                        <div className="px-2 py-1">
                          <div className="h-px bg-border" />
                        </div>
                        <CommandItem
                          value={`create-${debouncedSearchValue}`}
                          onSelect={handleQuickCreate}
                          disabled={isCreating}
                          className="text-primary text-xs py-1.5"
                        >
                          <Plus className="h-3 w-3 mr-1.5" />
                          {isCreating ? 'Creating...' : `Create "${debouncedSearchValue}"`}
                        </CommandItem>
                      </>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Browse all categories modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Browse All Categories</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                {categories.map((category) => {
                  const isSelected = selectedCategoryIds.includes(category.id)
                  return (
                    <div
                      key={category.id}
                      onClick={() => onCategoryToggle(category.id, !isSelected)}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                        isSelected && "bg-primary/10 border-primary"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{category.name}</span>
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      {category.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{selectedCategories.length} categories selected</span>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No categories available. Create categories in Settings → Categories.
        </p>
      )}

      {/* Create new category modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FormField
              id="category-name"
              label="Name"
              description="Enter a descriptive name for this category"
              required
              value={newCategoryForm.name}
              onChange={(value) => setNewCategoryForm(prev => ({ ...prev, name: value }))}
              placeholder="e.g., Gospel, First Reading, Funeral, Advent"
            />
            <FormField
              id="category-description"
              inputType="textarea"
              label="Description"
              description="Optional description to help explain this category's purpose"
              value={newCategoryForm.description}
              onChange={(value) => setNewCategoryForm(prev => ({ ...prev, description: value }))}
              placeholder="Brief description of this category..."
              rows={3}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCategory}
                disabled={isCreating || !newCategoryForm.name.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}