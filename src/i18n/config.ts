export type AppLanguage = 'en' | 'es'

export const APP_LANGUAGES: AppLanguage[] = ['en', 'es']
export const DEFAULT_APP_LANGUAGE: AppLanguage = 'en'

// Locale configuration for next-intl
export const locales = APP_LANGUAGES
export const defaultLocale = DEFAULT_APP_LANGUAGE
