import { Test, type TestingModule } from '@nestjs/testing';
import { GetPokemonByNameUseCase } from './get_pokemon_by_name.service';
import { PokemonApiService } from '../services/pokemon_api';
import { LoggerService } from '@/shared/logger';
import { CACHE_PORT, type CachePort } from '@/shared/cache';
import { isRight } from '@/shared/either';

describe('GetPokemonByNameUseCase', () => {
  let useCase: GetPokemonByNameUseCase;
  let pokemonApiService: jest.Mocked<PokemonApiService>;
  let cache: jest.Mocked<CachePort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPokemonByNameUseCase,
        {
          provide: PokemonApiService,
          useValue: {
            getPokemonByName: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            debug: jest.fn(),
            info: jest.fn(),
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

    useCase = module.get(GetPokemonByNameUseCase);
    pokemonApiService = module.get(PokemonApiService);
    cache = module.get(CACHE_PORT);
  });

  it('should return cached value (HIT) without calling PokemonApiService', async () => {
    cache.withCache.mockResolvedValue({
      id: 25,
      name: 'pikachu',
      height: 4,
      weight: 60,
      baseExperience: 112,
      sprites: {
        frontDefault: null,
        frontShiny: null,
        backDefault: null,
        backShiny: null,
      },
      stats: [],
      types: ['electric'],
      abilities: [],
    });

    const result = await useCase.execute({ name: 'pikachu' });
    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.right.id).toBe(25);
    }

    expect(pokemonApiService.getPokemonByName).not.toHaveBeenCalled();
  });

  it('should fetch on MISS (cache calls fetchFn)', async () => {
    cache.withCache.mockImplementation(async (_key, fetchFn) => fetchFn());

    pokemonApiService.getPokemonByName.mockResolvedValue({
      id: 132,
      name: 'ditto',
      height: 3,
      weight: 40,
      base_experience: 101,
      sprites: {
        front_default: null,
        front_shiny: null,
        back_default: null,
        back_shiny: null,
      },
      stats: [],
      types: [{ slot: 1, type: { name: 'normal', url: 'x' } }],
      abilities: [],
    });

    const result = await useCase.execute({ name: 'ditto' });
    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.right.name).toBe('ditto');
      expect(result.right.types).toEqual(['normal']);
    }

    expect(pokemonApiService.getPokemonByName).toHaveBeenCalledTimes(1);
  });

  it('should tolerate cache errors by bypassing cache and fetching', async () => {
    cache.withCache.mockRejectedValue(new Error('cache exploded'));

    pokemonApiService.getPokemonByName.mockResolvedValue({
      id: 1,
      name: 'bulbasaur',
      height: 7,
      weight: 69,
      base_experience: 64,
      sprites: {
        front_default: null,
        front_shiny: null,
        back_default: null,
        back_shiny: null,
      },
      stats: [],
      types: [{ slot: 1, type: { name: 'grass', url: 'x' } }],
      abilities: [],
    });

    const result = await useCase.execute({ name: 'bulbasaur' });
    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.right.id).toBe(1);
      expect(result.right.types).toEqual(['grass']);
    }

    expect(pokemonApiService.getPokemonByName).toHaveBeenCalledTimes(1);
  });
});


