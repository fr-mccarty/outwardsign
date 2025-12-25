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
 *
 * INPUT_FILTER_TAGS ON INPUT FIELDS:
 * ===================================
 * Content-type input fields use `input_filter_tags` to specify default picker filters.
 * Tags are matched by `slug` from category_tags table. Users can toggle
 * these filters on/off in the picker UI.
 *
 * PATTERN:
 * --------
 * input_filter_tags typically combines:
 * 1. A SACRAMENT slug: 'wedding', 'funeral', 'baptism', 'quinceanera', 'presentation'
 * 2. A SECTION slug: 'first-reading', 'opening-prayer', 'psalm', etc.
 *
 * EXAMPLE:
 * --------
 * { name: 'First Reading', type: 'content', input_filter_tags: ['wedding', 'first-reading'] }
 * - Picker defaults to content tagged with BOTH 'wedding' AND 'first-reading'
 *
 * AVAILABLE TAG SLUGS:
 * --------------------
 * See category-tags-seed.ts for the complete list of available slugs.
 * Common slugs used here:
 * - Sacraments: 'wedding', 'funeral', 'baptism', 'quinceanera', 'presentation'
 * - Sections: 'reading', 'first-reading', 'second-reading', 'psalm', 'gospel',
 *             'opening-prayer', 'closing-prayer', 'prayers-of-the-faithful'
 *
 * ADDING NEW CONTENT FIELDS:
 * --------------------------
 * 1. Define the input field with type: 'content'
 * 2. Set input_filter_tags using slugs from category-tags-seed.ts
 * 3. Ensure content-seed.ts has sample content with matching tags
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { generateSlug } from '@/lib/utils/formatters'
import { logError } from '@/lib/utils/console'

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
      system_type: 'special-liturgy',
      order: 1
    })
    .select()
    .single()

  if (weddingTypeError) {
    logError(`Error creating Wedding event type: ${weddingTypeError.message}`)
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
    { name: 'Bride', property_name: 'bride', type: 'person', required: true, is_key_person: true, order: 0 },
    { name: 'Groom', property_name: 'groom', type: 'person', required: true, is_key_person: true, order: 1 },
    { name: '---', property_name: 'spacer_1', type: 'spacer', required: false, order: 2 },
    { name: 'Wedding Ceremony', property_name: 'wedding_ceremony', type: 'calendar_event', required: true, is_primary: true, order: 3 },
    { name: 'Wedding Rehearsal', property_name: 'wedding_rehearsal', type: 'calendar_event', required: false, is_primary: false, order: 4 },
    { name: 'Presider', property_name: 'presider', type: 'person', required: false, order: 5 },
    { name: 'Reception Location', property_name: 'reception_location', type: 'location', required: false, order: 6 },
    { name: '---', property_name: 'spacer_2', type: 'spacer', required: false, order: 7 },
    { name: 'Opening Song', property_name: 'opening_song', type: 'list_item', required: false, list_id: weddingSongsList.id, order: 8 },
    { name: 'Opening Prayer', property_name: 'opening_prayer', type: 'content', required: false, input_filter_tags: ['wedding', 'opening-prayer'], order: 9 },
    { name: 'Prayers of the Faithful', property_name: 'prayers_of_the_faithful', type: 'petition', required: false, input_filter_tags: ['wedding', 'prayers-of-the-faithful'], order: 10 },
    { name: '---', property_name: 'spacer_3', type: 'spacer', required: false, order: 11 },
    { name: 'First Reader', property_name: 'first_reader', type: 'person', required: false, order: 12 },
    { name: 'First Reading', property_name: 'first_reading', type: 'content', required: false, input_filter_tags: ['wedding', 'first-reading'], order: 13 },
    { name: 'Responsorial Psalm', property_name: 'psalm', type: 'content', required: false, input_filter_tags: ['wedding', 'psalm'], order: 14 },
    { name: 'Second Reader', property_name: 'second_reader', type: 'person', required: false, order: 15 },
    { name: 'Second Reading', property_name: 'second_reading', type: 'content', required: false, input_filter_tags: ['wedding', 'second-reading'], order: 16 },
    { name: 'Gospel Reading', property_name: 'gospel_reading', type: 'content', required: false, input_filter_tags: ['wedding', 'gospel'], order: 17 },
    { name: '---', property_name: 'spacer_4', type: 'spacer', required: false, order: 18 },
    { name: 'Unity Candle', property_name: 'unity_candle', type: 'yes_no', required: false, order: 19 },
    { name: 'Special Instructions', property_name: 'special_instructions', type: 'rich_text', required: false, order: 20 }
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

**{{bride.full_name}}** and **{{groom.full_name}}**

{{wedding_ceremony}}`,
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
**Reader:** {{first_reader.full_name}}

{{first_reading}}

### Responsorial Psalm
{{psalm}}

### Second Reading
**Reader:** {{second_reader.full_name}}

{{second_reading}}

### Gospel
{{gospel_reading}}`,
      page_break_after: false,
      order: 2
    },
    {
      name: 'Reception',
      content: `## Reception

Please join us for a reception following the ceremony at:

{{reception_location.name}}`,
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

**{{bride.full_name}}** y **{{groom.full_name}}**

{{wedding_ceremony}}`,
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
**Lector:** {{first_reader.full_name}}

{{first_reading}}

### Salmo Responsorial
{{psalm}}

### Segunda Lectura
**Lector:** {{second_reader.full_name}}

{{second_reading}}

### Evangelio
{{gospel_reading}}`,
      page_break_after: false,
      order: 2
    },
    {
      name: 'Recepción',
      content: `## Recepción

Por favor, acompáñenos para una recepción después de la ceremonia en:

{{reception_location.name}}`,
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

**{{bride.full_name}}**
&
**{{groom.full_name}}**

{{wedding_ceremony}}

{{parish.name}}`,
      page_break_after: true,
      order: 0
    },
    {
      name: 'Order of Celebration',
      content: `## Order of Celebration

**Entrance Procession**
{{opening_song}}

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

{{prayers_of_the_faithful}}

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
      name: 'First Reading',
      content: `<p><strong>Reader:</strong> {{first_reader.full_name}}</p>

{{first_reading}}`,
      page_break_after: true,
      order: 2
    },
    {
      name: 'Responsorial Psalm',
      content: `{{psalm}}`,
      page_break_after: true,
      order: 3
    },
    {
      name: 'Second Reading',
      content: `<p><strong>Reader:</strong> {{second_reader.full_name}}</p>

{{second_reading}}`,
      page_break_after: true,
      order: 4
    },
    {
      name: 'Gospel',
      content: `{{gospel_reading}}`,
      page_break_after: true,
      order: 5
    },
    {
      name: 'Music',
      content: `## Music for the Celebration

**Entrance Procession:** {{opening_song}}

---

*Please join in singing the hymns as able.*`,
      page_break_after: false,
      order: 6
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
      system_type: 'special-liturgy',
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
    { name: 'Deceased', property_name: 'deceased', type: 'person', required: true, is_key_person: true, order: 0 },
    { name: 'Date of Death', property_name: 'date_of_death', type: 'date', required: false, order: 1 },
    { name: 'Funeral Mass', property_name: 'funeral_mass', type: 'calendar_event', required: true, is_primary: true, order: 2 },
    { name: 'Presider', property_name: 'presider', type: 'person', required: false, order: 3 },
    { name: 'Burial Location', property_name: 'burial_location', type: 'location', required: false, order: 4 },
    { name: 'Visitation Location', property_name: 'visitation_location', type: 'location', required: false, order: 5 },
    { name: '---', property_name: 'spacer_1', type: 'spacer', required: false, order: 6 },
    { name: 'Opening Song', property_name: 'opening_song', type: 'list_item', required: false, list_id: funeralSongsList.id, order: 7 },
    { name: 'Opening Prayer', property_name: 'opening_prayer', type: 'content', required: false, input_filter_tags: ['funeral', 'opening-prayer'], order: 8 },
    { name: 'Prayers of the Faithful', property_name: 'prayers_of_the_faithful', type: 'petition', required: false, input_filter_tags: ['funeral', 'prayers-of-the-faithful'], order: 9 },
    { name: '---', property_name: 'spacer_2', type: 'spacer', required: false, order: 10 },
    { name: 'First Reader', property_name: 'first_reader', type: 'person', required: false, order: 11 },
    { name: 'First Reading', property_name: 'first_reading', type: 'content', required: false, input_filter_tags: ['funeral', 'first-reading'], order: 12 },
    { name: 'Responsorial Psalm', property_name: 'psalm', type: 'content', required: false, input_filter_tags: ['funeral', 'psalm'], order: 13 },
    { name: 'Second Reader', property_name: 'second_reader', type: 'person', required: false, order: 14 },
    { name: 'Second Reading', property_name: 'second_reading', type: 'content', required: false, input_filter_tags: ['funeral', 'second-reading'], order: 15 },
    { name: 'Gospel Reading', property_name: 'gospel_reading', type: 'content', required: false, input_filter_tags: ['funeral', 'gospel'], order: 16 },
    { name: '---', property_name: 'spacer_3', type: 'spacer', required: false, order: 17 },
    { name: 'Eulogy Speaker', property_name: 'eulogy_speaker', type: 'person', required: false, order: 18 },
    { name: 'Special Instructions', property_name: 'special_instructions', type: 'rich_text', required: false, order: 19 }
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

**{{deceased.full_name}}**

{{date_of_death}}`,
      page_break_after: false,
      order: 0
    },
    {
      name: 'Service Details',
      content: `## Funeral Mass

{{funeral_mass}}

Presider: {{presider.full_name}}`,
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
**Reader:** {{first_reader.full_name}}

{{first_reading}}

### Responsorial Psalm
{{psalm}}

### Second Reading
**Reader:** {{second_reader.full_name}}

{{second_reading}}

### Gospel
{{gospel_reading}}`,
      page_break_after: false,
      order: 3
    },
    {
      name: 'Burial',
      content: `## Burial

Burial will take place at:

{{burial_location.name}}`,
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
      content: `Please pray for the repose of the soul of **{{deceased.full_name}}**, who passed away on {{date_of_death}}.

Funeral Mass will be celebrated at {{funeral_mass}}.

May eternal rest grant unto {{deceased.sex | him | her}}, O Lord, and let perpetual light shine upon {{deceased.sex | him | her}}. May {{deceased.sex | he | she}} rest in peace. Amen.`,
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

**{{deceased.full_name}}**

{{funeral_mass}}

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
{{opening_song}}

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

{{prayers_of_the_faithful}}

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
      name: 'First Reading',
      content: `<p><strong>Reader:</strong> {{first_reader.full_name}}</p>

{{first_reading}}`,
      page_break_after: true,
      order: 2
    },
    {
      name: 'Responsorial Psalm',
      content: `{{psalm}}`,
      page_break_after: true,
      order: 3
    },
    {
      name: 'Second Reading',
      content: `<p><strong>Reader:</strong> {{second_reader.full_name}}</p>

{{second_reading}}`,
      page_break_after: true,
      order: 4
    },
    {
      name: 'Gospel',
      content: `{{gospel_reading}}`,
      page_break_after: true,
      order: 5
    },
    {
      name: 'Petitions',
      content: `{{prayers_of_the_faithful}}`,
      page_break_after: true,
      order: 6
    },
    {
      name: 'Music',
      content: `## Music for the Liturgy

**Entrance Hymn:** {{opening_song}}

---

*Please join in singing the hymns as able.*

---

### Committal

Burial will take place at:

{{burial_location.name}}`,
      page_break_after: false,
      order: 7
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
      system_type: 'special-liturgy',
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
    { name: 'Child', property_name: 'child', type: 'person', required: true, is_key_person: true, order: 0 },
    { name: 'Mother', property_name: 'mother', type: 'person', required: false, order: 1 },
    { name: 'Father', property_name: 'father', type: 'person', required: false, order: 2 },
    { name: 'Godmother', property_name: 'godmother', type: 'person', required: false, order: 3 },
    { name: 'Godfather', property_name: 'godfather', type: 'person', required: false, order: 4 },
    { name: '---', property_name: 'spacer_1', type: 'spacer', required: false, order: 5 },
    { name: 'Baptism', property_name: 'baptism', type: 'calendar_event', required: true, is_primary: true, order: 6 },
    { name: 'Presider', property_name: 'presider', type: 'person', required: false, order: 7 },
    { name: 'Opening Prayer', property_name: 'opening_prayer', type: 'content', required: false, input_filter_tags: ['baptism', 'opening-prayer'], order: 8 },
    { name: 'Special Instructions', property_name: 'special_instructions', type: 'rich_text', required: false, order: 9 }
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

**{{child.full_name}}**

{{baptism}}`,
      page_break_after: false,
      order: 0
    },
    {
      name: 'Family',
      content: `## Family

**Parents:** {{mother.full_name}} and {{father.full_name}}

**Godparents:** {{godmother.full_name}} and {{godfather.full_name}}`,
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
      system_type: 'special-liturgy',
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
    { name: 'Quinceañera', property_name: 'quinceanera', type: 'person', required: true, is_key_person: true, order: 0 },
    { name: 'Mother', property_name: 'mother', type: 'person', required: false, order: 1 },
    { name: 'Father', property_name: 'father', type: 'person', required: false, order: 2 },
    { name: '---', property_name: 'spacer_1', type: 'spacer', required: false, order: 3 },
    { name: 'Quinceañera Mass', property_name: 'quinceanera_mass', type: 'calendar_event', required: true, is_primary: true, order: 4 },
    { name: 'Presider', property_name: 'presider', type: 'person', required: false, order: 5 },
    { name: 'Reception Location', property_name: 'reception_location', type: 'location', required: false, order: 6 },
    { name: 'Court of Honor', property_name: 'court_of_honor', type: 'group', required: false, order: 7 },
    { name: 'Opening Prayer', property_name: 'opening_prayer', type: 'content', required: false, input_filter_tags: ['quinceanera', 'opening-prayer'], order: 8 },
    { name: 'Special Instructions', property_name: 'special_instructions', type: 'rich_text', required: false, order: 9 }
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

**{{quinceanera.full_name}}**

{{quinceanera_mass}}`,
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

Lord God, you who are our Father and Creator, we thank you for the gift of life and for the blessing of family. Today we celebrate {{quinceanera.first_name}} as she marks her fifteenth birthday. We ask your blessing upon her as she continues her journey of faith. Guide her steps, strengthen her resolve, and fill her heart with your love. May she always know that she is your beloved daughter. We ask this through Christ our Lord. Amen.`,
      page_break_after: false,
      order: 2
    },
    {
      name: 'Reception',
      content: `## Reception

Please join us for a reception following the ceremony at:

{{reception_location.name}}`,
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
      system_type: 'special-liturgy',
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
    { name: 'Child', property_name: 'child', type: 'person', required: true, is_key_person: true, order: 0 },
    { name: 'Mother', property_name: 'mother', type: 'person', required: false, order: 1 },
    { name: 'Father', property_name: 'father', type: 'person', required: false, order: 2 },
    { name: 'Godmother', property_name: 'godmother', type: 'person', required: false, order: 3 },
    { name: 'Godfather', property_name: 'godfather', type: 'person', required: false, order: 4 },
    { name: '---', property_name: 'spacer_1', type: 'spacer', required: false, order: 5 },
    { name: 'Presentation', property_name: 'presentation', type: 'calendar_event', required: true, is_primary: true, order: 6 },
    { name: 'Presider', property_name: 'presider', type: 'person', required: false, order: 7 },
    { name: 'Opening Prayer', property_name: 'opening_prayer', type: 'content', required: false, input_filter_tags: ['presentation', 'opening-prayer'], order: 8 },
    { name: 'Special Instructions', property_name: 'special_instructions', type: 'rich_text', required: false, order: 9 }
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

**{{child.full_name}}**

{{presentation}}`,
      page_break_after: false,
      order: 0
    },
    {
      name: 'Family',
      content: `## Family

**Parents:** {{mother.full_name}} and {{father.full_name}}

**Godparents:** {{godmother.full_name}} and {{godfather.full_name}}`,
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

Lord God, we present this child to you in thanksgiving for the gift of life. Bless {{child.first_name}} and watch over {{child.sex | him | her}}. Guide the parents {{mother.first_name}} and {{father.first_name}} as they raise their child in faith. May the godparents {{godmother.first_name}} and {{godfather.first_name}} support them on this journey. We ask this through Christ our Lord. Amen.`,
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
  // 6. Create Bible Study Event Type
  // =====================================================
  const { data: bibleStudyType, error: bibleStudyTypeError } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishId,
      name: 'Bible Study',
      description: 'Regular Bible study and scripture reflection gatherings.',
      icon: 'Book',
      slug: 'bible-studies',
      system_type: 'parish-event',
      order: 6
    })
    .select()
    .single()

  if (bibleStudyTypeError) {
    console.error('Error creating Bible Study event type:', bibleStudyTypeError)
    throw new Error(`Failed to create Bible Study event type: ${bibleStudyTypeError.message}`)
  }

  // Create input field definitions for Bible Study
  const bibleStudyFields = [
    { name: 'Session', property_name: 'session', type: 'calendar_event', required: true, is_primary: true, order: 0 },
    { name: 'Discussion Leader', property_name: 'discussion_leader', type: 'person', required: false, is_key_person: true, order: 1 },
    { name: 'Topic', property_name: 'topic', type: 'text', required: false, order: 2 },
    { name: 'Scripture Passage', property_name: 'scripture_passage', type: 'content', required: false, input_filter_tags: ['reading'], order: 3 },
    { name: 'Discussion Questions', property_name: 'discussion_questions', type: 'rich_text', required: false, order: 4 },
    { name: 'Resources', property_name: 'resources', type: 'document', required: false, order: 5 },
    { name: 'Expected Attendance', property_name: 'expected_attendance', type: 'number', required: false, order: 6 },
    { name: 'Notes', property_name: 'notes', type: 'rich_text', required: false, order: 7 }
  ]

  const { error: bibleStudyFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      bibleStudyFields.map(field => ({
        event_type_id: bibleStudyType.id,
        ...field,
        is_key_person: field.is_key_person ?? false,
        is_primary: field.is_primary ?? false,
      }))
    )

  if (bibleStudyFieldsError) {
    console.error('Error creating Bible Study fields:', bibleStudyFieldsError)
    throw new Error(`Failed to create Bible Study fields: ${bibleStudyFieldsError.message}`)
  }

  // Create Bible Study script
  const { data: bibleStudyScript, error: bibleStudyScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: bibleStudyType.id,
      name: 'Bible Study Session Plan',
      order: 0
    })
    .select()
    .single()

  if (bibleStudyScriptError) {
    console.error('Error creating Bible Study script:', bibleStudyScriptError)
    throw new Error(`Failed to create Bible Study script: ${bibleStudyScriptError.message}`)
  }

  // Create sections for Bible Study Session Plan
  const bibleStudyScriptSections = [
    {
      name: 'Session Information',
      content: `# Bible Study Session

{{parish.name}}

**Date:** {{session}}

**Leader:** {{discussion_leader.full_name}}

**Topic:** {{topic}}`,
      page_break_after: false,
      order: 0
    },
    {
      name: 'Scripture',
      content: `## Scripture Passage

{{scripture_passage}}`,
      page_break_after: false,
      order: 1
    },
    {
      name: 'Discussion Questions',
      content: `## Discussion Questions

{{discussion_questions}}`,
      page_break_after: false,
      order: 2
    },
    {
      name: 'Notes',
      content: `## Session Notes

{{notes}}

---

**Expected Attendance:** {{expected_attendance}}`,
      page_break_after: false,
      order: 3
    }
  ]

  const { error: bibleStudyScriptSectionsError } = await supabase
    .from('sections')
    .insert(
      bibleStudyScriptSections.map(section => ({
        script_id: bibleStudyScript.id,
        ...section
      }))
    )

  if (bibleStudyScriptSectionsError) {
    console.error('Error creating Bible Study script sections:', bibleStudyScriptSectionsError)
    throw new Error(`Failed to create Bible Study script sections: ${bibleStudyScriptSectionsError.message}`)
  }

  // =====================================================
  // 7. Create Fundraiser Event Type
  // =====================================================
  const { data: fundraiserType, error: fundraiserTypeError } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishId,
      name: 'Fundraiser',
      description: 'Parish fundraising events and activities.',
      icon: 'DollarSign',
      slug: 'fundraisers',
      system_type: 'parish-event',
      order: 7
    })
    .select()
    .single()

  if (fundraiserTypeError) {
    console.error('Error creating Fundraiser event type:', fundraiserTypeError)
    throw new Error(`Failed to create Fundraiser event type: ${fundraiserTypeError.message}`)
  }

  // Create input field definitions for Fundraiser
  const fundraiserFields = [
    { name: 'Event Date', property_name: 'event_date', type: 'calendar_event', required: true, is_primary: true, order: 0 },
    { name: 'Event Coordinator', property_name: 'event_coordinator', type: 'person', required: false, is_key_person: true, order: 1 },
    { name: 'Fundraising Goal', property_name: 'fundraising_goal', type: 'number', required: false, order: 2 },
    { name: 'Event Description', property_name: 'event_description', type: 'rich_text', required: false, order: 3 },
    { name: 'Volunteer Needs', property_name: 'volunteer_needs', type: 'rich_text', required: false, order: 4 },
    { name: 'Setup Notes', property_name: 'setup_notes', type: 'rich_text', required: false, order: 5 },
    { name: 'Cleanup Notes', property_name: 'cleanup_notes', type: 'rich_text', required: false, order: 6 }
  ]

  const { error: fundraiserFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      fundraiserFields.map(field => ({
        event_type_id: fundraiserType.id,
        ...field,
        is_key_person: field.is_key_person ?? false,
        is_primary: field.is_primary ?? false,
      }))
    )

  if (fundraiserFieldsError) {
    console.error('Error creating Fundraiser fields:', fundraiserFieldsError)
    throw new Error(`Failed to create Fundraiser fields: ${fundraiserFieldsError.message}`)
  }

  // Create Fundraiser script
  const { data: fundraiserScript, error: fundraiserScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: fundraiserType.id,
      name: 'Fundraiser Plan',
      order: 0
    })
    .select()
    .single()

  if (fundraiserScriptError) {
    console.error('Error creating Fundraiser script:', fundraiserScriptError)
    throw new Error(`Failed to create Fundraiser script: ${fundraiserScriptError.message}`)
  }

  // Create sections for Fundraiser Plan
  const fundraiserScriptSections = [
    {
      name: 'Event Information',
      content: '# Fundraiser Event\n\n{{parish.name}}\n\n**Date:** {{event_date}}\n\n**Coordinator:** {{event_coordinator.full_name}}\n\n**Fundraising Goal:** ${{fundraising_goal}}',
      page_break_after: false,
      order: 0
    },
    {
      name: 'Event Description',
      content: `## Event Description

{{event_description}}`,
      page_break_after: false,
      order: 1
    },
    {
      name: 'Volunteer Needs',
      content: `## Volunteer Needs

{{volunteer_needs}}`,
      page_break_after: false,
      order: 2
    },
    {
      name: 'Setup',
      content: `## Setup Notes

{{setup_notes}}`,
      page_break_after: false,
      order: 3
    },
    {
      name: 'Cleanup',
      content: `## Cleanup Notes

{{cleanup_notes}}`,
      page_break_after: false,
      order: 4
    }
  ]

  const { error: fundraiserScriptSectionsError } = await supabase
    .from('sections')
    .insert(
      fundraiserScriptSections.map(section => ({
        script_id: fundraiserScript.id,
        ...section
      }))
    )

  if (fundraiserScriptSectionsError) {
    console.error('Error creating Fundraiser script sections:', fundraiserScriptSectionsError)
    throw new Error(`Failed to create Fundraiser script sections: ${fundraiserScriptSectionsError.message}`)
  }

  // =====================================================
  // 8. Create Religious Education Event Type
  // =====================================================
  const { data: religiousEdType, error: religiousEdTypeError } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishId,
      name: 'Religious Education',
      description: 'Faith formation classes and catechesis programs.',
      icon: 'GraduationCap',
      slug: 'religious-education',
      system_type: 'parish-event',
      order: 8
    })
    .select()
    .single()

  if (religiousEdTypeError) {
    console.error('Error creating Religious Education event type:', religiousEdTypeError)
    throw new Error(`Failed to create Religious Education event type: ${religiousEdTypeError.message}`)
  }

  // Create input field definitions for Religious Education
  const religiousEdFields = [
    { name: 'Class Session', property_name: 'class_session', type: 'calendar_event', required: true, is_primary: true, order: 0 },
    { name: 'Catechist', property_name: 'catechist', type: 'person', required: false, is_key_person: true, order: 1 },
    { name: 'Grade Level', property_name: 'grade_level', type: 'text', required: false, order: 2 },
    { name: 'Lesson Topic', property_name: 'lesson_topic', type: 'text', required: false, order: 3 },
    { name: 'Lesson Plan', property_name: 'lesson_plan', type: 'rich_text', required: false, order: 4 },
    { name: 'Materials Needed', property_name: 'materials_needed', type: 'rich_text', required: false, order: 5 },
    { name: 'Homework Assignment', property_name: 'homework_assignment', type: 'rich_text', required: false, order: 6 }
  ]

  const { error: religiousEdFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      religiousEdFields.map(field => ({
        event_type_id: religiousEdType.id,
        ...field,
        is_key_person: field.is_key_person ?? false,
        is_primary: field.is_primary ?? false,
      }))
    )

  if (religiousEdFieldsError) {
    console.error('Error creating Religious Education fields:', religiousEdFieldsError)
    throw new Error(`Failed to create Religious Education fields: ${religiousEdFieldsError.message}`)
  }

  // Create Religious Education script
  const { data: religiousEdScript, error: religiousEdScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: religiousEdType.id,
      name: 'Lesson Plan',
      order: 0
    })
    .select()
    .single()

  if (religiousEdScriptError) {
    console.error('Error creating Religious Education script:', religiousEdScriptError)
    throw new Error(`Failed to create Religious Education script: ${religiousEdScriptError.message}`)
  }

  // Create sections for Religious Education Lesson Plan
  const religiousEdScriptSections = [
    {
      name: 'Class Information',
      content: `# Religious Education Lesson Plan

{{parish.name}}

**Date:** {{class_session}}

**Catechist:** {{catechist.full_name}}

**Grade Level:** {{grade_level}}

**Topic:** {{lesson_topic}}`,
      page_break_after: false,
      order: 0
    },
    {
      name: 'Lesson Plan',
      content: `## Lesson Plan

{{lesson_plan}}`,
      page_break_after: false,
      order: 1
    },
    {
      name: 'Materials',
      content: `## Materials Needed

{{materials_needed}}`,
      page_break_after: false,
      order: 2
    },
    {
      name: 'Homework',
      content: `## Homework Assignment

{{homework_assignment}}`,
      page_break_after: false,
      order: 3
    }
  ]

  const { error: religiousEdScriptSectionsError } = await supabase
    .from('sections')
    .insert(
      religiousEdScriptSections.map(section => ({
        script_id: religiousEdScript.id,
        ...section
      }))
    )

  if (religiousEdScriptSectionsError) {
    console.error('Error creating Religious Education script sections:', religiousEdScriptSectionsError)
    throw new Error(`Failed to create Religious Education script sections: ${religiousEdScriptSectionsError.message}`)
  }

  // =====================================================
  // 9. Create Staff Meeting Event Type
  // =====================================================
  const { data: staffMeetingType, error: staffMeetingTypeError } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishId,
      name: 'Staff Meeting',
      description: 'Parish staff meetings and administrative gatherings.',
      icon: 'Users',
      slug: 'staff-meetings',
      system_type: 'parish-event',
      order: 9
    })
    .select()
    .single()

  if (staffMeetingTypeError) {
    console.error('Error creating Staff Meeting event type:', staffMeetingTypeError)
    throw new Error(`Failed to create Staff Meeting event type: ${staffMeetingTypeError.message}`)
  }

  // Create input field definitions for Staff Meeting
  const staffMeetingFields = [
    { name: 'Meeting Date', property_name: 'meeting_date', type: 'calendar_event', required: true, is_primary: true, order: 0 },
    { name: 'Meeting Leader', property_name: 'meeting_leader', type: 'person', required: false, is_key_person: true, order: 1 },
    { name: 'Agenda', property_name: 'agenda', type: 'rich_text', required: false, order: 2 },
    { name: 'Meeting Minutes', property_name: 'meeting_minutes', type: 'rich_text', required: false, order: 3 },
    { name: 'Action Items', property_name: 'action_items', type: 'rich_text', required: false, order: 4 },
    { name: 'Attachments', property_name: 'attachments', type: 'document', required: false, order: 5 }
  ]

  const { error: staffMeetingFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      staffMeetingFields.map(field => ({
        event_type_id: staffMeetingType.id,
        ...field,
        is_key_person: field.is_key_person ?? false,
        is_primary: field.is_primary ?? false,
      }))
    )

  if (staffMeetingFieldsError) {
    console.error('Error creating Staff Meeting fields:', staffMeetingFieldsError)
    throw new Error(`Failed to create Staff Meeting fields: ${staffMeetingFieldsError.message}`)
  }

  // Create Staff Meeting script
  const { data: staffMeetingScript, error: staffMeetingScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: staffMeetingType.id,
      name: 'Meeting Agenda',
      order: 0
    })
    .select()
    .single()

  if (staffMeetingScriptError) {
    console.error('Error creating Staff Meeting script:', staffMeetingScriptError)
    throw new Error(`Failed to create Staff Meeting script: ${staffMeetingScriptError.message}`)
  }

  // Create sections for Staff Meeting Agenda
  const staffMeetingScriptSections = [
    {
      name: 'Meeting Information',
      content: `# Staff Meeting

{{parish.name}}

**Date:** {{meeting_date}}

**Leader:** {{meeting_leader.full_name}}`,
      page_break_after: false,
      order: 0
    },
    {
      name: 'Agenda',
      content: `## Agenda

{{agenda}}`,
      page_break_after: false,
      order: 1
    },
    {
      name: 'Minutes',
      content: `## Meeting Minutes

{{meeting_minutes}}`,
      page_break_after: false,
      order: 2
    },
    {
      name: 'Action Items',
      content: `## Action Items

{{action_items}}`,
      page_break_after: false,
      order: 3
    }
  ]

  const { error: staffMeetingScriptSectionsError } = await supabase
    .from('sections')
    .insert(
      staffMeetingScriptSections.map(section => ({
        script_id: staffMeetingScript.id,
        ...section
      }))
    )

  if (staffMeetingScriptSectionsError) {
    console.error('Error creating Staff Meeting script sections:', staffMeetingScriptSectionsError)
    throw new Error(`Failed to create Staff Meeting script sections: ${staffMeetingScriptSectionsError.message}`)
  }

  // =====================================================
  // 10. Create "Other" Event Type (for general parish events)
  // =====================================================
  const { data: otherType, error: otherTypeError } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishId,
      name: 'Other',
      description: 'General parish events and activities.',
      icon: 'CalendarDays',
      slug: 'other',
      system_type: 'parish-event',
      order: 10
    })
    .select()
    .single()

  if (otherTypeError) {
    console.error('Error creating Other event type:', otherTypeError)
    throw new Error(`Failed to create Other event type: ${otherTypeError.message}`)
  }

  // "Other" has no input field definitions - it uses only the base event fields

  // Collect event types by category for reporting
  const specialLiturgyTypes = [
    weddingType,
    funeralType,
    baptismType,
    quinceaneraType,
    presentationType
  ]

  const generalEventTypes = [
    bibleStudyType,
    fundraiserType,
    religiousEdType,
    staffMeetingType,
    otherType
  ]

  return {
    success: true,
    eventTypes: [
      weddingType,
      funeralType,
      baptismType,
      quinceaneraType,
      presentationType,
      bibleStudyType,
      fundraiserType,
      religiousEdType,
      staffMeetingType,
      otherType
    ],
    specialLiturgyCount: specialLiturgyTypes.length,
    generalEventCount: generalEventTypes.length
  }
}
