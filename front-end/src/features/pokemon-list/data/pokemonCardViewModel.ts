import type { PokemonResponseDto } from '../../../shared/api/generated/query/pokemonAPI.schemas'

export interface PokemonCardViewModel {
  id: number
  name: string
  image: string | null
  types: string[]
}

/**
 * Transform PokemonResponseDto into a UI-optimized card view model.
 * Uses high-quality official artwork (475x475px) with fallback to standard sprite.
 */
export function toPokemonCardViewModel(dto: PokemonResponseDto): PokemonCardViewModel {
  return {
    id: dto.id,
    name: dto.name,
    image: dto.image,
    types: dto.types,
  }
}
