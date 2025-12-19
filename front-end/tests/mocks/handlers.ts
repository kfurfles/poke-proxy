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
  // Mock Pokemon list endpoint with flexible query params
  await page.route('**/pokemon?*', async (route: Route) => {
    const url = new URL(route.request().url())
    const offset = Number.parseInt(url.searchParams.get('offset') || '0', 10)
    
    if (offset === 0) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPokemonListPage1),
      })
    } else if (offset === 20) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPokemonListPage2),
      })
    } else {
      await route.continue()
    }
  })

  // Generic mock for any pokemon detail requests
  await page.route('**/pokemon/*', async (route: Route) => {
    const url = route.request().url()
    const match = url.match(/pokemon\/(.+)$/)
    
    if (!match) {
      await route.continue()
      return
    }
    
    const nameOrId = match[1]
    
    // Check for specific mocks first
    if (nameOrId === '1' || nameOrId === 'bulbasaur') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBulbasaurDetail),
      })
      return
    }
    
    if (nameOrId === '4' || nameOrId === 'charmander') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCharmanderDetail),
      })
      return
    }
    
    if (nameOrId === '7' || nameOrId === 'squirtle') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSquirtleDetail),
      })
      return
    }
    
    // Generic mock for pokemon-{number} pattern
    const pokemonMatch = nameOrId.match(/^pokemon-(\d+)$/)
    if (pokemonMatch) {
      const id = Number.parseInt(pokemonMatch[1], 10)
      const mockDetail = {
        id,
        name: `pokemon-${id}`,
        height: 10,
        weight: 100,
        baseExperience: 100,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        stats: [
          { name: 'hp', baseStat: 45, effort: 0 },
          { name: 'attack', baseStat: 49, effort: 0 },
          { name: 'defense', baseStat: 49, effort: 0 },
          { name: 'special-attack', baseStat: 65, effort: 1 },
          { name: 'special-defense', baseStat: 65, effort: 0 },
          { name: 'speed', baseStat: 45, effort: 0 },
        ],
        types: ['normal'],
        abilities: [
          { name: 'overgrow', isHidden: false, slot: 1 },
          { name: 'chlorophyll', isHidden: true, slot: 3 },
        ],
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDetail),
      })
      return
    }
    
    // If no match, continue to real API
    await route.continue()
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
  await page.route('**/pokemon?**', async (route: Route) => {
    const url = new URL(route.request().url())
    const offset = Number.parseInt(url.searchParams.get('offset') || '0', 10)
    const limit = Number.parseInt(url.searchParams.get('limit') || '20', 10)

    const pokemons = Array.from({ length: limit }, (_, i) => `pokemon-${offset + i + 1}`)

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        pokemons,
        total: 1000,
        hasNext: offset + limit < 1000,
        hasPrevious: offset > 0,
      }),
    })
  })
}
