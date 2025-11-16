import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

interface RoleFulfillmentBadgeProps {
  /** Total number of people needed for this role */
  countNeeded: number
  /** Number of people currently assigned */
  countAssigned: number
}

/**
 * Displays a badge showing how many more people are needed for a role,
 * or a green check mark if the role is fully staffed.
 */
export function RoleFulfillmentBadge({ countNeeded, countAssigned }: RoleFulfillmentBadgeProps) {
  const remainingNeeded = countNeeded - countAssigned

  if (remainingNeeded > 0) {
    return (
      <Badge variant="secondary" className="ml-2">
        {remainingNeeded} more needed
      </Badge>
    )
  }

  if (remainingNeeded === 0 && countNeeded > 0) {
    return (
      <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
        <Check className="h-3 w-3" />
      </Badge>
    )
  }

  return null
}
