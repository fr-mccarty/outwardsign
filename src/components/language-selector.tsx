'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LanguageSelectorProps {
  currentLang: 'en' | 'es'
  onLanguageChange?: (lang: 'en' | 'es') => void
  className?: string
  width?: string
}

export function LanguageSelector({
  currentLang,
  onLanguageChange,
  className = '',
  width = 'w-[140px]'
}: LanguageSelectorProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLanguageChange = (newLang: string) => {
    const lang = newLang as 'en' | 'es'

    // If custom handler provided, use it
    if (onLanguageChange) {
      onLanguageChange(lang)
      return
    }

    // Default behavior: navigate to same page in new language
    const newPath = pathname
      .replace(`/${currentLang}/`, `/${lang}/`)
      .replace(`/documentation/${currentLang}`, `/documentation/${lang}`)

    router.push(newPath)
  }

  return (
    <Select value={currentLang} onValueChange={handleLanguageChange}>
      <SelectTrigger className={`${width} ${className}`}>
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="es">Español</SelectItem>
      </SelectContent>
    </Select>
  )
}
