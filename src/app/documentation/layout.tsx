import { ReactNode } from 'react'

export const metadata = {
  title: 'Documentation - Outward Sign',
  description: 'Learn how to use Outward Sign for sacrament and sacramental management',
}

interface DocumentationLayoutProps {
  children: ReactNode
}

export default function DocumentationLayout({ children }: DocumentationLayoutProps) {
  // This layout is intentionally minimal - no authentication required
  // No main app sidebar - completely separate documentation section
  return children
}
