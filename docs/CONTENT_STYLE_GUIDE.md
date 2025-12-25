# Content Style Guide

> **Purpose:** Standard formatting patterns for liturgical content stored in the database.
> **Related:** [STYLE_VALUES.md](./STYLE_VALUES.md) for font sizes, [SCRIPT_EXPORT_STYLING.md](./SCRIPT_EXPORT_STYLING.md) for export details.

---

## Available Styles

| Style | Syntax | Usage |
|-------|--------|-------|
| **Right-aligned italic** | `<div style="text-align: right; font-style: italic;">` | Scripture references (pericope) |
| **Right-aligned red** | `<div style="text-align: right; color: #c41e3a;">` | Reading type labels |
| **Bold** | `<strong>text</strong>` | Introductions, Reader labels |
| **Italic** | `<em>text</em>` | Emphasis, people responses |
| **Red text** | `style="color: #c41e3a;"` | Rubrics, people responses, instructions |
| **Paragraph** | `<p>text</p>` | Body text |
| **Line break** | `<br>` | Poetry/verse line breaks within a paragraph |
| **Centered** | `<p style="text-align: center;">` | Titles, special headings |

**Liturgical Red:** `#c41e3a` - Use for reading titles, rubrics, instructions, people responses.

---

## Liturgical Reading Format

Use this pattern for First Reading, Second Reading, and Gospel:

```html
<p style="text-align: right; color: #c41e3a;"><strong>FIRST READING</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Genesis 1:26-28, 31a</strong></p>

<p><strong>A reading from the Book of Genesis</strong></p>

<p>God said: "Let us make man to our image and likeness: and let him have dominion over the fishes of the sea, and the fowls of the air, and the beasts, and the whole earth, and every creeping creature that moveth upon the earth."</p>

<p>And God created man to his own image: to the image of God he created him: male and female he created them.</p>

<p>And God saw all the things that he had made, and they were very good.</p>

<p>The word of the Lord.</p>
```

### Reading Structure

1. **Reading Type** (right-aligned, red, bold, uppercase) - FIRST READING, SECOND READING, or GOSPEL
2. **Pericope** (right-aligned, red, bold) - Scripture reference
3. **Introduction** (bold) - "A reading from..." or "A reading from the holy Gospel..."
4. **Scripture Text** (paragraphs) - The actual reading, one paragraph per logical section
5. **Conclusion** (plain text) - "The word of the Lord." or "The Gospel of the Lord."

**Note:** The reader name is added by the script template and appears after the pericope, styled right-aligned, red, and bold.

### Gospel Variation

For Gospel readings, use:
- `<p style="text-align: right; color: #c41e3a;"><strong>GOSPEL</strong></p>`
- Introduction: `<p><strong>A reading from the holy Gospel according to Matthew</strong></p>`
- Conclusion: `<p>The Gospel of the Lord.</p>`

---

## Responsorial Psalm Format

Use this pattern for all psalms:

```html
<p style="text-align: right; color: #c41e3a;"><strong>RESPONSORIAL PSALM</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Psalm 23:1-6</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{first_reader.full_name}}</strong></p>

<p><strong>Reader:</strong> The Lord is my shepherd; there is nothing I shall want.</p>

<p style="color: #c41e3a;"><em>People: The Lord is my shepherd; there is nothing I shall want.</em></p>

<p><strong>Reader:</strong> The Lord is my shepherd; I shall not want.<br>
In verdant pastures he gives me repose;<br>
Beside restful waters he leads me;<br>
he refreshes my soul.</p>

<p style="color: #c41e3a;"><em>People: The Lord is my shepherd; there is nothing I shall want.</em></p>

<p><strong>Reader:</strong> Even though I walk in the dark valley I fear no evil;<br>
for you are at my side with your rod and your staff<br>
that give me courage.</p>

<p style="color: #c41e3a;"><em>People: The Lord is my shepherd; there is nothing I shall want.</em></p>

<p><strong>Reader:</strong> You spread the table before me in the sight of my foes;<br>
You anoint my head with oil;<br>
my cup overflows.</p>

<p style="color: #c41e3a;"><em>People: The Lord is my shepherd; there is nothing I shall want.</em></p>

<p><strong>Reader:</strong> Only goodness and kindness follow me all the days of my life;<br>
And I shall dwell in the house of the Lord for years to come.</p>

<p style="color: #c41e3a;"><em>People: The Lord is my shepherd; there is nothing I shall want.</em></p>
```

### Psalm Structure

1. **Psalm Type** (right-aligned, red, bold, uppercase) - RESPONSORIAL PSALM
2. **Pericope** (right-aligned, red, bold) - Psalm reference
3. **Reader Name** (right-aligned, red, bold) - `{{first_reader.full_name}}` placeholder
4. **Response Introduction** (Reader announces response)
5. **People Response** (red, italic) - Congregation sings/says response
6. **Verse Stanzas** - Alternating:
   - `<p><strong>Reader:</strong> verse lines with <br> for line breaks</p>`
   - `<p style="color: #c41e3a;"><em>People: response text</em></p>`

### Key Points

- Use `<br>` for line breaks within a stanza (poetry formatting)
- Each stanza is its own `<p>` tag with `<strong>Reader:</strong>` prefix
- People response is always: `<p style="color: #c41e3a;"><em>People: response</em></p>`
- No "The word of the Lord" conclusion for psalms

---

## Quick Reference

### Reading Template (Copy/Paste)

```html
<p style="text-align: right; color: #c41e3a;"><strong>[FIRST READING|SECOND READING|GOSPEL]</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>[BOOK CHAPTER:VERSES]</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{first_reader.full_name|second_reader.full_name}}</strong></p>

<p><strong>A reading from [the Book of X | the Letter of Saint X | the holy Gospel according to X]</strong></p>

<p>[Scripture text paragraph 1]</p>

<p>[Scripture text paragraph 2]</p>

<p>[The word of the Lord. | The Gospel of the Lord.]</p>
```

### Psalm Template (Copy/Paste)

```html
<p style="text-align: right; color: #c41e3a;"><strong>RESPONSORIAL PSALM</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>Psalm [NUMBER:VERSES]</strong></p>

<p style="text-align: right; color: #c41e3a;"><strong>{{first_reader.full_name}}</strong></p>

<p><strong>Reader:</strong> [Response text]</p>

<p style="color: #c41e3a;"><em>People: [Response text]</em></p>

<p><strong>Reader:</strong> [Verse line 1]<br>
[Verse line 2]<br>
[Verse line 3]</p>

<p style="color: #c41e3a;"><em>People: [Response text]</em></p>
```

---

## Related Documentation

- [STYLE_VALUES.md](./STYLE_VALUES.md) - Font sizes, spacing, colors
- [SCRIPT_EXPORT_STYLING.md](./SCRIPT_EXPORT_STYLING.md) - How styles render across formats
- [LITURGICAL_SCRIPT_REFERENCE.md](./LITURGICAL_SCRIPT_REFERENCE.md) - Element types
