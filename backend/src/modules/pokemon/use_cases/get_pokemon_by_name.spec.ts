/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { HttpException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { PokemonApiService, type PokemonDetail } from '../services/pokemon_api';
import { GetPokemonByNameUseCase } from './get_pokemon_by_name.service';
import { isLeft, isRight } from '../../../shared/either';

describe('GetPokemonByNameUseCase', () => {
  let useCase: GetPokemonByNameUseCase;
  let pokemonApiService: jest.Mocked<PokemonApiService>;

  const mockPokemonDetail: PokemonDetail = {
    id: 25,
    name: 'pikachu',
    height: 4,
    weight: 60,
    base_experience: 112,
    sprites: {
      front_default:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
      front_shiny:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png',
      back_default:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/25.png',
      back_shiny:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/25.png',
    },
    stats: [
      {
        base_stat: 35,
        effort: 0,
        stat: {
          name: 'hp',
          url: 'https://pokeapi.co/api/v2/stat/1/',
        },
      },
      {
        base_stat: 55,
        effort: 0,
        stat: {
          name: 'attack',
          url: 'https://pokeapi.co/api/v2/stat/2/',
        },
      },
      {
        base_stat: 90,
        effort: 2,
        stat: {
          name: 'speed',
          url: 'https://pokeapi.co/api/v2/stat/6/',
        },
      },
    ],
    types: [
      {
        slot: 1,
        type: {
          name: 'electric',
          url: 'https://pokeapi.co/api/v2/type/13/',
        },
      },
    ],
    abilities: [
      {
        ability: {
          name: 'static',
          url: 'https://pokeapi.co/api/v2/ability/9/',
        },
        is_hidden: false,
        slot: 1,
      },
      {
        ability: {
          name: 'lightning-rod',
          url: 'https://pokeapi.co/api/v2/ability/31/',
        },
        is_hidden: true,
        slot: 3,
      },
    ],
  };

  beforeEach(async () => {
    const mockPokemonApiService = {
      getPokemonByName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPokemonByNameUseCase,
        {
          provide: PokemonApiService,
          useValue: mockPokemonApiService,
        },
      ],
    }).compile();

    useCase = module.get<GetPokemonByNameUseCase>(GetPokemonByNameUseCase);
    pokemonApiService = module.get(PokemonApiService);
  });

  describe('execute', () => {
    it('should successfully get pokemon by name', async () => {
      pokemonApiService.getPokemonByName.mockResolvedValue(mockPokemonDetail);

      const result = await useCase.execute({ name: 'pikachu' });

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.name).toBe('pikachu');
        expect(result.right.id).toBe(25);
        expect(result.right.height).toBe(4);
        expect(result.right.weight).toBe(60);
        expect(result.right.baseExperience).toBe(112);
      }
      expect(pokemonApiService.getPokemonByName).toHaveBeenCalledWith(
        'pikachu',
      );
    });

    it('should transform sprites correctly', async () => {
      pokemonApiService.getPokemonByName.mockResolvedValue(mockPokemonDetail);

      const result = await useCase.execute({ name: 'pikachu' });

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.sprites).toEqual({
          frontDefault: expect.stringContaining('pokemon/25.png'),
          frontShiny: expect.stringContaining('shiny/25.png'),
          backDefault: expect.stringContaining('back/25.png'),
          backShiny: expect.stringContaining('back/shiny/25.png'),
        });
      }
    });

    it('should transform stats correctly', async () => {
      pokemonApiService.getPokemonByName.mockResolvedValue(mockPokemonDetail);

      const result = await useCase.execute({ name: 'pikachu' });

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.stats).toEqual([
          { name: 'hp', baseStat: 35, effort: 0 },
          { name: 'attack', baseStat: 55, effort: 0 },
          { name: 'speed', baseStat: 90, effort: 2 },
        ]);
      }
    });

    it('should transform types correctly', async () => {
      pokemonApiService.getPokemonByName.mockResolvedValue(mockPokemonDetail);

      const result = await useCase.execute({ name: 'pikachu' });

      expect(isRight(result)).toBe(true);
      if (isRight(result)) expect(result.right.types).toEqual(['electric']);
    });

    it('should transform abilities correctly', async () => {
      pokemonApiService.getPokemonByName.mockResolvedValue(mockPokemonDetail);

      const result = await useCase.execute({ name: 'pikachu' });

      expect(isRight(result)).toBe(true);
      if (isRight(result)) {
        expect(result.right.abilities).toEqual([
          { name: 'static', isHidden: false, slot: 1 },
          { name: 'lightning-rod', isHidden: true, slot: 3 },
        ]);
      }
    });

    it('should reject empty name', async () => {
      const result = await useCase.execute({ name: '' });

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.type).toBe('validation');
        expect(result.left.message).toContain('Pokemon name is required');
      }
      expect(pokemonApiService.getPokemonByName).not.toHaveBeenCalled();
    });

    it('should reject name with only whitespace', async () => {
      const result = await useCase.execute({ name: '   ' });

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.type).toBe('validation');
        expect(result.left.message).toContain('Pokemon name is required');
      }
      expect(pokemonApiService.getPokemonByName).not.toHaveBeenCalled();
    });

    it('should reject name with invalid characters', async () => {
      const result = await useCase.execute({ name: 'pikachu@123' });

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.type).toBe('validation');
        expect(result.left.message).toContain(
          'Pokemon name must contain only letters, numbers, and hyphens',
        );
      }
      expect(pokemonApiService.getPokemonByName).not.toHaveBeenCalled();
    });

    it('should accept name with hyphens', async () => {
      const mockMrMime: PokemonDetail = {
        ...mockPokemonDetail,
        id: 122,
        name: 'mr-mime',
      };
      pokemonApiService.getPokemonByName.mockResolvedValue(mockMrMime);

      const result = await useCase.execute({ name: 'mr-mime' });

      expect(isRight(result)).toBe(true);
      if (isRight(result)) expect(result.right.name).toBe('mr-mime');
      expect(pokemonApiService.getPokemonByName).toHaveBeenCalledWith(
        'mr-mime',
      );
    });

    it('should handle pokemon not found error', async () => {
      pokemonApiService.getPokemonByName.mockRejectedValue(
        new HttpException('Pokemon not found', 404),
      );

      const result = await useCase.execute({ name: 'fakemon' });

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.type).toBe('not_found');
        expect(result.left.message).toContain('Pokemon not found');
      }
    });

    it('should handle API errors gracefully', async () => {
      pokemonApiService.getPokemonByName.mockRejectedValue(
        new Error('Network error'),
      );

      const result = await useCase.execute({ name: 'pikachu' });

      expect(isLeft(result)).toBe(true);
      if (isLeft(result)) {
        expect(result.left.type).toBe('unexpected');
        expect(result.left.message).toBe('Network error');
      }
    });
  });
});
