import { getRequestConfig } from 'next-intl/server'
import { DEFAULT_APP_LANGUAGE } from './config'

export default getRequestConfig(async () => {
  // For now, we'll use the default locale
  // This will be enhanced later to read from context
  const locale = DEFAULT_APP_LANGUAGE

  return {
    locale,
    timeZone: 'America/Chicago',
    messages: (await import(`./locales/${locale}.json`)).default
  }
})
