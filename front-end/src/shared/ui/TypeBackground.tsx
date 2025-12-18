type TypeBackgroundProps = {
  type?: string | null
  className?: string
}

const typeToGradient: Record<string, { from: string; to: string; blob: string }> = {
  fire: { from: 'from-orange-200/60', to: 'to-orange-50', blob: 'bg-orange-400/25' },
  water: { from: 'from-blue-200/60', to: 'to-blue-50', blob: 'bg-blue-400/25' },
  grass: { from: 'from-green-200/60', to: 'to-green-50', blob: 'bg-green-400/25' },
  electric: { from: 'from-yellow-200/60', to: 'to-yellow-50', blob: 'bg-yellow-300/25' },
  psychic: { from: 'from-pink-200/60', to: 'to-pink-50', blob: 'bg-pink-400/25' },
  ghost: { from: 'from-purple-200/60', to: 'to-purple-50', blob: 'bg-purple-400/25' },
  dragon: { from: 'from-indigo-200/60', to: 'to-indigo-50', blob: 'bg-indigo-400/25' },
  default: { from: 'from-slate-200/70', to: 'to-slate-50', blob: 'bg-slate-400/20' },
}

export function TypeBackground({ type, className }: TypeBackgroundProps) {
  const key = type && typeToGradient[type] ? type : 'default'
  const { from, to, blob } = typeToGradient[key]

  const rootClassName = className
    ? `relative overflow-hidden rounded-3xl ${className}`
    : 'relative overflow-hidden rounded-3xl'

  return (
    <div className={rootClassName} aria-hidden="true">
      <div className={`absolute inset-0 bg-linear-to-br ${from} ${to}`} />
      <div className={`absolute -left-16 -top-20 h-64 w-64 rounded-full blur-3xl ${blob}`} />
      <div className={`absolute -bottom-24 -right-16 h-72 w-72 rounded-full blur-3xl ${blob}`} />
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
    </div>
  )
}
