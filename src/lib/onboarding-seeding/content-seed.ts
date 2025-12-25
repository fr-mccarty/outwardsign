/**
 * Content Library Seed Data
 *
 * Seeds sample content items for development and new parishes.
 * Includes public domain content: prayers, ceremony instructions, announcements,
 * and scripture readings (using public domain Douay-Rheims translation).
 *
 * SCRIPTURE READING FORMAT:
 * -------------------------
 * Content uses HTML with inline styles from the Tiptap rich text editor:
 * - Bold: <strong>text</strong>
 * - Italic: <em>text</em>
 * - Red text: <span style="color: #c41e3a">text</span> or style="color: #c41e3a"
 * - Alignment: <p style="text-align: center">text</p>
 * - Psalms: <strong>Reader:</strong> verses + <p style="color: #c41e3a;"><em>People: response</em></p>
 *
 * NOTE: Reader names and page breaks are configured in SCRIPT TEMPLATES, not here.
 * The script template section should include: **Reader:** {{First_Reading_Reader}}
 *
 * HOW CONTENT IS TAGGED:
 * ======================
 * Each content item is assigned multiple tags via the `tag_assignments` table.
 * Tags are identified by their `slug` (defined in category-tags-seed.ts).
 *
 * TAGGING PATTERN:
 * ----------------
 * Content is typically tagged with:
 * 1. A SACRAMENT tag (which event type): 'wedding', 'funeral', 'baptism', etc.
 * 2. A SECTION tag (what role it plays): 'opening-prayer', 'first-reading', etc.
 * 3. Optional THEME tags: 'hope', 'love', 'comfort', etc.
 *
 * EXAMPLE:
 * --------
 * A wedding opening prayer is tagged: ['wedding', 'opening-prayer']
 * A funeral closing prayer about hope is tagged: ['funeral', 'closing-prayer', 'hope']
 *
 * HOW TO FIND CONTENT:
 * --------------------
 * Content pickers use `input_filter_tags` from input_field_definitions to set default filters.
 * The query finds content that has ALL active tags assigned.
 *
 * To find content programmatically:
 * 1. Get tag IDs by slug from `category_tags` table
 * 2. Query `tag_assignments` for entity_type='content' with matching tag_ids
 * 3. Join with `contents` table to get the actual content
 *
 * SEE ALSO:
 * ---------
 * - category-tags-seed.ts: Defines all available tag slugs
 * - event-types-seed.ts: Defines input_filter_tags on input fields
 * - scripts/dev-seeders/seed-readings.ts: Seeds scripture readings (dev only)
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
  tags: string[] // Tag slugs to assign (see category-tags-seed.ts)
}

// Opening Prayers
const OPENING_PRAYERS: SeedContent[] = [
  {
    title: 'Wedding Opening Prayer',
    body: `<p>Father, you have made the bond of marriage a holy mystery,<br>a symbol of Christ's love for his Church.<br>Hear our prayers for {{bride.full_name}} and {{groom.full_name}}.<br>With faith in you and in each other<br>they pledge their love today.<br>May their lives always bear witness<br>to the reality of that love.<br>We ask this through our Lord Jesus Christ, your Son,<br>who lives and reigns with you and the Holy Spirit,<br>one God, for ever and ever.<br>Amen.</p>`,
    language: 'en',
    description: 'Traditional Catholic wedding opening prayer',
    tags: ['wedding', 'opening-prayer']
  },
  {
    title: 'Oración Inicial del Matrimonio',
    body: `<p>Padre, has hecho del vínculo del matrimonio un santo misterio,<br>símbolo del amor de Cristo por su Iglesia.<br>Escucha nuestras oraciones por {{bride.full_name}} y {{groom.full_name}}.<br>Con fe en ti y el uno en el otro<br>hoy prometen su amor.<br>Que sus vidas siempre den testimonio<br>de la realidad de ese amor.<br>Te lo pedimos por nuestro Señor Jesucristo, tu Hijo,<br>que vive y reina contigo y el Espíritu Santo,<br>un solo Dios, por los siglos de los siglos.<br>Amén.</p>`,
    language: 'es',
    description: 'Oración inicial tradicional católica para bodas',
    tags: ['wedding', 'opening-prayer']
  },
  {
    title: 'Funeral Opening Prayer',
    body: `<p>O God, to whom mercy and forgiveness belong,<br>hear our prayers on behalf of your servant {{deceased.full_name}},<br>whom you have called out of this world.<br>Because they put their hope and trust in you,<br>command that they be carried safely home to heaven<br>and come to enjoy your eternal reward.<br>Through Christ our Lord.<br>Amen.</p>`,
    language: 'en',
    description: 'Traditional Catholic funeral opening prayer',
    tags: ['funeral', 'opening-prayer', 'comfort']
  },
  {
    title: 'Oración Inicial del Funeral',
    body: `<p>Oh Dios, a quien pertenece la misericordia y el perdón,<br>escucha nuestras oraciones por tu siervo {{deceased.full_name}},<br>a quien has llamado de este mundo.<br>Porque pusieron su esperanza y confianza en ti,<br>ordena que sean llevados a salvo al cielo<br>y lleguen a disfrutar de tu recompensa eterna.<br>Por Cristo nuestro Señor.<br>Amén.</p>`,
    language: 'es',
    description: 'Oración inicial tradicional católica para funerales',
    tags: ['funeral', 'opening-prayer', 'comfort']
  },
  {
    title: 'Baptism Opening Prayer',
    body: `<p>Almighty and ever-living God,<br>you sent your only Son into the world<br>to cast out the power of Satan, spirit of evil,<br>to rescue us from the kingdom of darkness,<br>and bring us into the splendor of your kingdom of light.<br>We pray for this child:<br>set them free from original sin,<br>make them a temple of your glory,<br>and send your Holy Spirit to dwell within them.<br>Through Christ our Lord.<br>Amen.</p>`,
    language: 'en',
    description: 'Traditional Catholic baptism opening prayer',
    tags: ['baptism', 'opening-prayer', 'hope']
  },
  {
    title: 'Oración Inicial del Bautismo',
    body: `<p>Dios todopoderoso y eterno,<br>enviaste a tu único Hijo al mundo<br>para expulsar el poder de Satanás, espíritu del mal,<br>para rescatarnos del reino de las tinieblas,<br>y traernos al esplendor de tu reino de luz.<br>Oramos por este niño:<br>líbralo del pecado original,<br>hazlo templo de tu gloria,<br>y envía tu Espíritu Santo para que habite en él.<br>Por Cristo nuestro Señor.<br>Amén.</p>`,
    language: 'es',
    description: 'Oración inicial tradicional católica para bautismos',
    tags: ['baptism', 'opening-prayer', 'hope']
  }
]

// Closing Prayers
const CLOSING_PRAYERS: SeedContent[] = [
  {
    title: 'Wedding Closing Prayer',
    body: `<p>Lord, we thank you for {{bride.full_name}} and {{groom.full_name}}.<br>May their love continue to grow,<br>and may they always find in each other<br>the best friend they will ever have.<br>May they never take each other for granted,<br>and always experience the wonder of married love.<br>Through Christ our Lord.<br>Amen.</p>`,
    language: 'en',
    description: 'Wedding closing prayer and blessing',
    tags: ['wedding', 'closing-prayer', 'love']
  },
  {
    title: 'Oración Final del Matrimonio',
    body: `<p>Señor, te damos gracias por {{bride.full_name}} y {{groom.full_name}}.<br>Que su amor siga creciendo,<br>y que siempre encuentren el uno en el otro<br>al mejor amigo que jamás tendrán.<br>Que nunca se den por sentados,<br>y siempre experimenten la maravilla del amor conyugal.<br>Por Cristo nuestro Señor.<br>Amén.</p>`,
    language: 'es',
    description: 'Oración final y bendición del matrimonio',
    tags: ['wedding', 'closing-prayer', 'love']
  },
  {
    title: 'Funeral Final Commendation',
    body: `<p>Into your hands, Father of mercies,<br>we commend our brother/sister {{deceased.full_name}}<br>in the sure and certain hope<br>that, together with all who have died in Christ,<br>they will rise with him on the last day.</p>
<p>We give you thanks for the blessings<br>which you bestowed upon {{deceased.full_name}} in this life:<br>they are signs to us of your goodness<br>and of our fellowship with the saints in Christ.</p>
<p>Merciful Lord,<br>turn toward us and listen to our prayers:<br>open the gates of paradise to your servant<br>and help us who remain<br>to comfort one another with assurances of faith,<br>until we all meet in Christ<br>and are with you and with our brother/sister for ever.<br>Through Christ our Lord.<br>Amen.</p>`,
    language: 'en',
    description: 'Funeral final commendation prayer',
    tags: ['funeral', 'closing-prayer', 'eternal-life', 'hope']
  },
  {
    title: 'Encomendación Final del Funeral',
    body: `<p>En tus manos, Padre de misericordia,<br>encomendamos a nuestro hermano/a {{deceased.full_name}}<br>en la esperanza segura y cierta<br>de que, junto con todos los que han muerto en Cristo,<br>resucitará con él en el último día.</p>
<p>Te damos gracias por las bendiciones<br>que derramaste sobre {{deceased.full_name}} en esta vida:<br>son signos para nosotros de tu bondad<br>y de nuestra comunión con los santos en Cristo.</p>
<p>Señor misericordioso,<br>vuélvete hacia nosotros y escucha nuestras oraciones:<br>abre las puertas del paraíso a tu siervo<br>y ayúdanos a los que quedamos<br>a consolarnos unos a otros con garantías de fe,<br>hasta que todos nos encontremos en Cristo<br>y estemos contigo y con nuestro hermano/a para siempre.<br>Por Cristo nuestro Señor.<br>Amén.</p>`,
    language: 'es',
    description: 'Oración de encomendación final del funeral',
    tags: ['funeral', 'closing-prayer', 'eternal-life', 'hope']
  }
]

// Prayers of the Faithful
const PRAYERS_OF_THE_FAITHFUL: SeedContent[] = [
  {
    title: 'Wedding Intercessions',
    body: `<p><strong>For the Church:</strong> That all married couples may be signs of Christ's love for his Church.<br><em>Lord, hear our prayer.</em></p>
<p><strong>For {{bride.full_name}} and {{groom.full_name}}:</strong> That God will bless their covenant as he chose to sanctify marriage at Cana in Galilee.<br><em>Lord, hear our prayer.</em></p>
<p><strong>For their families:</strong> That their love and support may strengthen this new family.<br><em>Lord, hear our prayer.</em></p>
<p><strong>For all married couples:</strong> That the grace of this Sacrament will be renewed in all married persons here present.<br><em>Lord, hear our prayer.</em></p>
<p><strong>For those who have died:</strong> That our departed loved ones may share in the wedding feast of heaven.<br><em>Lord, hear our prayer.</em></p>`,
    language: 'en',
    description: 'Wedding Mass intercessions/petitions',
    tags: ['wedding', 'prayers-of-the-faithful', 'love']
  },
  {
    title: 'Intercesiones del Matrimonio',
    body: `<p><strong>Por la Iglesia:</strong> Que todas las parejas casadas sean signos del amor de Cristo por su Iglesia.<br><em>Señor, escucha nuestra oración.</em></p>
<p><strong>Por {{bride.full_name}} y {{groom.full_name}}:</strong> Que Dios bendiga su alianza como eligió santificar el matrimonio en Caná de Galilea.<br><em>Señor, escucha nuestra oración.</em></p>
<p><strong>Por sus familias:</strong> Que su amor y apoyo fortalezcan a esta nueva familia.<br><em>Señor, escucha nuestra oración.</em></p>
<p><strong>Por todas las parejas casadas:</strong> Que la gracia de este Sacramento se renueve en todas las personas casadas aquí presentes.<br><em>Señor, escucha nuestra oración.</em></p>
<p><strong>Por los que han fallecido:</strong> Que nuestros seres queridos difuntos compartan el banquete de bodas del cielo.<br><em>Señor, escucha nuestra oración.</em></p>`,
    language: 'es',
    description: 'Intercesiones/peticiones de la Misa de Matrimonio',
    tags: ['wedding', 'prayers-of-the-faithful', 'love']
  },
  {
    title: 'Funeral Intercessions',
    body: `<p><strong>For {{deceased.full_name}}:</strong> That they may rest in eternal peace and rise in glory on the last day.<br><em>Lord, hear our prayer.</em></p>
<p><strong>For the family and friends:</strong> That they may find comfort in God's love and the support of this community.<br><em>Lord, hear our prayer.</em></p>
<p><strong>For all the faithful departed:</strong> Especially those who have no one to pray for them.<br><em>Lord, hear our prayer.</em></p>
<p><strong>For those who minister to the grieving:</strong> That God may strengthen them in their work of mercy.<br><em>Lord, hear our prayer.</em></p>
<p><strong>For ourselves:</strong> That we may be prepared for our own journey to eternal life.<br><em>Lord, hear our prayer.</em></p>`,
    language: 'en',
    description: 'Funeral Mass intercessions/petitions',
    tags: ['funeral', 'prayers-of-the-faithful', 'comfort', 'hope']
  },
  {
    title: 'Intercesiones del Funeral',
    body: `<p><strong>Por {{deceased.full_name}}:</strong> Que descanse en paz eterna y resucite en gloria en el último día.<br><em>Señor, escucha nuestra oración.</em></p>
<p><strong>Por la familia y amigos:</strong> Que encuentren consuelo en el amor de Dios y el apoyo de esta comunidad.<br><em>Señor, escucha nuestra oración.</em></p>
<p><strong>Por todos los fieles difuntos:</strong> Especialmente por aquellos que no tienen quien rece por ellos.<br><em>Señor, escucha nuestra oración.</em></p>
<p><strong>Por los que ministran a los afligidos:</strong> Que Dios los fortalezca en su obra de misericordia.<br><em>Señor, escucha nuestra oración.</em></p>
<p><strong>Por nosotros mismos:</strong> Que estemos preparados para nuestro propio viaje a la vida eterna.<br><em>Señor, escucha nuestra oración.</em></p>`,
    language: 'es',
    description: 'Intercesiones/peticiones de la Misa de Funeral',
    tags: ['funeral', 'prayers-of-the-faithful', 'comfort', 'hope']
  },
  {
    title: 'Baptism Intercessions',
    body: `<p><strong>For {{child.full_name}}:</strong> That they may grow in faith, hope, and love throughout their life.<br><em>Lord, hear our prayer.</em></p>
<p><strong>For the parents {{mother.full_name}} and {{father.full_name}}:</strong> That they may be living examples of faith for their child.<br><em>Lord, hear our prayer.</em></p>
<p><strong>For the godparents {{godmother.full_name}} and {{godfather.full_name}}:</strong> That they may faithfully fulfill their responsibilities.<br><em>Lord, hear our prayer.</em></p>
<p><strong>For this community:</strong> That we may support this family in their journey of faith.<br><em>Lord, hear our prayer.</em></p>
<p><strong>For all the baptized:</strong> That we may live out our baptismal promises each day.<br><em>Lord, hear our prayer.</em></p>`,
    language: 'en',
    description: 'Baptism intercessions/petitions',
    tags: ['baptism', 'prayers-of-the-faithful', 'hope', 'faith']
  },
  {
    title: 'Intercesiones del Bautismo',
    body: `<p><strong>Por {{child.full_name}}:</strong> Que crezca en fe, esperanza y amor a lo largo de su vida.<br><em>Señor, escucha nuestra oración.</em></p>
<p><strong>Por los padres {{mother.full_name}} y {{father.full_name}}:</strong> Que sean ejemplos vivos de fe para su hijo.<br><em>Señor, escucha nuestra oración.</em></p>
<p><strong>Por los padrinos {{godmother.full_name}} y {{godfather.full_name}}:</strong> Que cumplan fielmente sus responsabilidades.<br><em>Señor, escucha nuestra oración.</em></p>
<p><strong>Por esta comunidad:</strong> Que apoyemos a esta familia en su camino de fe.<br><em>Señor, escucha nuestra oración.</em></p>
<p><strong>Por todos los bautizados:</strong> Que vivamos nuestras promesas bautismales cada día.<br><em>Señor, escucha nuestra oración.</em></p>`,
    language: 'es',
    description: 'Intercesiones/peticiones del Bautismo',
    tags: ['baptism', 'prayers-of-the-faithful', 'hope', 'faith']
  }
]

// Ceremony Instructions
const CEREMONY_INSTRUCTIONS: SeedContent[] = [
  {
    title: 'Exchange of Consent',
    body: `<p><em>The presider invites the couple to declare their consent:</em></p>
<p><strong>Presider:</strong> {{groom.full_name}}, do you take {{bride.full_name}} to be your wife? Do you promise to be faithful to her in good times and in bad, in sickness and in health, to love her and to honor her all the days of your life?</p>
<p><strong>Groom:</strong> I do.</p>
<p><strong>Presider:</strong> {{bride.full_name}}, do you take {{groom.full_name}} to be your husband? Do you promise to be faithful to him in good times and in bad, in sickness and in health, to love him and to honor him all the days of your life?</p>
<p><strong>Bride:</strong> I do.</p>
<p><strong>Presider:</strong> Since it is your intention to enter the covenant of Holy Matrimony, join your right hands and declare your consent before God and his Church.</p>`,
    language: 'en',
    description: 'Wedding exchange of consent ceremony instructions',
    tags: ['wedding', 'ceremony-instructions']
  },
  {
    title: 'Intercambio de Consentimientos',
    body: `<p><em>El celebrante invita a la pareja a declarar su consentimiento:</em></p>
<p><strong>Celebrante:</strong> {{groom.full_name}}, ¿aceptas a {{bride.full_name}} como tu esposa? ¿Prometes serle fiel en las alegrías y en las penas, en la salud y en la enfermedad, amarla y respetarla todos los días de tu vida?</p>
<p><strong>Novio:</strong> Sí, acepto.</p>
<p><strong>Celebrante:</strong> {{bride.full_name}}, ¿aceptas a {{groom.full_name}} como tu esposo? ¿Prometes serle fiel en las alegrías y en las penas, en la salud y en la enfermedad, amarlo y respetarlo todos los días de tu vida?</p>
<p><strong>Novia:</strong> Sí, acepto.</p>
<p><strong>Celebrante:</strong> Ya que es su intención entrar en la alianza del Santo Matrimonio, unan sus manos derechas y declaren su consentimiento ante Dios y su Iglesia.</p>`,
    language: 'es',
    description: 'Instrucciones de la ceremonia de intercambio de consentimientos',
    tags: ['wedding', 'ceremony-instructions']
  },
  {
    title: 'Blessing and Exchange of Rings',
    body: `<p><strong>Blessing of the Rings:</strong></p>
<p>Lord, bless these rings which we bless in your name.<br>Grant that those who wear them<br>may always have a deep faith in each other.<br>May they do your will<br>and always live together<br>in peace, good will, and love.<br>We ask this through Christ our Lord.<br>Amen.</p>
<p><strong>Exchange of Rings:</strong></p>
<p><em>The groom places the ring on the bride's finger, saying:</em><br>"{{bride.full_name}}, receive this ring as a sign of my love and fidelity. In the name of the Father, and of the Son, and of the Holy Spirit."</p>
<p><em>The bride places the ring on the groom's finger, saying:</em><br>"{{groom.full_name}}, receive this ring as a sign of my love and fidelity. In the name of the Father, and of the Son, and of the Holy Spirit."</p>`,
    language: 'en',
    description: 'Blessing and exchange of wedding rings',
    tags: ['wedding', 'ceremony-instructions', 'love']
  },
  {
    title: 'Bendición e Intercambio de Anillos',
    body: `<p><strong>Bendición de los Anillos:</strong></p>
<p>Señor, bendice estos anillos que bendecimos en tu nombre.<br>Concede que quienes los lleven<br>tengan siempre una fe profunda el uno en el otro.<br>Que hagan tu voluntad<br>y vivan siempre juntos<br>en paz, buena voluntad y amor.<br>Te lo pedimos por Cristo nuestro Señor.<br>Amén.</p>
<p><strong>Intercambio de Anillos:</strong></p>
<p><em>El novio coloca el anillo en el dedo de la novia, diciendo:</em><br>"{{bride.full_name}}, recibe este anillo como signo de mi amor y fidelidad. En el nombre del Padre, y del Hijo, y del Espíritu Santo."</p>
<p><em>La novia coloca el anillo en el dedo del novio, diciendo:</em><br>"{{groom.full_name}}, recibe este anillo como signo de mi amor y fidelidad. En el nombre del Padre, y del Hijo, y del Espíritu Santo."</p>`,
    language: 'es',
    description: 'Bendición e intercambio de anillos de boda',
    tags: ['wedding', 'ceremony-instructions', 'love']
  },
  {
    title: 'Baptismal Promises Renewal',
    body: `<p><em>The presider addresses the parents and godparents:</em></p>
<p><strong>Presider:</strong> Dear parents and godparents, you have come here to present this child for baptism. By water and the Holy Spirit they will receive the gift of new life from God, who is love.</p>
<p>On your part, you must make it your constant care to bring them up in the practice of the faith. See that the divine life which God gives them is kept safe from the poison of sin, to grow always stronger in their hearts.</p>
<p>If your faith makes you ready to accept this responsibility, renew now the vows of your own baptism. Reject sin; profess your faith in Christ Jesus. This is the faith of the Church. This is the faith in which this child is about to be baptized.</p>
<p><strong>Do you renounce Satan?</strong><br><em>I do.</em></p>
<p><strong>And all his works?</strong><br><em>I do.</em></p>
<p><strong>And all his empty show?</strong><br><em>I do.</em></p>`,
    language: 'en',
    description: 'Baptismal promises renewal ceremony',
    tags: ['baptism', 'ceremony-instructions', 'faith']
  },
  {
    title: 'Renovación de las Promesas Bautismales',
    body: `<p><em>El celebrante se dirige a los padres y padrinos:</em></p>
<p><strong>Celebrante:</strong> Queridos padres y padrinos, han venido aquí para presentar a este niño para el bautismo. Por el agua y el Espíritu Santo recibirá el don de la nueva vida de Dios, que es amor.</p>
<p>De su parte, deben procurar constantemente educarlo en la práctica de la fe. Cuiden que la vida divina que Dios les da se mantenga a salvo del veneno del pecado, para que crezca siempre más fuerte en sus corazones.</p>
<p>Si su fe los hace dispuestos a aceptar esta responsabilidad, renueven ahora los votos de su propio bautismo. Rechacen el pecado; profesen su fe en Cristo Jesús. Esta es la fe de la Iglesia. Esta es la fe en la que este niño será bautizado.</p>
<p><strong>¿Renuncian a Satanás?</strong><br><em>Sí, renuncio.</em></p>
<p><strong>¿Y a todas sus obras?</strong><br><em>Sí, renuncio.</em></p>
<p><strong>¿Y a todas sus seducciones?</strong><br><em>Sí, renuncio.</em></p>`,
    language: 'es',
    description: 'Renovación de las promesas bautismales',
    tags: ['baptism', 'ceremony-instructions', 'faith']
  }
]

// Announcements
const ANNOUNCEMENTS: SeedContent[] = [
  {
    title: 'Wedding Reception Announcement',
    body: `<p>Please join us for a reception immediately following the ceremony at:</p>
<p><strong>{{reception_location.name}}</strong></p>
<p>We look forward to celebrating with you!</p>`,
    language: 'en',
    description: 'Wedding reception announcement',
    tags: ['wedding', 'announcements']
  },
  {
    title: 'Anuncio de Recepción de Boda',
    body: `<p>Por favor, acompáñenos a una recepción inmediatamente después de la ceremonia en:</p>
<p><strong>{{reception_location.name}}</strong></p>
<p>¡Esperamos celebrar con ustedes!</p>`,
    language: 'es',
    description: 'Anuncio de recepción de boda',
    tags: ['wedding', 'announcements']
  },
  {
    title: 'Funeral Repast Announcement',
    body: `<p>The family invites you to join them for a reception following the burial at:</p>
<p><strong>{{reception_location.name}}</strong></p>
<p>May we continue to support one another in this time of mourning.</p>`,
    language: 'en',
    description: 'Funeral reception/repast announcement',
    tags: ['funeral', 'announcements']
  },
  {
    title: 'Anuncio de Recepción del Funeral',
    body: `<p>La familia les invita a acompañarlos a una recepción después del entierro en:</p>
<p><strong>{{reception_location.name}}</strong></p>
<p>Que podamos seguir apoyándonos unos a otros en este tiempo de duelo.</p>`,
    language: 'es',
    description: 'Anuncio de recepción del funeral',
    tags: ['funeral', 'announcements']
  },
  {
    title: 'Baptism Reception Announcement',
    body: `<p>Please join the family for a celebration following the baptism.</p>
<p>Light refreshments will be served in the parish hall.</p>`,
    language: 'en',
    description: 'Baptism reception announcement',
    tags: ['baptism', 'announcements']
  },
  {
    title: 'Anuncio de Recepción del Bautismo',
    body: `<p>Por favor, acompañen a la familia para una celebración después del bautismo.</p>
<p>Se servirán refrescos ligeros en el salón parroquial.</p>`,
    language: 'es',
    description: 'Anuncio de recepción del bautismo',
    tags: ['baptism', 'announcements']
  }
]

// Quinceañera specific content
const QUINCEANERA_CONTENT: SeedContent[] = [
  {
    title: 'Quinceañera Thanksgiving Prayer',
    body: `<p>Lord God, we thank you for the gift of {{quinceanera.full_name}}.<br>Today, as she celebrates her fifteenth birthday,<br>we ask your blessing upon her.<br>Give her wisdom to make good choices,<br>courage to follow your will,<br>and a heart full of love for you and for others.<br>May she always know that she is your beloved daughter.<br>Guide her steps as she continues her journey of faith.<br>Through Christ our Lord.<br>Amen.</p>`,
    language: 'en',
    description: 'Quinceañera thanksgiving prayer',
    tags: ['quinceanera', 'opening-prayer', 'joy']
  },
  {
    title: 'Oración de Acción de Gracias de la Quinceañera',
    body: `<p>Señor Dios, te damos gracias por el don de {{quinceanera.full_name}}.<br>Hoy, mientras celebra su quinceavo cumpleaños,<br>te pedimos tu bendición sobre ella.<br>Dale sabiduría para tomar buenas decisiones,<br>valor para seguir tu voluntad,<br>y un corazón lleno de amor por ti y por los demás.<br>Que siempre sepa que es tu hija amada.<br>Guía sus pasos mientras continúa su camino de fe.<br>Por Cristo nuestro Señor.<br>Amén.</p>`,
    language: 'es',
    description: 'Oración de acción de gracias de la quinceañera',
    tags: ['quinceanera', 'opening-prayer', 'joy']
  },
  {
    title: 'Quinceañera Blessing',
    body: `<p><strong>Blessing of the Quinceañera:</strong></p>
<p>{{quinceanera.full_name}}, today you stand at the threshold of a new chapter in your life. As you leave childhood behind and embrace the responsibilities of young adulthood, know that God walks with you.</p>
<p>May the Lord bless you and keep you.<br>May the Lord make his face shine upon you and be gracious to you.<br>May the Lord look upon you with kindness and give you peace.</p>
<p>Go forth with confidence, knowing that you are loved by God, by your family, and by this community of faith.</p>`,
    language: 'en',
    description: 'Quinceañera blessing ceremony',
    tags: ['quinceanera', 'ceremony-instructions', 'joy', 'faith']
  },
  {
    title: 'Bendición de la Quinceañera',
    body: `<p><strong>Bendición de la Quinceañera:</strong></p>
<p>{{quinceanera.full_name}}, hoy te encuentras en el umbral de un nuevo capítulo en tu vida. Al dejar atrás la niñez y abrazar las responsabilidades de la juventud, sabe que Dios camina contigo.</p>
<p>Que el Señor te bendiga y te guarde.<br>Que el Señor haga resplandecer su rostro sobre ti y tenga misericordia de ti.<br>Que el Señor te mire con bondad y te conceda la paz.</p>
<p>Sal adelante con confianza, sabiendo que eres amada por Dios, por tu familia y por esta comunidad de fe.</p>`,
    language: 'es',
    description: 'Ceremonia de bendición de la quinceañera',
    tags: ['quinceanera', 'ceremony-instructions', 'joy', 'faith']
  }
]

// Presentation specific content
const PRESENTATION_CONTENT: SeedContent[] = [
  {
    title: 'Presentation Prayer',
    body: `<p>Loving God, we present this child {{child.full_name}} to you.<br>As Mary and Joseph presented Jesus in the Temple,<br>so we present {{child.full_name}} before your altar.<br>Bless this child and watch over them.<br>Guide {{mother.full_name}} and {{father.full_name}} as they raise their child in faith.<br>Strengthen {{godmother.full_name}} and {{godfather.full_name}} to support them on this journey.<br>May {{child.full_name}} grow in wisdom, age, and grace before you and all people.<br>Through Christ our Lord.<br>Amen.</p>`,
    language: 'en',
    description: 'Child presentation prayer',
    tags: ['presentation', 'opening-prayer', 'family']
  },
  {
    title: 'Oración de la Presentación',
    body: `<p>Dios amoroso, presentamos a este niño {{child.full_name}} ante ti.<br>Como María y José presentaron a Jesús en el Templo,<br>así presentamos a {{child.full_name}} ante tu altar.<br>Bendice a este niño y cuídalo.<br>Guía a {{mother.full_name}} y {{father.full_name}} mientras crían a su hijo en la fe.<br>Fortalece a {{godmother.full_name}} y {{godfather.full_name}} para que los apoyen en este camino.<br>Que {{child.full_name}} crezca en sabiduría, edad y gracia ante ti y ante todos.<br>Por Cristo nuestro Señor.<br>Amén.</p>`,
    language: 'es',
    description: 'Oración de presentación del niño',
    tags: ['presentation', 'opening-prayer', 'family']
  }
]

// =====================================================
// Scripture Readings (Public Domain - Douay-Rheims)
// =====================================================

// First Readings
const FIRST_READINGS: SeedContent[] = [
  {
    title: 'Genesis 1:26-28, 31a',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>FIRST READING</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Genesis 1:26-28, 31a</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{first_reader.full_name}}</strong></p>

<p><strong>A reading from the Book of Genesis</strong></p>

<p>God said: "Let us make man to our image and likeness: and let him have dominion over the fishes of the sea, and the fowls of the air, and the beasts, and the whole earth, and every creeping creature that moveth upon the earth."</p>

<p>And God created man to his own image: to the image of God he created him: male and female he created them.</p>

<p>And God blessed them, saying: "Increase and multiply, and fill the earth, and subdue it, and rule over the fishes of the sea, and the fowls of the air, and all living creatures that move upon the earth."</p>

<p>And God saw all the things that he had made, and they were very good.</p>

<p>The word of the Lord.</p>`,
    language: 'en',
    description: 'Wedding first reading about creation of man and woman',
    tags: ['wedding', 'first-reading', 'old-testament']
  },
  {
    title: 'Ecclesiastes 3:1-8',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>FIRST READING</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Ecclesiastes 3:1-8</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{first_reader.full_name}}</strong></p>

<p><strong>A reading from the Book of Ecclesiastes</strong></p>

<p>All things have their season, and in their times all things pass under heaven.</p>

<p>A time to be born and a time to die.<br>
A time to plant, and a time to pluck up that which is planted.<br>
A time to destroy, and a time to build.<br>
A time to weep, and a time to laugh.<br>
A time to mourn, and a time to dance.<br>
A time to scatter stones, and a time to gather.<br>
A time to embrace, and a time to be far from embraces.<br>
A time to get, and a time to lose.<br>
A time to keep, and a time to cast away.<br>
A time to rend, and a time to sew.<br>
A time to keep silence, and a time to speak.<br>
A time of love, and a time of hatred.<br>
A time of war, and a time of peace.</p>

<p>The word of the Lord.</p>`,
    language: 'en',
    description: 'Funeral reading about seasons of life',
    tags: ['funeral', 'first-reading', 'old-testament', 'comfort']
  },
  {
    title: 'Isaiah 25:6-9',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>FIRST READING</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Isaiah 25:6-9</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{first_reader.full_name}}</strong></p>

<p><strong>A reading from the Book of the Prophet Isaiah</strong></p>

<p>The Lord of hosts shall make unto all peoples in this mountain a feast of fat things, a feast of wine, of fat things full of marrow, of wine purified from the lees.</p>

<p>And he shall destroy in this mountain the face of the bond with which all peoples were tied, and the web that he began over all nations.</p>

<p>He shall cast death down headlong for ever: and the Lord God shall wipe away tears from every face, and the reproach of his people he shall take away from off the whole earth: for the Lord hath spoken it.</p>

<p>And they shall say in that day: Lo, this is our God, we have waited for him, and he will save us: this is the Lord, we have patiently waited for him, we shall rejoice and be joyful in his salvation.</p>

<p>The word of the Lord.</p>`,
    language: 'en',
    description: 'Funeral reading about God wiping away tears',
    tags: ['funeral', 'first-reading', 'old-testament', 'hope']
  },
  {
    title: 'Sirach 26:1-4, 13-16',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>FIRST READING</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Sirach 26:1-4, 13-16</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{first_reader.full_name}}</strong></p>

<p><strong>A reading from the Book of Sirach</strong></p>

<p>Happy is the husband of a good wife: for the number of his years is double.</p>

<p>A virtuous woman rejoiceth her husband: and shall fulfil the years of his life in peace.</p>

<p>A good wife is a good portion, she shall be given in the portion of them that fear God, to a man for his good deeds.</p>

<p>Rich or poor, if his heart is good, his countenance shall be cheerful at all times.</p>

<p>The grace of a diligent woman shall delight her husband, and shall fat his bones.</p>

<p>Her discipline is the gift of God.</p>

<p>Such is a wise and silent woman, and there is nothing so much worth as a well instructed soul.</p>

<p>A holy and shamefaced woman is grace upon grace.</p>

<p>The word of the Lord.</p>`,
    language: 'en',
    description: 'Wedding reading about a good wife',
    tags: ['wedding', 'first-reading', 'old-testament']
  },
  {
    title: 'Lamentations 3:17-26',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>FIRST READING</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Lamentations 3:17-26</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{first_reader.full_name}}</strong></p>

<p><strong>A reading from the Book of Lamentations</strong></p>

<p>And my soul is removed far off from peace, I have forgotten good things.</p>

<p>And I said: My end and my hope is perished from the Lord.</p>

<p>Remember my poverty, and my transgression, the wormwood, and the gall.</p>

<p>I will be mindful and remember, and my soul shall languish within me.</p>

<p>These things I shall think over in my heart, therefore will I hope.</p>

<p>The mercies of the Lord that we are not consumed: because his commiserations have not failed.</p>

<p>They are new every morning, great is thy faithfulness.</p>

<p>The Lord is my portion, said my soul: therefore will I wait for him.</p>

<p>The Lord is good to them that hope in him, to the soul that seeketh him.</p>

<p>It is good to wait with silence for the salvation of God.</p>

<p>The word of the Lord.</p>`,
    language: 'en',
    description: 'Funeral reading about hope in suffering',
    tags: ['funeral', 'first-reading', 'old-testament', 'hope', 'comfort']
  }
]

// Second Readings
const SECOND_READINGS: SeedContent[] = [
  {
    title: 'Romans 8:31b-35, 37-39',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>SECOND READING</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Romans 8:31b-35, 37-39</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{second_reader.full_name}}</strong></p>

<p><strong>A reading from the Letter of Saint Paul to the Romans</strong></p>

<p>Brothers and sisters: If God be for us, who is against us?</p>

<p>He that spared not even his own Son, but delivered him up for us all, how hath he not also, with him, given us all things?</p>

<p>Who shall accuse against the elect of God? God that justifieth.</p>

<p>Who is he that shall condemn? Christ Jesus that died, yea that is risen also again; who is at the right hand of God, who also maketh intercession for us.</p>

<p>Who then shall separate us from the love of Christ? Shall tribulation? or distress? or famine? or nakedness? or danger? or persecution? or the sword?</p>

<p>But in all these things we overcome, because of him that hath loved us.</p>

<p>For I am sure that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come, nor might, nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.</p>

<p>The word of the Lord.</p>`,
    language: 'en',
    description: 'Funeral reading about God\'s unbreakable love',
    tags: ['funeral', 'second-reading', 'new-testament', 'hope', 'comfort']
  },
  {
    title: '1 Corinthians 12:31-13:8a',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>SECOND READING</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>1 Corinthians 12:31-13:8a</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{second_reader.full_name}}</strong></p>

<p><strong>A reading from the first Letter of Saint Paul to the Corinthians</strong></p>

<p>Brothers and sisters: Be zealous for the better gifts. And I shew unto you yet a more excellent way.</p>

<p>If I speak with the tongues of men, and of angels, and have not charity, I am become as sounding brass, or a tinkling cymbal.</p>

<p>And if I should have prophecy and should know all mysteries, and all knowledge, and if I should have all faith, so that I could remove mountains, and have not charity, I am nothing.</p>

<p>And if I should distribute all my goods to feed the poor, and if I should deliver my body to be burned, and have not charity, it profiteth me nothing.</p>

<p>Charity is patient, is kind: charity envieth not, dealeth not perversely; is not puffed up;</p>

<p>Is not ambitious, seeketh not her own, is not provoked to anger, thinketh no evil;</p>

<p>Rejoiceth not in iniquity, but rejoiceth with the truth;</p>

<p>Beareth all things, believeth all things, hopeth all things, endureth all things.</p>

<p>Charity never falleth away.</p>

<p>The word of the Lord.</p>`,
    language: 'en',
    description: 'Wedding reading about love (charity)',
    tags: ['wedding', 'second-reading', 'new-testament', 'love']
  },
  {
    title: 'Colossians 3:12-17',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>SECOND READING</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Colossians 3:12-17</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{second_reader.full_name}}</strong></p>

<p><strong>A reading from the Letter of Saint Paul to the Colossians</strong></p>

<p>Brothers and sisters: Put ye on therefore, as the elect of God, holy, and beloved, the bowels of mercy, benignity, humility, modesty, patience:</p>

<p>Bearing with one another, and forgiving one another, if any have a complaint against another: even as the Lord hath forgiven you, so do you also.</p>

<p>But above all these things have charity, which is the bond of perfection:</p>

<p>And let the peace of Christ rejoice in your hearts, wherein also you are called in one body: and be ye thankful.</p>

<p>Let the word of Christ dwell in you abundantly, in all wisdom: teaching and admonishing one another in psalms, hymns, and spiritual canticles, singing in grace in your hearts to God.</p>

<p>All whatsoever you do in word or in work, do all in the name of the Lord Jesus Christ, giving thanks to God and the Father by him.</p>

<p>The word of the Lord.</p>`,
    language: 'en',
    description: 'Wedding reading about virtues and love',
    tags: ['wedding', 'second-reading', 'new-testament', 'love']
  },
  {
    title: '1 John 3:14-16',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>SECOND READING</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>1 John 3:14-16</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{second_reader.full_name}}</strong></p>

<p><strong>A reading from the first Letter of Saint John</strong></p>

<p>Beloved: We know that we have passed from death to life, because we love the brethren. He that loveth not, abideth in death.</p>

<p>Whosoever hateth his brother is a murderer. And you know that no murderer hath eternal life abiding in himself.</p>

<p>In this we have known the charity of God, because he hath laid down his life for us: and we ought to lay down our lives for the brethren.</p>

<p>The word of the Lord.</p>`,
    language: 'en',
    description: 'Funeral reading about passing from death to life',
    tags: ['funeral', 'second-reading', 'new-testament', 'love', 'eternal-life']
  },
  {
    title: 'Revelation 21:1-5a, 6b-7',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>SECOND READING</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Revelation 21:1-5a, 6b-7</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{second_reader.full_name}}</strong></p>

<p><strong>A reading from the Book of Revelation</strong></p>

<p>I, John, saw a new heaven and a new earth. For the first heaven and the first earth was gone, and the sea is now no more.</p>

<p>And I John saw the holy city, the new Jerusalem, coming down out of heaven from God, prepared as a bride adorned for her husband.</p>

<p>And I heard a great voice from the throne, saying: Behold the tabernacle of God with men, and he will dwell with them. And they shall be his people; and God himself with them shall be their God.</p>

<p>And God shall wipe away all tears from their eyes: and death shall be no more, nor mourning, nor crying, nor sorrow shall be any more, for the former things are passed away.</p>

<p>And he that sat on the throne, said: Behold, I make all things new.</p>

<p>I am Alpha and Omega; the beginning and the end. To him that thirsteth, I will give of the fountain of the water of life, freely.</p>

<p>He that shall overcome shall possess these things, and I will be his God; and he shall be my son.</p>

<p>The word of the Lord.</p>`,
    language: 'en',
    description: 'Funeral reading about the new heaven and new earth',
    tags: ['funeral', 'second-reading', 'new-testament', 'hope', 'eternal-life']
  }
]

// Gospel Readings
const GOSPELS: SeedContent[] = [
  {
    title: 'Matthew 5:1-12a',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>GOSPEL</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Matthew 5:1-12a</strong></p>

<p><strong>A reading from the holy Gospel according to Matthew</strong></p>

<p>At that time: Jesus seeing the multitudes, went up into a mountain, and when he was set down, his disciples came unto him.</p>

<p>And opening his mouth, he taught them, saying:</p>

<p>Blessed are the poor in spirit: for theirs is the kingdom of heaven.</p>

<p>Blessed are the meek: for they shall possess the land.</p>

<p>Blessed are they that mourn: for they shall be comforted.</p>

<p>Blessed are they that hunger and thirst after justice: for they shall have their fill.</p>

<p>Blessed are the merciful: for they shall obtain mercy.</p>

<p>Blessed are the clean of heart: for they shall see God.</p>

<p>Blessed are the peacemakers: for they shall be called children of God.</p>

<p>Blessed are they that suffer persecution for justice' sake: for theirs is the kingdom of heaven.</p>

<p>Blessed are ye when they shall revile you, and persecute you, and speak all that is evil against you, untruly, for my sake:</p>

<p>Be glad and rejoice, for your reward is very great in heaven.</p>

<p>The Gospel of the Lord.</p>`,
    language: 'en',
    description: 'Funeral Gospel - The Beatitudes',
    tags: ['funeral', 'gospel', 'new-testament', 'hope']
  },
  {
    title: 'Matthew 19:3-6',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>GOSPEL</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Matthew 19:3-6</strong></p>

<p><strong>A reading from the holy Gospel according to Matthew</strong></p>

<p>At that time: There came to Jesus the Pharisees tempting him, and saying: Is it lawful for a man to put away his wife for every cause?</p>

<p>Who answering, said to them: Have ye not read, that he who made man from the beginning, made them male and female? And he said:</p>

<p>For this cause shall a man leave father and mother, and shall cleave to his wife, and they two shall be in one flesh.</p>

<p>Therefore now they are not two, but one flesh. What therefore God hath joined together, let no man put asunder.</p>

<p>The Gospel of the Lord.</p>`,
    language: 'en',
    description: 'Wedding Gospel - What God has joined together',
    tags: ['wedding', 'gospel', 'new-testament', 'love']
  },
  {
    title: 'John 11:21-27',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>GOSPEL</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>John 11:21-27</strong></p>

<p><strong>A reading from the holy Gospel according to John</strong></p>

<p>At that time: Martha said to Jesus: Lord, if thou hadst been here, my brother had not died.</p>

<p>But now also I know that whatsoever thou wilt ask of God, God will give it thee.</p>

<p>Jesus saith to her: Thy brother shall rise again.</p>

<p>Martha saith to him: I know that he shall rise again, in the resurrection at the last day.</p>

<p>Jesus said to her: I am the resurrection and the life: he that believeth in me, although he be dead, shall live:</p>

<p>And every one that liveth, and believeth in me, shall not die for ever. Believest thou this?</p>

<p>She saith to him: Yea, Lord, I have believed that thou art Christ the Son of the living God, who art come into this world.</p>

<p>The Gospel of the Lord.</p>`,
    language: 'en',
    description: 'Funeral Gospel - I am the resurrection and the life',
    tags: ['funeral', 'gospel', 'new-testament', 'hope', 'eternal-life']
  },
  {
    title: 'John 15:9-12',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>GOSPEL</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>John 15:9-12</strong></p>

<p><strong>A reading from the holy Gospel according to John</strong></p>

<p>At that time: Jesus said to his disciples: As the Father hath loved me, I also have loved you. Abide in my love.</p>

<p>If you keep my commandments, you shall abide in my love; as I also have kept my Father's commandments, and do abide in his love.</p>

<p>These things I have spoken to you, that my joy may be in you, and your joy may be filled.</p>

<p>This is my commandment, that you love one another, as I have loved you.</p>

<p>The Gospel of the Lord.</p>`,
    language: 'en',
    description: 'Wedding Gospel - Love one another',
    tags: ['wedding', 'gospel', 'new-testament', 'love']
  },
  {
    title: 'John 14:1-6',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>GOSPEL</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>John 14:1-6</strong></p>

<p><strong>A reading from the holy Gospel according to John</strong></p>

<p>At that time: Jesus said to his disciples: Let not your heart be troubled. You believe in God, believe also in me.</p>

<p>In my Father's house there are many mansions. If not, I would have told you: because I go to prepare a place for you.</p>

<p>And if I shall go, and prepare a place for you, I will come again, and will take you to myself; that where I am, you also may be.</p>

<p>And whither I go you know, and the way you know.</p>

<p>Thomas saith to him: Lord, we know not whither thou goest; and how can we know the way?</p>

<p>Jesus saith to him: I am the way, and the truth, and the life. No man cometh to the Father, but by me.</p>

<p>The Gospel of the Lord.</p>`,
    language: 'en',
    description: 'Funeral Gospel - I am the way, the truth, and the life',
    tags: ['funeral', 'gospel', 'new-testament', 'hope', 'comfort']
  }
]

// Responsorial Psalms
const PSALMS: SeedContent[] = [
  {
    title: 'Psalm 23:1-6',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>RESPONSORIAL PSALM</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Psalm 23:1-6</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{first_reader.full_name}}</strong></p>

<p><strong>Reader:</strong> The Lord is my shepherd; there is nothing I shall want.</p>

<p style="color: #c41e3a;"><em>People: The Lord is my shepherd; there is nothing I shall want.</em></p>

<p><strong>Reader:</strong> The Lord is my shepherd; I shall not want.<br>
In verdant pastures he gives me repose;<br>
Beside restful waters he leads me;<br>
he refreshes my soul.<br>
He guides me in right paths for his name's sake.</p>

<p style="color: #c41e3a;"><em>People: The Lord is my shepherd; there is nothing I shall want.</em></p>

<p><strong>Reader:</strong> Even though I walk in the dark valley I fear no evil;<br>
for you are at my side with your rod and your staff<br>
that give me courage.</p>

<p style="color: #c41e3a;"><em>People: The Lord is my shepherd; there is nothing I shall want.</em></p>

<p><strong>Reader:</strong> You spread the table before me in the sight of my foes;<br>
You anoint my head with oil;<br>
my cup overflows.</p>

<p style="color: #c41e3a;"><em>People: The Lord is my shepherd; there is nothing I shall want.</em></p>

<p><strong>Reader:</strong> Only goodness and kindness follow me<br>
all the days of my life;<br>
And I shall dwell in the house of the Lord<br>
for years to come.</p>

<p style="color: #c41e3a;"><em>People: The Lord is my shepherd; there is nothing I shall want.</em></p>`,
    language: 'en',
    description: 'Responsorial Psalm',
    tags: ['funeral', 'psalm', 'old-testament', 'comfort']
  },
  {
    title: 'Psalm 33:12, 18-22',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>RESPONSORIAL PSALM</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Psalm 33:12, 18-22</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{first_reader.full_name}}</strong></p>

<p><strong>Reader:</strong> The earth is full of the goodness of the Lord.</p>

<p style="color: #c41e3a;"><em>People: The earth is full of the goodness of the Lord.</em></p>

<p><strong>Reader:</strong> Blessed the nation whose God is the Lord,<br>
the people he has chosen for his own inheritance.<br>
See, the eyes of the Lord are upon those who fear him,<br>
upon those who hope for his kindness.</p>

<p style="color: #c41e3a;"><em>People: The earth is full of the goodness of the Lord.</em></p>

<p><strong>Reader:</strong> To deliver them from death<br>
and preserve them in spite of famine.<br>
Our soul waits for the Lord,<br>
who is our help and our shield.</p>

<p style="color: #c41e3a;"><em>People: The earth is full of the goodness of the Lord.</em></p>

<p><strong>Reader:</strong> For in him our hearts rejoice;<br>
in his holy name we trust.<br>
May your kindness, O Lord, be upon us<br>
who have put our hope in you.</p>

<p style="color: #c41e3a;"><em>People: The earth is full of the goodness of the Lord.</em></p>`,
    language: 'en',
    description: 'Responsorial Psalm',
    tags: ['wedding', 'psalm', 'old-testament', 'joy']
  },
  {
    title: 'Psalm 103:1-4, 8, 10, 13-18',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>RESPONSORIAL PSALM</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Psalm 103:1-4, 8, 10, 13-18</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{first_reader.full_name}}</strong></p>

<p><strong>Reader:</strong> The Lord is kind and merciful.</p>

<p style="color: #c41e3a;"><em>People: The Lord is kind and merciful.</em></p>

<p><strong>Reader:</strong> Bless the Lord, O my soul;<br>
and all my being, bless his holy name.<br>
Bless the Lord, O my soul,<br>
and forget not all his benefits.</p>

<p style="color: #c41e3a;"><em>People: The Lord is kind and merciful.</em></p>

<p><strong>Reader:</strong> He pardons all your iniquities,<br>
heals all your ills,<br>
He redeems your life from destruction,<br>
crowns you with kindness and compassion.</p>

<p style="color: #c41e3a;"><em>People: The Lord is kind and merciful.</em></p>

<p><strong>Reader:</strong> Merciful and gracious is the Lord,<br>
slow to anger and abounding in kindness.<br>
Not according to our sins does he deal with us,<br>
nor does he requite us according to our crimes.</p>

<p style="color: #c41e3a;"><em>People: The Lord is kind and merciful.</em></p>

<p><strong>Reader:</strong> As a father has compassion on his children,<br>
so the Lord has compassion on those who fear him,<br>
For he knows how we are formed;<br>
he remembers that we are dust.</p>

<p style="color: #c41e3a;"><em>People: The Lord is kind and merciful.</em></p>`,
    language: 'en',
    description: 'Responsorial Psalm',
    tags: ['funeral', 'psalm', 'old-testament', 'comfort', 'hope']
  },
  {
    title: 'Psalm 128:1-5',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>RESPONSORIAL PSALM</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Psalm 128:1-5</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{first_reader.full_name}}</strong></p>

<p><strong>Reader:</strong> Blessed are those who fear the Lord.</p>

<p style="color: #c41e3a;"><em>People: Blessed are those who fear the Lord.</em></p>

<p><strong>Reader:</strong> Blessed are you who fear the Lord,<br>
who walk in his ways!<br>
For you shall eat the fruit of your handiwork;<br>
blessed shall you be, and favored.</p>

<p style="color: #c41e3a;"><em>People: Blessed are those who fear the Lord.</em></p>

<p><strong>Reader:</strong> Your wife shall be like a fruitful vine<br>
in the recesses of your home;<br>
Your children like olive plants<br>
around your table.</p>

<p style="color: #c41e3a;"><em>People: Blessed are those who fear the Lord.</em></p>

<p><strong>Reader:</strong> Behold, thus is the man blessed<br>
who fears the Lord.<br>
The Lord bless you from Zion:<br>
may you see the prosperity of Jerusalem<br>
all the days of your life.</p>

<p style="color: #c41e3a;"><em>People: Blessed are those who fear the Lord.</em></p>`,
    language: 'en',
    description: 'Responsorial Psalm',
    tags: ['wedding', 'psalm', 'old-testament', 'family']
  },
  {
    title: 'Psalm 27:1, 4, 7-9, 13-14',
    body: `<p style="text-align: right; color: #c41e3a;"><strong>RESPONSORIAL PSALM</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Psalm 27:1, 4, 7-9, 13-14</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{first_reader.full_name}}</strong></p>

<p><strong>Reader:</strong> The Lord is my light and my salvation.</p>

<p style="color: #c41e3a;"><em>People: The Lord is my light and my salvation.</em></p>

<p><strong>Reader:</strong> The Lord is my light and my salvation;<br>
whom should I fear?<br>
The Lord is my life's refuge;<br>
of whom should I be afraid?</p>

<p style="color: #c41e3a;"><em>People: The Lord is my light and my salvation.</em></p>

<p><strong>Reader:</strong> One thing I ask of the Lord; this I seek:<br>
To dwell in the house of the Lord<br>
all the days of my life,<br>
That I may gaze on the loveliness of the Lord<br>
and contemplate his temple.</p>

<p style="color: #c41e3a;"><em>People: The Lord is my light and my salvation.</em></p>

<p><strong>Reader:</strong> Hear, O Lord, the sound of my call;<br>
have pity on me, and answer me.<br>
Of you my heart speaks; you my glance seeks.</p>

<p style="color: #c41e3a;"><em>People: The Lord is my light and my salvation.</em></p>

<p><strong>Reader:</strong> I believe that I shall see the bounty of the Lord<br>
in the land of the living.<br>
Wait for the Lord with courage;<br>
be stouthearted, and wait for the Lord.</p>

<p style="color: #c41e3a;"><em>People: The Lord is my light and my salvation.</em></p>`,
    language: 'en',
    description: 'Responsorial Psalm',
    tags: ['funeral', 'psalm', 'old-testament', 'hope', 'comfort']
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
  ...PRESENTATION_CONTENT,
  ...FIRST_READINGS,
  ...SECOND_READINGS,
  ...GOSPELS,
  ...PSALMS
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
  logInfo(`Parish ID: ${parishId}`)
  logInfo(`Content items to seed: ${ALL_SEED_CONTENT.length}`)

  // First, fetch all category tags for this parish to get tag IDs
  const { data: tags, error: tagsError } = await supabase
    .from('category_tags')
    .select('id, slug')
    .eq('parish_id', parishId)

  if (tagsError) {
    logError(`Error fetching category tags: ${tagsError.message}`)
    throw new Error(`Failed to fetch category tags: ${tagsError.message}`)
  }

  logInfo(`Found ${tags?.length || 0} category tags`)

  if (!tags || tags.length === 0) {
    logWarning('No category tags found - skipping content seeding')
    return
  }

  // Create a slug -> id map for quick lookup
  const tagMap = new Map(tags.map(t => [t.slug, t.id]))

  // Insert content items
  let contentCount = 0
  let assignmentCount = 0

  logInfo(`Starting to insert ${ALL_SEED_CONTENT.length} content items...`)

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
      logError(`Error creating content "${content.title}": ${contentError.message}`)
      logError(`  Code: ${contentError.code}, Details: ${contentError.details}, Hint: ${contentError.hint}`)
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
  FIRST_READINGS,
  SECOND_READINGS,
  GOSPELS,
  PSALMS,
  ALL_SEED_CONTENT
}
