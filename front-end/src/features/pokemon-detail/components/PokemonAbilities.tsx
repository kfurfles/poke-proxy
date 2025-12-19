import { motion } from 'framer-motion'

interface Ability {
  name: string
  isHidden: boolean
  slot: number
}

interface PokemonAbilitiesProps {
  abilities: Ability[]
}

export function PokemonAbilities({ abilities }: PokemonAbilitiesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, delay: 0.5 }}
      className="mb-8 rounded-2xl border border-white/40 bg-white/70 p-8 shadow-xl backdrop-blur-md"
    >
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-6 text-slate-900"
      >
        Habilidades
      </motion.h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {abilities.map((ability, index) => (
          <motion.div
            key={ability.name}
            initial={{ opacity: 0, x: -30, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              type: 'spring',
              damping: 20,
              delay: 0.7 + index * 0.15,
            }}
            whileHover={{
              scale: 1.05,
              y: -5,
              transition: { duration: 0.2 },
            }}
            className={`relative rounded-xl border-2 p-5 ${
              ability.isHidden
                ? 'border-purple-300 bg-purple-50/80 backdrop-blur-sm'
                : 'border-slate-200 bg-white/80 backdrop-blur-sm'
            } transition-shadow hover:shadow-xl`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="mb-1 capitalize text-slate-900">
                  {ability.name.replace('-', ' ')}
                </h3>
                {ability.isHidden && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.15 }}
                    className="inline-block rounded-full bg-purple-600 px-2 py-1 text-xs text-white"
                  >
                    Habilidade Oculta
                  </motion.span>
                )}
              </div>
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: 'linear' },
                  scale: {
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  },
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  ability.isHidden ? 'bg-purple-200' : 'bg-slate-200'
                }`}
              >
                <span className="text-xl">✨</span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
