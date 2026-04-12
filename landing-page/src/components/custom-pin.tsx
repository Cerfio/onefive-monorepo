import { motion } from "framer-motion";

// Définir les styles par type
export const typeStyles = {
  INCUBATOR: {
    pinColor: "#9E77ED", // Violet
    icon: "🏢",
    scale: 1,
  },
  ACCELERATOR: {
    pinColor: "#F04438", // Rouge
    icon: "🚀",
    scale: 1.1,
  },
  COWORKING: {
    pinColor: "#12B76A", // Vert
    icon: "💼",
    scale: 0.9,
  },
  EVENT: {
    pinColor: "#F79009", // Orange
    icon: "🎯",
    scale: 1.2,
  },
};

export const CustomPin = ({ type }: { type: keyof typeof typeStyles }) => {
  const style = typeStyles[type];

  return (
    <motion.div
      className="relative"
      style={{
        width: `${40 * style.scale}px`,
        height: `${40 * style.scale}px`,
      }}
    >
      <div
        className="absolute inset-0 rounded-full opacity-[10%]"
        style={{ backgroundColor: style.pinColor }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full opacity-[20%]"
        style={{ backgroundColor: style.pinColor }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
        style={{ backgroundColor: style.pinColor }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {style.icon}
      </div>
    </motion.div>
  );
}; 