import { usePokemonControllerGetPokemonByName } from '../../../shared/api/generated/query/pokemon'
import { type PokemonDetailViewModel, toPokemonDetailViewModel } from './pokemonDetailViewModel'

export interface UsePokemonDetailResult {
  pokemon: PokemonDetailViewModel | null
  isLoading: boolean
  isError: boolean
  error: Error | null
}

/**
 * Fetch Pokemon detail by name with proper caching.
 */
export function usePokemonDetail(name: string | undefined): UsePokemonDetailResult {
  const { data, isLoading, isError, error } = usePokemonControllerGetPokemonByName(name || '', {
    query: {
      enabled: !!name,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  })

  const pokemon = data ? toPokemonDetailViewModel(data) : null

  return {
    pokemon,
    isLoading,
    isError,
    error: error as Error | null,
  }
}
