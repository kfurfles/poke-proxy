import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: 7, description: 'Height in decimeters' })
  height: number;

  @ApiProperty({ example: 69, description: 'Weight in hectograms' })
  weight: number;

  @ApiProperty({ example: 64 })
  baseExperience: number;

  @ApiProperty({
    example:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    description: 'High-quality official artwork (475x475px)',
  })
  image: string;

  @ApiProperty({ type: [PokemonStatDto] })
  stats: PokemonStatDto[];

  @ApiProperty({ example: ['grass', 'poison'], type: [String] })
  types: string[];

  @ApiProperty({ type: [PokemonAbilityDto] })
  abilities: PokemonAbilityDto[];
}
