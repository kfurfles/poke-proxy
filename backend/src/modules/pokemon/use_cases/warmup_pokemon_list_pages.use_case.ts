import { Injectable } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import { LoggerService } from '@/shared/logger';
import { isLeft } from '@/shared/either';
import { ListPokemonsUseCase } from './list_pokemons.service';

export interface WarmupPokemonListPagesResult {
  pagesRequested: number;
  pagesWarmed: number;
  pagesFailed: number;
  details: Array<{ page: number; offset: number; success: boolean }>;
}

@Injectable()
export class WarmupPokemonListPagesUseCase {
  private readonly DEFAULT_LIMIT = 20;

  constructor(
    private readonly listPokemons: ListPokemonsUseCase,
    private readonly logger: LoggerService,
  ) {}

  async execute(countPages: number): Promise<WarmupPokemonListPagesResult> {
    const tracer = trace.getTracer('pokemon.warmup');

    return tracer.startActiveSpan(
      'warmup_pokemon_list_pages',
      async (span) => {
        try {
          this.logger.info('WarmupPokemonListPages started', { countPages });

          const details: Array<{
            page: number;
            offset: number;
            success: boolean;
          }> = [];
          let pagesWarmed = 0;
          let pagesFailed = 0;

          for (let page = 0; page < countPages; page++) {
            const offset = page * this.DEFAULT_LIMIT;

            try {
              const result = await this.listPokemons.execute({
                limit: this.DEFAULT_LIMIT,
                offset,
              });

              if (isLeft(result)) {
                this.logger.warn('WarmupPokemonListPages page failed', {
                  page,
                  offset,
                  errorType: result.left.type,
                  errorMessage: result.left.message,
                });
                details.push({ page, offset, success: false });
                pagesFailed++;
              } else {
                details.push({ page, offset, success: true });
                pagesWarmed++;
              }
            } catch (error: unknown) {
              this.logger.warn('WarmupPokemonListPages page failed', {
                page,
                offset,
                errorMessage:
                  error instanceof Error ? error.message : String(error),
              });
              details.push({ page, offset, success: false });
              pagesFailed++;
            }
          }

          this.logger.info('WarmupPokemonListPages finished', {
            pagesRequested: countPages,
            pagesWarmed,
            pagesFailed,
          });

          return {
            pagesRequested: countPages,
            pagesWarmed,
            pagesFailed,
            details,
          };
        } finally {
          span.end();
        }
      },
    );
  }
}

