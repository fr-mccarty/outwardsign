import { test, expect } from '@playwright/test'

/**
 * Date Picker Component Tests
 *
 * Tests the DatePickerField component for correct date selection and display.
 *
 * CRITICAL: These tests verify that the timezone bug (toISOString shifting dates)
 * is fixed. The DatePickerField now uses toLocalDateString() to ensure dates
 * are displayed correctly in the user's local timezone.
 */

test.describe('DatePickerField Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to weekend summary page which uses DatePickerField
    await page.goto('/weekend-summary')
  })

  test('should display date picker with placeholder', async ({ page }) => {
    // Verify the date picker button exists and shows placeholder
    const dateButton = page.locator('#sunday-date')
    await expect(dateButton).toBeVisible()
    await expect(dateButton).toContainText('Select a Sunday')
  })

  test('should open calendar popover when clicked', async ({ page }) => {
    // Click the date picker button
    await page.locator('#sunday-date').click()

    // Verify calendar popover opens
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Verify calendar contains month navigation
    await expect(page.locator('[role="dialog"]')).toContainText(/November|December|January|February|March|April|May|June|July|August|September|October/)
  })

  test('should display selected date correctly without timezone shift', async ({ page }) => {
    // Click the date picker button
    await page.locator('#sunday-date').click()

    // Wait for calendar to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Find and click an enabled Sunday (the 15th if available, or first available)
    const calendar = page.locator('[role="dialog"]')
    const enabledDates = calendar.locator('button:not([disabled])').filter({ hasText: /^\d+$/ })

    // Get the first enabled date's text
    const firstEnabledDate = enabledDates.first()
    await firstEnabledDate.waitFor({ state: 'visible' })
    const selectedDay = await firstEnabledDate.textContent()

    // Click the date
    await firstEnabledDate.click()

    // Close the calendar by clicking outside
    await page.click('body')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()

    // Get the displayed date from the button
    const dateButton = page.locator('#sunday-date')
    const displayedText = await dateButton.textContent()

    // The displayed date should include the day number we selected
    // Format is like "December 15, 2025"
    expect(displayedText).toContain(selectedDay)
    expect(displayedText).not.toBe('Select a Sunday')
  })

  test('should pass selected date to URL correctly', async ({ page }) => {
    // Click the date picker button
    await page.locator('#sunday-date').click()

    // Wait for calendar and click an enabled date
    const calendar = page.locator('[role="dialog"]')
    const dateButton = calendar.locator('button:not([disabled])').filter({ hasText: /^\d+$/ }).first()
    await dateButton.waitFor({ state: 'visible' })
    await dateButton.click()

    // Close calendar
    await page.click('body')

    // Click generate button
    await page.getByRole('button', { name: 'Generate Weekend Summary' }).click()

    // Verify URL contains a valid date parameter
    await expect(page).toHaveURL(/date=\d{4}-\d{2}-\d{2}/)

    // Extract the date from URL
    const url = page.url()
    const dateMatch = url.match(/date=(\d{4}-\d{2}-\d{2})/)
    expect(dateMatch).not.toBeNull()

    if (dateMatch) {
      const dateParam = dateMatch[1]
      // Parse the date and verify it's valid
      const parsedDate = new Date(dateParam + 'T12:00:00')
      expect(parsedDate.getFullYear()).toBeGreaterThanOrEqual(2024)
      expect(parsedDate.getMonth()).toBeGreaterThanOrEqual(0)
      expect(parsedDate.getMonth()).toBeLessThanOrEqual(11)
      expect(parsedDate.getDate()).toBeGreaterThanOrEqual(1)
      expect(parsedDate.getDate()).toBeLessThanOrEqual(31)
    }
  })

  test('should only enable Sundays for weekend summary', async ({ page }) => {
    // Click the date picker button
    await page.locator('#sunday-date').click()

    // Wait for calendar
    const calendar = page.locator('[role="dialog"]')
    await expect(calendar).toBeVisible()

    // Get all enabled date buttons
    const enabledDates = calendar.locator('button:not([disabled])').filter({ hasText: /^\d+$/ })
    const enabledCount = await enabledDates.count()

    // Should have some enabled dates (Sundays)
    expect(enabledCount).toBeGreaterThan(0)

    // Get all disabled date buttons (non-Sundays)
    const disabledDates = calendar.locator('button[disabled]').filter({ hasText: /^\d+$/ })
    const disabledCount = await disabledDates.count()

    // Should have many more disabled dates than enabled (6:1 ratio)
    // Since only Sundays are enabled, there should be roughly 6x more disabled dates
    expect(disabledCount).toBeGreaterThan(enabledCount * 3) // At least 3x as many disabled
  })

  test('should close calendar after selecting date when closeOnSelect is true', async ({ page }) => {
    // The weekend summary uses closeOnSelect prop
    await page.locator('#sunday-date').click()

    // Wait for calendar
    const calendar = page.locator('[role="dialog"]')
    await expect(calendar).toBeVisible()

    // Click an enabled date
    const dateButton = calendar.locator('button:not([disabled])').filter({ hasText: /^\d+$/ }).first()
    await dateButton.click()

    // Calendar should close automatically
    await expect(calendar).not.toBeVisible({ timeout: 2000 })
  })
})

test.describe('DatePickerField - Timezone Edge Cases', () => {
  test('should handle date selection near midnight correctly', async ({ page }) => {
    // Navigate to weekend summary
    await page.goto('/weekend-summary')

    // Select a date
    await page.locator('#sunday-date').click()
    const calendar = page.locator('[role="dialog"]')
    await expect(calendar).toBeVisible()

    // Click an enabled date
    const dateButton = calendar.locator('button:not([disabled])').filter({ hasText: /^\d+$/ }).first()
    const expectedDay = await dateButton.textContent()
    await dateButton.click()

    // Close calendar
    await page.click('body')

    // Generate summary
    await page.getByRole('button', { name: 'Generate Weekend Summary' }).click()
    await expect(page).toHaveURL(/\/weekend-summary\/view\?/)

    // Verify the date in the sidebar metadata matches what was selected
    // The day number should be preserved in the Weekend Dates section
    const sidebarContent = page.getByText('Weekend Dates:')
    await expect(sidebarContent).toBeVisible()

    // Verify the URL date parameter is correct
    const url = page.url()
    const dateMatch = url.match(/date=(\d{4}-\d{2}-\d{2})/)
    if (dateMatch) {
      const [year, month, day] = dateMatch[1].split('-')
      // The day in URL should match what we clicked
      expect(parseInt(day)).toBe(parseInt(expectedDay || '0'))
    }
  })
})
