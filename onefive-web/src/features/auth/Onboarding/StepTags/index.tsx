"use client";

import { Badge } from '@/components/base/badges/badges';
import { useOnboardingContext } from "../OnboardingContext";
import { tags } from "@/shared/constants/tags";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

const StepTags = () => {
  const {
    tags: tagsContext,
    setTags,
    buttonDisabled: _buttonDisabled,
    setButtonDisabled
  } = useOnboardingContext();

  const callback = useCallback(
    (tagName: string, isSelect: boolean) => {
      if (isSelect) {
        setTags((prev) => [...prev, tagName]);
        toast.success(`${tagName} ajouté !`);
      } else {
        setTags((prev) => prev.filter((tag) => tag !== tagName));
        toast.info(`${tagName} retiré`);
      }
    },
    [setTags]
  );

  useEffect(() => {
    if (tagsContext.length >= 3) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [tagsContext, setButtonDisabled]);

  // Animation variants pour les tags
  const tagContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const tagVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        type: "spring" as const,
        stiffness: 100
      }
    },
    selected: {
      scale: 1.05,
      y: -2,
      transition: { duration: 0.2  }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8"
      >
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#101828] mb-2">
          Choisissez vos centres d'intérêt
        </h2>
        <p className="text-sm sm:text-base text-[#475467] mb-4 px-2">
          Sélectionnez au moins 3 tags qui vous représentent le mieux
        </p>

        {/* Indicateur de progression */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#475467] mb-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#5E6AD2] rounded-full"></div>
            <span>Sélectionné</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>
            {tagsContext.length}/8 tag{tagsContext.length > 1 ? "s" : ""}{" "}
            sélectionné{tagsContext.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-4 sm:mb-6 px-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-[#5E6AD2] h-2 rounded-full transition-all duration-300"
              initial={{ width: 0 }}
              animate={{ width: `${(tagsContext.length / 8) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {tagsContext.length < 3 ? (
              <span className="text-orange-600">
                Il vous faut encore {3 - tagsContext.length} tag
                {3 - tagsContext.length > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-green-600">
                Parfait ! Vous pouvez continuer
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tags Grid */}
      <motion.div
        variants={tagContainerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4"
      >
        {tags.map((tag, _index) => (
          <motion.div
            key={tag.title}
            variants={tagVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            layout
          >
            <Tag
              tag={tag}
              callback={callback}
              isSelect={tagsContext.includes(tag.title)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Feedback visuel pour la sélection */}
      {tagsContext.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex flex-wrap gap-2 justify-center">
            <span className="text-sm text-gray-600">Sélectionnés :</span>
            {tagsContext.map((tagName) => {
              const tag = tags.find(t => t.title === tagName);
              if (!tag) return null;
              return (
                <motion.span
                  key={tagName}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${tag.bgColor} ${tag.textColor}`}
                >
                  {tag.icon} {tagName}
                  <button
                    onClick={() => callback(tagName, false)}
                    className={`ml-1 hover:opacity-80 rounded-full p-0.5 transition-opacity ${tag.iconColor}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StepTags;

const Tag = ({
  tag,
  isSelect,
  callback
}: {
  tag: (typeof tags)[0];
  isSelect: boolean;
  callback: (tagName: string, isSelect: boolean) => void;
}) => {
  // Mapper les couleurs bg- aux couleurs CSS pour le ring (utiliser topicColor qui correspond à la couleur principale)
  const getRingColorStyle = (topicColor: string) => {
    const colorMap: Record<string, string> = {
      'bg-error-500': 'var(--color-error-500)',
      'bg-primary-500': 'var(--color-brand-500)', // primary utilise brand dans le système
      'bg-warning-500': 'var(--color-warning-500)',
      'bg-success-500': 'var(--color-success-500)',
      'bg-blue-light-500': 'var(--color-blue-light-500)',
      'bg-indigo-500': 'var(--color-indigo-500)',
      'bg-pink-500': 'var(--color-pink-500)',
      'bg-gray-blue-500': 'var(--color-gray-blue-500)',
    };
    return colorMap[topicColor] || 'var(--color-brand-500)';
  };
  
  const ringColor = getRingColorStyle(tag.topicColor);
  
  return (
    <motion.div
      animate={isSelect ? "selected" : "visible"}
      whileHover="hover"
      whileTap={{ scale: 0.95 }}
    >
      <Badge
        type="pill-color"
        color="gray"
        size="sm"
        className={`text-sm font-normal flex gap-2 items-center cursor-pointer whitespace-nowrap transition-all duration-200 border-0 ${
          isSelect ? "ring-2 shadow-lg" : "hover:shadow-md"
        } ${tag.bgColor} ${tag.textColor} ${tag.hoverBgColor}`}
        style={isSelect ? { '--tw-ring-color': ringColor } as React.CSSProperties : undefined}
        onClick={() => {
          callback(tag.title, !isSelect);
        }}
      >
        <motion.div
          animate={{ rotate: isSelect ? 360 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          {tag.icon}
        </motion.div>
        <span className="font-medium truncate max-w-[120px]">{tag.title}</span>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="flex-shrink-0"
        >
          {isSelect ? (
            <X className={`w-3 h-3 stroke-[4] ${tag.iconColor}`} />
          ) : (
            <Plus className={`w-3 h-3 stroke-[4] ${tag.iconColor}`} />
          )}
        </motion.div>
      </Badge>
    </motion.div>
  );
};
