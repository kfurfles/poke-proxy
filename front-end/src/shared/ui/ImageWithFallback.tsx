import type { ReactNode } from 'react'
import { useId, useMemo, useState } from 'react'

type ImageWithFallbackProps = {
  src?: string | null
  alt: string
  width?: number
  height?: number
  className?: string
  decoding?: 'sync' | 'async' | 'auto'
  loading?: 'eager' | 'lazy'
  fallback?: ReactNode
}

export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className,
  decoding = 'async',
  loading = 'lazy',
  fallback,
}: ImageWithFallbackProps) {
  const imgId = useId()
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const canRenderImg = Boolean(src) && !hasError
  const ariaDescribedBy = useMemo(() => {
    if (canRenderImg && isLoaded) return undefined
    return imgId
  }, [canRenderImg, imgId, isLoaded])

  return (
    <div className="relative overflow-hidden">
      {canRenderImg ? (
        <img
          src={src ?? undefined}
          alt={alt}
          width={width}
          height={height}
          decoding={decoding}
          loading={loading}
          className={className}
          aria-describedby={ariaDescribedBy}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      ) : null}

      {!canRenderImg ? (
        <div
          id={imgId}
          className="grid aspect-square w-full place-items-center rounded-2xl bg-white/60 text-sm text-slate-500 backdrop-blur-sm"
          role="img"
          aria-label={alt}
        >
          {fallback ?? <span>Imagem indisponível</span>}
        </div>
      ) : null}

      {canRenderImg && !isLoaded ? (
        <div
          id={imgId}
          className="absolute inset-0 animate-pulse rounded-2xl bg-white/60 backdrop-blur-sm"
          aria-hidden="true"
        />
      ) : null}
    </div>
  )
}
