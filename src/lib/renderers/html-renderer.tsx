/**
 * HTML/React Renderer
 *
 * Converts LiturgyDocument to React JSX using global styles from liturgical-script-styles.ts
 */

import React from 'react'
import {
  LiturgyDocument,
  ContentSection,
  ContentElement,
} from '@/lib/types/liturgy-content'
import { ELEMENT_STYLES, LITURGY_COLORS, LITURGY_FONT, convert } from '@/lib/styles/liturgical-script-styles'

// ============================================================================
// STYLE HELPERS
// ============================================================================

/**
 * Convert element style to HTML CSS properties
 */
function getElementStyle(elementType: keyof typeof ELEMENT_STYLES): React.CSSProperties {
  if (elementType === 'spacer') {
    return {} // Spacer handled separately
  }

  const style = ELEMENT_STYLES[elementType]

  return {
    fontSize: `${convert.pointsToPx(style.fontSize)}px`,
    fontWeight: style.bold ? 'bold' : 'normal',
    fontStyle: style.italic ? 'italic' : 'normal',
    color: style.color === 'liturgy-red' ? LITURGY_COLORS.liturgyRed : LITURGY_COLORS.black,
    textAlign: style.alignment,
    marginTop: `${convert.pointsToPx(style.marginTop)}px`,
    marginBottom: `${convert.pointsToPx(style.marginBottom)}px`,
    lineHeight: style.lineHeight,
    fontFamily: LITURGY_FONT,
    whiteSpace: style.preserveLineBreaks ? 'pre-wrap' : 'normal',
  }
}

// ============================================================================
// ELEMENT RENDERERS
// ============================================================================

/**
 * Render a single content element to React JSX
 */
function renderElement(element: ContentElement, index: number): React.ReactNode {
  switch (element.type) {
    case 'event-title':
      return (
        <div key={index} style={getElementStyle('event-title')}>
          {element.text}
        </div>
      )

    case 'event-datetime':
      return (
        <div key={index} style={getElementStyle('event-datetime')}>
          {element.text}
        </div>
      )

    case 'section-title':
      return (
        <div key={index} style={getElementStyle('section-title')}>
          {element.text}
        </div>
      )

    case 'reading-title':
      return (
        <div key={index} style={getElementStyle('reading-title')}>
          {element.text}
        </div>
      )

    case 'pericope':
      return (
        <div key={index} style={getElementStyle('pericope')}>
          {element.text}
        </div>
      )

    case 'reader-name':
      return (
        <div key={index} style={getElementStyle('reader-name')}>
          {element.text}
        </div>
      )

    case 'introduction':
      return (
        <div key={index} style={getElementStyle('introduction')}>
          {element.text}
        </div>
      )

    case 'reading-text':
      return (
        <div key={index} style={getElementStyle('reading-text')}>
          {element.text}
        </div>
      )

    case 'conclusion':
      return (
        <div key={index} style={getElementStyle('conclusion')}>
          {element.text}
        </div>
      )

    case 'response':
      return (
        <div key={index} style={getElementStyle('response')}>
          <span style={{ fontWeight: 'bold' }}>{element.label}</span>
          {' '}
          {element.text}
        </div>
      )

    case 'priest-dialogue':
      return (
        <div key={index} style={getElementStyle('priest-dialogue')}>
          {element.text}
        </div>
      )

    case 'petition':
      return (
        <div key={index} style={getElementStyle('petition')}>
          <span style={{ fontWeight: 'bold', color: LITURGY_COLORS.liturgyRed }}>
            {element.label}
          </span>
          {' '}
          {element.text}
        </div>
      )

    case 'text':
      return (
        <div key={index} style={getElementStyle('text')}>
          {element.text}
        </div>
      )

    case 'rubric':
      return (
        <div key={index} style={getElementStyle('rubric')}>
          {element.text}
        </div>
      )

    case 'prayer-text':
      return (
        <div key={index} style={getElementStyle('prayer-text')}>
          {element.text}
        </div>
      )

    case 'priest-text':
      return (
        <div key={index} style={getElementStyle('priest-text')}>
          {element.text}
        </div>
      )

    case 'info-row':
      return (
        <div key={index} className="liturgy-info-grid">
          <div className="liturgy-info-label">{element.label}</div>
          <div>{element.value}</div>
        </div>
      )

    case 'spacer':
      const spacerSize = element.size === 'large'
        ? ELEMENT_STYLES.spacer.large
        : element.size === 'medium'
        ? ELEMENT_STYLES.spacer.medium
        : ELEMENT_STYLES.spacer.small
      return <div key={index} style={{ marginBottom: `${convert.pointsToPx(spacerSize)}px` }} />

    case 'multi-part-text':
      // Deprecated - render as plain text
      return (
        <div key={index} style={getElementStyle('text')}>
          {element.parts.map((part) => part.text).join('')}
        </div>
      )

    default:
      return null
  }
}

/**
 * Render a content section to React JSX
 */
function renderSection(section: ContentSection, index: number): React.ReactNode {
  const className = section.pageBreakAfter ? 'print:break-after-page' : ''

  return (
    <React.Fragment key={section.id || index}>
      <div className={className}>
        {section.elements.map((element, elemIndex) => renderElement(element, elemIndex))}
      </div>
      {section.pageBreakAfter && (
        <div className="print:hidden my-8 border-t-2 border-dashed border-muted-foreground/30" />
      )}
    </React.Fragment>
  )
}

// ============================================================================
// MAIN RENDERER
// ============================================================================

/**
 * Render LiturgyDocument to React JSX
 */
export function renderHTML(document: LiturgyDocument): React.ReactNode {
  return (
    <>
      {document.sections.map((section, index) => renderSection(section, index))}
    </>
  )
}
