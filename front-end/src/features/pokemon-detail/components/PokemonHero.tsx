import { motion } from 'framer-motion'
import { HERO_FLOAT_DURATION, HERO_FLOAT_Y, motionTokens } from '../../../shared/motion/tokens'
import { ImageWithFallback } from '../../../shared/ui/ImageWithFallback'
import { getTypeBadgeClass } from '../../pokemon-list/utils/typeColors'

interface PokemonHeroProps {
  id: number
  name: string
  image: string | null
  types: string[]
  heightInMeters: string
  weightInKg: string
}

export function PokemonHero({
  id,
  name,
  image,
  types,
  heightInMeters,
  weightInKg,
}: PokemonHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionTokens.easings.spring}
      className="relative mb-6 rounded-3xl bg-white/70 p-8 shadow-xl backdrop-blur-md"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Image Section */}
        <div className="relative flex-shrink-0 lg:w-80">
          <motion.div
            animate={{
              y: HERO_FLOAT_Y,
            }}
            transition={{
              duration: HERO_FLOAT_DURATION,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className="relative aspect-square"
          >
            <ImageWithFallback src={image} alt={name} className="h-full w-full object-contain" />
          </motion.div>
        </div>

        {/* Metadata Section */}
        <div className="flex flex-1 flex-col gap-6">
          {/* ID Badge */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold capitalize text-slate-800">{name}</h1>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <span
                    key={type}
                    className={`rounded-full px-4 py-1 text-sm font-semibold capitalize ${getTypeBadgeClass(type)}`}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-full bg-white/90 px-4 py-2 backdrop-blur-sm">
              <span className="text-sm font-semibold text-slate-600">
                #{id.toString().padStart(3, '0')}
              </span>
            </div>
          </div>

          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/60 p-4 backdrop-blur-sm">
              <div className="mb-1 text-sm font-medium text-slate-500">Altura</div>
              <div className="text-2xl font-bold text-slate-800">{heightInMeters}m</div>
            </div>
            <div className="rounded-2xl bg-white/60 p-4 backdrop-blur-sm">
              <div className="mb-1 text-sm font-medium text-slate-500">Peso</div>
              <div className="text-2xl font-bold text-slate-800">{weightInKg}kg</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
