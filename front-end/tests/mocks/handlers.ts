import type { Page, Route } from '@playwright/test'
import {
  mockBulbasaurDetail,
  mockCharmanderDetail,
  mockSquirtleDetail,
} from './pokemon-detail.mock'
import { mockPokemonListPage1, mockPokemonListPage2 } from './pokemon-list.mock'

/**
 * Setup API route mocking for Playwright tests
 * Intercepts calls to the proxy backend and returns mock data
 */
export async function setupMocks(page: Page) {
  // Mock Pokemon list endpoint - page 1
  await page.route('**/api/pokemon?offset=0&limit=20', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockPokemonListPage1),
    })
  })

  // Mock Pokemon list endpoint - page 2 (infinite scroll)
  await page.route('**/api/pokemon?offset=20&limit=20', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockPokemonListPage2),
    })
  })

  // Mock Pokemon detail endpoints
  await page.route('**/api/pokemon/1', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockBulbasaurDetail),
    })
  })

  await page.route('**/api/pokemon/bulbasaur', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockBulbasaurDetail),
    })
  })

  await page.route('**/api/pokemon/4', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockCharmanderDetail),
    })
  })

  await page.route('**/api/pokemon/charmander', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockCharmanderDetail),
    })
  })

  await page.route('**/api/pokemon/7', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSquirtleDetail),
    })
  })

  await page.route('**/api/pokemon/squirtle', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSquirtleDetail),
    })
  })

  // Allow image requests to pass through
  await page.route('**/*.png', async (route: Route) => {
    await route.continue()
  })

  await page.route('**/*.jpg', async (route: Route) => {
    await route.continue()
  })
}

/**
 * Setup mocks for generic Pokemon list (all pages)
 * Useful for tests that need to scroll through multiple pages
 */
export async function setupInfiniteScrollMocks(page: Page) {
  await page.route('**/api/pokemon?**', async (route: Route) => {
    const url = new URL(route.request().url())
    const offset = Number.parseInt(url.searchParams.get('offset') || '0', 10)
    const limit = Number.parseInt(url.searchParams.get('limit') || '20', 10)

    const data = Array.from({ length: limit }, (_, i) => ({
      id: offset + i + 1,
      name: `pokemon-${offset + i + 1}`,
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${offset + i + 1}.png`,
      types: ['normal'],
    }))

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data,
        pagination: {
          offset,
          limit,
          total: 1000,
        },
      }),
    })
  })
}
