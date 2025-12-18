import { Injectable } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import { GeminiService } from '@/shared/gemini';
import { LoggerService } from '@/shared/logger';
import { isLeft } from '@/shared/either';
import { GetPokemonByNameUseCase } from './get_pokemon_by_name.service';
import { ListPokemonsUseCase } from './list_pokemons.service';

export interface WarmupFamousPokemonsResult {
  names: string[];
  warmed: string[];
  failed: Array<{ name: string; reason: string }>;
  listCacheWarmed: boolean;
}

@Injectable()
export class WarmupFamousPokemonsUseCase {
  constructor(
    private readonly gemini: GeminiService,
    private readonly getPokemonByName: GetPokemonByNameUseCase,
    private readonly listPokemons: ListPokemonsUseCase,
    private readonly logger: LoggerService,
  ) {}

  async execute(): Promise<WarmupFamousPokemonsResult> {
    const tracer = trace.getTracer('pokemon.warmup');

    return tracer.startActiveSpan('warmup_famous_pokemons', async (span) => {
      try {
        this.logger.info('WarmupFamousPokemons started');

        const prompt =
          'Return ONLY a valid JSON array of exactly 10 Pokémon names. ' +
          'All lowercase. No extra text. Example: ["pikachu","charizard",...]';

        const raw = await this.gemini.generateText(prompt);
        const names = this.parseNames(raw);

        // Warm list cache once (default pagination settings)
        const listResult = await this.listPokemons.execute({});
        const listCacheWarmed = !isLeft(listResult);
        if (!listCacheWarmed) {
          this.logger.warn('WarmupFamousPokemons list cache warm-up failed', {
            errorType: listResult.left.type,
            errorMessage: listResult.left.message,
          });
        }

        const perName = await Promise.allSettled(
          names.map(async (name) => {
            const result = await this.getPokemonByName.execute({ name });
            if (isLeft(result)) {
              return { ok: false as const, name, reason: result.left.message };
            }
            return { ok: true as const, name };
          }),
        );

        const warmed: string[] = [];
        const failed: Array<{ name: string; reason: string }> = [];
        for (const r of perName) {
          if (r.status === 'fulfilled') {
            if (r.value.ok) warmed.push(r.value.name);
            else failed.push({ name: r.value.name, reason: r.value.reason });
          } else {
            failed.push({
              name: 'unknown',
              reason:
                r.reason instanceof Error ? r.reason.message : String(r.reason),
            });
          }
        }

        this.logger.info('WarmupFamousPokemons finished', {
          names,
          warmedCount: warmed.length,
          failedCount: failed.length,
          listCacheWarmed,
        });

        return { names, warmed, failed, listCacheWarmed };
      } finally {
        span.end();
      }
    });
  }

  private parseNames(raw: string): string[] {
    const parsed =
      this.tryParseJsonArray(raw) ?? this.tryParseJsonArrayFromText(raw);

    if (!parsed) {
      this.logger.warn('WarmupFamousPokemons could not parse Gemini output', {
        outputPreview: raw.slice(0, 300),
      });
      throw new Error('Gemini output is not a JSON array of names');
    }

    const normalized = parsed
      .map((v) => String(v).toLowerCase().trim())
      .filter((v) => v.length > 0)
      .map((v) => v.replace(/^\"|\"$/g, ''))
      .filter((v) => /^[a-z0-9-]+$/.test(v));

    const unique: string[] = [];
    for (const n of normalized) {
      if (!unique.includes(n)) unique.push(n);
    }

    if (unique.length === 0) {
      throw new Error('Gemini output contains no valid Pokémon names');
    }

    return unique.slice(0, 10);
  }

  private tryParseJsonArray(raw: string): unknown[] | null {
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v : null;
    } catch {
      return null;
    }
  }

  private tryParseJsonArrayFromText(text: string): unknown[] | null {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1 || end <= start) return null;
    return this.tryParseJsonArray(text.slice(start, end + 1));
  }
}


