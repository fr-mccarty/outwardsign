/**
 * Wedding Petition Template - English Default
 */

export const weddingEnglishDefault = {
  id: 'wedding-english-default',
  name: 'Wedding (English) - Default',
  description: 'Standard wedding petitions in English',

  /**
   * Generate petitions with names inserted
   */
  build: (brideName: string, groomName: string): string[] => {
    return [
      `For ${brideName} and ${groomName}, joined now in marriage, that their love will grow and their commitment will deepen every day.`,
      `For the parents and grandparents of ${brideName} and ${groomName}, without whose dedication to God and family we would not be gathered here today, that they will be blessed as they gain a son or daughter.`,
      `For the families and friends of ${brideName} and ${groomName}, gathered here today, that they continue to enrich each other with love and support through the years.`,
      'For all married couples, that they may continue to give, be able to forgive, and experience deeper joy with each passing day.',
      'For young people preparing for marriage, that they may have the wisdom and patience to build relationships founded on mutual respect and self-giving love.',
      'For those who are sick, lonely, or suffering, that they may know the healing presence of Christ.',
      'For all who have died, especially the deceased members of our families, that they may enjoy eternal life in the presence of God.',
    ]
  },
}
