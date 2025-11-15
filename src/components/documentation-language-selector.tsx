'use client'

import { LanguageSelector } from '@/components/language-selector'

interface DocumentationLanguageSelectorProps {
  lang: 'en' | 'es'
}

export function DocumentationLanguageSelector({ lang }: DocumentationLanguageSelectorProps) {
  return <LanguageSelector currentLang={lang} />
}
