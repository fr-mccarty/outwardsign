import { Suspense } from 'react'
import { PageContainer } from '@/components/page-container'
import { ParishSelection } from './parish-selection'

export default function SelectParishPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <PageContainer
        title="Select Your Parish"
        description="Choose a parish to continue using the application"
      >
        <Suspense fallback={<div className="text-center">Loading parishes...</div>}>
          <ParishSelection />
        </Suspense>
      </PageContainer>
    </div>
  )
}