export type CalendarView = 'month' | 'week' | 'day'

export interface CalendarItem {
  id: string
  date: string
  title: string
  [key: string]: any // Allow additional properties
}

export interface CalendarDay<T extends CalendarItem = CalendarItem> {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  items: T[]
}

export interface CalendarHeaderProps {
  currentDate: Date
  view: CalendarView
  onNavigate: (direction: 'prev' | 'next') => void
  onToday: () => void
  onViewChange?: (view: CalendarView) => void
  title: string
  actions?: React.ReactNode
  showViewSelector?: boolean
}

export interface CalendarGridProps<T extends CalendarItem = CalendarItem> {
  currentDate: Date
  items: T[]
  onDayClick?: (date: Date) => void
  renderDayContent?: (day: CalendarDay<T>) => React.ReactNode
  getItemColor?: (item: T) => string
  onItemClick?: (item: T, event: React.MouseEvent) => void
  maxItemsPerDay?: number
}

export interface CalendarDayProps<T extends CalendarItem = CalendarItem> {
  day: CalendarDay<T>
  onClick?: (date: Date) => void
  renderContent?: (day: CalendarDay<T>) => React.ReactNode
  getItemColor?: (item: T) => string
  onItemClick?: (item: T, event: React.MouseEvent) => void
  maxItemsPerDay?: number
}