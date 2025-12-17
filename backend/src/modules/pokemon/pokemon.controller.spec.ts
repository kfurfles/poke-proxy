import { HttpException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { PokemonController } from './pokemon.controller';
import { GetPokemonByNameUseCase } from './use_cases/get_pokemon_by_name.service';
import { ListPokemonsUseCase } from './use_cases/list_pokemons.service';
import { left, right } from '../../shared/either';

describe('PokemonController', () => {
  let controller: PokemonController;
  let listPokemonsUseCase: jest.Mocked<ListPokemonsUseCase>;
  let getPokemonByNameUseCase: jest.Mocked<GetPokemonByNameUseCase>;

  beforeEach(async () => {
    const mockListPokemonsUseCase = {
      execute: jest.fn(),
    };

    const mockGetPokemonByNameUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonController],
      providers: [
        {
          provide: ListPokemonsUseCase,
          useValue: mockListPokemonsUseCase,
        },
        {
          provide: GetPokemonByNameUseCase,
          useValue: mockGetPokemonByNameUseCase,
        },
      ],
    }).compile();

    controller = module.get<PokemonController>(PokemonController);
    listPokemonsUseCase = module.get(ListPokemonsUseCase);
    getPokemonByNameUseCase = module.get(GetPokemonByNameUseCase);
  });

  describe('listPokemons', () => {
    it('should return list of pokemons with default parameters', async () => {
      const mockData = {
        pokemons: ['bulbasaur', 'ivysaur', 'venusaur'],
        total: 1302,
        hasNext: true,
        hasPrevious: false,
      };

      listPokemonsUseCase.execute.mockResolvedValue(right(mockData));

      const result = await controller.listPokemons({ limit: 20, offset: 0 });

      expect(result).toEqual(mockData);
      expect(listPokemonsUseCase.execute).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
      });
    });

    it('should return list of pokemons with custom parameters', async () => {
      const mockData = {
        pokemons: ['pikachu', 'raichu'],
        total: 1302,
        hasNext: true,
        hasPrevious: true,
      };

      listPokemonsUseCase.execute.mockResolvedValue(right(mockData));

      const result = await controller.listPokemons({ limit: 15, offset: 10 });

      expect(result).toEqual(mockData);
      expect(listPokemonsUseCase.execute).toHaveBeenCalledWith({
        limit: 15,
        offset: 10,
      });
    });

    it('should throw error when use case fails', async () => {
      const mockError = {
        type: 'validation' as const,
        message: 'Limit must be between 10 and 20',
      };

      listPokemonsUseCase.execute.mockResolvedValue(left(mockError));

      await expect(
        controller.listPokemons({ limit: 25, offset: 0 }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getPokemonByName', () => {
    it('should return pokemon details by name', async () => {
      const mockData = {
        id: 25,
        name: 'pikachu',
        height: 4,
        weight: 60,
        baseExperience: 112,
        sprites: {
          frontDefault: 'url',
          frontShiny: 'url',
          backDefault: 'url',
          backShiny: 'url',
        },
        stats: [],
        types: ['electric'],
        abilities: [],
      };

      getPokemonByNameUseCase.execute.mockResolvedValue(right(mockData));

      const result = await controller.getPokemonByName({ name: 'pikachu' });

      expect(result).toEqual(mockData);
      expect(getPokemonByNameUseCase.execute).toHaveBeenCalledWith({
        name: 'pikachu',
      });
    });

    it('should throw error when pokemon not found', async () => {
      const mockError = {
        type: 'not_found' as const,
        message: 'Pokemon with name "fakemon" not found',
      };

      getPokemonByNameUseCase.execute.mockResolvedValue(left(mockError));

      await expect(
        controller.getPokemonByName({ name: 'fakemon' }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error when use case fails', async () => {
      const mockError = {
        type: 'validation' as const,
        message: 'Pokemon name is required',
      };

      getPokemonByNameUseCase.execute.mockResolvedValue(left(mockError));

      await expect(controller.getPokemonByName({ name: '' })).rejects.toThrow(
        HttpException,
      );
    });
  });
});
