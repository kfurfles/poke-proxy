import { test, expect } from '@playwright/test'
import path from 'node:path'
import { setupMocks } from '../mocks/handlers'

test.describe('Pokedex E2E Journey (Mocked)', () => {
  test('complete user journey with mocked API: list → scroll → detail → back', async ({
    page,
  }, testInfo) => {
    const viewport = testInfo.project.name

    // Setup API mocks before navigation
    await setupMocks(page)

    // Navigate to list page
    await page.goto('/')

    // Wait for initial Pokemon cards to render
    await page.waitForSelector('[data-testid="pokemon-card"]', {
      state: 'visible',
      timeout: 10000,
    })

    // Verify at least 20 cards are rendered
    const initialCards = await page.locator('[data-testid="pokemon-card"]').count()
    expect(initialCards).toBeGreaterThanOrEqual(20)

    // Capture screenshot: list initial state
    const screenshotDir = path.join(
      process.cwd(),
      'project',
      'assets',
      'phase-05',
      'mocked',
    )
    await page.screenshot({
      path: path.join(screenshotDir, `list-initial-${viewport}.png`),
      fullPage: true,
    })

    // Scroll down to trigger infinite scroll
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })

    // Wait for more cards to load
    await page.waitForTimeout(2000) // Allow time for API call and render

    // Verify more cards loaded
    const cardsAfterScroll = await page.locator('[data-testid="pokemon-card"]').count()
    expect(cardsAfterScroll).toBeGreaterThan(initialCards)

    // Capture screenshot: list after scroll
    await page.screenshot({
      path: path.join(screenshotDir, `list-scrolled-${viewport}.png`),
      fullPage: true,
    })

    // Scroll back to top to click on first Pokemon
    await page.evaluate(() => {
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(500)

    // Click on the first Pokemon card
    const firstCard = page.locator('[data-testid="pokemon-card"]').first()
    await firstCard.click()

    // Wait for navigation to detail page
    await page.waitForURL(/\/pokemon\/\w+/)

    // Verify detail page elements
    // Pokemon name should be visible
    await expect(page.locator('h1')).toBeVisible()

    // Pokemon number badge should be visible
    await expect(page.locator('text=/#\\d+/')).toBeVisible()

    // Abilities section should be visible
    const abilitiesHeading = page.locator('h2:has-text("Habilidades")')
    await expect(abilitiesHeading).toBeVisible()

    // Stats section should be visible
    const statsHeading = page.locator('h2:has-text("Estatísticas")')
    await expect(statsHeading).toBeVisible()

    // Back button should be visible
    const backButton = page.locator('text=/voltar para pokédex/i')
    await expect(backButton).toBeVisible()

    // Capture screenshot: detail page
    await page.screenshot({
      path: path.join(screenshotDir, `detail-pokemon-${viewport}.png`),
      fullPage: true,
    })

    // Click back button
    await backButton.click()

    // Verify return to list page
    await page.waitForURL('/')
    await page.waitForSelector('[data-testid="pokemon-card"]', {
      state: 'visible',
    })

    // Verify cards are still visible
    const cardsAfterBack = await page.locator('[data-testid="pokemon-card"]').count()
    expect(cardsAfterBack).toBeGreaterThanOrEqual(20)
  })
})

