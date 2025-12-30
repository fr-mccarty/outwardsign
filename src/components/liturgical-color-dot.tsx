import { cn } from '@/lib/utils'

interface LiturgicalColorDotProps {
  color: string
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Displays a small colored dot representing a liturgical color.
 * Used to visually indicate the liturgical color assigned to a mass or event.
 *
 * @param color - The liturgical color (e.g., 'WHITE', 'RED', 'GREEN', 'PURPLE', 'GOLD', 'ROSE', 'BLACK')
 * @param size - 'sm' (12px) for detail views, 'md' (16px) for list views. Defaults to 'sm'.
 * @param className - Additional CSS classes to apply
 */
export function LiturgicalColorDot({ color, size = 'sm', className }: LiturgicalColorDotProps) {
  const sizeClass = size === 'md' ? 'h-4 w-4' : 'h-3 w-3'

  return (
    <div
      className={cn(
        sizeClass,
        'rounded-full border-2 border-black',
        `bg-liturgy-${color.toLowerCase()}`,
        className
      )}
    />
  )
}
