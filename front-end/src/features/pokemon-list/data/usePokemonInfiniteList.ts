import { useInfiniteQuery } from '@tanstack/react-query'
import { pokemonControllerListPokemons } from '../../../shared/api/generated/query/pokemon'

const POKEMON_LIST_LIMIT = 20

export function usePokemonInfiniteList() {
  return useInfiniteQuery({
    queryKey: ['pokemon', 'list'],
    queryFn: ({ pageParam }) =>
      pokemonControllerListPokemons({
        limit: POKEMON_LIST_LIMIT,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage.hasNext) {
        return undefined
      }
      return lastPageParam + POKEMON_LIST_LIMIT
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
