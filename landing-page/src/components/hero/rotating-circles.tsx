import { motion } from "framer-motion";

export const RotatingCircles = () => {
  return (
    <>
      {[1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            width: `${720 + (index - 1) * 300}px`,
            height: `${720 + (index - 1) * 300}px`,
          }}
          animate={{
            rotate: index % 2 === 0 ? 360 : -360,
          }}
          transition={{
            duration: 50 + index * 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* ... Existing rotating circles content ... */}
        </motion.div>
      ))}
    </>
  );
}; 