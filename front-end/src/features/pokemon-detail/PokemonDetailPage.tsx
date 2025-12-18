import { useParams } from '@tanstack/react-router'

export function PokemonDetailPage() {
  const { idOrName } = useParams({ strict: false }) as { idOrName?: string }

  return (
    <div style={{ padding: 16 }}>
      <h1>Pokémon Detail</h1>
      <p>Param: {idOrName}</p>
      <p>Próximo passo: consumir endpoint GET by name via Orval/Query.</p>
    </div>
  )
}
