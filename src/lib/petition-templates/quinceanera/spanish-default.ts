/**
 * Quinceañera Petition Template - Spanish Default
 */

export const quinceaneraSpanishDefault = {
  id: 'quinceanera-spanish-default',
  name: 'Quinceañera (Español) - Predeterminado',
  description: 'Peticiones estándar para quinceañera en español',

  /**
   * Generate petitions with name inserted
   */
  build: (quinceaneraName: string): string[] => {
    return [
      `Por ${quinceaneraName}, al entrar en este nuevo capítulo de su vida, para que crezca en fe, sabiduría y gracia. Roguemos al Señor.`,
      `Por los padres y la familia de ${quinceaneraName}, para que continúen guiándola con amor y apoyándola con sus oraciones. Roguemos al Señor.`,
      'Por todas las jóvenes que entran a la edad adulta, para que encuentren fuerza y coraje en el amor de Dios. Roguemos al Señor.',
      'Por los jóvenes de nuestra parroquia, para que se inspiren en esta celebración de fe y se acerquen más a Cristo. Roguemos al Señor.',
      'Por aquellos que han ayudado a preparar esta celebración, para que sean bendecidos por su servicio. Roguemos al Señor.',
      'Por nuestra comunidad, para que nos apoyemos unos a otros en fe y amor. Roguemos al Señor.',
      'Por todos los que están enfermos, solos o necesitados, para que conozcan la presencia sanadora de Dios. Roguemos al Señor.',
      'Por aquellos que han fallecido, especialmente los miembros de nuestras familias, para que descansen en paz eterna. Roguemos al Señor.',
    ]
  },
}
