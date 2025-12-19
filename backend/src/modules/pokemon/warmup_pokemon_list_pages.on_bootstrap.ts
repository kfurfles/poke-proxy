import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ENV } from '@/config/env';
import { LoggerService } from '@/shared/logger';
import { WarmupPokemonListPagesUseCase } from './use_cases/warmup_pokemon_list_pages.use_case';

@Injectable()
export class WarmupPokemonListPagesOnBootstrap
  implements OnApplicationBootstrap
{
  constructor(
    private readonly warmup: WarmupPokemonListPagesUseCase,
    private readonly logger: LoggerService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (ENV.NODE_ENV === 'test') return;
    if (ENV.WARMUP_COUNT_PAGES_CACHE === 0) return;

    try {
      await this.warmup.execute(ENV.WARMUP_COUNT_PAGES_CACHE);
    } catch (error: unknown) {
      this.logger.error(
        'WarmupPokemonListPages failed (non-fatal)',
        error instanceof Error ? error : undefined,
      );
    }
  }
}

