import { CenteredFormCard } from "@/components/centered-form-card"
import { cn } from "@/lib/utils"

interface PageContainerProps {
  title: string
  description?: string
  cardTitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
}

export function PageContainer({
  title,
  description,
  cardTitle,
  actions,
  children,
  className,
  maxWidth = '7xl'
}: PageContainerProps) {
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl'
  }

  return (
    <div className="space-y-6 p-6">
      <div className={cn(maxWidthClasses[maxWidth], "mx-auto", className)}>
        <div className="mb-4">
          {actions ? (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                {description && (
                  <p className="text-muted-foreground mt-0">
                    {description}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3 lg:shrink-0">
                {actions}
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">{title}</h1>
              {description && (
                <p className="text-muted-foreground mt-0">
                  {description}
                </p>
              )}
            </>
          )}
        </div>

        {cardTitle ? (
          <CenteredFormCard title={cardTitle} className="max-w-none">
            {children}
          </CenteredFormCard>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
