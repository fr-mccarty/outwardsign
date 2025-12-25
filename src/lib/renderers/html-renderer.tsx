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
 * @param style - Resolved style object
 * @param isPrintMode - If true, includes inline color for print pages; if false, excludes color for theme support
 */
function applyResolvedStyle(style: ResolvedStyle, isPrintMode: boolean = false): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    fontSize: `${convert.pointsToPx(style.fontSize)}px`,
    fontWeight: style.bold ? 'bold' : 'normal',
    fontStyle: style.italic ? 'italic' : 'normal',
    textAlign: style.alignment,
    marginTop: `${convert.pointsToPx(style.marginTop)}px`,
    marginBottom: `${convert.pointsToPx(style.marginBottom)}px`,
    lineHeight: style.lineHeight,
    fontFamily: LITURGY_FONT,
    whiteSpace: style.preserveLineBreaks ? 'pre-wrap' : 'normal',
  }

  // Include color in inline styles for print mode, exclude for view mode (uses className instead)
  if (isPrintMode) {
    baseStyle.color = style.color
  }

  return baseStyle
}

/**
 * Map color values to theme-aware Tailwind classes
 * This enables automatic dark mode support in view pages
 * @param color - Hex color from resolved style (e.g., '#000000', '#c41e3a')
 * @returns Tailwind color class that adapts to theme
 */
function getColorClassName(color: string): string {
  // Liturgical red → destructive color (adapts to theme)
  if (color === '#c41e3a') {
    return 'text-destructive'
  }
  // Black → foreground color (adapts to theme)
  return 'text-foreground'
}

// ============================================================================
// ELEMENT RENDERERS
// ============================================================================

/**
 * Render a single content element to React JSX
 */
function renderElement(element: ContentElement, index: number, isPrintMode: boolean = false): React.ReactNode {
  switch (element.type) {
    case 'event-title': {
      const style = resolveElementStyle('event-title')
      return style ? (
        <div key={index} className={getColorClassName(style.color)} style={applyResolvedStyle(style, isPrintMode)}>
          {element.text}
        </div>
      ) : null
    }

    case 'event-datetime': {
      const style = resolveElementStyle('event-datetime')
      return style ? (
        <div key={index} className={getColorClassName(style.color)} style={applyResolvedStyle(style, isPrintMode)}>
          {element.text}
        </div>
      ) : null
    }

    case 'section-title': {
      const style = resolveElementStyle('section-title')
      return style ? (
        <div key={index} className={getColorClassName(style.color)} style={applyResolvedStyle(style, isPrintMode)}>
          {element.text}
        </div>
      ) : null
    }

    case 'reading-title': {
      const style = resolveElementStyle('reading-title')
      return style ? (
        <div key={index} className={getColorClassName(style.color)} style={applyResolvedStyle(style, isPrintMode)}>
          {element.text}
        </div>
      ) : null
    }

    case 'pericope': {
      const style = resolveElementStyle('pericope')
      return style ? (
        <div key={index} className={getColorClassName(style.color)} style={applyResolvedStyle(style, isPrintMode)}>
          {element.text}
        </div>
      ) : null
    }

    case 'reader-name': {
      const style = resolveElementStyle('reader-name')
      return style ? (
        <div key={index} className={getColorClassName(style.color)} style={applyResolvedStyle(style, isPrintMode)}>
          {element.text}
        </div>
      ) : null
    }

    case 'introduction': {
      const style = resolveElementStyle('introduction')
      return style ? (
        <div key={index} className={getColorClassName(style.color)} style={applyResolvedStyle(style, isPrintMode)}>
          {element.text}
        </div>
      ) : null
    }

    case 'reading-text': {
      const style = resolveElementStyle('reading-text')
      return style ? (
        <div key={index} className={getColorClassName(style.color)} style={applyResolvedStyle(style, isPrintMode)}>
          {element.text}
        </div>
      ) : null
    }

    case 'conclusion': {
      const style = resolveElementStyle('conclusion')
      return style ? (
        <div key={index} className={getColorClassName(style.color)} style={applyResolvedStyle(style, isPrintMode)}>
          {element.text}
        </div>
      ) : null
    }

    case 'response-dialogue': {
      const containerStyle = resolveElementStyle('response-dialogue')
      const labelStyle = resolveElementStyle('response-dialogue-label')
      const textStyle = resolveElementStyle('response-dialogue-text')
      return containerStyle && labelStyle && textStyle ? (
        <div key={index} className={getColorClassName(containerStyle.color)} style={applyResolvedStyle(containerStyle, isPrintMode)}>
          <span className={getColorClassName(labelStyle.color)} style={applyResolvedStyle(labelStyle, isPrintMode)}>{element.label}</span>
          {' '}
          <span className={getColorClassName(textStyle.color)} style={applyResolvedStyle(textStyle, isPrintMode)}>{element.text}</span>
        </div>
      ) : null
    }

    case 'presider-dialogue': {
      const containerStyle = resolveElementStyle('presider-dialogue')
      if (!containerStyle) return null

      if (element.label) {
        const labelStyle = resolveElementStyle('presider-dialogue-label')
        const textStyle = resolveElementStyle('presider-dialogue-text')
        return labelStyle && textStyle ? (
          <div key={index} className={getColorClassName(containerStyle.color)} style={applyResolvedStyle(containerStyle, isPrintMode)}>
            <span className={getColorClassName(labelStyle.color)} style={applyResolvedStyle(labelStyle, isPrintMode)}>{element.label}</span>
            {' '}
            <span className={getColorClassName(textStyle.color)} style={applyResolvedStyle(textStyle, isPrintMode)}>{element.text}</span>
          </div>
        ) : null
      }

      return (
        <div key={index} className={getColorClassName(containerStyle.color)} style={applyResolvedStyle(containerStyle, isPrintMode)}>
          {element.text}
        </div>
      )
    }

    case 'petition': {
      const containerStyle = resolveElementStyle('petition')
      const labelStyle = resolveElementStyle('petition-label')
      const textStyle = resolveElementStyle('petition-text')
      return containerStyle && labelStyle && textStyle ? (
        <div key={index} className={getColorClassName(containerStyle.color)} style={applyResolvedStyle(containerStyle, isPrintMode)}>
          <span className={getColorClassName(labelStyle.color)} style={applyResolvedStyle(labelStyle, isPrintMode)}>{element.label}</span>
          {' '}
          <span className={getColorClassName(textStyle.color)} style={applyResolvedStyle(textStyle, isPrintMode)}>{element.text}</span>
        </div>
      ) : null
    }

    case 'text': {
      const style = resolveElementStyle('text')
      return style ? (
        <div key={index} className={getColorClassName(style.color)} style={applyResolvedStyle(style, isPrintMode)}>
          {element.text}
        </div>
      ) : null
    }

    case 'rubric': {
      const style = resolveElementStyle('rubric')
      return style ? (
        <div key={index} className={getColorClassName(style.color)} style={applyResolvedStyle(style, isPrintMode)}>
          {element.text}
        </div>
      ) : null
    }

    case 'prayer-text': {
      const style = resolveElementStyle('prayer-text')
      return style ? (
        <div key={index} className={getColorClassName(style.color)} style={applyResolvedStyle(style, isPrintMode)}>
          {element.text}
        </div>
      ) : null
    }

    case 'priest-text': {
      const style = resolveElementStyle('priest-text')
      return style ? (
        <div key={index} className={getColorClassName(style.color)} style={applyResolvedStyle(style, isPrintMode)}>
          {element.text}
        </div>
      ) : null
    }

    case 'info-row': {
      const containerStyle = resolveElementStyle('info-row')
      const labelStyle = resolveElementStyle('info-row-label')
      const valueStyle = resolveElementStyle('info-row-value')
      return containerStyle && labelStyle && valueStyle ? (
        <div key={index} style={{
          ...applyResolvedStyle(containerStyle, isPrintMode),
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '12px',
          alignItems: 'start'
        }}>
          <div className={`liturgy-info-label ${getColorClassName(labelStyle.color)}`} style={applyResolvedStyle(labelStyle, isPrintMode)}>
            {element.label}
          </div>
          <div
            className={getColorClassName(valueStyle.color)}
            style={{
              ...applyResolvedStyle(valueStyle, isPrintMode),
              whiteSpace: 'pre-wrap'
            }}
            dangerouslySetInnerHTML={{ __html: element.value }}
          />
        </div>
      ) : null
    }

    case 'info-row-with-avatar': {
      const containerStyle = resolveElementStyle('info-row')
      const labelStyle = resolveElementStyle('info-row-label')
      const valueStyle = resolveElementStyle('info-row-value')
      return containerStyle && labelStyle && valueStyle ? (
        <div key={index} style={{
          ...applyResolvedStyle(containerStyle, isPrintMode),
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '12px',
          alignItems: 'start'
        }}>
          <div className={`liturgy-info-label ${getColorClassName(labelStyle.color)}`} style={applyResolvedStyle(labelStyle, isPrintMode)}>
            {element.label}
          </div>
          <div className={getColorClassName(valueStyle.color)} style={{
            ...applyResolvedStyle(valueStyle, isPrintMode),
            whiteSpace: 'pre-wrap'
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={element.avatarUrl}
              alt="Avatar"
              style={{
                width: `${element.avatarSize || 40}px`,
                height: `${element.avatarSize || 40}px`,
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: '12px',
                float: 'left'
              }}
            />
            <div dangerouslySetInnerHTML={{ __html: element.value }} />
          </div>
        </div>
      ) : null
    }

    case 'spacer': {
      const spacerSize = resolveSpacerSize(element.size || 'small')
      return <div key={index} style={{ marginBottom: `${convert.pointsToPx(spacerSize)}px` }} />
    }

    case 'image': {
      const imageStyle: React.CSSProperties = {
        display: 'block',
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '4px',
      }

      if (element.width) {
        imageStyle.width = `${element.width}px`
      }
      if (element.height) {
        imageStyle.height = `${element.height}px`
      }

      const containerStyle: React.CSSProperties = {
        textAlign: element.alignment || 'center',
        marginTop: '8px',
        marginBottom: '8px',
      }

      return (
        <div key={index} style={containerStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={element.url}
            alt={element.alt || 'Image'}
            style={imageStyle}
          />
        </div>
      )
    }

    default:
      return null
  }
}

/**
 * Render a content section to React JSX
 */
function renderSection(
  section: ContentSection,
  index: number,
  isLastSection: boolean,
  isPrintMode: boolean = false
): React.ReactNode {
  const classes = []
  if (section.pageBreakBefore) classes.push('print:break-before-page')
  if (section.pageBreakAfter) classes.push('print:break-after-page')
  const className = classes.join(' ')

  return (
    <React.Fragment key={section.id || index}>
      {section.pageBreakBefore && (
        <div className="print:hidden my-8 border-t-2 border-dashed border-muted-foreground/50" />
      )}
      <div className={className}>
        {section.elements.map((element, elemIndex) => renderElement(element, elemIndex, isPrintMode))}
      </div>
      {/* Page break indicator (screen only - hidden in print/PDF/Word) */}
      {section.pageBreakAfter && !isLastSection && (
        <div className="print:hidden my-8 border-t-2 border-dashed border-muted-foreground/50" />
      )}
    </React.Fragment>
  )
}

// ============================================================================
// MAIN RENDERER
// ============================================================================

/**
 * Render LiturgyDocument to React JSX
 * @param document - The liturgy document to render
 * @param isPrintMode - If true, includes inline colors for print pages; if false, uses className for theme support
 */
export function renderHTML(document: LiturgyDocument, isPrintMode: boolean = false): React.ReactNode {
  // Render title at the top using event-title styling
  const titleStyle = resolveElementStyle('event-title')

  // Render subtitle (if present) using event-datetime styling
  const subtitleStyle = resolveElementStyle('event-datetime')

  return (
    <>
      {/* Document title */}
      {titleStyle && (
        <div className={getColorClassName(titleStyle.color)} style={applyResolvedStyle(titleStyle, isPrintMode)}>
          {document.title}
        </div>
      )}

      {/* Document subtitle (optional) */}
      {document.subtitle && subtitleStyle && (
        <div className={getColorClassName(subtitleStyle.color)} style={applyResolvedStyle(subtitleStyle, isPrintMode)}>
          {document.subtitle}
        </div>
      )}

      {/* Spacer after title/subtitle */}
      <div style={{ marginBottom: `${convert.pointsToPx(24)}px` }} />

      {/* Content sections */}
      {document.sections.map((section, index) =>
        renderSection(section, index, index === document.sections.length - 1, isPrintMode)
      )}
    </>
  )
}
