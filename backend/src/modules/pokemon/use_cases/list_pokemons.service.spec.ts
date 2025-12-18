import { Test, type TestingModule } from '@nestjs/testing';
import { ListPokemonsUseCase } from './list_pokemons.service';
import { PokemonApiService } from '../services/pokemon_api';
import { LoggerService } from '@/shared/logger';
import { CACHE_PORT, type CachePort } from '@/shared/cache';
import { isRight } from '@/shared/either';

describe('ListPokemonsUseCase', () => {
  let useCase: ListPokemonsUseCase;
  let pokemonApiService: jest.Mocked<PokemonApiService>;
  let cache: jest.Mocked<CachePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListPokemonsUseCase,
        {
          provide: PokemonApiService,
          useValue: {
            listPokemons: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: CACHE_PORT,
          useValue: {
            withCache: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(ListPokemonsUseCase);
    pokemonApiService = module.get(PokemonApiService);
    cache = module.get(CACHE_PORT);
  });

  it('should return cached value (HIT) without calling PokemonApiService', async () => {
    cache.withCache.mockResolvedValue({
      pokemons: ['pikachu'],
      total: 1,
      hasNext: false,
      hasPrevious: false,
    });

    const result = await useCase.execute({ limit: 10, offset: 0 });
    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.right.pokemons).toEqual(['pikachu']);
    }

    expect(pokemonApiService.listPokemons).not.toHaveBeenCalled();
  });

  it('should fetch on MISS (cache calls fetchFn)', async () => {
    cache.withCache.mockImplementation(async (_key, fetchFn) => fetchFn());

    pokemonApiService.listPokemons.mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      results: [
        { name: 'bulbasaur', url: 'x' },
        { name: 'ivysaur', url: 'y' },
      ],
    });

    const result = await useCase.execute({ limit: 10, offset: 0 });
    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.right.pokemons).toEqual(['bulbasaur', 'ivysaur']);
      expect(result.right.total).toBe(2);
    }

    expect(pokemonApiService.listPokemons).toHaveBeenCalledTimes(1);
  });

  it('should tolerate cache errors by bypassing cache and fetching', async () => {
    cache.withCache.mockRejectedValue(new Error('cache exploded'));

    pokemonApiService.listPokemons.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [{ name: 'ditto', url: 'x' }],
    });

    const result = await useCase.execute({ limit: 10, offset: 0 });
    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.right.pokemons).toEqual(['ditto']);
    }

    expect(pokemonApiService.listPokemons).toHaveBeenCalledTimes(1);
  });
});


