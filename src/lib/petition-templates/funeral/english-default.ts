/**
 * Funeral Petition Template - English Default
 * Uses gender-aware pronouns
 */

export const funeralEnglishDefault = {
  id: 'funeral-english-default',
  name: 'Funeral (English) - Default',
  description: 'Standard funeral petitions in English',

  /**
   * Generate petitions with name and gender
   */
  build: (deceasedName: string, gender: 'male' | 'female' | 'unknown' = 'unknown'): string[] => {
    const pronouns = {
      male: { he_she: 'he', his_her: 'his' },
      female: { he_she: 'she', his_her: 'her' },
      unknown: { he_she: 'they', his_her: 'their' },
    }

    const p = pronouns[gender]

    return [
      `For ${deceasedName}, that ${p.he_she} may rest in eternal peace and enjoy the fullness of God's love.`,
      `For ${deceasedName}, that the good ${p.he_she} did in life may inspire us and that ${p.his_her} faith may be rewarded.`,
      'For the family and friends who mourn, that they may find comfort in God\'s love and the support of this community.',
      'For all the faithful departed, especially those who have no one to pray for them, that they may rest in peace.',
      'For those who minister to the grieving and dying, that they may be strengthened in their service.',
      'For our community, that we may support one another in times of loss and sorrow.',
      'For all who are sick and approaching death, that they may know God\'s peace.',
      'For ourselves, that we may be prepared for our own journey to eternal life.',
    ]
  },
}
