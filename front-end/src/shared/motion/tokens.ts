/**
 * Motion tokens — Phase 01
 *
 * Centralizes animation durations and easings for consistent UX across list/detail pages.
 * Based on the baseline (Phase 00): cards use spring, detail uses smooth fade/float.
 */

export const motionTokens = {
  durations: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
  },
  easings: {
    smooth: [0.4, 0, 0.2, 1],
    spring: { type: 'spring', stiffness: 260, damping: 20 },
  },
} as const

/**
 * Card stagger delay (list): delay = (index % 20) * STAGGER_DELAY
 */
export const CARD_STAGGER_DELAY = 0.05

/**
 * Hover/interaction transforms (cards)
 */
export const CARD_HOVER_Y = -12
export const CARD_HOVER_SCALE = 1.02
export const CARD_IMAGE_HOVER_SCALE = 1.15

/**
 * Detail page: hero float animation
 */
export const HERO_FLOAT_Y = [-8, 8]
export const HERO_FLOAT_DURATION = 3
