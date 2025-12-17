import { Injectable } from '@nestjs/common';
import { PokemonApiService, PokemonDetail } from '../services/pokemon_api';
import type { AppError } from '../../../shared/app_error';
import { left, right, type Either } from '../../../shared/either';

// Input/Output Contracts
export interface GetPokemonByNameUseCaseInput {
  name: string;
}

export interface PokemonOutput {
  id: number;
  name: string;
  height: number;
  weight: number;
  baseExperience: number;
  sprites: {
    frontDefault: string | null;
    frontShiny: string | null;
    backDefault: string | null;
    backShiny: string | null;
  };
  stats: Array<{
    name: string;
    baseStat: number;
    effort: number;
  }>;
  types: string[];
  abilities: Array<{
    name: string;
    isHidden: boolean;
    slot: number;
  }>;
}

export type GetPokemonByNameUseCaseOutput = Either<AppError, PokemonOutput>;

@Injectable()
export class GetPokemonByNameUseCase {
  constructor(private readonly pokemonApiService: PokemonApiService) {}

  async execute(
    input: GetPokemonByNameUseCaseInput,
  ): Promise<GetPokemonByNameUseCaseOutput> {
    const validationError = this.validateInput(input);
    if (validationError) return left(validationError);

    try {
      const pokemon = await this.pokemonApiService.getPokemonByName(input.name);
      return right(this.transformToOutput(pokemon));
    } catch (error: unknown) {
      return left(this.mapError(error));
    }
  }

  private validateInput(input: GetPokemonByNameUseCaseInput): AppError | null {
    if (!input.name || input.name.trim().length === 0) {
      return { type: 'validation', message: 'Pokemon name is required' };
    }

    // Check if name contains only valid characters (letters, numbers, hyphens)
    const validNamePattern = /^[a-zA-Z0-9-]+$/;
    if (!validNamePattern.test(input.name)) {
      return {
        type: 'validation',
        message: 'Pokemon name must contain only letters, numbers, and hyphens',
      };
    }

    return null;
  }

  private mapError(error: unknown): AppError {
    const status =
      typeof error === 'object' &&
      error !== null &&
      'getStatus' in error &&
      typeof (error as { getStatus?: unknown }).getStatus === 'function'
        ? (error as { getStatus: () => number }).getStatus()
        : undefined;

    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';

    if (status === 404) return { type: 'not_found', message };
    return { type: 'unexpected', message };
  }

  private transformToOutput(pokemon: PokemonDetail): PokemonOutput {
    return {
      id: pokemon.id,
      name: pokemon.name,
      height: pokemon.height,
      weight: pokemon.weight,
      baseExperience: pokemon.base_experience,
      sprites: {
        frontDefault: pokemon.sprites.front_default,
        frontShiny: pokemon.sprites.front_shiny,
        backDefault: pokemon.sprites.back_default,
        backShiny: pokemon.sprites.back_shiny,
      },
      stats: pokemon.stats.map((stat) => ({
        name: stat.stat.name,
        baseStat: stat.base_stat,
        effort: stat.effort,
      })),
      types: pokemon.types.map((type) => type.type.name),
      abilities: pokemon.abilities.map((ability) => ({
        name: ability.ability.name,
        isHidden: ability.is_hidden,
        slot: ability.slot,
      })),
    };
  }
}
