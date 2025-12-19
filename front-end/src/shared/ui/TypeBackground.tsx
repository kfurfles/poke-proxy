type TypeBackgroundProps = {
  type?: string | null
  className?: string
}

const typeToGradient: Record<string, { from: string; to: string; blob: string }> = {
  normal: { from: 'from-gray-200/60', to: 'to-gray-50', blob: 'bg-gray-400/25' },
  fire: { from: 'from-orange-200/60', to: 'to-orange-50', blob: 'bg-orange-400/30' },
  water: { from: 'from-blue-200/60', to: 'to-blue-50', blob: 'bg-blue-400/30' },
  electric: { from: 'from-yellow-200/60', to: 'to-yellow-50', blob: 'bg-yellow-300/30' },
  grass: { from: 'from-green-200/60', to: 'to-green-50', blob: 'bg-green-400/30' },
  ice: { from: 'from-cyan-200/60', to: 'to-cyan-50', blob: 'bg-cyan-400/30' },
  fighting: { from: 'from-red-200/60', to: 'to-red-50', blob: 'bg-red-500/30' },
  poison: { from: 'from-purple-200/60', to: 'to-purple-50', blob: 'bg-purple-400/30' },
  ground: { from: 'from-amber-200/60', to: 'to-amber-50', blob: 'bg-amber-500/30' },
  flying: { from: 'from-indigo-200/60', to: 'to-indigo-50', blob: 'bg-indigo-300/30' },
  psychic: { from: 'from-pink-200/60', to: 'to-pink-50', blob: 'bg-pink-400/30' },
  bug: { from: 'from-lime-200/60', to: 'to-lime-50', blob: 'bg-lime-400/30' },
  rock: { from: 'from-yellow-300/60', to: 'to-yellow-100', blob: 'bg-yellow-500/30' },
  ghost: { from: 'from-purple-300/60', to: 'to-purple-50', blob: 'bg-purple-500/30' },
  dragon: { from: 'from-indigo-300/60', to: 'to-indigo-50', blob: 'bg-indigo-500/30' },
  dark: { from: 'from-gray-300/60', to: 'to-gray-100', blob: 'bg-gray-600/30' },
  steel: { from: 'from-slate-200/60', to: 'to-slate-50', blob: 'bg-slate-400/30' },
  fairy: { from: 'from-pink-200/60', to: 'to-pink-50', blob: 'bg-pink-300/30' },
  default: { from: 'from-slate-200/70', to: 'to-slate-50', blob: 'bg-slate-400/20' },
}

export function TypeBackground({ type, className }: TypeBackgroundProps) {
  const key = type && typeToGradient[type] ? type : 'default'
  const { from, to, blob } = typeToGradient[key]

  return (
    <div className={`pointer-events-none fixed inset-0 ${className || ''}`} aria-hidden="true">
      <div className={`absolute inset-0 bg-linear-to-br ${from} ${to}`} />
      <div
        className={`absolute -left-20 -top-32 h-96 w-96 rounded-full blur-3xl ${blob} animate-pulse`}
      />
      <div
        className={`absolute -bottom-32 -right-20 h-128 w-128 rounded-full blur-3xl ${blob} animate-pulse`}
      />
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
    </div>
  )
}
