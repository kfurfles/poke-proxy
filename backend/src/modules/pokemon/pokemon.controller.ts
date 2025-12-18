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
    summary: 'List Pokémon',
    description:
      'Returns a paginated list of Pokémon with navigation metadata',
  })
  @ApiResponse({
    status: 200,
    description: 'Pokémon list returned successfully',
    type: ListPokemonsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid parameters (limit out of range 10-20 or negative offset)',
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
    summary: 'Get Pokémon by name',
    description:
      'Returns detailed information for a specific Pokémon (case-insensitive)',
  })
  @ApiParam({
    name: 'name',
    description: 'Pokémon name',
    example: 'pikachu',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Pokémon found',
    type: PokemonResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Pokémon not found',
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
