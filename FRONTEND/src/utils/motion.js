/**
 * Antigravity Premium Motion & Animation Utility System
 * Built for LMS with Framer Motion and respects prefers-reduced-motion.
 */

// Check if user prefers reduced motion safely
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Premium Easing Curve
export const TRANSITION_EASE = [0.16, 1, 0.3, 1];

// Staggered Container for Lists and Grids
export const staggerContainer = (staggerDelay = 0.06, delayChildren = 0.05) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: prefersReducedMotion() ? 0 : staggerDelay,
      delayChildren: prefersReducedMotion() ? 0 : delayChildren,
    },
  },
});

// Fade In variant
export const fadeIn = (duration = 0.35) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: prefersReducedMotion() ? 0.01 : duration,
      ease: TRANSITION_EASE,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: prefersReducedMotion() ? 0.01 : 0.2,
      ease: 'easeOut',
    },
  },
});

// Fade In Up variant (ideal for cards, hero headers, buttons)
export const fadeInUp = (distance = 16, duration = 0.4) => ({
  hidden: {
    opacity: 0,
    y: prefersReducedMotion() ? 0 : distance,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: prefersReducedMotion() ? 0.01 : duration,
      ease: TRANSITION_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: prefersReducedMotion() ? 0 : -distance,
    transition: {
      duration: prefersReducedMotion() ? 0.01 : 0.2,
      ease: 'easeIn',
    },
  },
});

// Interactive Card Elevation / Pop
export const cardHoverProps = prefersReducedMotion()
  ? {}
  : {
      whileHover: { y: -3, transition: { duration: 0.2, ease: TRANSITION_EASE } },
      whileTap: { scale: 0.985, transition: { duration: 0.1 } },
    };

// Interactive Button Tap
export const buttonTapProps = prefersReducedMotion()
  ? {}
  : {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.97 },
      transition: { duration: 0.15, ease: TRANSITION_EASE },
    };

// Modal Entrance and Exit
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: prefersReducedMotion() ? 1 : 0.95,
    y: prefersReducedMotion() ? 0 : 12,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: prefersReducedMotion() ? 0.01 : 0.28,
      ease: TRANSITION_EASE,
    },
  },
  exit: {
    opacity: 0,
    scale: prefersReducedMotion() ? 1 : 0.96,
    y: prefersReducedMotion() ? 0 : 8,
    transition: {
      duration: prefersReducedMotion() ? 0.01 : 0.18,
      ease: 'easeIn',
    },
  },
};

// Chat / List Item Removal and Insertion (smooth slide-out on archive/delete)
export const chatItemVariants = {
  initial: { opacity: 0, y: prefersReducedMotion() ? 0 : 8, height: 'auto' },
  animate: {
    opacity: 1,
    y: 0,
    height: 'auto',
    transition: { duration: prefersReducedMotion() ? 0.01 : 0.25, ease: TRANSITION_EASE },
  },
  exit: {
    opacity: 0,
    x: prefersReducedMotion() ? 0 : -20,
    height: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: 0,
    overflow: 'hidden',
    transition: {
      opacity: { duration: prefersReducedMotion() ? 0.01 : 0.18 },
      height: { duration: prefersReducedMotion() ? 0.01 : 0.22, delay: 0.05 },
    },
  },
};

// Tab Switcher Animation
export const tabContentVariants = {
  hidden: { opacity: 0, x: prefersReducedMotion() ? 0 : 8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: prefersReducedMotion() ? 0.01 : 0.25, ease: TRANSITION_EASE },
  },
  exit: {
    opacity: 0,
    x: prefersReducedMotion() ? 0 : -8,
    transition: { duration: prefersReducedMotion() ? 0.01 : 0.15, ease: 'easeOut' },
  },
};
