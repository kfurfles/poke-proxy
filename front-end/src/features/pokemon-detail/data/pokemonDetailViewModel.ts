import type { PokemonResponseDto } from '../../../shared/api/generated/query/pokemonAPI.schemas'

export interface PokemonDetailViewModel {
  id: number
  name: string
  image: string | null
  types: string[]
  height: number
  weight: number
  heightInMeters: string
  weightInKg: string
  abilities: Array<{
    name: string
    isHidden: boolean
    slot: number
  }>
  stats: Array<{
    name: string
    baseStat: number
  }>
  baseExperience: number
}

/**
 * Transform PokemonResponseDto into a UI-optimized detail view model.
 * Includes display-friendly transformations for height/weight.
 */
export function toPokemonDetailViewModel(dto: PokemonResponseDto): PokemonDetailViewModel {
  // Extract frontDefault sprite URL
  let image: string | null = null

  if (dto.sprites?.frontDefault) {
    const frontDefault = dto.sprites.frontDefault
    if (typeof frontDefault === 'string') {
      image = frontDefault
    } else if (typeof frontDefault === 'object' && frontDefault !== null) {
      const possibleUrl = (frontDefault as Record<string, unknown>).url
      if (typeof possibleUrl === 'string') {
        image = possibleUrl
      }
    }
  }

  // Convert height from decimeters to meters (1 decimeter = 0.1 meters)
  const heightInMeters = (dto.height * 0.1).toFixed(1)

  // Convert weight from hectograms to kg (1 hectogram = 0.1 kg)
  const weightInKg = (dto.weight * 0.1).toFixed(1)

  return {
    id: dto.id,
    name: dto.name,
    image,
    types: dto.types,
    height: dto.height,
    weight: dto.weight,
    heightInMeters,
    weightInKg,
    abilities: dto.abilities,
    stats: dto.stats.map((stat) => ({
      name: stat.name,
      baseStat: stat.baseStat,
    })),
    baseExperience: dto.baseExperience,
  }
}
