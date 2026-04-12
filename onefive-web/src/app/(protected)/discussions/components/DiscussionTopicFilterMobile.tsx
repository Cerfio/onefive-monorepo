'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { tags } from '@/constant';
import { Tags } from '@/enums';

interface DiscussionTopicFilterMobileProps {
  topic?: Tags;
  onTopicChange: (topic: Tags | undefined) => void;
}

// Topics populaires
const hotTopics = [Tags.MARKETING, Tags.FUNDING_AND_INVESTMENT, Tags.TECHNOLOGY];

export const DiscussionTopicFilterMobile = ({ topic, onTopicChange }: DiscussionTopicFilterMobileProps) => {
  return (
    <motion.div
      className="lg:hidden mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <p className="text-sm font-semibold text-[#101828] mb-3">Sujets</p>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {/* Bouton Tous */}
          <button
            type="button"
            onClick={() => onTopicChange(undefined)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              topic === undefined
                ? 'bg-[#5E6AD2] text-white shadow-md shadow-[#5E6AD2]/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          
          {/* Liste des topics */}
          {tags.map(tag => {
            const isActive = tag.enum === topic;
            const isHot = hotTopics.includes(tag.enum);
            
            return (
              <button
                key={tag.enum}
                type="button"
                onClick={() => onTopicChange(isActive ? undefined : tag.enum)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-[#5E6AD2] text-white shadow-md shadow-[#5E6AD2]/20' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tag.icon}</span>
                <span>{tag.title}</span>
                {isHot && !isActive && (
                  <Flame className="w-3 h-3 text-orange-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
