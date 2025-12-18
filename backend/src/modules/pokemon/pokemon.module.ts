import { Module } from '@nestjs/common';
import { PokemonController } from './pokemon.controller';
import { PokemonApiService } from './services/pokemon_api';
import { GetPokemonByNameUseCase } from './use_cases/get_pokemon_by_name.service';
import { ListPokemonsUseCase } from './use_cases/list_pokemons.service';
import { GeminiModule } from '@/shared/gemini';
import { WarmupFamousPokemonsUseCase } from './use_cases/warmup_famous_pokemons.use_case';
import { WarmupFamousPokemonsOnBootstrap } from './warmup_famous_pokemons.on_bootstrap';

@Module({
  imports: [GeminiModule],
  controllers: [PokemonController],
  providers: [
    PokemonApiService,
    ListPokemonsUseCase,
    GetPokemonByNameUseCase,
    WarmupFamousPokemonsUseCase,
    WarmupFamousPokemonsOnBootstrap,
  ],
  exports: [PokemonApiService, ListPokemonsUseCase, GetPokemonByNameUseCase],
})
export class PokemonModule {}
