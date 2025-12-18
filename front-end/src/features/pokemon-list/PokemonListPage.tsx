import { Link } from '@tanstack/react-router'

export function PokemonListPage() {
  return (
    <div style={{ padding: 16 }}>
      <h1>Pokédex</h1>
      <p>Router setup OK. Próximo passo: implementar listagem + infinite scroll.</p>
      <Link to="/pokemon/$idOrName" params={{ idOrName: 'pikachu' }}>
        Ir para detalhe (pikachu)
      </Link>
    </div>
  )
}
