import { RootRoute, Route, Router } from '@tanstack/react-router'
import { PokemonDetailPage } from '../features/pokemon-detail/PokemonDetailPage'
import { PokemonListPage } from '../features/pokemon-list/PokemonListPage'

const rootRoute = new RootRoute({
  component: PokemonListPage,
})

const pokemonDetailRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pokemon/$idOrName',
  component: PokemonDetailPage,
})

const routeTree = rootRoute.addChildren([pokemonDetailRoute])

export const router = new Router({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
