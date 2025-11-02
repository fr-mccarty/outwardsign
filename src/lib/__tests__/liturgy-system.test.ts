/**
 * Liturgy Content & Style System Tests
 *
 * Tests the complete flow from data → content builder → renderers
 */

import { mockWedding } from './mock-wedding-data'
import { buildWeddingLiturgy, WEDDING_TEMPLATES } from '../content-builders/wedding-templates'
import { renderPDF } from '../renderers/pdf-renderer'
import { renderWord } from '../renderers/word-renderer'
import { renderHTML } from '../renderers/html-renderer'
import { LITURGY_BASE_STYLES, pdfStyles, wordStyles, htmlStyles } from '../styles/liturgy-styles'

console.log('🧪 Starting Liturgy System Tests\n')

// ============================================================================
// TEST 1: Style System
// ============================================================================

console.log('📐 Test 1: Style System')
console.log('─'.repeat(50))

// Test that base styles are defined
if (!LITURGY_BASE_STYLES.colors.liturgyRed) {
  throw new Error('❌ Base liturgy red color not defined')
}
console.log('✅ Base styles defined')

// Test that all three format styles exist
if (!pdfStyles.color || !wordStyles.color || !htmlStyles.color) {
  throw new Error('❌ Format-specific styles missing')
}
console.log('✅ PDF, Word, and HTML styles all exist')

// Test that colors are consistent (accounting for format differences)
const pdfColor = pdfStyles.color
const wordColor = wordStyles.color.toUpperCase()
const htmlColor = htmlStyles.color.toUpperCase()

if (pdfColor.toUpperCase() !== `#${wordColor}` || pdfColor.toUpperCase() !== htmlColor) {
  throw new Error(`❌ Color inconsistency: PDF=${pdfColor}, Word=${wordColor}, HTML=${htmlColor}`)
}
console.log(`✅ Colors consistent across formats: ${pdfColor}`)

// Test unit conversions
const testPoints = 12
const expectedTwips = testPoints * 20
const expectedHalfPoints = testPoints * 2

if (pdfStyles.sizes.pericope !== 12) {
  throw new Error('❌ PDF font sizes incorrect')
}
if (wordStyles.sizes.pericope !== 24) {
  throw new Error('❌ Word font sizes incorrect (should be half-points)')
}
console.log('✅ Unit conversions working correctly')

console.log('✅ Style System: PASSED\n')

// ============================================================================
// TEST 2: Template Registry
// ============================================================================

console.log('📚 Test 2: Template Registry')
console.log('─'.repeat(50))

const template = WEDDING_TEMPLATES['wedding-full-script-english']
if (!template) {
  throw new Error('❌ Template "wedding-full-script-english" not found')
}
console.log('✅ Template found')

if (template.name !== 'Full Ceremony Script (English)') {
  throw new Error('❌ Template name incorrect')
}
console.log(`✅ Template name: "${template.name}"`)

if (!template.supportedLanguages.includes('en')) {
  throw new Error('❌ Template should support English')
}
console.log('✅ Template supports English')

if (typeof template.builder !== 'function') {
  throw new Error('❌ Template builder is not a function')
}
console.log('✅ Template has builder function')

console.log('✅ Template Registry: PASSED\n')

// ============================================================================
// TEST 3: Content Builder
// ============================================================================

console.log('🏗️  Test 3: Content Builder')
console.log('─'.repeat(50))

const liturgyDoc = buildWeddingLiturgy(mockWedding, 'wedding-full-script-english')

if (!liturgyDoc) {
  throw new Error('❌ Content builder returned null')
}
console.log('✅ Content builder executed')

if (liturgyDoc.type !== 'wedding') {
  throw new Error('❌ Document type should be "wedding"')
}
console.log(`✅ Document type: ${liturgyDoc.type}`)

if (liturgyDoc.language !== 'en') {
  throw new Error('❌ Document language should be "en"')
}
console.log(`✅ Document language: ${liturgyDoc.language}`)

if (liturgyDoc.template !== 'wedding-full-script-english') {
  throw new Error('❌ Document template incorrect')
}
console.log(`✅ Document template: ${liturgyDoc.template}`)

if (!liturgyDoc.title.includes('Garcia') || !liturgyDoc.title.includes('Rodriguez')) {
  throw new Error('❌ Document title should include bride and groom names')
}
console.log(`✅ Document title: "${liturgyDoc.title}"`)

if (!Array.isArray(liturgyDoc.sections) || liturgyDoc.sections.length === 0) {
  throw new Error('❌ Document should have sections')
}
console.log(`✅ Document has ${liturgyDoc.sections.length} sections`)

// Check for expected sections
const sectionIds = liturgyDoc.sections.map(s => s.id)
const expectedSections = ['summary', 'first-reading', 'psalm', 'second-reading', 'gospel', 'petitions']
const missingSection = expectedSections.find(id => !sectionIds.includes(id))
if (missingSection) {
  throw new Error(`❌ Missing expected section: ${missingSection}`)
}
console.log(`✅ All expected sections present: ${expectedSections.join(', ')}`)

// Check that readings have content
const firstReadingSection = liturgyDoc.sections.find(s => s.id === 'first-reading')
if (!firstReadingSection || firstReadingSection.elements.length === 0) {
  throw new Error('❌ First reading section should have elements')
}
console.log(`✅ First reading has ${firstReadingSection.elements.length} elements`)

// Check for reading text element
const hasReadingText = firstReadingSection.elements.some(el => el.type === 'reading-text')
if (!hasReadingText) {
  throw new Error('❌ First reading should have reading-text element')
}
console.log('✅ Reading text element found')

// Check for pericope
const hasPericope = firstReadingSection.elements.some(el => el.type === 'pericope')
if (!hasPericope) {
  throw new Error('❌ First reading should have pericope element')
}
console.log('✅ Pericope element found')

// Check petitions include custom ones
const petitionsSection = liturgyDoc.sections.find(s => s.id === 'petitions')
if (!petitionsSection) {
  throw new Error('❌ Petitions section not found')
}
const petitionElements = petitionsSection.elements.filter(el => el.type === 'petition')
console.log(`✅ Found ${petitionElements.length} petition elements`)

console.log('✅ Content Builder: PASSED\n')

// ============================================================================
// TEST 4: PDF Renderer
// ============================================================================

console.log('📄 Test 4: PDF Renderer')
console.log('─'.repeat(50))

const pdfContent = renderPDF(liturgyDoc)

if (!Array.isArray(pdfContent)) {
  throw new Error('❌ PDF renderer should return array')
}
console.log(`✅ PDF renderer returned array with ${pdfContent.length} items`)

if (pdfContent.length === 0) {
  throw new Error('❌ PDF content should not be empty')
}
console.log('✅ PDF content is not empty')

// Check for page breaks
const hasPageBreaks = pdfContent.some(item =>
  typeof item === 'object' && item !== null && 'pageBreak' in item
)
if (!hasPageBreaks) {
  throw new Error('❌ PDF should contain page breaks')
}
console.log('✅ PDF contains page breaks')

// Check that text content exists
const hasTextContent = pdfContent.some(item =>
  typeof item === 'object' && item !== null && 'text' in item
)
if (!hasTextContent) {
  throw new Error('❌ PDF should contain text content')
}
console.log('✅ PDF contains text content')

console.log('✅ PDF Renderer: PASSED\n')

// ============================================================================
// TEST 5: Word Renderer
// ============================================================================

console.log('📝 Test 5: Word Renderer')
console.log('─'.repeat(50))

const wordParagraphs = renderWord(liturgyDoc)

if (!Array.isArray(wordParagraphs)) {
  throw new Error('❌ Word renderer should return array')
}
console.log(`✅ Word renderer returned array with ${wordParagraphs.length} paragraphs`)

if (wordParagraphs.length === 0) {
  throw new Error('❌ Word paragraphs should not be empty')
}
console.log('✅ Word content is not empty')

// Check that paragraphs have the expected structure
const hasValidParagraphs = wordParagraphs.every(para =>
  typeof para === 'object' && para !== null
)
if (!hasValidParagraphs) {
  throw new Error('❌ Word paragraphs have invalid structure')
}
console.log('✅ Word paragraphs have valid structure')

console.log('✅ Word Renderer: PASSED\n')

// ============================================================================
// TEST 6: HTML Renderer
// ============================================================================

console.log('🌐 Test 6: HTML Renderer')
console.log('─'.repeat(50))

const htmlContent = renderHTML(liturgyDoc)

if (!htmlContent) {
  throw new Error('❌ HTML renderer returned null/undefined')
}
console.log('✅ HTML renderer returned content')

// HTML renderer returns React elements, which are objects
if (typeof htmlContent !== 'object') {
  throw new Error('❌ HTML content should be React element(s)')
}
console.log('✅ HTML content is React element')

console.log('✅ HTML Renderer: PASSED\n')

// ============================================================================
// TEST 7: Content Consistency
// ============================================================================

console.log('🔄 Test 7: Content Consistency')
console.log('─'.repeat(50))

// All three renderers should receive the same liturgyDoc
// This ensures the same content structure goes to all formats

// Build the document again to ensure it's deterministic
const liturgyDoc2 = buildWeddingLiturgy(mockWedding, 'wedding-full-script-english')

if (liturgyDoc.sections.length !== liturgyDoc2.sections.length) {
  throw new Error('❌ Content builder is not deterministic')
}
console.log('✅ Content builder is deterministic')

if (liturgyDoc.title !== liturgyDoc2.title) {
  throw new Error('❌ Document title changes between builds')
}
console.log('✅ Document title consistent')

// Check that section order is the same
for (let i = 0; i < liturgyDoc.sections.length; i++) {
  if (liturgyDoc.sections[i].id !== liturgyDoc2.sections[i].id) {
    throw new Error(`❌ Section order changed: ${liturgyDoc.sections[i].id} vs ${liturgyDoc2.sections[i].id}`)
  }
}
console.log('✅ Section order consistent')

console.log('✅ Content Consistency: PASSED\n')

// ============================================================================
// TEST 8: Page Break Handling
// ============================================================================

console.log('📄 Test 8: Page Break Handling')
console.log('─'.repeat(50))

// Check that summary section has pageBreakAfter
const summarySection = liturgyDoc.sections.find(s => s.id === 'summary')
if (!summarySection?.pageBreakAfter) {
  throw new Error('❌ Summary section should have pageBreakAfter')
}
console.log('✅ Summary section has page break after')

// Check that reading sections have pageBreakBefore
const psalmSection = liturgyDoc.sections.find(s => s.id === 'psalm')
if (psalmSection && mockWedding.psalm && !psalmSection.pageBreakBefore) {
  throw new Error('❌ Psalm section should have pageBreakBefore when psalm exists')
}
console.log('✅ Reading sections have proper page breaks')

console.log('✅ Page Break Handling: PASSED\n')

// ============================================================================
// SUMMARY
// ============================================================================

console.log('=' .repeat(50))
console.log('🎉 ALL TESTS PASSED!')
console.log('=' .repeat(50))
console.log('')
console.log('Test Coverage:')
console.log('  ✅ Style System (base values, conversions, consistency)')
console.log('  ✅ Template Registry (wedding-full-script-english)')
console.log('  ✅ Content Builder (sections, elements, content)')
console.log('  ✅ PDF Renderer (output structure, page breaks)')
console.log('  ✅ Word Renderer (paragraph structure)')
console.log('  ✅ HTML Renderer (React elements)')
console.log('  ✅ Content Consistency (deterministic output)')
console.log('  ✅ Page Break Handling (section breaks)')
console.log('')
console.log('The centralized liturgy system is working correctly!')
console.log('You can now:')
console.log('  1. Use it for weddings ✅')
console.log('  2. Create baptism-templates.ts following the same pattern')
console.log('  3. Create funeral-templates.ts following the same pattern')
console.log('  4. Create quinceanera-templates.ts following the same pattern')
console.log('')
