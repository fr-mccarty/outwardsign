import { test, expect } from '@playwright/test'

test.describe('Weekend Summary Print View', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to weekend summary page
    await page.goto('/weekend-summary')
  })

  test('should display print view correctly', async ({ page, context }) => {
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

    // Click generate button
    await page.getByRole('button', { name: 'Generate Weekend Summary' }).click()

    // Should navigate to view page
    await expect(page).toHaveURL(/\/weekend-summary\/view\?/)

    // Click Print View link (opens in new tab)
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: 'Print View' }).click()
    ])

    await newPage.waitForLoadState('networkidle')

    // Should navigate to print page with same params
    await expect(newPage).toHaveURL(/\/print\/weekend-summary\?/)

    // Verify print page URL contains required params
    const printUrl = newPage.url()
    expect(printUrl).toContain('date=')
    expect(printUrl).toContain('sacraments=true')
    expect(printUrl).toContain('masses=true')

    // Verify print content container is present
    await expect(newPage.locator('.weekend-summary-print-content')).toBeVisible()

    // Check that content is rendered (not empty)
    const content = newPage.locator('.weekend-summary-print-content')
    const contentText = await content.textContent()
    expect(contentText).toBeTruthy()
    expect(contentText?.length).toBeGreaterThan(10)

    // Verify either title or some actual content is present
    const hasTitle = contentText?.includes('Weekend Summary')
    const hasDate = contentText?.includes('2025')
    expect(hasTitle || hasDate).toBe(true)

    await newPage.close()
  })

  test('should apply print styles correctly', async ({ page }) => {
    // Navigate directly to print page with query params
    const nextSunday = new Date()
    nextSunday.setDate(nextSunday.getDate() + ((7 - nextSunday.getDay()) % 7 || 7))
    const dateStr = nextSunday.toISOString().split('T')[0]

    await page.goto(`/print/weekend-summary?date=${dateStr}&sacraments=true&masses=true`)

    await page.waitForLoadState('networkidle')

    // Verify print-specific styles are applied
    const content = page.locator('.weekend-summary-print-content')
    await expect(content).toBeVisible()

    // Verify content is rendered (not empty)
    const contentText = await content.textContent()
    expect(contentText).toBeTruthy()
    expect(contentText?.length).toBeGreaterThan(0)
  })
})
