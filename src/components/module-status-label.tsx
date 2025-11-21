import { Badge } from "@/components/ui/badge"
import { MODULE_STATUS_LABELS } from "@/lib/constants"

type StatusType = 'module' | 'mass' | 'mass-intention'

interface ModuleStatusLabelProps {
  status?: string | null
  statusType: StatusType
  variant?: "default" | "secondary" | "outline" | "destructive"
  className?: string
}

// Get default status based on type
const getDefaultStatus = (statusType: StatusType): string => {
  switch (statusType) {
    case 'module':
      return 'PLANNING'
    case 'mass':
      return 'PLANNING'
    case 'mass-intention':
      return 'REQUESTED'
    default:
      return 'PLANNING'
  }
}

// Get display label for a status based on its type
const getStatusLabel = (status: string, statusType: StatusType): string => {
  // All status labels are now in MODULE_STATUS_LABELS
  return MODULE_STATUS_LABELS[status]?.en || status
}

// Get badge variant based on status and type
const getStatusVariant = (status: string, statusType: StatusType): "default" | "secondary" | "outline" | "destructive" => {
  // Module status (weddings, funerals, baptisms, quinceaneras, presentations)
  if (statusType === 'module') {
    switch (status) {
      case 'PLANNING':
        return 'secondary'
      case 'ACTIVE':
        return 'outline'
      case 'INACTIVE':
        return 'secondary'
      case 'COMPLETED':
        return 'outline'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // Mass status
  if (statusType === 'mass') {
    switch (status) {
      case 'PLANNING':
        return 'secondary'
      case 'SCHEDULED':
        return 'default'
      case 'COMPLETED':
        return 'outline'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // Mass intention status
  if (statusType === 'mass-intention') {
    switch (status) {
      case 'REQUESTED':
        return 'secondary'
      case 'CONFIRMED':
        return 'default'
      case 'FULFILLED':
        return 'outline'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return 'secondary'
}

export function ModuleStatusLabel({ status, statusType, variant, className }: ModuleStatusLabelProps) {
  // Use default status if none provided
  const actualStatus = status || getDefaultStatus(statusType)

  const badgeVariant = variant || getStatusVariant(actualStatus, statusType)
  const label = getStatusLabel(actualStatus, statusType)

  return (
    <Badge variant={badgeVariant} className={className}>
      {label}
    </Badge>
  )
}
