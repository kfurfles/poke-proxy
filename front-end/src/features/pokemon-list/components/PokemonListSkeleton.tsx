import { Skeleton } from '../../../shared/ui/Skeleton'

/**
 * PokemonListSkeleton - Loading state for the initial page load
 * Shows a grid of skeleton cards matching the real card structure
 */

type PokemonListSkeletonProps = {
  count?: number
}

export function PokemonListSkeleton({ count = 12 }: PokemonListSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items don't have stable IDs
            index
          }`}
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
        >
          {/* Image area skeleton */}
          <Skeleton className="aspect-square w-full" />

          {/* Card content skeleton */}
          <div className="p-4">
            {/* Name skeleton */}
            <Skeleton className="mb-3 h-6 w-3/4" />

            {/* Type badges skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
