import { ReactNode } from 'react'
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
  maxWidth?: '4xl' | '6xl'
}

export function SettingsPage({
  title,
  description,
  tabs,
  defaultTab,
  actions,
  maxWidth = '6xl'
}: SettingsPageProps) {
  // Map tab count to Tailwind grid-cols class
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  }[tabs.length] || 'grid-cols-6'

  return (
    <PageContainer
      title={title}
      description={description}
      maxWidth={maxWidth}
    >
      {actions && (
        <div className="flex justify-end mb-6 gap-3">
          {actions}
        </div>
      )}

      <Tabs defaultValue={defaultTab || tabs[0]?.value} className="space-y-6">
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
