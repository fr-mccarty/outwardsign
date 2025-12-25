import { Card, CardHeader, CardTitle, CardContent } from "@/components/content-card"
import { LucideIcon, ArrowRight } from "lucide-react"
import { ReactNode } from "react"

interface MetricCardProps {
  title: string
  value: ReactNode
  description: string
  icon: LucideIcon
  /** When true, adds visual affordance (arrow icon) to indicate the card is clickable */
  isClickable?: boolean
}

export function MetricCard({ title, value, description, icon: Icon, isClickable = false }: MetricCardProps) {
  return (
    <Card className={`bg-card text-card-foreground border ${isClickable ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {isClickable && (
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
