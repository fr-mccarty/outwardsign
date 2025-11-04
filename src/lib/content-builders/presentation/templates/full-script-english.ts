/**
 * Presentation Full Script - English
 * Based on the traditional Presentation in the Temple liturgy
 */

import { PresentationWithRelations } from '@/lib/actions/presentations'
import { LiturgyDocument } from '@/lib/types/liturgy-content'

export function buildFullScriptEnglish(presentation: PresentationWithRelations): LiturgyDocument {
  const child = presentation.child
  const mother = presentation.mother
  const father = presentation.father
  const childName = child ? `${child.first_name} ${child.last_name}` : '[Child\'s Name]'
  const childSex = child?.sex || 'Male'
  const motherName = mother ? `${mother.first_name} ${mother.last_name}` : '[Mother\'s Name]'
  const fatherName = father ? `${father.first_name} ${father.last_name}` : '[Father\'s Name]'
  const isBaptized = presentation.is_baptized

  // Helper function for gendered text in English
  const gendered = (maleText: string, femaleText: string) => {
    return childSex === 'Male' ? maleText : femaleText
  }

  const getParentsText = () => {
    return `the parents, ${motherName} and ${fatherName}`
  }

  const getAudienceText = () => 'parents'

  return {
    title: 'Presentation in the Temple',
    language: 'en',
    sections: [
      {
        type: 'section',
        heading: 'After the Homily',
        level: 2,
        content: [
          {
            type: 'direction',
            text: 'After the Homily'
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'speaker',
            speaker: 'CELEBRANT',
            text: `Life is God's greatest gift to us. Grateful for the life of their ${gendered('son', 'daughter')}, ${getParentsText()} would like to present their ${gendered('son', 'daughter')} ${childName} to the Lord and to this community. We welcome you here to the front of the church.`
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'direction',
            text: 'Walk to the front of the altar'
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'speaker',
            speaker: `CELEBRANT (to the ${getAudienceText()})`,
            text: `By presenting this ${gendered('boy', 'girl')} to the Lord and to this community today, you ${isBaptized ? 'renew your commitment' : 'commit yourselves'} to raise ${gendered('him', 'her')} in the ways of faith. Do you understand and accept this responsibility?`
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'dialogue',
            speaker: 'PARENTS',
            response: 'Yes, we do.'
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'speaker',
            speaker: `CELEBRANT (to the ${gendered('boy', 'girl')})`,
            text: `${isBaptized ? 'As on the day of your baptism, I' : 'I'} sign you with the sign of the cross, and I ask your ${getAudienceText()} to do the same.`
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'speaker',
            speaker: 'CELEBRANT',
            text: `Heavenly Father, you are the giver of all life. You gave us this ${gendered('son', 'daughter')} and we present ${gendered('him', 'her')} to you, as Mary presented Jesus in the temple. We pray for these ${getAudienceText()}. Bless them in their efforts to raise this ${gendered('boy', 'girl')} as a good Christian and as a good Catholic. Bless this child. Give ${gendered('him', 'her')} good health, protect ${gendered('him', 'her')} from any danger of body and spirit, and help ${gendered('him', 'her')} to grow in age and in wisdom, always in your presence.`
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'paragraph',
            text: `Holy Mary, Mother of God and our Mother, we ask your protection over this family and over this ${gendered('son', 'daughter')}. It is by following your example that this family brings this ${gendered('boy', 'girl')} to be presented to God, our creator, and to this community today. Help these parents to raise this child with word and example. We make our prayer in the name of Jesus Christ, who is Lord forever and ever.`
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'dialogue',
            speaker: 'ASSEMBLY',
            response: 'Amen.'
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'direction',
            text: 'Bless religious articles'
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'speaker',
            speaker: 'CELEBRANT',
            text: 'Now we send you back to your places, as we show you our support with applause.'
          }
        ]
      }
    ]
  }
}
