export const enhancedContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

export const enhancedCardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9,
    rotateX: -15
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.6,
      type: 'spring' as const,
      stiffness: 100
    }
  },
  selected: {
    scale: 1.03,
    y: -5,
    boxShadow: '0 25px 50px -12px rgba(94, 106, 210, 0.25)',
    transition: { duration: 0.3, ease: 'easeOut' as const }
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.8,
    transition: { duration: 0.4 }
  }
};

export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4  }
  },
  selected: {
    scale: 1.02,
    boxShadow: '0 20px 25px -5px rgba(94, 106, 210, 0.1)',
    transition: { duration: 0.2 }
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};
