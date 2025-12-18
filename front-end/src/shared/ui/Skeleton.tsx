type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  const rootClassName = className
    ? `animate-pulse rounded-2xl bg-white/60 backdrop-blur-sm ${className}`
    : 'animate-pulse rounded-2xl bg-white/60 backdrop-blur-sm'

  return <div className={rootClassName} aria-hidden="true" />
}
