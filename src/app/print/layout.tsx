import { Inter } from 'next/font/google'
import '@/app/globals.css'
import './print.css'

const inter = Inter({ subsets: ['latin'] })

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`print-container ${inter.className}`}>
      {children}
    </div>
  )
}