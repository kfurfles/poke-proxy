import { ApiProperty } from '@nestjs/swagger';

export class ListPokemonsResponseDto {
  @ApiProperty({
    description: 'List of Pokémon names',
    example: ['bulbasaur', 'ivysaur', 'venusaur'],
    type: [String],
  })
  pokemons: string[];

  @ApiProperty({
    description: 'Total number of available Pokémon',
    example: 1302,
  })
  total: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrevious: boolean;
}
