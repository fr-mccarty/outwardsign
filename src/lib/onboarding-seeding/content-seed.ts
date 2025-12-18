/**
 * Content Library Seed Data
 *
 * Seeds sample content items for development and new parishes.
 * Only includes public domain content (prayers, ceremony instructions, announcements).
 * Scripture readings are NOT included due to copyright considerations.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logSuccess, logWarning, logInfo, logError } from '@/lib/utils/console'

// =====================================================
// Sample Content Data
// =====================================================

interface SeedContent {
  title: string
  body: string
  language: 'en' | 'es'
  description?: string
  tags: string[] // Tag slugs to assign
}

// Opening Prayers
const OPENING_PRAYERS: SeedContent[] = [
  {
    title: 'Wedding Opening Prayer',
    body: `Father, you have made the bond of marriage a holy mystery,
a symbol of Christ's love for his Church.
Hear our prayers for {{Bride}} and {{Groom}}.
With faith in you and in each other
they pledge their love today.
May their lives always bear witness
to the reality of that love.
We ask this through our Lord Jesus Christ, your Son,
who lives and reigns with you and the Holy Spirit,
one God, for ever and ever.
Amen.`,
    language: 'en',
    description: 'Traditional Catholic wedding opening prayer',
    tags: ['wedding', 'opening-prayer']
  },
  {
    title: 'Oración Inicial del Matrimonio',
    body: `Padre, has hecho del vínculo del matrimonio un santo misterio,
símbolo del amor de Cristo por su Iglesia.
Escucha nuestras oraciones por {{Bride}} y {{Groom}}.
Con fe en ti y el uno en el otro
hoy prometen su amor.
Que sus vidas siempre den testimonio
de la realidad de ese amor.
Te lo pedimos por nuestro Señor Jesucristo, tu Hijo,
que vive y reina contigo y el Espíritu Santo,
un solo Dios, por los siglos de los siglos.
Amén.`,
    language: 'es',
    description: 'Oración inicial tradicional católica para bodas',
    tags: ['wedding', 'opening-prayer']
  },
  {
    title: 'Funeral Opening Prayer',
    body: `O God, to whom mercy and forgiveness belong,
hear our prayers on behalf of your servant {{Deceased}},
whom you have called out of this world.
Because they put their hope and trust in you,
command that they be carried safely home to heaven
and come to enjoy your eternal reward.
Through Christ our Lord.
Amen.`,
    language: 'en',
    description: 'Traditional Catholic funeral opening prayer',
    tags: ['funeral', 'opening-prayer', 'comfort']
  },
  {
    title: 'Oración Inicial del Funeral',
    body: `Oh Dios, a quien pertenece la misericordia y el perdón,
escucha nuestras oraciones por tu siervo {{Deceased}},
a quien has llamado de este mundo.
Porque pusieron su esperanza y confianza en ti,
ordena que sean llevados a salvo al cielo
y lleguen a disfrutar de tu recompensa eterna.
Por Cristo nuestro Señor.
Amén.`,
    language: 'es',
    description: 'Oración inicial tradicional católica para funerales',
    tags: ['funeral', 'opening-prayer', 'comfort']
  },
  {
    title: 'Baptism Opening Prayer',
    body: `Almighty and ever-living God,
you sent your only Son into the world
to cast out the power of Satan, spirit of evil,
to rescue us from the kingdom of darkness,
and bring us into the splendor of your kingdom of light.
We pray for this child:
set them free from original sin,
make them a temple of your glory,
and send your Holy Spirit to dwell within them.
Through Christ our Lord.
Amen.`,
    language: 'en',
    description: 'Traditional Catholic baptism opening prayer',
    tags: ['baptism', 'opening-prayer', 'hope']
  },
  {
    title: 'Oración Inicial del Bautismo',
    body: `Dios todopoderoso y eterno,
enviaste a tu único Hijo al mundo
para expulsar el poder de Satanás, espíritu del mal,
para rescatarnos del reino de las tinieblas,
y traernos al esplendor de tu reino de luz.
Oramos por este niño:
líbralo del pecado original,
hazlo templo de tu gloria,
y envía tu Espíritu Santo para que habite en él.
Por Cristo nuestro Señor.
Amén.`,
    language: 'es',
    description: 'Oración inicial tradicional católica para bautismos',
    tags: ['baptism', 'opening-prayer', 'hope']
  }
]

// Closing Prayers
const CLOSING_PRAYERS: SeedContent[] = [
  {
    title: 'Wedding Closing Prayer',
    body: `Lord, we thank you for {{Bride}} and {{Groom}}.
May their love continue to grow,
and may they always find in each other
the best friend they will ever have.
May they never take each other for granted,
and always experience the wonder of married love.
Through Christ our Lord.
Amen.`,
    language: 'en',
    description: 'Wedding closing prayer and blessing',
    tags: ['wedding', 'closing-prayer', 'love']
  },
  {
    title: 'Oración Final del Matrimonio',
    body: `Señor, te damos gracias por {{Bride}} y {{Groom}}.
Que su amor siga creciendo,
y que siempre encuentren el uno en el otro
al mejor amigo que jamás tendrán.
Que nunca se den por sentados,
y siempre experimenten la maravilla del amor conyugal.
Por Cristo nuestro Señor.
Amén.`,
    language: 'es',
    description: 'Oración final y bendición del matrimonio',
    tags: ['wedding', 'closing-prayer', 'love']
  },
  {
    title: 'Funeral Final Commendation',
    body: `Into your hands, Father of mercies,
we commend our brother/sister {{Deceased}}
in the sure and certain hope
that, together with all who have died in Christ,
they will rise with him on the last day.
We give you thanks for the blessings
which you bestowed upon {{Deceased}} in this life:
they are signs to us of your goodness
and of our fellowship with the saints in Christ.
Merciful Lord,
turn toward us and listen to our prayers:
open the gates of paradise to your servant
and help us who remain
to comfort one another with assurances of faith,
until we all meet in Christ
and are with you and with our brother/sister for ever.
Through Christ our Lord.
Amen.`,
    language: 'en',
    description: 'Funeral final commendation prayer',
    tags: ['funeral', 'closing-prayer', 'eternal-life', 'hope']
  },
  {
    title: 'Encomendación Final del Funeral',
    body: `En tus manos, Padre de misericordia,
encomendamos a nuestro hermano/a {{Deceased}}
en la esperanza segura y cierta
de que, junto con todos los que han muerto en Cristo,
resucitará con él en el último día.
Te damos gracias por las bendiciones
que derramaste sobre {{Deceased}} en esta vida:
son signos para nosotros de tu bondad
y de nuestra comunión con los santos en Cristo.
Señor misericordioso,
vuélvete hacia nosotros y escucha nuestras oraciones:
abre las puertas del paraíso a tu siervo
y ayúdanos a los que quedamos
a consolarnos unos a otros con garantías de fe,
hasta que todos nos encontremos en Cristo
y estemos contigo y con nuestro hermano/a para siempre.
Por Cristo nuestro Señor.
Amén.`,
    language: 'es',
    description: 'Oración de encomendación final del funeral',
    tags: ['funeral', 'closing-prayer', 'eternal-life', 'hope']
  }
]

// Prayers of the Faithful
const PRAYERS_OF_THE_FAITHFUL: SeedContent[] = [
  {
    title: 'Wedding Intercessions',
    body: `**For the Church:** That all married couples may be signs of Christ's love for his Church.
*Lord, hear our prayer.*

**For {{Bride}} and {{Groom}}:** That God will bless their covenant as he chose to sanctify marriage at Cana in Galilee.
*Lord, hear our prayer.*

**For their families:** That their love and support may strengthen this new family.
*Lord, hear our prayer.*

**For all married couples:** That the grace of this Sacrament will be renewed in all married persons here present.
*Lord, hear our prayer.*

**For those who have died:** That our departed loved ones may share in the wedding feast of heaven.
*Lord, hear our prayer.*`,
    language: 'en',
    description: 'Wedding Mass intercessions/petitions',
    tags: ['wedding', 'prayers-of-the-faithful', 'love']
  },
  {
    title: 'Intercesiones del Matrimonio',
    body: `**Por la Iglesia:** Que todas las parejas casadas sean signos del amor de Cristo por su Iglesia.
*Señor, escucha nuestra oración.*

**Por {{Bride}} y {{Groom}}:** Que Dios bendiga su alianza como eligió santificar el matrimonio en Caná de Galilea.
*Señor, escucha nuestra oración.*

**Por sus familias:** Que su amor y apoyo fortalezcan a esta nueva familia.
*Señor, escucha nuestra oración.*

**Por todas las parejas casadas:** Que la gracia de este Sacramento se renueve en todas las personas casadas aquí presentes.
*Señor, escucha nuestra oración.*

**Por los que han fallecido:** Que nuestros seres queridos difuntos compartan el banquete de bodas del cielo.
*Señor, escucha nuestra oración.*`,
    language: 'es',
    description: 'Intercesiones/peticiones de la Misa de Matrimonio',
    tags: ['wedding', 'prayers-of-the-faithful', 'love']
  },
  {
    title: 'Funeral Intercessions',
    body: `**For {{Deceased}}:** That they may rest in eternal peace and rise in glory on the last day.
*Lord, hear our prayer.*

**For the family and friends:** That they may find comfort in God's love and the support of this community.
*Lord, hear our prayer.*

**For all the faithful departed:** Especially those who have no one to pray for them.
*Lord, hear our prayer.*

**For those who minister to the grieving:** That God may strengthen them in their work of mercy.
*Lord, hear our prayer.*

**For ourselves:** That we may be prepared for our own journey to eternal life.
*Lord, hear our prayer.*`,
    language: 'en',
    description: 'Funeral Mass intercessions/petitions',
    tags: ['funeral', 'prayers-of-the-faithful', 'comfort', 'hope']
  },
  {
    title: 'Intercesiones del Funeral',
    body: `**Por {{Deceased}}:** Que descanse en paz eterna y resucite en gloria en el último día.
*Señor, escucha nuestra oración.*

**Por la familia y amigos:** Que encuentren consuelo en el amor de Dios y el apoyo de esta comunidad.
*Señor, escucha nuestra oración.*

**Por todos los fieles difuntos:** Especialmente por aquellos que no tienen quien rece por ellos.
*Señor, escucha nuestra oración.*

**Por los que ministran a los afligidos:** Que Dios los fortalezca en su obra de misericordia.
*Señor, escucha nuestra oración.*

**Por nosotros mismos:** Que estemos preparados para nuestro propio viaje a la vida eterna.
*Señor, escucha nuestra oración.*`,
    language: 'es',
    description: 'Intercesiones/peticiones de la Misa de Funeral',
    tags: ['funeral', 'prayers-of-the-faithful', 'comfort', 'hope']
  },
  {
    title: 'Baptism Intercessions',
    body: `**For {{Child}}:** That they may grow in faith, hope, and love throughout their life.
*Lord, hear our prayer.*

**For the parents {{Mother}} and {{Father}}:** That they may be living examples of faith for their child.
*Lord, hear our prayer.*

**For the godparents {{Godmother}} and {{Godfather}}:** That they may faithfully fulfill their responsibilities.
*Lord, hear our prayer.*

**For this community:** That we may support this family in their journey of faith.
*Lord, hear our prayer.*

**For all the baptized:** That we may live out our baptismal promises each day.
*Lord, hear our prayer.*`,
    language: 'en',
    description: 'Baptism intercessions/petitions',
    tags: ['baptism', 'prayers-of-the-faithful', 'hope', 'faith']
  },
  {
    title: 'Intercesiones del Bautismo',
    body: `**Por {{Child}}:** Que crezca en fe, esperanza y amor a lo largo de su vida.
*Señor, escucha nuestra oración.*

**Por los padres {{Mother}} y {{Father}}:** Que sean ejemplos vivos de fe para su hijo.
*Señor, escucha nuestra oración.*

**Por los padrinos {{Godmother}} y {{Godfather}}:** Que cumplan fielmente sus responsabilidades.
*Señor, escucha nuestra oración.*

**Por esta comunidad:** Que apoyemos a esta familia en su camino de fe.
*Señor, escucha nuestra oración.*

**Por todos los bautizados:** Que vivamos nuestras promesas bautismales cada día.
*Señor, escucha nuestra oración.*`,
    language: 'es',
    description: 'Intercesiones/peticiones del Bautismo',
    tags: ['baptism', 'prayers-of-the-faithful', 'hope', 'faith']
  }
]

// Ceremony Instructions
const CEREMONY_INSTRUCTIONS: SeedContent[] = [
  {
    title: 'Exchange of Consent',
    body: `The presider invites the couple to declare their consent:

**Presider:** {{Groom}}, do you take {{Bride}} to be your wife? Do you promise to be faithful to her in good times and in bad, in sickness and in health, to love her and to honor her all the days of your life?

**Groom:** I do.

**Presider:** {{Bride}}, do you take {{Groom}} to be your husband? Do you promise to be faithful to him in good times and in bad, in sickness and in health, to love him and to honor him all the days of your life?

**Bride:** I do.

**Presider:** Since it is your intention to enter the covenant of Holy Matrimony, join your right hands and declare your consent before God and his Church.`,
    language: 'en',
    description: 'Wedding exchange of consent ceremony instructions',
    tags: ['wedding', 'ceremony-instructions']
  },
  {
    title: 'Intercambio de Consentimientos',
    body: `El celebrante invita a la pareja a declarar su consentimiento:

**Celebrante:** {{Groom}}, ¿aceptas a {{Bride}} como tu esposa? ¿Prometes serle fiel en las alegrías y en las penas, en la salud y en la enfermedad, amarla y respetarla todos los días de tu vida?

**Novio:** Sí, acepto.

**Celebrante:** {{Bride}}, ¿aceptas a {{Groom}} como tu esposo? ¿Prometes serle fiel en las alegrías y en las penas, en la salud y en la enfermedad, amarlo y respetarlo todos los días de tu vida?

**Novia:** Sí, acepto.

**Celebrante:** Ya que es su intención entrar en la alianza del Santo Matrimonio, unan sus manos derechas y declaren su consentimiento ante Dios y su Iglesia.`,
    language: 'es',
    description: 'Instrucciones de la ceremonia de intercambio de consentimientos',
    tags: ['wedding', 'ceremony-instructions']
  },
  {
    title: 'Blessing and Exchange of Rings',
    body: `**Blessing of the Rings:**

Lord, bless these rings which we bless in your name.
Grant that those who wear them
may always have a deep faith in each other.
May they do your will
and always live together
in peace, good will, and love.
We ask this through Christ our Lord.
Amen.

**Exchange of Rings:**

The groom places the ring on the bride's finger, saying:
"{{Bride}}, receive this ring as a sign of my love and fidelity. In the name of the Father, and of the Son, and of the Holy Spirit."

The bride places the ring on the groom's finger, saying:
"{{Groom}}, receive this ring as a sign of my love and fidelity. In the name of the Father, and of the Son, and of the Holy Spirit."`,
    language: 'en',
    description: 'Blessing and exchange of wedding rings',
    tags: ['wedding', 'ceremony-instructions', 'love']
  },
  {
    title: 'Bendición e Intercambio de Anillos',
    body: `**Bendición de los Anillos:**

Señor, bendice estos anillos que bendecimos en tu nombre.
Concede que quienes los lleven
tengan siempre una fe profunda el uno en el otro.
Que hagan tu voluntad
y vivan siempre juntos
en paz, buena voluntad y amor.
Te lo pedimos por Cristo nuestro Señor.
Amén.

**Intercambio de Anillos:**

El novio coloca el anillo en el dedo de la novia, diciendo:
"{{Bride}}, recibe este anillo como signo de mi amor y fidelidad. En el nombre del Padre, y del Hijo, y del Espíritu Santo."

La novia coloca el anillo en el dedo del novio, diciendo:
"{{Groom}}, recibe este anillo como signo de mi amor y fidelidad. En el nombre del Padre, y del Hijo, y del Espíritu Santo."`,
    language: 'es',
    description: 'Bendición e intercambio de anillos de boda',
    tags: ['wedding', 'ceremony-instructions', 'love']
  },
  {
    title: 'Baptismal Promises Renewal',
    body: `The presider addresses the parents and godparents:

**Presider:** Dear parents and godparents, you have come here to present this child for baptism. By water and the Holy Spirit they will receive the gift of new life from God, who is love.

On your part, you must make it your constant care to bring them up in the practice of the faith. See that the divine life which God gives them is kept safe from the poison of sin, to grow always stronger in their hearts.

If your faith makes you ready to accept this responsibility, renew now the vows of your own baptism. Reject sin; profess your faith in Christ Jesus. This is the faith of the Church. This is the faith in which this child is about to be baptized.

**Do you renounce Satan?**
*I do.*

**And all his works?**
*I do.*

**And all his empty show?**
*I do.*`,
    language: 'en',
    description: 'Baptismal promises renewal ceremony',
    tags: ['baptism', 'ceremony-instructions', 'faith']
  },
  {
    title: 'Renovación de las Promesas Bautismales',
    body: `El celebrante se dirige a los padres y padrinos:

**Celebrante:** Queridos padres y padrinos, han venido aquí para presentar a este niño para el bautismo. Por el agua y el Espíritu Santo recibirá el don de la nueva vida de Dios, que es amor.

De su parte, deben procurar constantemente educarlo en la práctica de la fe. Cuiden que la vida divina que Dios les da se mantenga a salvo del veneno del pecado, para que crezca siempre más fuerte en sus corazones.

Si su fe los hace dispuestos a aceptar esta responsabilidad, renueven ahora los votos de su propio bautismo. Rechacen el pecado; profesen su fe en Cristo Jesús. Esta es la fe de la Iglesia. Esta es la fe en la que este niño será bautizado.

**¿Renuncian a Satanás?**
*Sí, renuncio.*

**¿Y a todas sus obras?**
*Sí, renuncio.*

**¿Y a todas sus seducciones?**
*Sí, renuncio.*`,
    language: 'es',
    description: 'Renovación de las promesas bautismales',
    tags: ['baptism', 'ceremony-instructions', 'faith']
  }
]

// Announcements
const ANNOUNCEMENTS: SeedContent[] = [
  {
    title: 'Wedding Reception Announcement',
    body: `Please join us for a reception immediately following the ceremony at:

**{{Reception Location}}**

We look forward to celebrating with you!`,
    language: 'en',
    description: 'Wedding reception announcement',
    tags: ['wedding', 'announcements']
  },
  {
    title: 'Anuncio de Recepción de Boda',
    body: `Por favor, acompáñenos a una recepción inmediatamente después de la ceremonia en:

**{{Reception Location}}**

¡Esperamos celebrar con ustedes!`,
    language: 'es',
    description: 'Anuncio de recepción de boda',
    tags: ['wedding', 'announcements']
  },
  {
    title: 'Funeral Repast Announcement',
    body: `The family invites you to join them for a reception following the burial at:

**{{Reception Location}}**

May we continue to support one another in this time of mourning.`,
    language: 'en',
    description: 'Funeral reception/repast announcement',
    tags: ['funeral', 'announcements']
  },
  {
    title: 'Anuncio de Recepción del Funeral',
    body: `La familia les invita a acompañarlos a una recepción después del entierro en:

**{{Reception Location}}**

Que podamos seguir apoyándonos unos a otros en este tiempo de duelo.`,
    language: 'es',
    description: 'Anuncio de recepción del funeral',
    tags: ['funeral', 'announcements']
  },
  {
    title: 'Baptism Reception Announcement',
    body: `Please join the family for a celebration following the baptism.

Light refreshments will be served in the parish hall.`,
    language: 'en',
    description: 'Baptism reception announcement',
    tags: ['baptism', 'announcements']
  },
  {
    title: 'Anuncio de Recepción del Bautismo',
    body: `Por favor, acompañen a la familia para una celebración después del bautismo.

Se servirán refrescos ligeros en el salón parroquial.`,
    language: 'es',
    description: 'Anuncio de recepción del bautismo',
    tags: ['baptism', 'announcements']
  }
]

// Quinceañera specific content
const QUINCEANERA_CONTENT: SeedContent[] = [
  {
    title: 'Quinceañera Thanksgiving Prayer',
    body: `Lord God, we thank you for the gift of {{Quinceañera}}.
Today, as she celebrates her fifteenth birthday,
we ask your blessing upon her.
Give her wisdom to make good choices,
courage to follow your will,
and a heart full of love for you and for others.
May she always know that she is your beloved daughter.
Guide her steps as she continues her journey of faith.
Through Christ our Lord.
Amen.`,
    language: 'en',
    description: 'Quinceañera thanksgiving prayer',
    tags: ['quinceanera', 'opening-prayer', 'joy']
  },
  {
    title: 'Oración de Acción de Gracias de la Quinceañera',
    body: `Señor Dios, te damos gracias por el don de {{Quinceañera}}.
Hoy, mientras celebra su quinceavo cumpleaños,
te pedimos tu bendición sobre ella.
Dale sabiduría para tomar buenas decisiones,
valor para seguir tu voluntad,
y un corazón lleno de amor por ti y por los demás.
Que siempre sepa que es tu hija amada.
Guía sus pasos mientras continúa su camino de fe.
Por Cristo nuestro Señor.
Amén.`,
    language: 'es',
    description: 'Oración de acción de gracias de la quinceañera',
    tags: ['quinceanera', 'opening-prayer', 'joy']
  },
  {
    title: 'Quinceañera Blessing',
    body: `**Blessing of the Quinceañera:**

{{Quinceañera}}, today you stand at the threshold of a new chapter in your life. As you leave childhood behind and embrace the responsibilities of young adulthood, know that God walks with you.

May the Lord bless you and keep you.
May the Lord make his face shine upon you and be gracious to you.
May the Lord look upon you with kindness and give you peace.

Go forth with confidence, knowing that you are loved by God, by your family, and by this community of faith.`,
    language: 'en',
    description: 'Quinceañera blessing ceremony',
    tags: ['quinceanera', 'ceremony-instructions', 'joy', 'faith']
  },
  {
    title: 'Bendición de la Quinceañera',
    body: `**Bendición de la Quinceañera:**

{{Quinceañera}}, hoy te encuentras en el umbral de un nuevo capítulo en tu vida. Al dejar atrás la niñez y abrazar las responsabilidades de la juventud, sabe que Dios camina contigo.

Que el Señor te bendiga y te guarde.
Que el Señor haga resplandecer su rostro sobre ti y tenga misericordia de ti.
Que el Señor te mire con bondad y te conceda la paz.

Sal adelante con confianza, sabiendo que eres amada por Dios, por tu familia y por esta comunidad de fe.`,
    language: 'es',
    description: 'Ceremonia de bendición de la quinceañera',
    tags: ['quinceanera', 'ceremony-instructions', 'joy', 'faith']
  }
]

// Presentation specific content
const PRESENTATION_CONTENT: SeedContent[] = [
  {
    title: 'Presentation Prayer',
    body: `Loving God, we present this child {{Child}} to you.
As Mary and Joseph presented Jesus in the Temple,
so we present {{Child}} before your altar.
Bless this child and watch over them.
Guide {{Mother}} and {{Father}} as they raise their child in faith.
Strengthen {{Godmother}} and {{Godfather}} to support them on this journey.
May {{Child}} grow in wisdom, age, and grace before you and all people.
Through Christ our Lord.
Amen.`,
    language: 'en',
    description: 'Child presentation prayer',
    tags: ['presentation', 'opening-prayer', 'family']
  },
  {
    title: 'Oración de la Presentación',
    body: `Dios amoroso, presentamos a este niño {{Child}} ante ti.
Como María y José presentaron a Jesús en el Templo,
así presentamos a {{Child}} ante tu altar.
Bendice a este niño y cuídalo.
Guía a {{Mother}} y {{Father}} mientras crían a su hijo en la fe.
Fortalece a {{Godmother}} y {{Godfather}} para que los apoyen en este camino.
Que {{Child}} crezca en sabiduría, edad y gracia ante ti y ante todos.
Por Cristo nuestro Señor.
Amén.`,
    language: 'es',
    description: 'Oración de presentación del niño',
    tags: ['presentation', 'opening-prayer', 'family']
  }
]

// Combine all content
const ALL_SEED_CONTENT: SeedContent[] = [
  ...OPENING_PRAYERS,
  ...CLOSING_PRAYERS,
  ...PRAYERS_OF_THE_FAITHFUL,
  ...CEREMONY_INSTRUCTIONS,
  ...ANNOUNCEMENTS,
  ...QUINCEANERA_CONTENT,
  ...PRESENTATION_CONTENT
]

/**
 * Seed sample content items for a parish
 *
 * @param supabase - Supabase client
 * @param parishId - Parish ID to seed content for
 */
export async function seedContentForParish(
  supabase: SupabaseClient,
  parishId: string
): Promise<void> {
  logInfo('Seeding content library...')

  // First, fetch all category tags for this parish to get tag IDs
  const { data: tags, error: tagsError } = await supabase
    .from('category_tags')
    .select('id, slug')
    .eq('parish_id', parishId)

  if (tagsError) {
    logError(`Error fetching category tags: ${tagsError.message}`)
    throw new Error(`Failed to fetch category tags: ${tagsError.message}`)
  }

  if (!tags || tags.length === 0) {
    logWarning('No category tags found - skipping content seeding')
    return
  }

  // Create a slug -> id map for quick lookup
  const tagMap = new Map(tags.map(t => [t.slug, t.id]))

  // Insert content items
  let contentCount = 0
  let assignmentCount = 0

  for (const content of ALL_SEED_CONTENT) {
    // Insert the content item
    const { data: newContent, error: contentError } = await supabase
      .from('contents')
      .insert({
        parish_id: parishId,
        title: content.title,
        body: content.body,
        language: content.language,
        description: content.description || null
      })
      .select('id')
      .single()

    if (contentError) {
      logError(`Error creating content ${content.title}: ${contentError.message}`)
      continue
    }

    contentCount++

    // Create tag assignments using polymorphic tag_assignments table
    const validTagIds = content.tags
      .map(slug => tagMap.get(slug))
      .filter((id): id is string => id !== undefined)

    if (validTagIds.length > 0) {
      const { error: assignmentError } = await supabase
        .from('tag_assignments')
        .insert(
          validTagIds.map(tagId => ({
            tag_id: tagId,
            entity_type: 'content',
            entity_id: newContent.id
          }))
        )

      if (assignmentError) {
        logError(`Error creating tag assignments for ${content.title}: ${assignmentError.message}`)
      } else {
        assignmentCount += validTagIds.length
      }
    }
  }

  logSuccess(`Created ${contentCount} content items`)
  logSuccess(`Created ${assignmentCount} tag assignments`)
}

/**
 * Export content data for reference
 */
export const SEED_CONTENT_DATA = {
  OPENING_PRAYERS,
  CLOSING_PRAYERS,
  PRAYERS_OF_THE_FAITHFUL,
  CEREMONY_INSTRUCTIONS,
  ANNOUNCEMENTS,
  QUINCEANERA_CONTENT,
  PRESENTATION_CONTENT,
  ALL_SEED_CONTENT
}
