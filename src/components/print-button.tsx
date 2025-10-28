'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { ComponentProps } from 'react'

interface PrintButtonProps extends Omit<ComponentProps<typeof Button>, 'onClick'> {
  /** The ID of the item to print */
  itemId: string
  /** The type of item being printed (e.g., 'petitions', 'liturgical-readings') */
  itemType: 'petitions' | 'liturgical-readings'
  /** Custom button text (defaults to "Print {itemType}") */
  children?: React.ReactNode
  /** Whether the button should take full width */
  fullWidth?: boolean
}

export function PrintButton({ 
  itemId, 
  itemType, 
  children, 
  fullWidth = false, 
  className = '',
  variant = 'outline',
  ...props 
}: PrintButtonProps) {
  const handlePrint = () => {
    if (!itemId) return
    
    const printUrl = `/print/${itemType}/${itemId}`
    window.open(printUrl, '_blank')
  }

  const defaultText = itemType === 'petitions' ? 'Print Petitions' : 'Print'
  const buttonText = children || defaultText

  return (
    <Button 
      onClick={handlePrint}
      variant={variant}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      <Printer className="h-4 w-4 mr-2" />
      {buttonText}
    </Button>
  )
}