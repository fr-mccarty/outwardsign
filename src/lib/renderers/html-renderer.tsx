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
import {
  LITURGY_FONT,
  convert,
  resolveElementStyle,
  resolveSpacerSize,
  type ResolvedStyle,
} from '@/lib/styles/liturgical-script-styles'

// ============================================================================
// STYLE HELPERS
// ============================================================================

/**
 * Apply resolved style properties to HTML CSS
 * Pure converter - no style lookups or decisions
 */
function applyResolvedStyle(style: ResolvedStyle): React.CSSProperties {
  return {
    fontSize: `${convert.pointsToPx(style.fontSize)}px`,
    fontWeight: style.bold ? 'bold' : 'normal',
    fontStyle: style.italic ? 'italic' : 'normal',
    color: style.color,
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
    case 'event-title': {
      const style = resolveElementStyle('event-title')
      return style ? (
        <div key={index} style={applyResolvedStyle(style)}>
          {element.text}
        </div>
      ) : null
    }

    case 'event-datetime': {
      const style = resolveElementStyle('event-datetime')
      return style ? (
        <div key={index} style={applyResolvedStyle(style)}>
          {element.text}
        </div>
      ) : null
    }

    case 'section-title': {
      const style = resolveElementStyle('section-title')
      return style ? (
        <div key={index} style={applyResolvedStyle(style)}>
          {element.text}
        </div>
      ) : null
    }

    case 'reading-title': {
      const style = resolveElementStyle('reading-title')
      return style ? (
        <div key={index} style={applyResolvedStyle(style)}>
          {element.text}
        </div>
      ) : null
    }

    case 'pericope': {
      const style = resolveElementStyle('pericope')
      return style ? (
        <div key={index} style={applyResolvedStyle(style)}>
          {element.text}
        </div>
      ) : null
    }

    case 'reader-name': {
      const style = resolveElementStyle('reader-name')
      return style ? (
        <div key={index} style={applyResolvedStyle(style)}>
          {element.text}
        </div>
      ) : null
    }

    case 'introduction': {
      const style = resolveElementStyle('introduction')
      return style ? (
        <div key={index} style={applyResolvedStyle(style)}>
          {element.text}
        </div>
      ) : null
    }

    case 'reading-text': {
      const style = resolveElementStyle('reading-text')
      return style ? (
        <div key={index} style={applyResolvedStyle(style)}>
          {element.text}
        </div>
      ) : null
    }

    case 'conclusion': {
      const style = resolveElementStyle('conclusion')
      return style ? (
        <div key={index} style={applyResolvedStyle(style)}>
          {element.text}
        </div>
      ) : null
    }

    case 'response': {
      const containerStyle = resolveElementStyle('response')
      const labelStyle = resolveElementStyle('response-label')
      const textStyle = resolveElementStyle('response-text')
      return containerStyle && labelStyle && textStyle ? (
        <div key={index} style={applyResolvedStyle(containerStyle)}>
          <span style={applyResolvedStyle(labelStyle)}>{element.label}</span>
          {' '}
          <span style={applyResolvedStyle(textStyle)}>{element.text}</span>
        </div>
      ) : null
    }

    case 'priest-dialogue': {
      const style = resolveElementStyle('priest-dialogue')
      return style ? (
        <div key={index} style={applyResolvedStyle(style)}>
          {element.text}
        </div>
      ) : null
    }

    case 'petition': {
      const containerStyle = resolveElementStyle('petition')
      const labelStyle = resolveElementStyle('petition-label')
      const textStyle = resolveElementStyle('petition-text')
      return containerStyle && labelStyle && textStyle ? (
        <div key={index} style={applyResolvedStyle(containerStyle)}>
          <span style={applyResolvedStyle(labelStyle)}>{element.label}</span>
          {' '}
          <span style={applyResolvedStyle(textStyle)}>{element.text}</span>
        </div>
      ) : null
    }

    case 'text': {
      const style = resolveElementStyle('text')
      return style ? (
        <div key={index} style={applyResolvedStyle(style)}>
          {element.text}
        </div>
      ) : null
    }

    case 'rubric': {
      const style = resolveElementStyle('rubric')
      return style ? (
        <div key={index} style={applyResolvedStyle(style)}>
          {element.text}
        </div>
      ) : null
    }

    case 'prayer-text': {
      const style = resolveElementStyle('prayer-text')
      return style ? (
        <div key={index} style={applyResolvedStyle(style)}>
          {element.text}
        </div>
      ) : null
    }

    case 'priest-text': {
      const style = resolveElementStyle('priest-text')
      return style ? (
        <div key={index} style={applyResolvedStyle(style)}>
          {element.text}
        </div>
      ) : null
    }

    case 'info-row': {
      const labelStyle = resolveElementStyle('info-row-label')
      const valueStyle = resolveElementStyle('info-row-value')
      return labelStyle && valueStyle ? (
        <div key={index} className="liturgy-info-grid">
          <div className="liturgy-info-label" style={applyResolvedStyle(labelStyle)}>
            {element.label}
          </div>
          <div style={applyResolvedStyle(valueStyle)}>{element.value}</div>
        </div>
      ) : null
    }

    case 'spacer': {
      const spacerSize = resolveSpacerSize(element.size || 'small')
      return <div key={index} style={{ marginBottom: `${convert.pointsToPx(spacerSize)}px` }} />
    }

    default:
      return null
  }
}

/**
 * Render a content section to React JSX
 */
function renderSection(section: ContentSection, index: number): React.ReactNode {
  const classes = []
  if (section.pageBreakBefore) classes.push('print:break-before-page')
  if (section.pageBreakAfter) classes.push('print:break-after-page')
  const className = classes.join(' ')

  return (
    <React.Fragment key={section.id || index}>
      {section.pageBreakBefore && (
        <div className="print:hidden my-8 border-t-2 border-dashed border-muted-foreground/30" />
      )}
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
