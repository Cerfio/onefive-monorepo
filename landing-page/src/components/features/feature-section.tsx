import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface FeatureSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  imageOnLeft?: boolean;
}

export const FeatureSection = ({ title, description, children, imageOnLeft = false }: FeatureSectionProps) => {
  const ContentSection = (
    <div className="flex flex-col justify-center">
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <p className="text-lg text-muted-foreground mb-6">{description}</p>
      <Button
        variant="outline"
        className="w-fit flex items-center gap-2 hover:bg-gray-100 transition-colors"
      >
        Learn more
        <motion.svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          animate={{ x: [0, 5, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </motion.svg>
      </Button>
    </div>
  );

  return (
    <div className="pt-16 w-full max-w-7xl mx-auto grid grid-cols-2 gap-16 px-8">
      {imageOnLeft ? (
        <>
          {children}
          {ContentSection}
        </>
      ) : (
        <>
          {ContentSection}
          {children}
        </>
      )}
    </div>
  );
}; 