import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

interface ColdStartBannerProps {
  isLoading: boolean
  delayMs?: number
}

/**
 * Displays a polite notification when the backend is waking up from cold start.
 * Only appears if loading takes longer than expected (default: 3 seconds).
 */
export function ColdStartBanner({ isLoading, delayMs = 3000 }: ColdStartBannerProps) {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setShowBanner(false)
      return
    }

    // Only show banner if still loading after delay
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowBanner(true)
      }
    }, delayMs)

    return () => clearTimeout(timer)
  }, [isLoading, delayMs])

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed left-1/2 top-6 z-50 -translate-x-1/2 transform"
        >
          <div className="rounded-2xl border border-blue-200 bg-white/95 px-6 py-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center">
                <svg
                  className="h-6 w-6 animate-spin text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <p className="text-base font-semibold text-slate-800">
                  Inicializando servidor
                </p>
                <p className="text-sm text-slate-600">
                  O backend estava em repouso. Isso pode levar até 30 segundos.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

