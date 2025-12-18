type LoadingSpinnerProps = {
  className?: string
  label?: string
}

export function LoadingSpinner({ className, label = 'Carregando' }: LoadingSpinnerProps) {
  const rootClassName = className
    ? `inline-flex items-center gap-2 text-slate-600 ${className}`
    : 'inline-flex items-center gap-2 text-slate-600'

  return (
    <div className={rootClassName}>
      <svg
        className="h-4 w-4 animate-spin"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
        />
      </svg>
      <span className="text-sm">{label}</span>
    </div>
  )
}
