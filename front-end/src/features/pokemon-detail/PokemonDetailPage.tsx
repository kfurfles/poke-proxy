import { useEffect } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner'
import { TypeBackground } from '../../shared/ui/TypeBackground'
import { usePokemonDetail } from './data/usePokemonDetail'
import { PokemonHero } from './components/PokemonHero'
import { PokemonAbilities } from './components/PokemonAbilities'
import { PokemonStats } from './components/PokemonStats'
import { motionTokens } from '../../shared/motion/tokens'

export function PokemonDetailPage() {
  const { idOrName } = useParams({ strict: false }) as { idOrName?: string }

  const { pokemon, isLoading, isError, error } = usePokemonDetail(idOrName)

  // Scroll to top when page loads or Pokemon changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [idOrName])

  const primaryType = pokemon?.types[0]

  if (isError) {
    return (
      <div className="relative min-h-screen bg-linear-to-br from-slate-200/70 to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 text-sm font-medium text-slate-700 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para Pokédex
          </Link>
          <div className="rounded-3xl bg-white/70 p-8 shadow-xl backdrop-blur-md">
            <h1 className="mb-4 text-2xl font-bold text-slate-800">Erro</h1>
            <p className="mb-2 text-red-600">
              Não foi possível carregar o Pokémon "{idOrName}".
            </p>
            {error && <p className="text-sm text-slate-600">{error.message}</p>}
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || !pokemon) {
    return (
      <div className="relative min-h-screen bg-linear-to-br from-slate-200/70 to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 text-sm font-medium text-slate-700 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para Pokédex
          </Link>
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Type-specific background */}
      <TypeBackground type={primaryType} />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: motionTokens.durations.normal }}
        className="relative z-10 mx-auto max-w-5xl px-6 py-8 pb-16"
      >
        {/* Back Button */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 text-sm font-medium text-slate-700 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para Pokédex
        </Link>

        {/* Hero Section */}
        <PokemonHero
          id={pokemon.id}
          name={pokemon.name}
          image={pokemon.image}
          types={pokemon.types}
          heightInMeters={pokemon.heightInMeters}
          weightInKg={pokemon.weightInKg}
        />

        {/* Abilities Section */}
        <PokemonAbilities abilities={pokemon.abilities} />

        {/* Stats Section */}
        <PokemonStats stats={pokemon.stats} primaryType={primaryType} />
      </motion.div>
    </div>
  )
}
