import { NextRequest, NextResponse } from 'next/server'
import PdfPrinter from 'pdfmake'
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { Document, Packer } from 'docx'
import { pdfStyles } from '@/lib/styles/liturgy-styles'
import { renderPDF } from '@/lib/renderers/pdf-renderer'
import { renderWord } from '@/lib/renderers/word-renderer'
import { WORD_PAGE_MARGIN } from '@/lib/print-styles'
import type { LiturgyDocument } from '@/lib/types/liturgy-content'

// Define fonts for pdfmake
const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
}

const printer = new PdfPrinter(fonts)

/**
 * Configuration for creating a PDF route handler
 */
export interface PdfRouteConfig<T> {
  /** Name of the entity (e.g., 'Wedding', 'Funeral') - used in error messages */
  entityName: string
  /** Function to fetch the entity by ID */
  fetchEntity: (id: string) => Promise<T | null>
  /** Function to build the liturgy document from the entity */
  buildContent: (entity: T, templateId?: string) => LiturgyDocument
  /** Function to generate the filename for the PDF */
  getFilename: (entity: T) => string
  /** Optional: Default template ID if entity doesn't have one */
  defaultTemplate?: string
  /** Optional: Key name of the template ID field in the entity (e.g., 'wedding_template_id') */
  templateIdField?: keyof T
}

/**
 * Configuration for creating a Word route handler
 */
export interface WordRouteConfig<T> {
  /** Name of the entity (e.g., 'Wedding', 'Funeral') - used in error messages */
  entityName: string
  /** Function to fetch the entity by ID */
  fetchEntity: (id: string) => Promise<T | null>
  /** Function to build the liturgy document from the entity */
  buildContent: (entity: T, templateId?: string) => LiturgyDocument
  /** Function to generate the filename for the Word document */
  getFilename: (entity: T) => string
  /** Optional: Default template ID if entity doesn't have one */
  defaultTemplate?: string
  /** Optional: Key name of the template ID field in the entity (e.g., 'wedding_template_id') */
  templateIdField?: keyof T
}

/**
 * Creates a PDF route handler for a given entity type
 *
 * @example
 * ```typescript
 * export const GET = createPdfRoute({
 *   entityName: 'Wedding',
 *   fetchEntity: getWeddingWithRelations,
 *   buildContent: buildWeddingLiturgy,
 *   getFilename: (wedding) => getWeddingFilename(wedding, 'pdf'),
 *   defaultTemplate: 'wedding-full-script-english',
 *   templateIdField: 'wedding_template_id'
 * })
 * ```
 */
export function createPdfRoute<T>(config: PdfRouteConfig<T>) {
  return async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params
      const entity = await config.fetchEntity(id)

      if (!entity) {
        return NextResponse.json(
          { error: `${config.entityName} not found` },
          { status: 404 }
        )
      }

      // Get template ID from entity if templateIdField is specified
      let templateId = config.defaultTemplate
      if (config.templateIdField && entity[config.templateIdField]) {
        templateId = entity[config.templateIdField] as string
      }

      // Build liturgy content using centralized content builder
      const liturgyDocument = config.buildContent(entity, templateId)

      // Render to PDF format
      const content = renderPDF(liturgyDocument)

      // PDF Document definition
      const docDefinition: TDocumentDefinitions = {
        content,
        pageMargins: [
          pdfStyles.margins.page,
          pdfStyles.margins.page,
          pdfStyles.margins.page,
          pdfStyles.margins.page
        ]
      }

      // Generate PDF
      const pdfDoc = printer.createPdfKitDocument(docDefinition)

      // Collect PDF buffer
      const chunks: Buffer[] = []
      pdfDoc.on('data', (chunk) => chunks.push(chunk))

      await new Promise<void>((resolve, reject) => {
        pdfDoc.on('end', () => resolve())
        pdfDoc.on('error', reject)
        pdfDoc.end()
      })

      const pdfBuffer = Buffer.concat(chunks)

      // Generate filename
      const filename = config.getFilename(entity)

      // Return PDF
      return new NextResponse(pdfBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    } catch (error) {
      console.error(`Error generating PDF for ${config.entityName}:`, error)
      return NextResponse.json(
        { error: 'Failed to generate PDF' },
        { status: 500 }
      )
    }
  }
}

/**
 * Creates a Word document route handler for a given entity type
 *
 * @example
 * ```typescript
 * export const GET = createWordRoute({
 *   entityName: 'Wedding',
 *   fetchEntity: getWeddingWithRelations,
 *   buildContent: buildWeddingLiturgy,
 *   getFilename: (wedding) => getWeddingFilename(wedding, 'docx'),
 *   defaultTemplate: 'wedding-full-script-english',
 *   templateIdField: 'wedding_template_id'
 * })
 * ```
 */
export function createWordRoute<T>(config: WordRouteConfig<T>) {
  return async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params
      const entity = await config.fetchEntity(id)

      if (!entity) {
        return NextResponse.json(
          { error: `${config.entityName} not found` },
          { status: 404 }
        )
      }

      // Get template ID from entity if templateIdField is specified
      let templateId = config.defaultTemplate
      if (config.templateIdField && entity[config.templateIdField]) {
        templateId = entity[config.templateIdField] as string
      }

      // Build liturgy content using centralized content builder
      const liturgyDocument = config.buildContent(entity, templateId)

      // Render to Word format
      const paragraphs = renderWord(liturgyDocument)

      // Create Word document
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: WORD_PAGE_MARGIN,
                  right: WORD_PAGE_MARGIN,
                  bottom: WORD_PAGE_MARGIN,
                  left: WORD_PAGE_MARGIN
                }
              }
            },
            children: paragraphs
          }
        ]
      })

      // Generate Word document buffer
      const buffer = await Packer.toBuffer(doc)

      // Generate filename
      const filename = config.getFilename(entity)

      // Return Word document
      return new NextResponse(buffer as any, {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    } catch (error) {
      console.error(`Error generating Word document for ${config.entityName}:`, error)
      return NextResponse.json(
        { error: 'Failed to generate Word document' },
        { status: 500 }
      )
    }
  }
}
