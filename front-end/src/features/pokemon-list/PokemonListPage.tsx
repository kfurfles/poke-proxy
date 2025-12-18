import { Link } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner'
import { Skeleton } from '../../shared/ui/Skeleton'
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

  // Error states
  if (isErrorList) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Pokédex</h1>
        <p style={{ color: 'red' }}>Erro ao carregar lista de Pokémon. Tente novamente.</p>
      </div>
    )
  }

  // Initial loading
  if (isLoadingList) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Pokédex</h1>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Pokédex</h1>
      <p style={{ marginBottom: 16, color: '#666' }}>
        Data layer connected. Showing {cards.length} Pokémon.
      </p>

      {isErrorCards && (
        <p style={{ color: 'red', marginBottom: 16 }}>
          Erro ao carregar alguns detalhes de Pokémon.
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {cards.map((card, index) => {
          if (!card) {
            return (
              <div
                key={allPokemonNames[index] || index}
                style={{ padding: 16, border: '1px solid #ccc', borderRadius: 8 }}
              >
                <Skeleton className="w-full h-[150px]" />
                <Skeleton className="w-3/5 h-5 mt-2" />
              </div>
            )
          }

          return (
            <Link
              key={card.id}
              to="/pokemon/$idOrName"
              params={{ idOrName: card.name }}
              style={{
                padding: 16,
                border: '1px solid #ccc',
                borderRadius: 8,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              {card.image ? (
                <img
                  src={card.image}
                  alt={card.name}
                  style={{ width: '100%', height: 150, objectFit: 'contain' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 150,
                    background: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  No image
                </div>
              )}
              <h3 style={{ margin: '8px 0 4px', textTransform: 'capitalize' }}>{card.name}</h3>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {card.types.map((type) => (
                  <span
                    key={type}
                    style={{
                      fontSize: 12,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: '#ddd',
                      textTransform: 'capitalize',
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Loading more indicator */}
      {(isFetchingNextPage || isLoadingCards) && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <LoadingSpinner />
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={observerRef} style={{ height: 20, marginTop: 16 }} />

      {!hasNextPage && cards.length > 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: 16 }}>Fim da lista</p>
      )}
    </div>
  )
}
