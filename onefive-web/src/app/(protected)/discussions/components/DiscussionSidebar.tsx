'use client';

import { motion } from 'framer-motion';
import { Flame, X } from 'lucide-react';
import { tags } from '@/constant';
import { Tags } from '@/enums';

interface DiscussionSidebarProps {
  topic?: Tags;
  onTopicChange: (topic: Tags | undefined) => void;
}

// Topics populaires (à remplacer par des données réelles si disponibles)
const hotTopics = [Tags.MARKETING, Tags.FUNDING_AND_INVESTMENT, Tags.TECHNOLOGY];

export const DiscussionSidebar = ({ topic, onTopicChange }: DiscussionSidebarProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="w-80 hidden lg:block">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#101828]">Sujets</h3>
            {topic && (
              <button
                onClick={() => onTopicChange(undefined)}
                className="text-xs text-[#5E6AD2] hover:underline font-medium"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Liste des sujets */}
          <div className="space-y-1.5">
            {tags.map((tag, index) => {
              const isSelected = topic === tag.enum;
              const isHot = hotTopics.includes(tag.enum);
              
              return (
                <motion.button
                  key={tag.enum}
                  onClick={() => onTopicChange(isSelected ? undefined : tag.enum)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-[#5E6AD2] text-white shadow-md shadow-[#5E6AD2]/20' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${
                      isSelected ? 'bg-white/20' : tag.bgColor
                    }`}>
                      {tag.icon}
                    </span>
                    <span className={`text-sm ${isSelected ? 'font-medium' : 'font-normal'}`}>
                      {tag.title}
                    </span>
                  </span>
                  
                  <span className="flex items-center gap-2">
                    {isHot && !isSelected && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-50 rounded-full">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span className="text-[10px] font-medium text-orange-600">Hot</span>
                      </span>
                    )}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <X className="w-4 h-4 text-white/80" />
                      </motion.div>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Footer hint */}
          <p className="text-xs text-gray-400 mt-4 text-center">
            Cliquez sur un sujet pour filtrer
          </p>
        </div>
      </div>
    </motion.div>
  );
}; 