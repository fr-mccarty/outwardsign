import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Parishioner Portal - Outward Sign',
  description: 'View your ministry schedule, get AI assistance, and stay connected with your parish',
}

export default function ParishionerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
