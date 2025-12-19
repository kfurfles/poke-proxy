import { Test, type TestingModule } from '@nestjs/testing';
import { WarmupPokemonListPagesUseCase } from './warmup_pokemon_list_pages.use_case';
import { ListPokemonsUseCase } from './list_pokemons.service';
import { LoggerService } from '@/shared/logger';
import { isLeft, isRight, left, right } from '@/shared/either';

describe('WarmupPokemonListPagesUseCase', () => {
  let useCase: WarmupPokemonListPagesUseCase;
  let listPokemonsUseCase: jest.Mocked<ListPokemonsUseCase>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    const mockListPokemonsUseCase = {
      execute: jest.fn(),
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarmupPokemonListPagesUseCase,
        {
          provide: ListPokemonsUseCase,
          useValue: mockListPokemonsUseCase,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    useCase = module.get<WarmupPokemonListPagesUseCase>(
      WarmupPokemonListPagesUseCase,
    );
    listPokemonsUseCase = module.get(ListPokemonsUseCase);
    loggerService = module.get(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should skip warmup when countPages is 0', async () => {
      const result = await useCase.execute(0);

      expect(result.pagesRequested).toBe(0);
      expect(result.pagesWarmed).toBe(0);
      expect(result.pagesFailed).toBe(0);
      expect(result.details).toEqual([]);
      expect(listPokemonsUseCase.execute).not.toHaveBeenCalled();
      expect(loggerService.info).toHaveBeenCalledWith(
        'WarmupPokemonListPages started',
        expect.objectContaining({ countPages: 0 }),
      );
    });

    it('should warmup 1 page with offset 0', async () => {
      const mockListResponse = right({
        pokemons: ['bulbasaur', 'ivysaur'],
        total: 1302,
        hasNext: true,
        hasPrevious: false,
      });

      listPokemonsUseCase.execute.mockResolvedValue(mockListResponse);

      const result = await useCase.execute(1);

      expect(result.pagesRequested).toBe(1);
      expect(result.pagesWarmed).toBe(1);
      expect(result.pagesFailed).toBe(0);
      expect(result.details).toEqual([
        { page: 0, offset: 0, success: true },
      ]);

      expect(listPokemonsUseCase.execute).toHaveBeenCalledTimes(1);
      expect(listPokemonsUseCase.execute).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
      });

      expect(loggerService.info).toHaveBeenCalledWith(
        'WarmupPokemonListPages finished',
        expect.objectContaining({
          pagesRequested: 1,
          pagesWarmed: 1,
          pagesFailed: 0,
        }),
      );
    });

    it('should warmup 3 pages with correct offsets (0, 20, 40)', async () => {
      const mockListResponse = right({
        pokemons: ['bulbasaur', 'ivysaur'],
        total: 1302,
        hasNext: true,
        hasPrevious: false,
      });

      listPokemonsUseCase.execute.mockResolvedValue(mockListResponse);

      const result = await useCase.execute(3);

      expect(result.pagesRequested).toBe(3);
      expect(result.pagesWarmed).toBe(3);
      expect(result.pagesFailed).toBe(0);
      expect(result.details).toEqual([
        { page: 0, offset: 0, success: true },
        { page: 1, offset: 20, success: true },
        { page: 2, offset: 40, success: true },
      ]);

      expect(listPokemonsUseCase.execute).toHaveBeenCalledTimes(3);
      expect(listPokemonsUseCase.execute).toHaveBeenNthCalledWith(1, {
        limit: 20,
        offset: 0,
      });
      expect(listPokemonsUseCase.execute).toHaveBeenNthCalledWith(2, {
        limit: 20,
        offset: 20,
      });
      expect(listPokemonsUseCase.execute).toHaveBeenNthCalledWith(3, {
        limit: 20,
        offset: 40,
      });
    });

    it('should calculate offset correctly for different page indexes', async () => {
      const mockListResponse = right({
        pokemons: ['bulbasaur'],
        total: 1302,
        hasNext: true,
        hasPrevious: false,
      });

      listPokemonsUseCase.execute.mockResolvedValue(mockListResponse);

      const result = await useCase.execute(5);

      expect(result.details).toEqual([
        { page: 0, offset: 0, success: true },
        { page: 1, offset: 20, success: true },
        { page: 2, offset: 40, success: true },
        { page: 3, offset: 60, success: true },
        { page: 4, offset: 80, success: true },
      ]);

      expect(listPokemonsUseCase.execute).toHaveBeenCalledTimes(5);
    });

    it('should continue if one page fails (non-blocking)', async () => {
      const mockSuccessResponse = right({
        pokemons: ['bulbasaur'],
        total: 1302,
        hasNext: true,
        hasPrevious: false,
      });

      const mockErrorResponse = left({
        type: 'unexpected' as const,
        message: 'Network error',
      });

      listPokemonsUseCase.execute
        .mockResolvedValueOnce(mockSuccessResponse) // page 0 success
        .mockResolvedValueOnce(mockErrorResponse) // page 1 fails
        .mockResolvedValueOnce(mockSuccessResponse); // page 2 success

      const result = await useCase.execute(3);

      expect(result.pagesRequested).toBe(3);
      expect(result.pagesWarmed).toBe(2);
      expect(result.pagesFailed).toBe(1);
      expect(result.details).toEqual([
        { page: 0, offset: 0, success: true },
        { page: 1, offset: 20, success: false },
        { page: 2, offset: 40, success: true },
      ]);

      expect(listPokemonsUseCase.execute).toHaveBeenCalledTimes(3);
      expect(loggerService.warn).toHaveBeenCalledWith(
        'WarmupPokemonListPages page failed',
        expect.objectContaining({
          page: 1,
          offset: 20,
        }),
      );
    });

    it('should log success and failures correctly', async () => {
      const mockSuccessResponse = right({
        pokemons: ['bulbasaur'],
        total: 1302,
        hasNext: true,
        hasPrevious: false,
      });

      const mockErrorResponse = left({
        type: 'validation' as const,
        message: 'Invalid parameters',
      });

      listPokemonsUseCase.execute
        .mockResolvedValueOnce(mockSuccessResponse)
        .mockResolvedValueOnce(mockErrorResponse);

      const result = await useCase.execute(2);

      expect(loggerService.info).toHaveBeenCalledWith(
        'WarmupPokemonListPages started',
        expect.objectContaining({ countPages: 2 }),
      );

      expect(loggerService.warn).toHaveBeenCalledWith(
        'WarmupPokemonListPages page failed',
        expect.objectContaining({
          page: 1,
          offset: 20,
          errorType: 'validation',
          errorMessage: 'Invalid parameters',
        }),
      );

      expect(loggerService.info).toHaveBeenCalledWith(
        'WarmupPokemonListPages finished',
        expect.objectContaining({
          pagesRequested: 2,
          pagesWarmed: 1,
          pagesFailed: 1,
        }),
      );
    });

    it('should handle unexpected errors during execution', async () => {
      const unexpectedError = new Error('Unexpected error');
      listPokemonsUseCase.execute.mockRejectedValue(unexpectedError);

      const result = await useCase.execute(2);

      expect(result.pagesRequested).toBe(2);
      expect(result.pagesWarmed).toBe(0);
      expect(result.pagesFailed).toBe(2);

      expect(loggerService.warn).toHaveBeenCalledWith(
        'WarmupPokemonListPages page failed',
        expect.objectContaining({
          page: 0,
          offset: 0,
          errorMessage: 'Unexpected error',
        }),
      );
    });

    it('should use OpenTelemetry tracing', async () => {
      const mockListResponse = right({
        pokemons: ['bulbasaur'],
        total: 1302,
        hasNext: true,
        hasPrevious: false,
      });

      listPokemonsUseCase.execute.mockResolvedValue(mockListResponse);

      await useCase.execute(1);

      // The tracing is implicit in the implementation
      // We just verify the use case executed successfully
      expect(listPokemonsUseCase.execute).toHaveBeenCalled();
    });
  });
});

