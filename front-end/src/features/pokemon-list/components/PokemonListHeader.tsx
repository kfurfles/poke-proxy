/**
 * PokemonListHeader - List page header with title and subtitle
 * Based on Phase 00 baseline visual specifications
 */

export function PokemonListHeader() {
  return (
    <div className="mb-12 text-center">
      <h1 className="mb-4 text-5xl font-bold text-slate-800">Pokédex</h1>
      <p className="mx-auto max-w-2xl text-lg text-slate-600">
        Descubra e explore o fascinante mundo dos Pokémon. Role para descobrir mais criaturas
        incríveis.
      </p>
    </div>
  )
}
