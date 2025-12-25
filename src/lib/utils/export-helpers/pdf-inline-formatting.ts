/**
 * PDF Inline Formatting Parser
 *
 * Parses HTML with inline styles and converts to pdfmake text runs.
 * Handles: <strong>, <b>, <em>, <i>, <u>, <span style="color:...;font-size:...">
 */

// Liturgical red color
const RED_COLOR = '#c41e3a'

type PdfTextSegment = {
  text: string
  bold?: boolean
  italics?: boolean
  decoration?: string
  color?: string
  fontSize?: number
}

/**
 * Parses inline HTML/formatting and converts to pdfmake text runs
 * Handles: <strong>, <b>, <em>, <i>, <u>, <span style="color:...;font-size:...">
 * Also strips: <a> tags (converting to plain text)
 */
export function parseInlineFormatting(text: string): string | PdfTextSegment[] {
  // First, strip <a> tags but keep their text content
  const cleanedText = text.replace(/<a[^>]*>(.*?)<\/a>/g, '$1')

  // If no formatting at all, return plain text
  if (!/</.test(cleanedText)) {
    return cleanedText
  }

  const segments: PdfTextSegment[] = []

  // Process the text character by character, tracking open tags
  let currentText = ''
  let i = 0

  while (i < cleanedText.length) {
    if (cleanedText[i] === '<') {
      // Find the end of the tag
      const tagEnd = cleanedText.indexOf('>', i)
      if (tagEnd === -1) {
        currentText += cleanedText[i]
        i++
        continue
      }

      const tagContent = cleanedText.slice(i + 1, tagEnd)

      // Check for closing tags
      if (tagContent.startsWith('/')) {
        // Push current text if any
        if (currentText) {
          segments.push({ text: currentText })
          currentText = ''
        }
        i = tagEnd + 1
        continue
      }

      // Check for self-closing tags like <br> or <br/>
      if (tagContent === 'br' || tagContent === 'br/') {
        currentText += '\n'
        i = tagEnd + 1
        continue
      }

      // Handle opening tags
      const tagName = tagContent.split(/\s/)[0].toLowerCase()

      // Find the matching closing tag and extract content
      const closeTag = `</${tagName}>`
      const closeIndex = cleanedText.indexOf(closeTag, tagEnd)

      if (closeIndex === -1) {
        // No closing tag found, treat as regular text
        currentText += cleanedText.slice(i, tagEnd + 1)
        i = tagEnd + 1
        continue
      }

      // Push any text before this tag
      if (currentText) {
        segments.push({ text: currentText })
        currentText = ''
      }

      const innerContent = cleanedText.slice(tagEnd + 1, closeIndex)
      const segment: PdfTextSegment = { text: innerContent }

      // Apply formatting based on tag
      if (tagName === 'strong' || tagName === 'b') {
        segment.bold = true
      } else if (tagName === 'em' || tagName === 'i') {
        segment.italics = true
      } else if (tagName === 'u') {
        segment.decoration = 'underline'
      } else if (tagName === 'span') {
        // Parse style attribute
        const styleMatch = tagContent.match(/style=["']([^"']+)["']/)
        if (styleMatch) {
          const style = styleMatch[1]

          // Check for color
          const colorMatch = style.match(/color:\s*([^;]+)/)
          if (colorMatch) {
            const color = colorMatch[1].trim()
            // Normalize "red" to hex
            segment.color = color === 'red' ? RED_COLOR : color
          }

          // Check for font-size
          const fontSizeMatch = style.match(/font-size:\s*([^;]+)/)
          if (fontSizeMatch) {
            const fontSize = fontSizeMatch[1].trim()
            // Convert em to pt (base 11pt)
            if (fontSize.endsWith('em')) {
              const emValue = parseFloat(fontSize)
              segment.fontSize = Math.round(11 * emValue)
            }
          }
        }
      }

      // Recursively parse inner content for nested tags
      const innerParsed = parseInlineFormatting(innerContent)
      if (Array.isArray(innerParsed)) {
        // Apply outer formatting to each inner segment
        for (const innerSeg of innerParsed) {
          const mergedSeg = { ...innerSeg }
          if (segment.bold) mergedSeg.bold = true
          if (segment.italics) mergedSeg.italics = true
          if (segment.decoration) mergedSeg.decoration = segment.decoration
          if (segment.color) mergedSeg.color = segment.color
          if (segment.fontSize) mergedSeg.fontSize = segment.fontSize
          segments.push(mergedSeg)
        }
      } else {
        segment.text = innerParsed
        segments.push(segment)
      }

      i = closeIndex + closeTag.length
    } else {
      currentText += cleanedText[i]
      i++
    }
  }

  // Push any remaining text
  if (currentText) {
    segments.push({ text: currentText })
  }

  // If only one segment with no special formatting, return as string
  if (segments.length === 1 && !segments[0].bold && !segments[0].italics && !segments[0].color && !segments[0].fontSize && !segments[0].decoration) {
    return segments[0].text
  }

  // Clean up segments - remove empty text segments
  const cleanedSegments = segments.filter(s => s.text !== '')

  // Return array of text runs for pdfmake
  return cleanedSegments.length > 0 ? cleanedSegments : cleanedText
}
