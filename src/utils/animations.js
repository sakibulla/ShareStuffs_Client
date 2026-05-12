/**
 * Shared Framer Motion animation variants.
 * Import these instead of defining inline to keep components clean.
 */

/** Fade up — used for page sections and cards */
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Fade in — simple opacity only */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

/** Scale in — for modals, dropdowns */
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

/** Slide in from right — for drawers / mobile menus */
export const slideInRight = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: { duration: 0.22, ease: 'easeIn' },
  },
};

/** Stagger container — wraps a list of staggered children */
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

/** Stagger item — child of staggerContainer */
export const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Page transition — wraps entire page content */
export const pageTransition = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

/** Hover lift — used as whileHover prop directly */
export const hoverLift = {
  y: -4,
  transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] },
};

/** Tap press — used as whileTap prop directly */
export const tapPress = {
  scale: 0.97,
  transition: { duration: 0.1 },
};
