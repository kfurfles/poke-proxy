// Mock data for Pokemon list endpoint
export const mockPokemonListPage1 = {
  data: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `pokemon-${i + 1}`,
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${i + 1}.png`,
    types: i === 0 ? ['grass', 'poison'] : i === 3 ? ['fire'] : i === 6 ? ['water'] : ['normal'],
  })),
  pagination: {
    offset: 0,
    limit: 20,
    total: 1000,
  },
}

export const mockPokemonListPage2 = {
  data: Array.from({ length: 20 }, (_, i) => ({
    id: i + 21,
    name: `pokemon-${i + 21}`,
    image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${i + 21}.png`,
    types: ['normal'],
  })),
  pagination: {
    offset: 20,
    limit: 20,
    total: 1000,
  },
}

// Bulbasaur specific mock
export const mockBulbasaur = {
  id: 1,
  name: 'bulbasaur',
  image:
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
  types: ['grass', 'poison'],
}
