import { Test, type TestingModule } from '@nestjs/testing';
import { PokemonApiService } from '../services/pokemon_api';
import { ListPokemonsUseCase } from './list_pokemons.service';
import { isLeft, isRight } from '../../../shared/either';
import { LoggerService } from '@/shared/logger';
import { CACHE_PORT, type CachePort } from '@/shared/cache';

describe('ListPokemonsUseCase', () => {
  let useCase: ListPokemonsUseCase;
  let pokemonApiService: jest.Mocked<PokemonApiService>;
  let loggerService: jest.Mocked<LoggerService>;
  let cache: jest.Mocked<CachePort>;

  beforeEach(async () => {
    const mockPokemonApiService = {
      listPokemons: jest.fn(),
    };

    const mockLoggerService = {
      setContext: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      log: jest.fn(),
    };

    const mockCachePort = {
      withCache: jest.fn(async (_key: string, fetchFn: () => Promise<any>) =>
        fetchFn(),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListPokemonsUseCase,
        {
          provide: PokemonApiService,
          useValue: mockPokemonApiService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: CACHE_PORT,
          useValue: mockCachePort,
        },
      ],
    }).compile();

    useCase = module.get<ListPokemonsUseCase>(ListPokemonsUseCase);
    pokemonApiService = module.get(PokemonApiService);
    loggerService = module.get(LoggerService);
    cache = module.get(CACHE_PORT);
  });

  describe('execute', () => {
    it('should successfully list pokemons with default parameters', async () => {
      const mockResponse = {
        count: 1302,
        next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
        previous: null,
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
          { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
        ],
      };

      pokemonApiService.listPokemons.mockResolvedValue(mockResponse);

      const result = await useCase.execute({});

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.pokemons).toEqual([
          'bulbasaur',
          'ivysaur',
          'venusaur',
        ]);
        expect(result.right.total).toBe(1302);
        expect(result.right.hasNext).toBe(true);
        expect(result.right.hasPrevious).toBe(false);
      }
      expect(pokemonApiService.listPokemons).toHaveBeenCalledWith(20, 0);
    });

    it('should successfully list pokemons with custom pagination', async () => {
      const mockResponse = {
        count: 1302,
        next: 'https://pokeapi.co/api/v2/pokemon?offset=25&limit=15',
        previous: 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=10',
        results: [
          { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
          { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon/26/' },
        ],
      };

      pokemonApiService.listPokemons.mockResolvedValue(mockResponse);

      const result = await useCase.execute({ limit: 15, offset: 10 });

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.pokemons).toEqual(['pikachu', 'raichu']);
        expect(result.right.hasNext).toBe(true);
        expect(result.right.hasPrevious).toBe(true);
      }
      expect(pokemonApiService.listPokemons).toHaveBeenCalledWith(15, 10);
    });

    it('should reject limit below minimum (10)', async () => {
      const result = await useCase.execute({ limit: 5 });

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.type).toBe('validation');
        expect(result.left.message).toContain('Limit must be between 10 and 20');
      }
      expect(pokemonApiService.listPokemons).not.toHaveBeenCalled();
    });

    it('should reject limit above maximum (20)', async () => {
      const result = await useCase.execute({ limit: 25 });

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.type).toBe('validation');
        expect(result.left.message).toContain('Limit must be between 10 and 20');
      }
      expect(pokemonApiService.listPokemons).not.toHaveBeenCalled();
    });

    it('should reject negative offset', async () => {
      const result = await useCase.execute({ limit: 10, offset: -1 });

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.type).toBe('validation');
        expect(result.left.message).toContain('Offset must be non-negative');
      }
      expect(pokemonApiService.listPokemons).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      pokemonApiService.listPokemons.mockRejectedValue(
        new Error('Network error'),
      );

      const result = await useCase.execute({});

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.type).toBe('unexpected');
        expect(result.left.message).toBe('Network error');
      }

      expect(loggerService.error).toHaveBeenCalledWith(
        'ListPokemons failed',
        expect.any(Error),
        expect.objectContaining({
          limit: 20,
          offset: 0,
        }),
      );
    });

    it('should accept limit at minimum boundary (10)', async () => {
      const mockResponse = {
        count: 1302,
        next: 'https://pokeapi.co/api/v2/pokemon?offset=10&limit=10',
        previous: null,
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        ],
      };

      pokemonApiService.listPokemons.mockResolvedValue(mockResponse);

      const result = await useCase.execute({ limit: 10 });

      expect(isRight(result)).toBe(true);
      expect(pokemonApiService.listPokemons).toHaveBeenCalledWith(10, 0);
    });

    it('should accept limit at maximum boundary (20)', async () => {
      const mockResponse = {
        count: 1302,
        next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
        previous: null,
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        ],
      };

      pokemonApiService.listPokemons.mockResolvedValue(mockResponse);

      const result = await useCase.execute({ limit: 20 });

      expect(isRight(result)).toBe(true);
      expect(pokemonApiService.listPokemons).toHaveBeenCalledWith(20, 0);
    });
  });
});
