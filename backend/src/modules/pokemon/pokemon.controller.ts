import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListPokemonsQueryDto } from './dto/list-pokemons-query.dto';
import { ListPokemonsResponseDto } from './dto/list-pokemons-response.dto';
import { PokemonNameParamDto } from './dto/pokemon-name-param.dto';
import { PokemonResponseDto } from './dto/pokemon-response.dto';
import { GetPokemonByNameUseCase } from './use_cases/get_pokemon_by_name.service';
import { ListPokemonsUseCase } from './use_cases/list_pokemons.service';
import { isLeft } from '../../shared/either';

@ApiTags('pokemon')
@Controller('pokemon')
export class PokemonController {
  constructor(
    private readonly listPokemonsUseCase: ListPokemonsUseCase,
    private readonly getPokemonByNameUseCase: GetPokemonByNameUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar pokémons',
    description:
      'Retorna uma lista paginada de pokémons com metadados de navegação',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pokémons retornada com sucesso',
    type: ListPokemonsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Parâmetros inválidos (limit fora do range 10-20 ou offset negativo)',
  })
  async listPokemons(@Query() query: ListPokemonsQueryDto) {
    const result = await this.listPokemonsUseCase.execute({
      limit: query.limit,
      offset: query.offset,
    });

    if (isLeft(result)) {
      const status =
        result.left.type === 'validation'
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(result.left.message, status);
    }

    return result.right;
  }

  @Get(':name')
  @ApiOperation({
    summary: 'Buscar pokémon por nome',
    description:
      'Retorna informações detalhadas de um pokémon específico (case-insensitive)',
  })
  @ApiParam({
    name: 'name',
    description: 'Nome do pokémon',
    example: 'pikachu',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Pokémon encontrado',
    type: PokemonResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Pokémon não encontrado',
  })
  async getPokemonByName(@Param() params: PokemonNameParamDto) {
    const result = await this.getPokemonByNameUseCase.execute({
      name: params.name,
    });

    if (isLeft(result)) {
      const status =
        result.left.type === 'validation'
          ? HttpStatus.BAD_REQUEST
          : result.left.type === 'not_found'
            ? HttpStatus.NOT_FOUND
            : HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(result.left.message, status);
    }

    return result.right;
  }
}
