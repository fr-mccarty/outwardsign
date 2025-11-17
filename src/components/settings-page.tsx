'use client'

import { ReactNode, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageContainer } from '@/components/page-container'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SettingsTab {
  value: string
  label: string
  icon: ReactNode
  content: ReactNode
  badge?: string | number
}

interface SettingsPageProps {
  title: string
  description: string
  tabs: SettingsTab[]
  defaultTab?: string
  actions?: ReactNode
}

/**
 * Internal component that uses useSearchParams
 * Must be wrapped in Suspense boundary
 */
function SettingsPageContent({
  title,
  description,
  tabs,
  defaultTab,
  actions
}: SettingsPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlTab = searchParams.get('tab')

  // Use URL tab if valid, otherwise use defaultTab
  const activeTab = urlTab && tabs.some(t => t.value === urlTab)
    ? urlTab
    : defaultTab || tabs[0]?.value

  // Map tab count to Tailwind grid-cols class
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  }[tabs.length] || 'grid-cols-6'

  const handleTabChange = (value: string) => {
    // Update URL without page reload
    const url = new URL(window.location.href)
    url.searchParams.set('tab', value)
    router.push(url.pathname + url.search, { scroll: false })
  }

  return (
    <PageContainer
      title={title}
      description={description}
    >
      {actions && (
        <div className="flex justify-end mb-6 gap-3">
          {actions}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className={`grid w-full ${gridColsClass}`}>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && ` (${tab.badge})`}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-6">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </PageContainer>
  )
}

/**
 * SettingsPage component with Suspense boundary
 * Wraps SettingsPageContent to handle useSearchParams requirement
 */
export function SettingsPage(props: SettingsPageProps) {
  return (
    <Suspense fallback={
      <PageContainer
        title={props.title}
        description={props.description}
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </PageContainer>
    }>
      <SettingsPageContent {...props} />
    </Suspense>
  )
}
