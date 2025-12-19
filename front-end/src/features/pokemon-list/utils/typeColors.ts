/**
 * Type color mapping utilities
 * Maps Pokemon types to Tailwind CSS classes for consistent styling across the app
 * Based on Phase 00 baseline color specifications
 */

type TypeColorMap = {
  bg: string
  badge: string
}

const typeColors: Record<string, TypeColorMap> = {
  normal: { bg: 'bg-gray-400', badge: 'bg-gray-400 text-white' },
  fire: { bg: 'bg-orange-500', badge: 'bg-orange-500 text-white' },
  water: { bg: 'bg-blue-500', badge: 'bg-blue-500 text-white' },
  electric: { bg: 'bg-yellow-400', badge: 'bg-yellow-400 text-gray-900' },
  grass: { bg: 'bg-green-500', badge: 'bg-green-500 text-white' },
  ice: { bg: 'bg-cyan-400', badge: 'bg-cyan-400 text-gray-900' },
  fighting: { bg: 'bg-red-600', badge: 'bg-red-600 text-white' },
  poison: { bg: 'bg-purple-500', badge: 'bg-purple-500 text-white' },
  ground: { bg: 'bg-amber-600', badge: 'bg-amber-600 text-white' },
  flying: { bg: 'bg-indigo-400', badge: 'bg-indigo-400 text-white' },
  psychic: { bg: 'bg-pink-500', badge: 'bg-pink-500 text-white' },
  bug: { bg: 'bg-lime-500', badge: 'bg-lime-500 text-gray-900' },
  rock: { bg: 'bg-yellow-600', badge: 'bg-yellow-600 text-white' },
  ghost: { bg: 'bg-purple-700', badge: 'bg-purple-700 text-white' },
  dragon: { bg: 'bg-indigo-600', badge: 'bg-indigo-600 text-white' },
  dark: { bg: 'bg-gray-700', badge: 'bg-gray-700 text-white' },
  steel: { bg: 'bg-gray-500', badge: 'bg-gray-500 text-white' },
  fairy: { bg: 'bg-pink-400', badge: 'bg-pink-400 text-white' },
}

const defaultColors: TypeColorMap = {
  bg: 'bg-slate-300',
  badge: 'bg-slate-300 text-gray-900',
}

/**
 * Get the background color class for a given Pokemon type
 * Used for card image area backgrounds
 */
export function getTypeBgClass(type?: string | null): string {
  if (!type) return defaultColors.bg
  const normalizedType = type.toLowerCase()
  return typeColors[normalizedType]?.bg ?? defaultColors.bg
}

/**
 * Get the badge color class for a given Pokemon type
 * Used for type badge pills
 */
export function getTypeBadgeClass(type?: string | null): string {
  if (!type) return defaultColors.badge
  const normalizedType = type.toLowerCase()
  return typeColors[normalizedType]?.badge ?? defaultColors.badge
}
