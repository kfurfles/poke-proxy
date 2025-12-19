// Mock data for Pokemon list endpoint
export const mockPokemonListPage1 = {
  pokemons: Array.from({ length: 20 }, (_, i) => `pokemon-${i + 1}`),
  total: 1000,
  hasNext: true,
  hasPrevious: false,
}

export const mockPokemonListPage2 = {
  pokemons: Array.from({ length: 20 }, (_, i) => `pokemon-${i + 21}`),
  total: 1000,
  hasNext: true,
  hasPrevious: true,
}

// Bulbasaur specific mock
export const mockBulbasaur = {
  id: 1,
  name: 'bulbasaur',
  image:
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
  types: ['grass', 'poison'],
}
