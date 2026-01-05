import Link from 'next/link'
import { BookOpen } from 'lucide-react'

interface DescriptionWithDocLinkProps {
  /** The main description text */
  description: string
  /** The URL to the documentation page (e.g., "/docs/settings#mass") */
  href: string
  /** Link text (defaults to "Learn more") */
  linkText?: string
}

/**
 * A component that renders a description with a documentation link.
 * Use this in PageContainer descriptions to provide consistent doc links.
 */
export function DescriptionWithDocLink({
  description,
  href,
  linkText = 'Learn more'
}: DescriptionWithDocLinkProps) {
  return (
    <span>
      {description}{' '}
      <Link
        href={href}
        className="text-primary hover:underline inline-flex items-center gap-1"
      >
        <BookOpen className="h-3 w-3" /> {linkText}
      </Link>
    </span>
  )
}
