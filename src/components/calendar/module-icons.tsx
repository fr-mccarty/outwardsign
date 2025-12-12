import {
  CirclePlus,
  VenusAndMars,
  Cross,
  HandHeartIcon,
  Droplet,
  BookHeart,
  FileText,
  Calendar,
  Church,
  Heart,
  Star,
  Users,
  type LucideIcon
} from 'lucide-react'

type ModuleType = 'wedding' | 'funeral' | 'baptism' | 'presentation' | 'quinceanera' | 'mass'

// Map of module types to icons
const moduleIconMap: Record<ModuleType, LucideIcon> = {
  wedding: VenusAndMars,
  funeral: Cross,
  baptism: Droplet,
  presentation: HandHeartIcon,
  quinceanera: BookHeart,
  mass: CirclePlus,
}

// Map of icon names (from event_types.icon) to Lucide icons
const iconNameMap: Record<string, LucideIcon> = {
  FileText: FileText,
  Calendar: Calendar,
  Church: Church,
  Heart: Heart,
  Star: Star,
  Users: Users,
  CirclePlus: CirclePlus,
  VenusAndMars: VenusAndMars,
  Cross: Cross,
  HandHeartIcon: HandHeartIcon,
  Droplet: Droplet,
  BookHeart: BookHeart,
}

export function getModuleIcon(moduleType: ModuleType | null): LucideIcon | null {
  if (!moduleType) return null
  return moduleIconMap[moduleType] || null
}

/**
 * Get icon by name string (from event_types.icon field)
 * Falls back to FileText if icon name not found
 */
export function getIconByName(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return FileText
  return iconNameMap[iconName] || FileText
}
