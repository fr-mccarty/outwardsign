/**
 * HTML/React Renderer
 *
 * Converts LiturgyDocument to React JSX
 */

import React from 'react'
import {
  LiturgyDocument,
  ContentSection,
  ContentElement,
} from '@/lib/types/liturgy-content'
import { liturgyPatterns, htmlStyles, createHtmlStyle } from '@/lib/styles/liturgy-styles'

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
        <div key={index} style={liturgyPatterns.html.eventTitle}>
          {element.text}
        </div>
      )

    case 'event-datetime':
      return (
        <div key={index} style={liturgyPatterns.html.eventDateTime}>
          {element.text}
        </div>
      )

    case 'section-title':
      return (
        <div
          key={index}
          style={createHtmlStyle({
            fontSize: 'sectionTitle',
            bold: true,
            marginTop: 'large',
            marginBottom: 'medium',
          })}
        >
          {element.text}
        </div>
      )

    case 'reading-title':
      return (
        <div key={index} style={liturgyPatterns.html.readingTitle}>
          {element.text}
        </div>
      )

    case 'pericope':
      return (
        <div key={index} style={liturgyPatterns.html.pericope}>
          {element.text}
        </div>
      )

    case 'reader-name':
      return (
        <div key={index} style={liturgyPatterns.html.readerName}>
          {element.text}
        </div>
      )

    case 'introduction':
      return (
        <div key={index} style={liturgyPatterns.html.introduction}>
          {element.text}
        </div>
      )

    case 'reading-text':
      return (
        <div
          key={index}
          style={{
            ...liturgyPatterns.html.readingText,
            whiteSpace: element.preserveLineBreaks ? 'pre-wrap' : 'normal',
          }}
        >
          {element.text}
        </div>
      )

    case 'conclusion':
      return (
        <div key={index} style={liturgyPatterns.html.conclusion}>
          {element.text}
        </div>
      )

    case 'response':
      return (
        <div key={index} style={liturgyPatterns.html.response}>
          {element.parts.map((part, partIndex) => (
            <span
              key={partIndex}
              style={{
                fontWeight: part.formatting?.includes('bold') ? 'bold' : 'normal',
                fontStyle: part.formatting?.includes('italic') ? 'italic' : 'normal',
              }}
            >
              {part.text}
            </span>
          ))}
        </div>
      )

    case 'priest-dialogue':
      return (
        <div
          key={index}
          style={createHtmlStyle({
            fontSize: 'priestDialogue',
            marginTop: 'small',
          })}
        >
          {element.text}
        </div>
      )

    case 'petition':
      return (
        <div
          key={index}
          style={createHtmlStyle({
            fontSize: 'petition',
            lineHeight: 'normal',
            bold: true,
            marginTop: 'small',
            marginBottom: 'small',
          })}
        >
          {element.parts.map((part, partIndex) => (
            <span
              key={partIndex}
              style={{
                fontWeight: part.formatting?.includes('bold') ? 'bold' : 'normal',
                fontStyle: part.formatting?.includes('italic') ? 'italic' : 'normal',
                color: part.color === 'liturgy-red' ? htmlStyles.color : undefined,
              }}
            >
              {part.text}
            </span>
          ))}
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
      const spacerSize =
        element.size === 'large'
          ? htmlStyles.spacing.large
          : element.size === 'medium'
          ? htmlStyles.spacing.medium
          : htmlStyles.spacing.small
      return <div key={index} style={{ marginBottom: spacerSize }} />

    case 'text':
      return (
        <div
          key={index}
          style={{
            fontWeight: element.formatting?.includes('bold') ? 'bold' : 'normal',
            fontStyle: element.formatting?.includes('italic') ? 'italic' : 'normal',
            textAlign: element.alignment || 'left',
            marginTop: htmlStyles.spacing.small,
            marginBottom: htmlStyles.spacing.small,
            fontFamily: htmlStyles.fonts.primary,
            whiteSpace: element.preserveLineBreaks ? 'pre-wrap' : 'normal',
          }}
        >
          {element.text}
        </div>
      )

    case 'multi-part-text':
      return (
        <div
          key={index}
          style={{
            textAlign: element.alignment || 'left',
            marginTop: htmlStyles.spacing.small,
            marginBottom: htmlStyles.spacing.small,
          }}
        >
          {element.parts.map((part, partIndex) => (
            <span
              key={partIndex}
              style={{
                fontWeight: part.formatting?.includes('bold') ? 'bold' : 'normal',
                fontStyle: part.formatting?.includes('italic') ? 'italic' : 'normal',
                color: part.color === 'liturgy-red' ? htmlStyles.color : undefined,
              }}
            >
              {part.text}
            </span>
          ))}
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
