import { useQueries } from '@tanstack/react-query'
import { getPokemonControllerGetPokemonByNameQueryOptions } from '../../../shared/api/generated/query/pokemon'
import { type PokemonCardViewModel, toPokemonCardViewModel } from './pokemonCardViewModel'

export interface UsePokemonCardDetailsResult {
  cards: (PokemonCardViewModel | null)[]
  isLoading: boolean
  isError: boolean
  hasPartialData: boolean
}

/**
 * Fetch Pokemon details in batch for card display.
 * Each Pokemon is cached independently for efficient navigation.
 */
export function usePokemonCardDetails(names: string[]): UsePokemonCardDetailsResult {
  const queries = useQueries({
    queries: names.map((name) =>
      getPokemonControllerGetPokemonByNameQueryOptions(name, {
        query: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
        },
      })
    ),
  })

  // Aggregate loading/error states
  const isLoading = queries.some((q) => q.isLoading)
  const isError = queries.every((q) => q.isError)
  const hasPartialData = queries.some((q) => q.isError) && queries.some((q) => q.data)

  // Transform successful responses to view models
  const cards = queries.map((query) => {
    if (!query.data) return null
    return toPokemonCardViewModel(query.data)
  })

  return {
    cards,
    isLoading,
    isError,
    hasPartialData,
  }
}
