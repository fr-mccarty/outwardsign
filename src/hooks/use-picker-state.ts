import { useState } from 'react'

/**
 * Custom hook to manage picker state and selected value
 * Reduces boilerplate for managing modal pickers (people, events, readings, etc.)
 *
 * @param initialValue - Initial selected value (optional)
 * @returns Object containing value, setValue, showPicker, setShowPicker
 *
 * @example
 * const bride = usePickerState<Person>()
 * // Usage: bride.value, bride.setValue, bride.showPicker, bride.setShowPicker
 */
export function usePickerState<T>(initialValue?: T | null) {
  const [value, setValue] = useState<T | null>(initialValue || null)
  const [showPicker, setShowPicker] = useState(false)

  return {
    value,
    setValue,
    showPicker,
    setShowPicker,
  }
}
