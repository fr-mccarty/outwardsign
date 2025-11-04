/**
 * Baptism Petition Template - English Default
 * Uses gender-aware pronouns for child
 */

export const baptismEnglishDefault = {
  id: 'baptism-english-default',
  name: 'Baptism (English) - Default',
  description: 'Standard baptism petitions in English',

  /**
   * Generate petitions with child name, parent names, and gender
   */
  build: (
    childName: string,
    parentNames: string = '',
    gender: 'male' | 'female' | 'unknown' = 'unknown'
  ): string[] => {
    const pronouns = {
      male: { he_she: 'he', him_her: 'him', his_her: 'his' },
      female: { he_she: 'she', him_her: 'her', his_her: 'her' },
      unknown: { he_she: 'they', him_her: 'them', his_her: 'their' },
    }

    const p = pronouns[gender]

    return [
      `For ${childName}, who is being baptized today, that ${p.he_she} may grow in faith, hope, and love.`,
      parentNames
        ? `For ${childName}'s parents, ${parentNames}, that they may be faithful examples of Christian life for their child.`
        : `For ${childName}'s parents, that they may be faithful examples of Christian life for their child.`,
      `For ${childName}'s godparents, that they may support and guide ${p.him_her} in ${p.his_her} faith journey.`,
      'For all parents, that they may have the wisdom and strength to raise their children in the faith.',
      'For our parish community, that we may welcome and support all who are newly baptized.',
      'For all children, that they may know God\'s love and grow to be faithful disciples.',
    ]
  },
}
