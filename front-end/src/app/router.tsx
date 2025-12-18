import { Outlet, RootRoute, Route, Router } from '@tanstack/react-router'
import { PokemonDetailPage } from '../features/pokemon-detail/PokemonDetailPage'
import { PokemonListPage } from '../features/pokemon-list/PokemonListPage'

function RootLayout() {
  return (
    <div className="min-h-dvh bg-linear-to-br from-slate-50 to-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  )
}

const rootRoute = new RootRoute({
  component: RootLayout,
})

const pokemonListRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: PokemonListPage,
})

const pokemonDetailRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pokemon/$idOrName',
  component: PokemonDetailPage,
})

const routeTree = rootRoute.addChildren([pokemonListRoute, pokemonDetailRoute])

export const router = new Router({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
