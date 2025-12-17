import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListPokemonsQueryDto {
  @ApiProperty({
    description: 'Número de pokémons por página',
    minimum: 10,
    maximum: 20,
    default: 20,
    required: false,
    example: 15,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(10, { message: 'Limit must be at least 10' })
  @Max(20, { message: 'Limit must be at most 20' })
  limit?: number = 20;

  @ApiProperty({
    description: 'Número de registros a pular',
    minimum: 0,
    default: 0,
    required: false,
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Offset must be an integer' })
  @Min(0, { message: 'Offset must be non-negative' })
  offset?: number = 0;
}
