import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import {
  CARD_HOVER_SCALE,
  CARD_HOVER_Y,
  CARD_IMAGE_HOVER_SCALE,
  CARD_STAGGER_DELAY,
  motionTokens,
} from '../../../shared/motion/tokens'
import { ImageWithFallback } from '../../../shared/ui/ImageWithFallback'
import type { PokemonCardViewModel } from '../data/pokemonCardViewModel'
import { getTypeBadgeClass, getTypeBgClass } from '../utils/typeColors'

type PokemonCardProps = {
  card: PokemonCardViewModel
  index: number
}

export function PokemonCard({ card, index }: PokemonCardProps) {
  const primaryType = card.types[0]
  const bgClass = getTypeBgClass(primaryType)

  // Format ID as #001, #002, etc.
  const formattedId = `#${card.id.toString().padStart(3, '0')}`

  // Stagger delay based on index (mod 20 to reset for each page)
  const staggerDelay = (index % 20) * CARD_STAGGER_DELAY

  return (
    <motion.div
      data-testid="pokemon-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        ...motionTokens.easings.spring,
        delay: staggerDelay,
      }}
      whileHover={{
        y: CARD_HOVER_Y,
        scale: CARD_HOVER_SCALE,
      }}
    >
      <Link
        to="/pokemon/$idOrName"
        params={{ idOrName: card.name }}
        className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-2xl"
      >
        {/* Image area with type-based background */}
        <div className={`relative aspect-square overflow-hidden ${bgClass}`}>
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-white/50 to-transparent" />

          {/* Number badge */}
          <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-700 backdrop-blur-sm">
            {formattedId}
          </div>

          {/* Pokemon image with hover effect */}
          <motion.div
            className="relative z-10 h-full w-full p-6"
            whileHover={{
              scale: CARD_IMAGE_HOVER_SCALE,
              rotate: 2,
            }}
            transition={motionTokens.easings.spring}
          >
            <ImageWithFallback
              src={card.image}
              alt={card.name}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </motion.div>
        </div>

        {/* Card content */}
        <div className="p-4">
          {/* Pokemon name */}
          <h3 className="mb-3 text-lg font-bold capitalize text-slate-800">{card.name}</h3>

          {/* Type badges */}
          <div className="flex flex-wrap gap-2">
            {card.types.map((type) => (
              <span
                key={type}
                className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${getTypeBadgeClass(type)}`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
