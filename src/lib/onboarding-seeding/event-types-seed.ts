/**
 * Event Types Seed Data - Onboarding data for user-defined event types
 *
 * This module creates starter event types for new parishes with:
 * - Base event types (Wedding, Funeral, Baptism, Quinceañera, Presentation)
 * - Input field definitions for each type
 * - Custom lists (Wedding Songs, Funeral Songs)
 * - Default scripts with sections (public domain content only)
 *
 * See /requirements/user-defined-event-types.md Phase 9 for specifications.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { generateSlug } from '@/lib/utils/formatters'

/**
 * Seeds event types for a new parish with starter templates
 *
 * @param supabase - Any Supabase client (server, service role, etc.)
 * @param parishId - The parish ID to seed data for
 */
export async function seedEventTypesForParish(supabase: SupabaseClient, parishId: string) {
  // =====================================================
  // 1. Create Wedding Event Type
  // =====================================================
  const { data: weddingType, error: weddingTypeError } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishId,
      name: 'Wedding',
      description: 'Celebrating the union of two people in marriage.',
      icon: 'VenusAndMars',
      slug: 'weddings',
      order: 1
    })
    .select()
    .single()

  if (weddingTypeError) {
    console.error('Error creating Wedding event type:', weddingTypeError)
    throw new Error(`Failed to create Wedding event type: ${weddingTypeError.message}`)
  }

  // Create Wedding Songs custom list
  const weddingSongsName = 'Wedding Songs'
  const { data: weddingSongsList, error: weddingSongsListError } = await supabase
    .from('custom_lists')
    .insert({
      parish_id: parishId,
      name: weddingSongsName,
      slug: generateSlug(weddingSongsName)
    })
    .select()
    .single()

  if (weddingSongsListError) {
    console.error('Error creating Wedding Songs list:', weddingSongsListError)
    throw new Error(`Failed to create Wedding Songs list: ${weddingSongsListError.message}`)
  }

  // Add items to Wedding Songs list
  const weddingSongItems = [
    'Ave Maria',
    'On This Day, O Beautiful Mother',
    'The Lord\'s Prayer',
    'Panis Angelicus',
    'Joyful, Joyful, We Adore Thee',
    'All Creatures of Our God and King',
    'How Great Thou Art',
    'Here I Am, Lord',
    'The Wedding Song',
    'One Hand, One Heart'
  ]

  const { error: weddingSongItemsError } = await supabase
    .from('custom_list_items')
    .insert(
      weddingSongItems.map((song, index) => ({
        list_id: weddingSongsList.id,
        value: song,
        order: index
      }))
    )

  if (weddingSongItemsError) {
    console.error('Error creating Wedding Song items:', weddingSongItemsError)
    throw new Error(`Failed to create Wedding Song items: ${weddingSongItemsError.message}`)
  }

  // Create input field definitions for Wedding
  const weddingFields = [
    { name: 'Bride', type: 'person', required: true, is_key_person: true, order: 0 },
    { name: 'Groom', type: 'person', required: true, is_key_person: true, order: 1 },
    { name: '---', type: 'spacer', required: false, order: 2 },
    { name: 'Wedding Ceremony', type: 'occasion', required: true, is_primary: true, order: 3 },
    { name: 'Presider', type: 'person', required: false, order: 4 },
    { name: 'Reception Location', type: 'location', required: false, order: 5 },
    { name: '---', type: 'spacer', required: false, order: 6 },
    { name: 'Opening Song', type: 'list_item', required: false, list_id: weddingSongsList.id, order: 7 },
    { name: 'Opening Prayer', type: 'content', required: false, filter_tags: ['wedding', 'opening-prayer'], order: 8 },
    { name: 'Prayers of the Faithful', type: 'petition', required: false, filter_tags: ['wedding', 'prayers-of-the-faithful'], order: 9 },
    { name: 'First Reading', type: 'text', required: false, order: 10 },
    { name: 'Gospel Reading', type: 'text', required: false, order: 11 },
    { name: 'Unity Candle', type: 'yes_no', required: false, order: 12 },
    { name: 'Special Instructions', type: 'rich_text', required: false, order: 13 }
  ]

  const { error: weddingFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      weddingFields.map(field => ({
        event_type_id: weddingType.id,
        ...field,
        is_key_person: field.is_key_person ?? false,
        is_primary: field.is_primary ?? false,
      }))
    )

  if (weddingFieldsError) {
    console.error('Error creating Wedding fields:', weddingFieldsError)
    throw new Error(`Failed to create Wedding fields: ${weddingFieldsError.message}`)
  }

  // Create Wedding scripts
  const { data: weddingEnglishScript, error: weddingEnglishScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: weddingType.id,
      name: 'English Wedding Program',
      order: 0
    })
    .select()
    .single()

  if (weddingEnglishScriptError) {
    console.error('Error creating Wedding English script:', weddingEnglishScriptError)
    throw new Error(`Failed to create Wedding English script: ${weddingEnglishScriptError.message}`)
  }

  // Create sections for English Wedding Program
  const weddingEnglishSections = [
    {
      name: 'Welcome',
      content: `# Wedding Ceremony

Please join us in celebrating the marriage of

**{{Bride}}** and **{{Groom}}**

{{Wedding Date}}
{{Ceremony Location}}`,
      page_break_after: false,
      order: 0
    },
    {
      name: 'Order of Service',
      content: `## Order of Service

1. Processional
2. Opening Prayer
3. Liturgy of the Word
4. Exchange of Consent
5. Blessing and Exchange of Rings
6. Prayer of the Faithful
7. Nuptial Blessing
8. Sign of Peace
9. Recessional`,
      page_break_after: false,
      order: 1
    },
    {
      name: 'Readings',
      content: `## Readings

### First Reading
{{First Reading}}

### Gospel
{{Gospel Reading}}`,
      page_break_after: false,
      order: 2
    },
    {
      name: 'Reception',
      content: `## Reception

Please join us for a reception following the ceremony at:

{{Reception Location}}`,
      page_break_after: false,
      order: 3
    }
  ]

  const { error: weddingEnglishSectionsError } = await supabase
    .from('sections')
    .insert(
      weddingEnglishSections.map(section => ({
        script_id: weddingEnglishScript.id,
        ...section
      }))
    )

  if (weddingEnglishSectionsError) {
    console.error('Error creating Wedding English sections:', weddingEnglishSectionsError)
    throw new Error(`Failed to create Wedding English sections: ${weddingEnglishSectionsError.message}`)
  }

  const { data: weddingSpanishScript, error: weddingSpanishScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: weddingType.id,
      name: 'Spanish Wedding Program',
      order: 1
    })
    .select()
    .single()

  if (weddingSpanishScriptError) {
    console.error('Error creating Wedding Spanish script:', weddingSpanishScriptError)
    throw new Error(`Failed to create Wedding Spanish script: ${weddingSpanishScriptError.message}`)
  }

  // Create sections for Spanish Wedding Program
  const weddingSpanishSections = [
    {
      name: 'Bienvenida',
      content: `# Ceremonia de Matrimonio

Por favor, acompáñenos a celebrar el matrimonio de

**{{Bride}}** y **{{Groom}}**

{{Wedding Date}}
{{Ceremony Location}}`,
      page_break_after: false,
      order: 0
    },
    {
      name: 'Orden del Servicio',
      content: `## Orden del Servicio

1. Procesión
2. Oración Inicial
3. Liturgia de la Palabra
4. Intercambio de Consentimientos
5. Bendición e Intercambio de Anillos
6. Oración de los Fieles
7. Bendición Nupcial
8. Signo de la Paz
9. Recesión`,
      page_break_after: false,
      order: 1
    },
    {
      name: 'Lecturas',
      content: `## Lecturas

### Primera Lectura
{{First Reading}}

### Evangelio
{{Gospel Reading}}`,
      page_break_after: false,
      order: 2
    },
    {
      name: 'Recepción',
      content: `## Recepción

Por favor, acompáñenos para una recepción después de la ceremonia en:

{{Reception Location}}`,
      page_break_after: false,
      order: 3
    }
  ]

  const { error: weddingSpanishSectionsError } = await supabase
    .from('sections')
    .insert(
      weddingSpanishSections.map(section => ({
        script_id: weddingSpanishScript.id,
        ...section
      }))
    )

  if (weddingSpanishSectionsError) {
    console.error('Error creating Wedding Spanish sections:', weddingSpanishSectionsError)
    throw new Error(`Failed to create Wedding Spanish sections: ${weddingSpanishSectionsError.message}`)
  }

  // Create Wedding Worship Aid script (congregation-facing)
  const { data: weddingWorshipAidScript, error: weddingWorshipAidScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: weddingType.id,
      name: 'Worship Aid',
      order: 2
    })
    .select()
    .single()

  if (weddingWorshipAidScriptError) {
    console.error('Error creating Wedding Worship Aid script:', weddingWorshipAidScriptError)
    throw new Error(`Failed to create Wedding Worship Aid script: ${weddingWorshipAidScriptError.message}`)
  }

  // Create sections for Wedding Worship Aid
  const weddingWorshipAidSections = [
    {
      name: 'Cover',
      content: `# The Celebration of Marriage

**{{Bride}}**
&
**{{Groom}}**

{{Wedding Date}}

{{Ceremony Location}}

{{parish.name}}`,
      page_break_after: true,
      order: 0
    },
    {
      name: 'Order of Celebration',
      content: `## Order of Celebration

**Entrance Procession**
{{Opening Song}}

**Greeting**

**Collect (Opening Prayer)**

---

### Liturgy of the Word

**First Reading**

**Responsorial Psalm**

**Gospel**

**Homily**

---

### Celebration of Matrimony

**Questions Before Consent**

**Exchange of Consent**

**Blessing and Exchange of Rings**

---

### Universal Prayer (Prayer of the Faithful)

{{Prayers of the Faithful}}

---

### Nuptial Blessing

---

### Conclusion

**Final Blessing**

**Recessional**`,
      page_break_after: true,
      order: 1
    },
    {
      name: 'Readings',
      content: `## Readings

### First Reading
{{First Reading}}

---

### Gospel
{{Gospel Reading}}`,
      page_break_after: true,
      order: 2
    },
    {
      name: 'Music',
      content: `## Music for the Celebration

**Entrance Procession:** {{Opening Song}}

---

*Please join in singing the hymns as able.*`,
      page_break_after: false,
      order: 3
    }
  ]

  const { error: weddingWorshipAidSectionsError } = await supabase
    .from('sections')
    .insert(
      weddingWorshipAidSections.map(section => ({
        script_id: weddingWorshipAidScript.id,
        ...section
      }))
    )

  if (weddingWorshipAidSectionsError) {
    console.error('Error creating Wedding Worship Aid sections:', weddingWorshipAidSectionsError)
    throw new Error(`Failed to create Wedding Worship Aid sections: ${weddingWorshipAidSectionsError.message}`)
  }

  // =====================================================
  // 2. Create Funeral Event Type
  // =====================================================
  const { data: funeralType, error: funeralTypeError } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishId,
      name: 'Funeral',
      description: 'Honoring the life of the deceased and commending them to God.',
      icon: 'Cross',
      slug: 'funerals',
      order: 2
    })
    .select()
    .single()

  if (funeralTypeError) {
    console.error('Error creating Funeral event type:', funeralTypeError)
    throw new Error(`Failed to create Funeral event type: ${funeralTypeError.message}`)
  }

  // Create Funeral Songs custom list
  const funeralSongsName = 'Funeral Songs'
  const { data: funeralSongsList, error: funeralSongsListError } = await supabase
    .from('custom_lists')
    .insert({
      parish_id: parishId,
      name: funeralSongsName,
      slug: generateSlug(funeralSongsName)
    })
    .select()
    .single()

  if (funeralSongsListError) {
    console.error('Error creating Funeral Songs list:', funeralSongsListError)
    throw new Error(`Failed to create Funeral Songs list: ${funeralSongsListError.message}`)
  }

  // Add items to Funeral Songs list
  const funeralSongItems = [
    'How Great Thou Art',
    'On Eagle\'s Wings',
    'Amazing Grace',
    'Be Not Afraid',
    'Shepherd Me, O God',
    'Ave Maria',
    'The Lord Is My Shepherd',
    'I Am the Bread of Life',
    'Here I Am, Lord',
    'Song of Farewell'
  ]

  const { error: funeralSongItemsError } = await supabase
    .from('custom_list_items')
    .insert(
      funeralSongItems.map((song, index) => ({
        list_id: funeralSongsList.id,
        value: song,
        order: index
      }))
    )

  if (funeralSongItemsError) {
    console.error('Error creating Funeral Song items:', funeralSongItemsError)
    throw new Error(`Failed to create Funeral Song items: ${funeralSongItemsError.message}`)
  }

  // Create input field definitions for Funeral
  const funeralFields = [
    { name: 'Deceased', type: 'person', required: true, is_key_person: true, order: 0 },
    { name: 'Date of Death', type: 'date', required: false, order: 1 },
    { name: 'Funeral Mass', type: 'occasion', required: true, is_primary: true, order: 2 },
    { name: 'Presider', type: 'person', required: false, order: 3 },
    { name: 'Burial Location', type: 'location', required: false, order: 4 },
    { name: 'Visitation Location', type: 'location', required: false, order: 5 },
    { name: '---', type: 'spacer', required: false, order: 6 },
    { name: 'Opening Song', type: 'list_item', required: false, list_id: funeralSongsList.id, order: 7 },
    { name: 'Opening Prayer', type: 'content', required: false, filter_tags: ['funeral', 'opening-prayer'], order: 8 },
    { name: 'Prayers of the Faithful', type: 'petition', required: false, filter_tags: ['funeral', 'prayers-of-the-faithful'], order: 9 },
    { name: 'First Reading', type: 'text', required: false, order: 10 },
    { name: 'Psalm', type: 'text', required: false, order: 11 },
    { name: 'Gospel Reading', type: 'text', required: false, order: 12 },
    { name: 'Eulogy Speaker', type: 'person', required: false, order: 13 },
    { name: 'Special Instructions', type: 'rich_text', required: false, order: 14 }
  ]

  const { error: funeralFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      funeralFields.map(field => ({
        event_type_id: funeralType.id,
        ...field,
        is_key_person: field.is_key_person ?? false,
        is_primary: field.is_primary ?? false,
      }))
    )

  if (funeralFieldsError) {
    console.error('Error creating Funeral fields:', funeralFieldsError)
    throw new Error(`Failed to create Funeral fields: ${funeralFieldsError.message}`)
  }

  // Create Funeral scripts
  const { data: funeralProgramScript, error: funeralProgramScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: funeralType.id,
      name: 'Funeral Program',
      order: 0
    })
    .select()
    .single()

  if (funeralProgramScriptError) {
    console.error('Error creating Funeral Program script:', funeralProgramScriptError)
    throw new Error(`Failed to create Funeral Program script: ${funeralProgramScriptError.message}`)
  }

  // Create sections for Funeral Program
  const funeralProgramSections = [
    {
      name: 'In Loving Memory',
      content: `# In Loving Memory

**{{Deceased}}**

{{Date of Death}}`,
      page_break_after: false,
      order: 0
    },
    {
      name: 'Service Details',
      content: `## Funeral Mass

{{Funeral Date}}

{{Funeral Location}}

Presider: {{Presider}}`,
      page_break_after: false,
      order: 1
    },
    {
      name: 'Order of Service',
      content: `## Order of Service

1. Gathering Song
2. Opening Prayer
3. Liturgy of the Word
4. Homily
5. Prayer of the Faithful
6. Liturgy of the Eucharist
7. Final Commendation
8. Recessional`,
      page_break_after: false,
      order: 2
    },
    {
      name: 'Readings',
      content: `## Readings

### First Reading
{{First Reading}}

### Responsorial Psalm
{{Psalm}}

### Gospel
{{Gospel Reading}}`,
      page_break_after: false,
      order: 3
    },
    {
      name: 'Burial',
      content: `## Burial

Burial will take place at:

{{Burial Location}}`,
      page_break_after: false,
      order: 4
    }
  ]

  const { error: funeralProgramSectionsError } = await supabase
    .from('sections')
    .insert(
      funeralProgramSections.map(section => ({
        script_id: funeralProgramScript.id,
        ...section
      }))
    )

  if (funeralProgramSectionsError) {
    console.error('Error creating Funeral Program sections:', funeralProgramSectionsError)
    throw new Error(`Failed to create Funeral Program sections: ${funeralProgramSectionsError.message}`)
  }

  const { data: funeralBulletinScript, error: funeralBulletinScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: funeralType.id,
      name: 'Bulletin Notice',
      order: 1
    })
    .select()
    .single()

  if (funeralBulletinScriptError) {
    console.error('Error creating Funeral Bulletin script:', funeralBulletinScriptError)
    throw new Error(`Failed to create Funeral Bulletin script: ${funeralBulletinScriptError.message}`)
  }

  // Create sections for Bulletin Notice
  const funeralBulletinSections = [
    {
      name: 'Notice',
      content: `Please pray for the repose of the soul of **{{Deceased}}**, who passed away on {{Date of Death}}.

Funeral Mass will be celebrated on {{Funeral Date}} at {{Funeral Location}}.

May eternal rest grant unto them, O Lord, and let perpetual light shine upon them. May they rest in peace. Amen.`,
      page_break_after: false,
      order: 0
    }
  ]

  const { error: funeralBulletinSectionsError } = await supabase
    .from('sections')
    .insert(
      funeralBulletinSections.map(section => ({
        script_id: funeralBulletinScript.id,
        ...section
      }))
    )

  if (funeralBulletinSectionsError) {
    console.error('Error creating Funeral Bulletin sections:', funeralBulletinSectionsError)
    throw new Error(`Failed to create Funeral Bulletin sections: ${funeralBulletinSectionsError.message}`)
  }

  // Create Funeral Worship Aid script (congregation-facing)
  const { data: funeralWorshipAidScript, error: funeralWorshipAidScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: funeralType.id,
      name: 'Worship Aid',
      order: 2
    })
    .select()
    .single()

  if (funeralWorshipAidScriptError) {
    console.error('Error creating Funeral Worship Aid script:', funeralWorshipAidScriptError)
    throw new Error(`Failed to create Funeral Worship Aid script: ${funeralWorshipAidScriptError.message}`)
  }

  // Create sections for Funeral Worship Aid
  const funeralWorshipAidSections = [
    {
      name: 'Cover',
      content: `# Funeral Mass

**{{Deceased}}**

{{Funeral Date}}

{{Funeral Location}}

{{parish.name}}`,
      page_break_after: true,
      order: 0
    },
    {
      name: 'Order of Mass',
      content: `## Order of Mass

### Introductory Rites

**Greeting of the Body**

**Entrance Procession**
{{Opening Song}}

**Sprinkling with Holy Water**

**Placing of the Pall**

**Entrance into the Church**

**Collect (Opening Prayer)**

---

### Liturgy of the Word

**First Reading**

**Responsorial Psalm**

**Gospel**

**Homily**

---

### Universal Prayer (Prayer of the Faithful)

{{Prayers of the Faithful}}

---

### Liturgy of the Eucharist

**Preparation of the Gifts**

**Eucharistic Prayer**

**Lord's Prayer**

**Sign of Peace**

**Communion**

---

### Final Commendation

**Invitation to Prayer**

**Silence**

**Signs of Farewell**

**Song of Farewell**

**Prayer of Commendation**

**Procession to the Place of Committal**`,
      page_break_after: true,
      order: 1
    },
    {
      name: 'Readings',
      content: `## Readings

### First Reading
{{First Reading}}

---

### Responsorial Psalm
{{Psalm}}

---

### Gospel
{{Gospel Reading}}`,
      page_break_after: true,
      order: 2
    },
    {
      name: 'Responses',
      content: `## Responses

### Responsorial Psalm Response
*The Lord is my shepherd; there is nothing I shall want.*

---

### Gospel Acclamation
*Alleluia, alleluia.*
*I am the resurrection and the life, says the Lord;*
*whoever believes in me, even if he dies, will live.*
*Alleluia.*

---

### Memorial Acclamation
*We proclaim your Death, O Lord,*
*and profess your Resurrection*
*until you come again.*

---

### The Lord's Prayer
*Our Father, who art in heaven,*
*hallowed be thy name;*
*thy kingdom come,*
*thy will be done*
*on earth as it is in heaven.*
*Give us this day our daily bread,*
*and forgive us our trespasses,*
*as we forgive those who trespass against us;*
*and lead us not into temptation,*
*but deliver us from evil.*

*For thine is the kingdom,*
*and the power, and the glory,*
*for ever and ever. Amen.*`,
      page_break_after: true,
      order: 3
    },
    {
      name: 'Music',
      content: `## Music for the Liturgy

**Entrance Hymn:** {{Opening Song}}

---

*Please join in singing the hymns as able.*

---

### Committal

Burial will take place at:

{{Burial Location}}`,
      page_break_after: false,
      order: 4
    }
  ]

  const { error: funeralWorshipAidSectionsError } = await supabase
    .from('sections')
    .insert(
      funeralWorshipAidSections.map(section => ({
        script_id: funeralWorshipAidScript.id,
        ...section
      }))
    )

  if (funeralWorshipAidSectionsError) {
    console.error('Error creating Funeral Worship Aid sections:', funeralWorshipAidSectionsError)
    throw new Error(`Failed to create Funeral Worship Aid sections: ${funeralWorshipAidSectionsError.message}`)
  }

  // =====================================================
  // 3. Create Baptism Event Type
  // =====================================================
  const { data: baptismType, error: baptismTypeError } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishId,
      name: 'Baptism',
      description: 'Welcoming new members into the faith through the waters of baptism.',
      icon: 'Droplet',
      slug: 'baptisms',
      order: 3
    })
    .select()
    .single()

  if (baptismTypeError) {
    console.error('Error creating Baptism event type:', baptismTypeError)
    throw new Error(`Failed to create Baptism event type: ${baptismTypeError.message}`)
  }

  // Create input field definitions for Baptism
  const baptismFields = [
    { name: 'Child', type: 'person', required: true, is_key_person: true, order: 0 },
    { name: 'Mother', type: 'person', required: false, order: 1 },
    { name: 'Father', type: 'person', required: false, order: 2 },
    { name: 'Godmother', type: 'person', required: false, order: 3 },
    { name: 'Godfather', type: 'person', required: false, order: 4 },
    { name: '---', type: 'spacer', required: false, order: 5 },
    { name: 'Baptism', type: 'occasion', required: true, is_primary: true, order: 6 },
    { name: 'Presider', type: 'person', required: false, order: 7 },
    { name: 'Opening Prayer', type: 'content', required: false, filter_tags: ['baptism', 'opening-prayer'], order: 8 },
    { name: 'Special Instructions', type: 'rich_text', required: false, order: 9 }
  ]

  const { error: baptismFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      baptismFields.map(field => ({
        event_type_id: baptismType.id,
        ...field,
        is_key_person: field.is_key_person ?? false,
        is_primary: field.is_primary ?? false,
      }))
    )

  if (baptismFieldsError) {
    console.error('Error creating Baptism fields:', baptismFieldsError)
    throw new Error(`Failed to create Baptism fields: ${baptismFieldsError.message}`)
  }

  // Create Baptism script
  const { data: baptismProgramScript, error: baptismProgramScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: baptismType.id,
      name: 'Baptism Program',
      order: 0
    })
    .select()
    .single()

  if (baptismProgramScriptError) {
    console.error('Error creating Baptism Program script:', baptismProgramScriptError)
    throw new Error(`Failed to create Baptism Program script: ${baptismProgramScriptError.message}`)
  }

  // Create sections for Baptism Program
  const baptismProgramSections = [
    {
      name: 'Welcome',
      content: `# Baptism

Please join us in celebrating the Baptism of

**{{Child}}**

{{Baptism Date}}
{{Baptism Location}}`,
      page_break_after: false,
      order: 0
    },
    {
      name: 'Family',
      content: `## Family

**Parents:** {{Mother}} and {{Father}}

**Godparents:** {{Godmother}} and {{Godfather}}`,
      page_break_after: false,
      order: 1
    },
    {
      name: 'Order of Service',
      content: `## Order of Service

1. Reception of the Child
2. Celebration of God's Word
3. Celebration of the Sacrament
   - Prayer over the Water
   - Renunciation of Sin and Profession of Faith
   - Baptism
   - Anointing with Chrism
   - Clothing with White Garment
   - Lighted Candle
4. Conclusion of the Rite
   - Lord's Prayer
   - Blessing`,
      page_break_after: false,
      order: 2
    }
  ]

  const { error: baptismProgramSectionsError } = await supabase
    .from('sections')
    .insert(
      baptismProgramSections.map(section => ({
        script_id: baptismProgramScript.id,
        ...section
      }))
    )

  if (baptismProgramSectionsError) {
    console.error('Error creating Baptism Program sections:', baptismProgramSectionsError)
    throw new Error(`Failed to create Baptism Program sections: ${baptismProgramSectionsError.message}`)
  }

  // =====================================================
  // 4. Create Quinceañera Event Type
  // =====================================================
  const { data: quinceaneraType, error: quinceaneraTypeError } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishId,
      name: 'Quinceañera',
      description: 'Celebrating a young woman\'s fifteenth birthday and her transition to adulthood.',
      icon: 'BookHeart',
      slug: 'quinceaneras',
      order: 4
    })
    .select()
    .single()

  if (quinceaneraTypeError) {
    console.error('Error creating Quinceañera event type:', quinceaneraTypeError)
    throw new Error(`Failed to create Quinceañera event type: ${quinceaneraTypeError.message}`)
  }

  // Create input field definitions for Quinceañera
  const quinceaneraFields = [
    { name: 'Quinceañera', type: 'person', required: true, is_key_person: true, order: 0 },
    { name: 'Mother', type: 'person', required: false, order: 1 },
    { name: 'Father', type: 'person', required: false, order: 2 },
    { name: '---', type: 'spacer', required: false, order: 3 },
    { name: 'Quinceañera Mass', type: 'occasion', required: true, is_primary: true, order: 4 },
    { name: 'Presider', type: 'person', required: false, order: 5 },
    { name: 'Reception Location', type: 'location', required: false, order: 6 },
    { name: 'Court of Honor', type: 'group', required: false, order: 7 },
    { name: 'Opening Prayer', type: 'content', required: false, filter_tags: ['quinceanera', 'opening-prayer'], order: 8 },
    { name: 'Special Instructions', type: 'rich_text', required: false, order: 9 }
  ]

  const { error: quinceaneraFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      quinceaneraFields.map(field => ({
        event_type_id: quinceaneraType.id,
        ...field,
        is_key_person: field.is_key_person ?? false,
        is_primary: field.is_primary ?? false,
      }))
    )

  if (quinceaneraFieldsError) {
    console.error('Error creating Quinceañera fields:', quinceaneraFieldsError)
    throw new Error(`Failed to create Quinceañera fields: ${quinceaneraFieldsError.message}`)
  }

  // Create Quinceañera script
  const { data: quinceaneraProgramScript, error: quinceaneraProgramScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: quinceaneraType.id,
      name: 'Quinceañera Program',
      order: 0
    })
    .select()
    .single()

  if (quinceaneraProgramScriptError) {
    console.error('Error creating Quinceañera Program script:', quinceaneraProgramScriptError)
    throw new Error(`Failed to create Quinceañera Program script: ${quinceaneraProgramScriptError.message}`)
  }

  // Create sections for Quinceañera Program
  const quinceaneraProgramSections = [
    {
      name: 'Welcome',
      content: `# Quinceañera

Please join us in celebrating the Quinceañera of

**{{Quinceañera}}**

{{Ceremony Date}}
{{Ceremony Location}}`,
      page_break_after: false,
      order: 0
    },
    {
      name: 'Order of Service',
      content: `## Order of Service

1. Processional
2. Opening Prayer
3. Liturgy of the Word
4. Renewal of Baptismal Promises
5. Presentation of Gifts
6. Blessing
7. Prayer of Thanksgiving
8. Recessional`,
      page_break_after: false,
      order: 1
    },
    {
      name: 'Prayer',
      content: `## Prayer for Quinceañera

Lord God, you who are our Father and Creator, we thank you for the gift of life and for the blessing of family. Today we celebrate {{Quinceañera}} as she marks her fifteenth birthday. We ask your blessing upon her as she continues her journey of faith. Guide her steps, strengthen her resolve, and fill her heart with your love. May she always know that she is your beloved daughter. We ask this through Christ our Lord. Amen.`,
      page_break_after: false,
      order: 2
    },
    {
      name: 'Reception',
      content: `## Reception

Please join us for a reception following the ceremony at:

{{Reception Location}}`,
      page_break_after: false,
      order: 3
    }
  ]

  const { error: quinceaneraProgramSectionsError } = await supabase
    .from('sections')
    .insert(
      quinceaneraProgramSections.map(section => ({
        script_id: quinceaneraProgramScript.id,
        ...section
      }))
    )

  if (quinceaneraProgramSectionsError) {
    console.error('Error creating Quinceañera Program sections:', quinceaneraProgramSectionsError)
    throw new Error(`Failed to create Quinceañera Program sections: ${quinceaneraProgramSectionsError.message}`)
  }

  // =====================================================
  // 5. Create Presentation Event Type
  // =====================================================
  const { data: presentationType, error: presentationTypeError } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishId,
      name: 'Presentation',
      description: 'Presenting a child to God and asking for His blessing.',
      icon: 'HandHeartIcon',
      slug: 'presentations',
      order: 5
    })
    .select()
    .single()

  if (presentationTypeError) {
    console.error('Error creating Presentation event type:', presentationTypeError)
    throw new Error(`Failed to create Presentation event type: ${presentationTypeError.message}`)
  }

  // Create input field definitions for Presentation
  const presentationFields = [
    { name: 'Child', type: 'person', required: true, is_key_person: true, order: 0 },
    { name: 'Mother', type: 'person', required: false, order: 1 },
    { name: 'Father', type: 'person', required: false, order: 2 },
    { name: 'Godmother', type: 'person', required: false, order: 3 },
    { name: 'Godfather', type: 'person', required: false, order: 4 },
    { name: '---', type: 'spacer', required: false, order: 5 },
    { name: 'Presentation', type: 'occasion', required: true, is_primary: true, order: 6 },
    { name: 'Presider', type: 'person', required: false, order: 7 },
    { name: 'Opening Prayer', type: 'content', required: false, filter_tags: ['presentation', 'opening-prayer'], order: 8 },
    { name: 'Special Instructions', type: 'rich_text', required: false, order: 9 }
  ]

  const { error: presentationFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      presentationFields.map(field => ({
        event_type_id: presentationType.id,
        ...field,
        is_key_person: field.is_key_person ?? false,
        is_primary: field.is_primary ?? false,
      }))
    )

  if (presentationFieldsError) {
    console.error('Error creating Presentation fields:', presentationFieldsError)
    throw new Error(`Failed to create Presentation fields: ${presentationFieldsError.message}`)
  }

  // Create Presentation script
  const { data: presentationProgramScript, error: presentationProgramScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: presentationType.id,
      name: 'Presentation Program',
      order: 0
    })
    .select()
    .single()

  if (presentationProgramScriptError) {
    console.error('Error creating Presentation Program script:', presentationProgramScriptError)
    throw new Error(`Failed to create Presentation Program script: ${presentationProgramScriptError.message}`)
  }

  // Create sections for Presentation Program
  const presentationProgramSections = [
    {
      name: 'Welcome',
      content: `# Presentation of the Child

Please join us in celebrating the Presentation of

**{{Child}}**

{{Presentation Date}}
{{Presentation Location}}`,
      page_break_after: false,
      order: 0
    },
    {
      name: 'Family',
      content: `## Family

**Parents:** {{Mother}} and {{Father}}

**Godparents:** {{Godmother}} and {{Godfather}}`,
      page_break_after: false,
      order: 1
    },
    {
      name: 'Order of Service',
      content: `## Order of Service

1. Gathering
2. Opening Prayer
3. Reading from Scripture
4. Presentation of the Child
5. Blessing of Parents and Godparents
6. Blessing of the Child
7. Lord's Prayer
8. Final Blessing`,
      page_break_after: false,
      order: 2
    },
    {
      name: 'Prayer',
      content: `## Prayer for the Child

Lord God, we present this child to you in thanksgiving for the gift of life. Bless {{Child}} and watch over them. Guide the parents {{Mother}} and {{Father}} as they raise their child in faith. May the godparents {{Godmother}} and {{Godfather}} support them on this journey. We ask this through Christ our Lord. Amen.`,
      page_break_after: false,
      order: 3
    }
  ]

  const { error: presentationProgramSectionsError } = await supabase
    .from('sections')
    .insert(
      presentationProgramSections.map(section => ({
        script_id: presentationProgramScript.id,
        ...section
      }))
    )

  if (presentationProgramSectionsError) {
    console.error('Error creating Presentation Program sections:', presentationProgramSectionsError)
    throw new Error(`Failed to create Presentation Program sections: ${presentationProgramSectionsError.message}`)
  }

  // =====================================================
  // 6. Create "Other" Event Type (for general parish events)
  // =====================================================
  const { data: otherType, error: otherTypeError } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishId,
      name: 'Other',
      description: 'General parish events and activities.',
      icon: 'CalendarDays',
      slug: 'other',
      order: 6
    })
    .select()
    .single()

  if (otherTypeError) {
    console.error('Error creating Other event type:', otherTypeError)
    throw new Error(`Failed to create Other event type: ${otherTypeError.message}`)
  }

  // "Other" has no input field definitions - it uses only the base event fields

  return {
    success: true,
    eventTypes: [weddingType, funeralType, baptismType, quinceaneraType, presentationType, otherType]
  }
}
