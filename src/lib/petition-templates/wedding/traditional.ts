/**
 * Wedding Petition Template - Traditional
 */

export const weddingTraditional = {
  id: 'wedding-traditional',
  name: 'Wedding (English) - Traditional',
  description: 'Traditional wedding petitions from the Roman Ritual',

  /**
   * Generate petitions with names inserted
   */
  build: (brideName: string, groomName: string): string[] => {
    return [
      `That God will bless the covenant of ${brideName} and ${groomName} as he chose to sanctify marriage at Cana in Galilee.`,
      'That they be granted perfect and fruitful love, peace and strength, and that they bear faithful witness to the name of Christian.',
      'That the Christian people may grow in virtue day by day and that all who are burdened by any need may receive the help of grace from above.',
      'That the grace of the Sacrament will be renewed by the Holy Spirit in all married persons here present.',
    ]
  },
}
