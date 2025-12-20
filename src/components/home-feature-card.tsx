import { Card, CardHeader, CardTitle, CardContent } from "@/components/content-card"
import { CheckCircle2, LucideIcon } from "lucide-react"

interface HomeFeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  features?: string[]
}

export function HomeFeatureCard({ icon: Icon, title, description, features }: HomeFeatureCardProps) {
  return (
    <Card className="bg-card text-card-foreground hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-start gap-3 leading-relaxed">
          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <span className="leading-relaxed">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {description}
        </p>
        {features && features.length > 0 && (
          <ul className="text-sm space-y-2 text-muted-foreground">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
