/**
 * Quinceañera Petition Template - English Default
 */

export const quinceaneraEnglishDefault = {
  id: 'quinceanera-english-default',
  name: 'Quinceañera (English) - Default',
  description: 'Standard quinceañera petitions in English',

  /**
   * Generate petitions with name inserted
   */
  build: (quinceaneraName: string): string[] => {
    return [
      `For ${quinceaneraName}, as she enters this new chapter of her life, that she may grow in faith, wisdom, and grace.`,
      `For ${quinceaneraName}'s parents and family, that they may continue to guide her with love and support her with their prayers.`,
      `For all young women entering adulthood, that they may find strength and courage in God's love.`,
      'For our parish youth, that they may be inspired by this celebration of faith and grow closer to Christ.',
      'For those who have helped prepare this celebration, that they may be blessed for their service.',
      'For our community, that we may support one another in faith and love.',
      'For all who are sick, lonely, or in need, that they may know God's healing presence.',
      'For those who have died, especially members of our families, that they may rest in eternal peace.',
    ]
  },
}
