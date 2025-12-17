import { ApiProperty } from '@nestjs/swagger';

export class ListPokemonsResponseDto {
  @ApiProperty({
    description: 'Lista de nomes dos pokémons',
    example: ['bulbasaur', 'ivysaur', 'venusaur'],
    type: [String],
  })
  pokemons: string[];

  @ApiProperty({
    description: 'Total de pokémons disponíveis',
    example: 1302,
  })
  total: number;

  @ApiProperty({
    description: 'Indica se há próxima página',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Indica se há página anterior',
    example: false,
  })
  hasPrevious: boolean;
}
