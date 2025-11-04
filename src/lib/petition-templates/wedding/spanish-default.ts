/**
 * Wedding Petition Template - Spanish Default
 */

export const weddingSpanishDefault = {
  id: 'wedding-spanish-default',
  name: 'Wedding (Spanish) - Default',
  description: 'Peticiones estándar para bodas en español',

  /**
   * Generate petitions with names inserted
   */
  build: (brideName: string, groomName: string): string[] => {
    return [
      `Por ${brideName} y ${groomName}, que su amor crezca y su compromiso se profundice cada día.`,
      `Por los padres y abuelos de ${brideName} y ${groomName}, que sean bendecidos al recibir un hijo o una hija.`,
      `Por las familias y amigos de ${brideName} y ${groomName}, que continúen enriqueciéndose mutuamente con amor y apoyo.`,
      'Por todos los matrimonios, que puedan continuar dando, perdonando y experimentando mayor alegría cada día.',
      'Por los jóvenes que se preparan para el matrimonio, que tengan la sabiduría y la paciencia para construir relaciones fundadas en el respeto mutuo.',
      'Por los enfermos, los solitarios y los que sufren, que conozcan la presencia sanadora de Cristo.',
      'Por todos los difuntos, especialmente los miembros fallecidos de nuestras familias, que gocen de la vida eterna en la presencia de Dios.',
    ]
  },
}
