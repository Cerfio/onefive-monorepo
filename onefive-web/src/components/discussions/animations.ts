// Animation variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

// Nouvelles animations pour les interactions
export const buttonVariants = {
  idle: { scale: 1, rotate: 0 },
  hover: { scale: 1.05, rotate: 2 },
  tap: { scale: 0.95, rotate: -2 },
  loading: { 
    scale: [1, 1.1, 1], 
    rotate: [0, 180, 360],
    transition: { duration: 0.8, repeat: Infinity }
  }
};

export const voteVariants = {
  idle: { scale: 1, y: 0 },
  hover: { scale: 1.1, y: -2 },
  active: { 
    scale: [1, 1.3, 1], 
    y: [0, -8, 0],
    transition: { duration: 0.4, ease: "backOut" }
  }
};

export const reactionVariants = {
  idle: { scale: 1, rotate: 0 },
  hover: { scale: 1.2, rotate: 10 },
  active: { 
    scale: [1, 1.5, 1.2], 
    rotate: [0, 20, 0],
    transition: { duration: 0.5, ease: "backOut" }
  }
}; 