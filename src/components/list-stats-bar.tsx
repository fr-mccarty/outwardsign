import { FormSectionCard } from "@/components/form-section-card"

export interface ListStat {
  value: number
  label: string
}

interface ListStatsBarProps {
  stats: ListStat[]
  title?: string
  className?: string
}

/**
 * ListStatsBar - A reusable stats/status bar component for list views
 *
 * Displays a grid of statistics with consistent styling and responsive layout.
 * Stats automatically adjust from 2 columns on mobile to 4+ columns on larger screens.
 *
 * @param stats - Array of stat objects with value and label
 * @param title - Optional title for the stats section (default: "Overview")
 * @param className - Optional additional CSS classes
 *
 * @example
 * // Basic usage
 * <ListStatsBar
 *   stats={[
 *     { value: 100, label: "Total" },
 *     { value: 50, label: "Active" }
 *   ]}
 * />
 *
 * // With custom title
 * <ListStatsBar
 *   title="Wedding Statistics"
 *   stats={weddingStats}
 * />
 */
export function ListStatsBar({ stats, title = "Overview", className }: ListStatsBarProps) {
  // Don't render if no stats provided
  if (!stats || stats.length === 0) {
    return null
  }

  // Determine grid columns based on number of stats
  const getGridCols = () => {
    if (stats.length <= 2) return "grid-cols-2"
    if (stats.length === 3) return "grid-cols-2 md:grid-cols-3"
    // 4 or more stats
    return "grid-cols-2 md:grid-cols-4"
  }

  return (
    <FormSectionCard title={title} className={className}>
      <div className={`grid ${getGridCols()} gap-4 text-center`}>
        {stats.map((stat, index) => (
          <div key={index}>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </FormSectionCard>
  )
}
