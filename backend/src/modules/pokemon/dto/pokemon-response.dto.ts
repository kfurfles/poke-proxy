import { ApiProperty } from '@nestjs/swagger';

class PokemonSpritesDto {
  @ApiProperty({
    example:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
  })
  frontDefault: string | null;

  @ApiProperty({
    example:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png',
  })
  frontShiny: string | null;

  @ApiProperty({
    example:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png',
  })
  backDefault: string | null;

  @ApiProperty({
    example:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/1.png',
  })
  backShiny: string | null;
}

class PokemonStatDto {
  @ApiProperty({ example: 'hp' })
  name: string;

  @ApiProperty({ example: 45 })
  baseStat: number;

  @ApiProperty({ example: 0 })
  effort: number;
}

class PokemonAbilityDto {
  @ApiProperty({ example: 'overgrow' })
  name: string;

  @ApiProperty({ example: false })
  isHidden: boolean;

  @ApiProperty({ example: 1 })
  slot: number;
}

export class PokemonResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'bulbasaur' })
  name: string;

  @ApiProperty({ example: 7, description: 'Altura em decímetros' })
  height: number;

  @ApiProperty({ example: 69, description: 'Peso em hectogramas' })
  weight: number;

  @ApiProperty({ example: 64 })
  baseExperience: number;

  @ApiProperty({ type: PokemonSpritesDto })
  sprites: PokemonSpritesDto;

  @ApiProperty({ type: [PokemonStatDto] })
  stats: PokemonStatDto[];

  @ApiProperty({ example: ['grass', 'poison'], type: [String] })
  types: string[];

  @ApiProperty({ type: [PokemonAbilityDto] })
  abilities: PokemonAbilityDto[];
}
