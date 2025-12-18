import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { env } from '../shared/env'
import { router } from './router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - balance between freshness and cache hits
      gcTime: 10 * 60 * 1000, // 10 minutes - keep unused data briefly
      retry: 1, // One retry with exponential backoff
      refetchOnWindowFocus: false, // Avoid unnecessary refetches
    },
  },
})

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {env.VITE_APP_ENV === 'development' ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  )
}
