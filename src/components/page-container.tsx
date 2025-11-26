import { cn } from "@/lib/utils"
import { PAGE_MAX_WIDTH_CLASS } from "@/lib/constants"

interface PageContainerProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  'data-testid'?: string
}

export function PageContainer({
  title,
  description,
  actions,
  children,
  className,
  'data-testid': dataTestId
}: PageContainerProps) {
  return (
    <div className="space-y-6 p-6 pb-12" data-testid={dataTestId}>
      <div className={cn(PAGE_MAX_WIDTH_CLASS, "mx-auto", className)}>
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

        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}
