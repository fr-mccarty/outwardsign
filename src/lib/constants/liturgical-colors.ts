/**
 * Liturgical Colors for the Catholic Church
 *
 * These colors match the CSS variables defined in globals.css:
 * - --liturgy-white, --liturgy-red, --liturgy-purple, etc.
 *
 * Use the Tailwind classes: bg-liturgy-{color} and text-liturgy-{color}-foreground
 */

export const LITURGICAL_COLOR_VALUES = [
  'white',
  'red',
  'purple',
  'green',
  'gold',
  'rose',
  'black',
] as const

export type LiturgicalColor = typeof LITURGICAL_COLOR_VALUES[number]

export interface LiturgicalColorMetadata {
  value: LiturgicalColor
  name_en: string
  name_es: string
  description_en: string
  description_es: string
}

export const LITURGICAL_COLOR_METADATA: Record<LiturgicalColor, LiturgicalColorMetadata> = {
  white: {
    value: 'white',
    name_en: 'White',
    name_es: 'Blanco',
    description_en: 'Christmas, Easter, feasts of Our Lord, Mary, angels, and saints who are not martyrs',
    description_es: 'Navidad, Pascua, fiestas de Nuestro Señor, María, ángeles y santos que no son mártires',
  },
  red: {
    value: 'red',
    name_en: 'Red',
    name_es: 'Rojo',
    description_en: 'Palm Sunday, Good Friday, Pentecost, martyrs, and apostles',
    description_es: 'Domingo de Ramos, Viernes Santo, Pentecostés, mártires y apóstoles',
  },
  purple: {
    value: 'purple',
    name_en: 'Purple/Violet',
    name_es: 'Morado',
    description_en: 'Advent, Lent, and penitential celebrations',
    description_es: 'Adviento, Cuaresma y celebraciones penitenciales',
  },
  green: {
    value: 'green',
    name_en: 'Green',
    name_es: 'Verde',
    description_en: 'Ordinary Time',
    description_es: 'Tiempo Ordinario',
  },
  gold: {
    value: 'gold',
    name_en: 'Gold',
    name_es: 'Dorado',
    description_en: 'May be used for solemn occasions in place of white, red, or green',
    description_es: 'Puede usarse en ocasiones solemnes en lugar de blanco, rojo o verde',
  },
  rose: {
    value: 'rose',
    name_en: 'Rose',
    name_es: 'Rosa',
    description_en: 'Gaudete Sunday (3rd Sunday of Advent) and Laetare Sunday (4th Sunday of Lent)',
    description_es: 'Domingo Gaudete (3er Domingo de Adviento) y Domingo Laetare (4to Domingo de Cuaresma)',
  },
  black: {
    value: 'black',
    name_en: 'Black',
    name_es: 'Negro',
    description_en: 'Masses for the dead (optional alternative to purple)',
    description_es: 'Misas por los difuntos (alternativa opcional al morado)',
  },
} as const

/**
 * Get all liturgical colors as options for a select input
 */
export function getLiturgicalColorOptions(locale: 'en' | 'es' = 'en') {
  return LITURGICAL_COLOR_VALUES.map(color => ({
    value: color,
    label: locale === 'es'
      ? LITURGICAL_COLOR_METADATA[color].name_es
      : LITURGICAL_COLOR_METADATA[color].name_en,
    description: locale === 'es'
      ? LITURGICAL_COLOR_METADATA[color].description_es
      : LITURGICAL_COLOR_METADATA[color].description_en,
  }))
}
