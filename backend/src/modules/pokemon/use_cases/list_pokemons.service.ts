import { Injectable } from '@nestjs/common';
import { PokemonApiService, PokemonBasicInfo } from '../services/pokemon_api';
import type { AppError } from '../../../shared/app_error';
import { left, right, type Either } from '../../../shared/either';
import { LogContext } from '@/shared/decorators';
import { LoggerService } from '@/shared/logger';

// Input/Output Contracts
export interface ListPokemonsUseCaseInput {
  limit?: number;
  offset?: number;
}

export interface ListPokemonsData {
  pokemons: string[];
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type ListPokemonsUseCaseOutput = Either<AppError, ListPokemonsData>;

@Injectable()
export class ListPokemonsUseCase {
  private readonly MIN_LIMIT = 10;
  private readonly MAX_LIMIT = 20;
  private readonly DEFAULT_LIMIT = 20;
  private readonly DEFAULT_OFFSET = 0;

  constructor(
    private readonly pokemonApiService: PokemonApiService,
    private readonly logger: LoggerService,
  ) {}

  @LogContext({
    operation: 'list_pokemons',
  })
  async execute(
    input: ListPokemonsUseCaseInput,
  ): Promise<ListPokemonsUseCaseOutput> {
    const validatedInput = this.validateInput(input);
    if ('error' in validatedInput) return left(validatedInput.error);

    this.logger.debug('ListPokemons started', {
      limit: validatedInput.limit,
      offset: validatedInput.offset,
    });

    try {
      const response = await this.pokemonApiService.listPokemons(
        validatedInput.limit,
        validatedInput.offset,
      );

      return right({
        pokemons: response.results.map(
          (pokemon: PokemonBasicInfo) => pokemon.name,
        ),
        total: response.count,
        hasNext: response.next !== null,
        hasPrevious: response.previous !== null,
      });
    } catch (error: unknown) {
      this.logger.error(
        'ListPokemons failed',
        error instanceof Error ? error : undefined,
        {
          limit: validatedInput.limit,
          offset: validatedInput.offset,
          rawError: error instanceof Error ? undefined : error,
        },
      );
      return left(this.mapError(error));
    }
  }

  private validateInput(
    input: ListPokemonsUseCaseInput,
  ): { limit: number; offset: number } | { error: AppError } {
    const limit =
      typeof input.limit === 'number' && Number.isFinite(input.limit)
        ? input.limit
        : this.DEFAULT_LIMIT;
    const offset =
      typeof input.offset === 'number' && Number.isFinite(input.offset)
        ? input.offset
        : this.DEFAULT_OFFSET;

    // Validate limit range
    if (limit < this.MIN_LIMIT || limit > this.MAX_LIMIT) {
      return {
        error: {
          type: 'validation',
          message: `Limit must be between ${this.MIN_LIMIT} and ${this.MAX_LIMIT}`,
        },
      };
    }

    // Validate offset is non-negative
    if (offset < 0) {
      return {
        error: { type: 'validation', message: 'Offset must be non-negative' },
      };
    }

    return { limit, offset };
  }

  private mapError(error: unknown): AppError {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return { type: 'unexpected', message };
  }
}
