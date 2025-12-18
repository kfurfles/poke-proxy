import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class PokemonNameParamDto {
  @ApiProperty({
    description: 'Pokémon name (case-insensitive)',
    example: 'pikachu',
    pattern: '^[a-zA-Z0-9-]+$',
  })
  @IsString()
  @IsNotEmpty({ message: 'Pokemon name is required' })
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'Pokemon name must contain only letters, numbers, and hyphens',
  })
  name: string;
}
