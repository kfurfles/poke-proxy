import type { PokemonResponseDto } from '../../../shared/api/generated/query/pokemonAPI.schemas'

export interface PokemonCardViewModel {
  id: number
  name: string
  image: string | null
  types: string[]
}

/**
 * Transform PokemonResponseDto into a UI-optimized card view model.
 * Handles missing/malformed sprite data gracefully.
 */
export function toPokemonCardViewModel(dto: PokemonResponseDto): PokemonCardViewModel {
  // Extract frontDefault sprite URL, handling various possible shapes
  let image: string | null = null

  if (dto.sprites?.frontDefault) {
    const frontDefault = dto.sprites.frontDefault
    // The DTO type shows frontDefault as { [key: string]: unknown }
    // In reality, it's likely a string URL. Handle both cases.
    if (typeof frontDefault === 'string') {
      image = frontDefault
    } else if (typeof frontDefault === 'object' && frontDefault !== null) {
      // If it's an object, try to extract a URL property
      const possibleUrl = (frontDefault as Record<string, unknown>).url
      if (typeof possibleUrl === 'string') {
        image = possibleUrl
      }
    }
  }

  return {
    id: dto.id,
    name: dto.name,
    image,
    types: dto.types,
  }
}
