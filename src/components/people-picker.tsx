'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  User,
  UserPlus,
  Mail,
  Phone,
  Save
} from 'lucide-react'
import { getPeople, createPerson } from '@/lib/actions/people'
import type { Person } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Zod schema for new person form validation
const newPersonSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().optional(),
  phone_number: z.string().optional(),
  sex: z.enum(['Male', 'Female', '']).optional(),
  note: z.string().optional(),
})

type NewPersonFormData = z.infer<typeof newPersonSchema>

interface PeoplePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (person: Person) => void
  placeholder?: string
  emptyMessage?: string
  selectedPersonId?: string
  className?: string
  showSexField?: boolean
  openToNewPerson?: boolean
}

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function PeoplePicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = "Search for a person...",
  emptyMessage = "No people found.",
  selectedPersonId,
  className,
  showSexField = false,
  openToNewPerson = false,
}: PeoplePickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<NewPersonFormData>({
    resolver: zodResolver(newPersonSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      sex: '',
      note: '',
    },
  })

  const sexValue = watch('sex')

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const searchPeopleCallback = useCallback(async (query: string) => {
    try {
      setLoading(true)
      const results = await getPeople(query ? { search: query } : undefined)
      setPeople(results)
    } catch (error) {
      console.error('Error searching people:', error)
      toast.error('Failed to search people')
    } finally {
      setLoading(false)
    }
  }, [])

  // Effect to search when debounced query changes
  useEffect(() => {
    if (open) {
      searchPeopleCallback(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, open, searchPeopleCallback])

  // Load initial data when dialog opens
  useEffect(() => {
    if (open && people.length === 0) {
      searchPeopleCallback('')
    }
  }, [open, people.length, searchPeopleCallback])

  // Auto-open add form when openToNewPerson is true
  useEffect(() => {
    if (open && openToNewPerson) {
      setShowAddForm(true)
    }
  }, [open, openToNewPerson])

  const handlePersonSelect = (person: Person) => {
    onSelect(person)
    onOpenChange(false)
    setSearchQuery('')
    setShowAddForm(false)
  }

  const handleAddNewPerson = () => {
    setShowAddForm(true)
  }

  const onSubmitNewPerson = async (data: NewPersonFormData) => {
    try {
      const newPerson = await createPerson({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || undefined,
        phone_number: data.phone_number || undefined,
        sex: data.sex || undefined,
        note: data.note || undefined
      })

      toast.success('Person created successfully')

      // Reset form
      reset()
      setShowAddForm(false)

      // Select the newly created person (this will close the picker)
      handlePersonSelect(newPerson)
    } catch (error) {
      console.error('Error creating person:', error)
      toast.error('Failed to add person')
    }
  }

  const handleCancelAddPerson = () => {
    setShowAddForm(false)
    reset()
  }

  const getPersonDisplayName = (person: Person) => {
    return `${person.first_name} ${person.last_name}`.trim()
  }

  const getPersonInitials = (person: Person) => {
    const firstName = person.first_name?.charAt(0) || ''
    const lastName = person.last_name?.charAt(0) || ''
    return (firstName + lastName).toUpperCase()
  }

  const isPersonSelected = (person: Person) => {
    return selectedPersonId === person.id
  }

  return (
    <>
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <DialogTitle className="sr-only">Select Person</DialogTitle>
      <Command className={cn("rounded-lg border shadow-md", className)}>
        <div className="flex items-center border-b px-3" onClick={(e) => e.stopPropagation()}>
          <CommandInput
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <CommandList className="max-h-[400px]">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                Searching...
              </div>
            </div>
          )}

          {!loading && people.length === 0 && (
            <CommandEmpty className="py-6 text-center text-sm">
              <div className="flex flex-col items-center gap-2">
                <User className="h-8 w-8 text-muted-foreground" />
                <div>{emptyMessage}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddNewPerson}
                  className="mt-2"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Person
                </Button>
              </div>
            </CommandEmpty>
          )}

          {!loading && people.length > 0 && (
            <>
              <CommandGroup heading="People">
                {people.map((person) => (
                  <CommandItem
                    key={person.id}
                    value={`${person.first_name} ${person.last_name} ${person.email || ''}`}
                    onSelect={() => handlePersonSelect(person)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 cursor-pointer",
                      isPersonSelected(person) && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getPersonInitials(person)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {getPersonDisplayName(person)}
                        </span>
                        {isPersonSelected(person) && (
                          <Badge variant="secondary" className="text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        {person.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{person.email}</span>
                          </div>
                        )}
                        {person.phone_number && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{person.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />
              
              <CommandGroup>
                <CommandItem
                  onSelect={handleAddNewPerson}
                  className="flex items-center gap-2 px-3 py-3 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add New Person</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>

    {/* New Person Dialog */}
    <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add New Person</DialogTitle>
          <DialogDescription>
            Create a new person record. Fill in their details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitNewPerson)} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-4 py-4 overflow-y-auto flex-1 -mx-6 px-6">
            <FormField
              id="first_name"
              label="First Name"
              inputType="text"
              value={watch('first_name') || ''}
              onChange={(value) => setValue('first_name', value)}
              placeholder="John"
              required
              error={errors.first_name?.message}
            />

            <FormField
              id="last_name"
              label="Last Name"
              inputType="text"
              value={watch('last_name') || ''}
              onChange={(value) => setValue('last_name', value)}
              placeholder="Doe"
              required
              error={errors.last_name?.message}
            />

            <FormField
              id="email"
              label="Email"
              inputType="email"
              value={watch('email') || ''}
              onChange={(value) => setValue('email', value)}
              placeholder="john.doe@example.com"
            />

            <FormField
              id="phone_number"
              label="Phone"
              inputType="tel"
              value={watch('phone_number') || ''}
              onChange={(value) => setValue('phone_number', value)}
              placeholder="(555) 123-4567"
            />

            {showSexField && (
              <FormField
                id="sex"
                label="Sex"
                inputType="select"
                value={sexValue || ''}
                onChange={(value) => setValue('sex', value as 'Male' | 'Female' | '')}
              >
                <SelectItem value="">Not specified</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </FormField>
            )}

            <FormField
              id="note"
              label="Note"
              inputType="textarea"
              value={watch('note') || ''}
              onChange={(value) => setValue('note', value)}
              placeholder="Additional note..."
              rows={3}
            />
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelAddPerson}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Person
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}

// Hook to use the people picker
export function usePeoplePicker() {
  const [open, setOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  const openPicker = () => setOpen(true)
  const closePicker = () => setOpen(false)
  
  const handleSelect = (person: Person) => {
    setSelectedPerson(person)
    setOpen(false)
  }

  const clearSelection = () => {
    setSelectedPerson(null)
  }

  return {
    open,
    openPicker,
    closePicker,
    selectedPerson,
    handleSelect,
    clearSelection,
    setOpen,
  }
}