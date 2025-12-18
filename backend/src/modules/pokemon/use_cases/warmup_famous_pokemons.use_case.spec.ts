import { Test } from '@nestjs/testing';
import { left, right } from '@/shared/either';
import { LoggerService } from '@/shared/logger';
import { GeminiService } from '@/shared/gemini';
import { WarmupFamousPokemonsUseCase } from './warmup_famous_pokemons.use_case';
import { GetPokemonByNameUseCase } from './get_pokemon_by_name.service';
import { ListPokemonsUseCase } from './list_pokemons.service';

describe('WarmupFamousPokemonsUseCase', () => {
  const loggerMock = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    log: jest.fn(),
    setContext: jest.fn(),
  };

  const geminiMock = {
    generateText: jest.fn<Promise<string>, [string]>(),
  };

  const getByNameMock = {
    execute: jest.fn(),
  };

  const listMock = {
    execute: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('warms list cache and by-name cache for parsed names', async () => {
    geminiMock.generateText.mockResolvedValueOnce(
      '["pikachu","charizard","mewtwo","bulbasaur","squirtle","eevee","snorlax","gengar","lucario","jigglypuff"]',
    );

    listMock.execute.mockResolvedValueOnce(
      right({ pokemons: [], total: 0, hasNext: false, hasPrevious: false }),
    );

    getByNameMock.execute.mockImplementation(async ({ name }: { name: string }) =>
      right({ id: 1, name, height: 1, weight: 1, baseExperience: 1, sprites: { frontDefault: null, frontShiny: null, backDefault: null, backShiny: null }, stats: [], types: [], abilities: [] }),
    );

    const moduleRef = await Test.createTestingModule({
      providers: [
        WarmupFamousPokemonsUseCase,
        { provide: LoggerService, useValue: loggerMock },
        { provide: GeminiService, useValue: geminiMock },
        { provide: GetPokemonByNameUseCase, useValue: getByNameMock },
        { provide: ListPokemonsUseCase, useValue: listMock },
      ],
    }).compile();

    const uc = moduleRef.get(WarmupFamousPokemonsUseCase);
    const res = await uc.execute();

    expect(listMock.execute).toHaveBeenCalledWith({});
    expect(getByNameMock.execute).toHaveBeenCalledTimes(10);
    expect(res.names).toHaveLength(10);
    expect(res.warmed).toHaveLength(10);
    expect(res.failed).toHaveLength(0);
    expect(res.listCacheWarmed).toBe(true);
  });

  it('parses JSON array from surrounding text and filters invalid entries', async () => {
    geminiMock.generateText.mockResolvedValueOnce(
      'Sure! Here are the names:\n["PIKACHU","Mr-Mime","bad name","Eevee"]\nEnjoy!',
    );

    listMock.execute.mockResolvedValueOnce(
      right({ pokemons: [], total: 0, hasNext: false, hasPrevious: false }),
    );

    getByNameMock.execute.mockImplementation(async ({ name }: { name: string }) =>
      right({ id: 1, name, height: 1, weight: 1, baseExperience: 1, sprites: { frontDefault: null, frontShiny: null, backDefault: null, backShiny: null }, stats: [], types: [], abilities: [] }),
    );

    const moduleRef = await Test.createTestingModule({
      providers: [
        WarmupFamousPokemonsUseCase,
        { provide: LoggerService, useValue: loggerMock },
        { provide: GeminiService, useValue: geminiMock },
        { provide: GetPokemonByNameUseCase, useValue: getByNameMock },
        { provide: ListPokemonsUseCase, useValue: listMock },
      ],
    }).compile();

    const uc = moduleRef.get(WarmupFamousPokemonsUseCase);
    const res = await uc.execute();

    expect(res.names).toEqual(['pikachu', 'mr-mime', 'eevee']);
    expect(getByNameMock.execute).toHaveBeenCalledTimes(3);
  });

  it('returns failed entries when by-name use case returns Left', async () => {
    geminiMock.generateText.mockResolvedValueOnce('["pikachu","charizard"]');
    listMock.execute.mockResolvedValueOnce(
      right({ pokemons: [], total: 0, hasNext: false, hasPrevious: false }),
    );

    getByNameMock.execute
      .mockResolvedValueOnce(right({}))
      .mockResolvedValueOnce(left({ type: 'not_found', message: 'not found' }));

    const moduleRef = await Test.createTestingModule({
      providers: [
        WarmupFamousPokemonsUseCase,
        { provide: LoggerService, useValue: loggerMock },
        { provide: GeminiService, useValue: geminiMock },
        { provide: GetPokemonByNameUseCase, useValue: getByNameMock },
        { provide: ListPokemonsUseCase, useValue: listMock },
      ],
    }).compile();

    const uc = moduleRef.get(WarmupFamousPokemonsUseCase);
    const res = await uc.execute();

    expect(res.warmed).toEqual(['pikachu']);
    expect(res.failed).toEqual([{ name: 'charizard', reason: 'not found' }]);
  });
});


