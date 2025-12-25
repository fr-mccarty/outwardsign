/**
 * DOCX Text Run Creator
 *
 * Creates styled TextRun objects for docx library from HTML with inline styles.
 * Handles: <strong>, <b>, <em>, <i>, <u>, <span style="color:...;font-size:...">
 */

import { TextRun } from 'docx'

// Liturgical red color (without # prefix for Word)
const RED_COLOR = 'c41e3a'

// Font settings
const FONT_FAMILY = 'Times New Roman'

// Unit conversion helpers
const POINT_TO_HALF_POINT = 2 // Word uses half-points for font size

/**
 * Creates styled text runs from content with inline formatting
 * Handles: <strong>, <b>, <em>, <i>, <u>, <span style="color:...;font-size:...">
 * Also strips: <a> tags (converting to plain text)
 */
export function createStyledTextRuns(text: string, baseFontSize: number): TextRun[] {
  // First, strip <a> tags but keep their text content
  const cleanedText = text.replace(/<a[^>]*>(.*?)<\/a>/g, '$1')

  // If no formatting at all, return plain text
  if (!/</.test(cleanedText)) {
    return [
      new TextRun({
        text: cleanedText,
        font: FONT_FAMILY,
        size: baseFontSize * POINT_TO_HALF_POINT
      })
    ]
  }

  const runs: TextRun[] = []
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
          runs.push(
            new TextRun({
              text: currentText,
              font: FONT_FAMILY,
              size: baseFontSize * POINT_TO_HALF_POINT
            })
          )
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
        runs.push(
          new TextRun({
            text: currentText,
            font: FONT_FAMILY,
            size: baseFontSize * POINT_TO_HALF_POINT
          })
        )
        currentText = ''
      }

      const innerContent = cleanedText.slice(tagEnd + 1, closeIndex)
      const runOptions: {
        text: string
        font: string
        size: number
        bold?: boolean
        italics?: boolean
        underline?: object
        color?: string
      } = {
        text: innerContent,
        font: FONT_FAMILY,
        size: baseFontSize * POINT_TO_HALF_POINT
      }

      // Apply formatting based on tag
      if (tagName === 'strong' || tagName === 'b') {
        runOptions.bold = true
      } else if (tagName === 'em' || tagName === 'i') {
        runOptions.italics = true
      } else if (tagName === 'u') {
        runOptions.underline = {}
      } else if (tagName === 'span') {
        // Parse style attribute
        const styleMatch = tagContent.match(/style=["']([^"']+)["']/)
        if (styleMatch) {
          const style = styleMatch[1]

          // Check for color
          const colorMatch = style.match(/color:\s*([^;]+)/)
          if (colorMatch) {
            const color = colorMatch[1].trim()
            // Normalize "red" to hex, strip # for Word
            if (color === 'red' || color === '#c41e3a') {
              runOptions.color = RED_COLOR
            } else if (color.startsWith('#')) {
              runOptions.color = color.substring(1) // Remove # for Word
            }
          }

          // Check for font-size
          const fontSizeMatch = style.match(/font-size:\s*([^;]+)/)
          if (fontSizeMatch) {
            const fontSizeValue = fontSizeMatch[1].trim()
            // Convert em to pt (base 11pt)
            if (fontSizeValue.endsWith('em')) {
              const emValue = parseFloat(fontSizeValue)
              runOptions.size = Math.round(11 * emValue) * POINT_TO_HALF_POINT
            }
          }
        }
      }

      // Recursively parse inner content for nested tags
      const innerRuns = createStyledTextRuns(innerContent, baseFontSize)
      for (const innerRun of innerRuns) {
        // Merge outer formatting with inner runs (TextRun instances need spreading)
        const mergedOptions: any = { ...innerRun }
        if (runOptions.bold) mergedOptions.bold = true
        if (runOptions.italics) mergedOptions.italics = true
        if (runOptions.underline) mergedOptions.underline = runOptions.underline
        if (runOptions.color) mergedOptions.color = runOptions.color
        if (runOptions.size !== baseFontSize * POINT_TO_HALF_POINT) {
          mergedOptions.size = runOptions.size
        }
        runs.push(new TextRun(mergedOptions))
      }

      i = closeIndex + closeTag.length
    } else {
      currentText += cleanedText[i]
      i++
    }
  }

  // Push any remaining text
  if (currentText) {
    runs.push(
      new TextRun({
        text: currentText,
        font: FONT_FAMILY,
        size: baseFontSize * POINT_TO_HALF_POINT
      })
    )
  }

  // If only one segment with no special formatting, return as simple text run
  if (runs.length === 0) {
    return [
      new TextRun({
        text: cleanedText.replace(/<[^>]*>/g, ''),
        font: FONT_FAMILY,
        size: baseFontSize * POINT_TO_HALF_POINT
      })
    ]
  }

  return runs
}

// Export constants for use in route files
export { FONT_FAMILY, POINT_TO_HALF_POINT }
