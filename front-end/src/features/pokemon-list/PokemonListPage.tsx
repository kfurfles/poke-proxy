import { useEffect, useRef } from 'react'
import { ColdStartBanner } from '../../shared/ui/ColdStartBanner'
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner'
import { Skeleton } from '../../shared/ui/Skeleton'
import { PokemonCard } from './components/PokemonCard'
import { PokemonListHeader } from './components/PokemonListHeader'
import { PokemonListSkeleton } from './components/PokemonListSkeleton'
import { usePokemonCardDetails } from './data/usePokemonCardDetails'
import { usePokemonInfiniteList } from './data/usePokemonInfiniteList'

export function PokemonListPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingList,
    isError: isErrorList,
  } = usePokemonInfiniteList()

  // Flatten all Pokemon names from all pages
  const allPokemonNames = data?.pages.flatMap((page) => page.pokemons) ?? []

  // Fetch details for all Pokemon names
  const {
    cards,
    isLoading: isLoadingCards,
    isError: isErrorCards,
  } = usePokemonCardDetails(allPokemonNames)

  // Infinite scroll trigger
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    const currentRef = observerRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  // Error state
  if (isErrorList) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 px-4 py-16">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="mb-4 text-5xl font-bold text-slate-800">Pokédex</h1>
          <div className="rounded-2xl bg-red-50 p-6 text-red-700">
            <p className="text-lg font-semibold">
              Erro ao carregar lista de Pokémon. Por favor, tente novamente.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Initial loading state
  if (isLoadingList) {
    return (
      <>
        <ColdStartBanner isLoading={isLoadingList} />
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <PokemonListHeader />
            <PokemonListSkeleton count={12} />
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <PokemonListHeader />

        {/* Partial error banner (non-blocking) */}
        {isErrorCards && (
          <div className="mb-6 rounded-2xl bg-yellow-50 p-4 text-yellow-800">
            <p className="text-sm">
              Alguns detalhes de Pokémon não puderam ser carregados. Tentando novamente...
            </p>
          </div>
        )}

        {/* Pokemon grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card, index) => {
            if (!card) {
              // Show skeleton for cards still loading
              return (
                <div
                  key={allPokemonNames[index] || index}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-4">
                    <Skeleton className="mb-3 h-6 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-7 w-20 rounded-full" />
                    </div>
                  </div>
                </div>
              )
            }

            return <PokemonCard key={card.id} card={card} index={index} />
          })}
        </div>

        {/* Loading more indicator */}
        {(isFetchingNextPage || isLoadingCards) && (
          <div className="mt-8 flex justify-center">
            <div className="rounded-full bg-white/80 p-4 shadow-md backdrop-blur-sm">
              <LoadingSpinner />
            </div>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={observerRef} className="mt-8 h-20" aria-hidden="true" />

        {/* End of list message */}
        {!hasNextPage && cards.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-lg text-slate-600">Você explorou toda a Pokédex!</p>
          </div>
        )}

        {/* Empty state (unlikely but handled) */}
        {!isLoadingList && cards.length === 0 && !isErrorList && (
          <div className="mt-8 text-center">
            <p className="text-lg text-slate-600">Nenhum Pokémon encontrado.</p>
          </div>
        )}
      </div>
    </div>
  )
}
