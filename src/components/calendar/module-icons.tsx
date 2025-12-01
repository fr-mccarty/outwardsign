import {
  CirclePlus,
  VenusAndMars,
  Cross,
  HandHeartIcon,
  Droplet,
  BookHeart,
  type LucideIcon
} from 'lucide-react'

type ModuleType = 'wedding' | 'funeral' | 'baptism' | 'group-baptism' | 'presentation' | 'quinceanera' | 'mass'

export function getModuleIcon(moduleType: ModuleType | null): LucideIcon | null {
  if (!moduleType) return null

  const iconMap: Record<ModuleType, LucideIcon> = {
    wedding: VenusAndMars,
    funeral: Cross,
    baptism: Droplet,
    'group-baptism': Droplet,
    presentation: HandHeartIcon,
    quinceanera: BookHeart,
    mass: CirclePlus,
  }

  return iconMap[moduleType] || null
}
