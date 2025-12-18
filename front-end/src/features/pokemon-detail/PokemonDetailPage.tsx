import { Link, useParams } from '@tanstack/react-router'
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner'
import { usePokemonDetail } from './data/usePokemonDetail'

export function PokemonDetailPage() {
  const { idOrName } = useParams({ strict: false }) as { idOrName?: string }

  const { pokemon, isLoading, isError, error } = usePokemonDetail(idOrName)

  if (isError) {
    return (
      <div style={{ padding: 16 }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: 16 }}>
          ← Voltar para Pokédex
        </Link>
        <h1>Erro</h1>
        <p style={{ color: 'red' }}>Não foi possível carregar o Pokémon "{idOrName}".</p>
        {error && <p style={{ color: '#666', fontSize: 14 }}>{error.message}</p>}
      </div>
    )
  }

  if (isLoading || !pokemon) {
    return (
      <div style={{ padding: 16 }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: 16 }}>
          ← Voltar para Pokédex
        </Link>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: 16 }}>
        ← Voltar para Pokédex
      </Link>

      <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 24 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24 }}>
          {pokemon.image ? (
            <img
              src={pokemon.image}
              alt={pokemon.name}
              style={{ width: 200, height: 200, objectFit: 'contain' }}
            />
          ) : (
            <div
              style={{
                width: 200,
                height: 200,
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              No image
            </div>
          )}

          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 8px', textTransform: 'capitalize' }}>
              {pokemon.name}
              <span style={{ fontSize: 18, color: '#666', marginLeft: 8 }}>
                #{pokemon.id.toString().padStart(3, '0')}
              </span>
            </h1>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 16,
                    background: '#ddd',
                    textTransform: 'capitalize',
                  }}
                >
                  {type}
                </span>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <strong>Altura:</strong> {pokemon.heightInMeters} m
              </div>
              <div>
                <strong>Peso:</strong> {pokemon.weightInKg} kg
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ marginBottom: 12 }}>Habilidades</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {pokemon.abilities.map((ability) => (
              <div
                key={ability.name}
                style={{
                  padding: 12,
                  border: ability.isHidden ? '2px solid purple' : '1px solid #ccc',
                  borderRadius: 8,
                  background: ability.isHidden ? '#f9f0ff' : '#fff',
                }}
              >
                <div style={{ fontWeight: 'bold', textTransform: 'capitalize', marginBottom: 4 }}>
                  {ability.name.replace('-', ' ')}
                </div>
                {ability.isHidden && (
                  <div style={{ fontSize: 12, color: 'purple' }}>Habilidade Oculta</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ marginBottom: 12 }}>Stats</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pokemon.stats.map((stat) => (
              <div key={stat.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 120, textTransform: 'capitalize', fontSize: 14 }}>
                  {stat.name.replace('-', ' ')}
                </div>
                <div
                  style={{
                    flex: 1,
                    background: '#f0f0f0',
                    height: 24,
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min((stat.baseStat / 255) * 100, 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #4ade80, #22c55e)',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                <div style={{ width: 40, textAlign: 'right', fontWeight: 'bold' }}>
                  {stat.baseStat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
