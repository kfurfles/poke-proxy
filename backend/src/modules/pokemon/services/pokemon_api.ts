import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { type AxiosError, type AxiosInstance } from 'axios';

export interface PokemonBasicInfo {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonBasicInfo[];
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default: string | null;
  back_shiny: string | null;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: PokemonSprites;
  stats: PokemonStat[];
  types: PokemonType[];
  abilities: PokemonAbility[];
}

@Injectable()
export class PokemonApiService {
  private readonly client: AxiosInstance;
  private readonly baseURL = 'https://pokeapi.co/api/v2';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async listPokemons(
    limit: number,
    offset: number,
  ): Promise<PokemonListResponse> {
    try {
      const response = await this.client.get<PokemonListResponse>('/pokemon', {
        params: { limit, offset },
      });

      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to list pokemons');
    }
  }

  async getPokemonByName(name: string): Promise<PokemonDetail> {
    try {
      const normalizedName = name.toLowerCase().trim();
      const response = await this.client.get<PokemonDetail>(
        `/pokemon/${normalizedName}`,
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new HttpException(
          `Pokemon with name "${name}" not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      this.handleError(error, `Failed to fetch pokemon: ${name}`);
    }
  }

  private handleError(error: unknown, message: string): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status =
        axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const errorMessage =
        axiosError.response?.data || axiosError.message || message;

      throw new HttpException(
        {
          message,
          details: errorMessage,
        },
        status,
      );
    }

    throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
