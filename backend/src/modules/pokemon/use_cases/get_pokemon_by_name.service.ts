import { Injectable } from '@nestjs/common';
import { PokemonApiService, PokemonDetail } from '../services/pokemon_api';
import type { AppError } from '../../../shared/app_error';
import { left, right, type Either } from '../../../shared/either';
import { LogContext } from '@/shared/decorators';
import { LoggerService } from '@/shared/logger';

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
  constructor(
    private readonly pokemonApiService: PokemonApiService,
    private readonly logger: LoggerService,
  ) {}

  @LogContext({
    operation: 'get_pokemon_by_name',
  })
  async execute(
    input: GetPokemonByNameUseCaseInput,
  ): Promise<GetPokemonByNameUseCaseOutput> {
    const validationError = this.validateInput(input);
    if (validationError) return left(validationError);

    const startedAt = Date.now();
    this.logger.debug('GetPokemonByName started', {
      pokemonName: input.name,
    });

    try {
      const pokemon = await this.pokemonApiService.getPokemonByName(input.name);

      this.logger.info('GetPokemonByName succeeded', {
        pokemonName: input.name,
        pokemonId: pokemon.id,
        durationMs: Date.now() - startedAt,
      });

      return right(this.transformToOutput(pokemon));
    } catch (error: unknown) {
      const mappedError = this.mapError(error);

      if (mappedError.type === 'not_found') {
        this.logger.warn('GetPokemonByName not found', {
          pokemonName: input.name,
          message: mappedError.message,
          durationMs: Date.now() - startedAt,
        });
      } else {
        this.logger.error(
          'GetPokemonByName failed',
          error instanceof Error ? error : undefined,
          {
            pokemonName: input.name,
            mappedError,
            durationMs: Date.now() - startedAt,
            rawError: error instanceof Error ? undefined : error,
          },
        );
      }

      return left(mappedError);
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
      abilities: pokemon.abilities
        .slice()
        .sort((a, b) => a.ability.name.localeCompare(b.ability.name))
        .map((ability) => ({
          name: ability.ability.name,
          isHidden: ability.is_hidden,
          slot: ability.slot,
        })),
    };
  }
}
