import { Module } from '@nestjs/common';
import { PokemonController } from './pokemon.controller';
import { PokemonApiService } from './services/pokemon_api';
import { GetPokemonByNameUseCase } from './use_cases/get_pokemon_by_name.service';
import { ListPokemonsUseCase } from './use_cases/list_pokemons.service';

@Module({
  controllers: [PokemonController],
  providers: [PokemonApiService, ListPokemonsUseCase, GetPokemonByNameUseCase],
  exports: [PokemonApiService, ListPokemonsUseCase, GetPokemonByNameUseCase],
})
export class PokemonModule {}
