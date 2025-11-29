import { test, expect } from '@playwright/test'
import { toLocalDateString } from './utils/test-config'

test.describe('Weekend Summary Module', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to weekend summary page
    await page.goto('/weekend-summary')
  })

  test('should display setup page with date picker and checkboxes', async ({ page }) => {
    // Verify page title
    await expect(page.getByRole('heading', { name: 'Weekend Summary' })).toBeVisible()

    // Verify description
    await expect(page.getByText('Generate a summary document of all activities')).toBeVisible()

    // Verify calendar picker button (use id since accessible name comes from label)
    const dateButton = page.locator('#sunday-date')
    await expect(dateButton).toBeVisible()

    // Verify checkboxes
    await expect(page.getByLabel('Sacraments (Weddings, Baptisms, Funerals, etc.)')).toBeVisible()
    await expect(page.getByLabel('Masses')).toBeVisible()
    await expect(page.getByLabel('Mass Roles (Lectors, Servers, Musicians, etc.)')).toBeVisible()

    // Verify all checkboxes are checked by default
    await expect(page.getByLabel('Sacraments (Weddings, Baptisms, Funerals, etc.)')).toBeChecked()
    await expect(page.getByLabel('Masses')).toBeChecked()
    await expect(page.getByLabel('Mass Roles (Lectors, Servers, Musicians, etc.)')).toBeChecked()

    // Verify generate button
    const generateButton = page.getByRole('button', { name: 'Generate Weekend Summary' })
    await expect(generateButton).toBeVisible()
    await expect(generateButton).toBeDisabled() // Should be disabled until date is selected
  })

  test('should allow selecting a Sunday date and generating summary', async ({ page }) => {
    // Click the date picker button
    await page.locator('#sunday-date').click()

    // Wait for calendar to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Find and click an enabled date button in the calendar
    const calendar = page.locator('[role="dialog"]')
    // Calendar uses shadcn Calendar component - find any enabled button
    const dateButton = calendar.locator('button:not([disabled])').filter({ hasText: /^\d+$/ }).first()

    await dateButton.waitFor({ state: 'visible' })
    await dateButton.click()

    // Click outside calendar to close it
    await page.click('body')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()

    // Verify the button now shows a date (no longer shows "Select a Sunday")
    await expect(page.locator('#sunday-date')).not.toContainText('Select a Sunday')

    // Verify generate button is now enabled
    const generateButton = page.getByRole('button', { name: 'Generate Weekend Summary' })
    await expect(generateButton).toBeEnabled()

    // Click generate button
    await generateButton.click()

    // Should navigate to view page
    await expect(page).toHaveURL(/\/weekend-summary\/view\?/)

    // Verify we're on the view page
    await expect(page.getByRole('heading', { name: /Weekend Summary/i })).toBeVisible()
  })

  test('should toggle checkboxes and include correct params in URL', async ({ page }) => {
    // Click the date picker button
    await page.locator('#sunday-date').click()

    // Wait for calendar and click an enabled date (will be a Sunday)
    const calendar = page.locator('[role="dialog"]')
    const dateButton = calendar.locator('button:not([disabled])').filter({ hasText: /^\d+$/ }).first()

    await dateButton.waitFor({ state: 'visible' })
    await dateButton.click()

    // Click outside calendar to close it
    await page.click('body')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()

    // Uncheck "Sacraments"
    await page.getByLabel('Sacraments (Weddings, Baptisms, Funerals, etc.)').click()

    // Uncheck "Mass Roles"
    await page.getByLabel('Mass Roles (Lectors, Servers, Musicians, etc.)').click()

    // Click generate button
    await page.getByRole('button', { name: 'Generate Weekend Summary' }).click()

    // Verify URL params reflect our selections
    await expect(page).toHaveURL(/date=/)
    await expect(page).toHaveURL(/masses=true/)

    // Should NOT have sacraments or massRoles params
    expect(page.url()).not.toContain('sacraments=true')
    expect(page.url()).not.toContain('massRoles=true')
  })

  test('should display weekend summary view page with correct sections', async ({ page }) => {
    // Navigate directly to view page with query params
    // Use a future Sunday date that won't have data
    const nextSunday = new Date()
    nextSunday.setDate(nextSunday.getDate() + ((7 - nextSunday.getDay()) % 7 || 7))
    const dateStr = toLocalDateString(nextSunday)

    await page.goto(`/weekend-summary/view?date=${dateStr}&sacraments=true&masses=true&massRoles=true`)

    // Verify page heading
    await expect(page.getByRole('heading', { name: /Weekend Summary/i })).toBeVisible()

    // Verify description
    await expect(page.getByText('Summary of all weekend activities')).toBeVisible()

    // Verify action buttons in sidebar
    await expect(page.getByRole('link', { name: 'Edit Configuration' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Print View' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Download PDF' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Download Word' })).toBeVisible()
  })

  test('should navigate back to setup page when clicking Edit Configuration', async ({ page }) => {
    // Navigate to view page
    const nextSunday = new Date()
    nextSunday.setDate(nextSunday.getDate() + ((7 - nextSunday.getDay()) % 7 || 7))
    const dateStr = toLocalDateString(nextSunday)

    await page.goto(`/weekend-summary/view?date=${dateStr}&sacraments=true&masses=true`)

    // Click "Edit Configuration" button
    await page.getByRole('link', { name: 'Edit Configuration' }).click()

    // Should navigate back to setup page
    await expect(page).toHaveURL('/weekend-summary')
    await expect(page.getByRole('heading', { name: 'Weekend Summary' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Generate Weekend Summary' })).toBeVisible()
  })

  test('should display weekend summary document content', async ({ page }) => {
    // Navigate to a weekend summary view page (no data, should show empty state)
    const nextSunday = new Date()
    nextSunday.setDate(nextSunday.getDate() + ((7 - nextSunday.getDay()) % 7 || 7))
    const sundayStr = toLocalDateString(nextSunday)

    await page.goto(`/weekend-summary/view?date=${sundayStr}&sacraments=true&masses=true&massRoles=false`)

    // Verify page loaded
    await expect(page.getByRole('heading', { name: /Weekend Summary/i })).toBeVisible()

    // Verify the subtitle shows the date range (first occurrence in document)
    await expect(page.locator('text=/November.*2025.*November.*2025/').first()).toBeVisible()

    // Should see empty state since no data exists
    await expect(page.getByText('No Activities', { exact: true })).toBeVisible()
    await expect(page.getByText('No activities scheduled for this weekend.')).toBeVisible()

    // Verify sidebar metadata
    await expect(page.getByText('Weekend Dates:')).toBeVisible()
    await expect(page.getByText('Included Sections:')).toBeVisible()
    // Check for Sacraments and Masses in sidebar list (not button or text content)
    await expect(page.locator('li').filter({ hasText: /^• Sacraments$/ })).toBeVisible()
    await expect(page.locator('li').filter({ hasText: /^• Masses$/ })).toBeVisible()

    // Verify summary counts show zeros
    await expect(page.getByText('Weddings: 0')).toBeVisible()
    await expect(page.getByText('Baptisms: 0')).toBeVisible()
    await expect(page.getByText('Funerals: 0')).toBeVisible()
    await expect(page.getByText('Presentations: 0')).toBeVisible()
    await expect(page.getByText('Quinceañeras: 0')).toBeVisible()
    await expect(page.getByText('Masses: 0')).toBeVisible()

    // Verify action buttons are present
    await expect(page.getByRole('link', { name: 'Edit Configuration' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Print View' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Download PDF' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Download Word' })).toBeVisible()

    console.log('Weekend summary document content displayed correctly')
  })
})
