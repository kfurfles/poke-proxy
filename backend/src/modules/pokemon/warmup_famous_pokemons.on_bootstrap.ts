import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ENV } from '@/config/env';
import { LoggerService } from '@/shared/logger';
import { WarmupFamousPokemonsUseCase } from './use_cases/warmup_famous_pokemons.use_case';

@Injectable()
export class WarmupFamousPokemonsOnBootstrap implements OnApplicationBootstrap {
  constructor(
    private readonly warmup: WarmupFamousPokemonsUseCase,
    private readonly logger: LoggerService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (ENV.NODE_ENV === 'test') return;
    if (!ENV.WARMUP_FAMOUS_POKEMON_CACHE) return;

    if (!ENV.GEMINI_API_KEY) {
      this.logger.warn(
        'WarmupFamousPokemons skipped: GEMINI_API_KEY is not configured',
      );
      return;
    }

    try {
      await this.warmup.execute();
    } catch (error: unknown) {
      this.logger.error(
        'WarmupFamousPokemons failed (non-fatal)',
        error instanceof Error ? error : undefined,
      );
    }
  }
}


