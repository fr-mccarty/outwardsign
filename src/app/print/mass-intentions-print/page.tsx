import { Suspense } from 'react'
import { MassIntentionsPrint } from './mass-intentions-print'

export default function PrintMassIntentionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MassIntentionsPrint />
    </Suspense>
  )
}