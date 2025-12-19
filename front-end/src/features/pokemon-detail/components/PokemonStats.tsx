import { motion } from 'framer-motion'

interface Stat {
  name: string
  baseStat: number
}

interface PokemonStatsProps {
  stats: Stat[]
  primaryType?: string
}

const statNameMap: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Atq. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidade',
}

const typeColors: Record<string, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-orange-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-cyan-400',
  fighting: 'bg-red-600',
  poison: 'bg-purple-500',
  ground: 'bg-amber-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-yellow-600',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-600',
  dark: 'bg-gray-700',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-400',
}

export function PokemonStats({ stats, primaryType }: PokemonStatsProps) {
  const totalStats = stats.reduce((sum, stat) => sum + stat.baseStat, 0)
  const typeColor = primaryType
    ? typeColors[primaryType.toLowerCase()] || 'bg-gray-400'
    : 'bg-gray-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, delay: 0.7 }}
      className="rounded-2xl border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-md"
    >
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-6 text-slate-900"
      >
        Estatísticas Base
      </motion.h2>
      <div className="space-y-4">
        {stats.map((stat, index) => {
          const percentage = Math.min((stat.baseStat / 255) * 100, 100)
          const label = statNameMap[stat.name] || stat.name

          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: 'spring',
                damping: 20,
                delay: 0.9 + index * 0.08,
              }}
            >
              <div className="mb-2 flex items-center gap-4">
                <motion.div
                  className="w-24 text-sm text-slate-600"
                  whileHover={{ scale: 1.05, x: 5 }}
                >
                  {label}
                </motion.div>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200/50 backdrop-blur-sm">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                      duration: 1,
                      delay: 1.0 + index * 0.08,
                      ease: 'easeOut',
                    }}
                    className={`relative h-full rounded-full ${typeColor}`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/30"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'linear',
                        delay: 1.5 + index * 0.08,
                      }}
                    />
                  </motion.div>
                </div>
                <motion.div
                  className="w-12 text-right text-slate-900"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    damping: 10,
                    delay: 1.2 + index * 0.08,
                  }}
                >
                  {stat.baseStat}
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Total Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="mt-6 border-t border-slate-300/50 pt-6"
      >
        <div className="flex items-center justify-between rounded-xl bg-white/50 px-4 py-3 backdrop-blur-sm">
          <span className="text-slate-600">Total</span>
          <motion.span
            className="text-slate-900"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10, delay: 1.6 }}
          >
            {totalStats}
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  )
}
