'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Tags } from '@/enums';

interface FeedFilterContextType {
  selectedTags: Tags[];
  addTag: (tag: Tags) => void;
  removeTag: (tag: Tags) => void;
  toggleTag: (tag: Tags) => void;
  clearTags: () => void;
  hasTag: (tag: Tags) => boolean;
  setTags: (tags: Tags[]) => void;
}

const FeedFilterContext = createContext<FeedFilterContextType | undefined>(undefined);

interface FeedFilterProviderProps {
  children: ReactNode;
}

export const FeedFilterProvider: React.FC<FeedFilterProviderProps> = ({ children }) => {
  const [selectedTags, setSelectedTags] = useState<Tags[]>([]);

  // Charger les filtres depuis localStorage au montage
  useEffect(() => {
    const savedFilters = localStorage.getItem('feed-filter-tags');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        if (Array.isArray(parsedFilters)) {
          setSelectedTags(parsedFilters.filter(tag => Object.values(Tags).includes(tag)));
        }
      } catch (error) {
        console.warn('Failed to parse saved filter tags:', error);
      }
    }
  }, []);

  // Sauvegarder les filtres dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('feed-filter-tags', JSON.stringify(selectedTags));
  }, [selectedTags]);

  const addTag = useCallback((tag: Tags) => {
    setSelectedTags(prev => prev.includes(tag) ? prev : [...prev, tag]);
  }, []);

  const removeTag = useCallback((tag: Tags) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  }, []);

  const toggleTag = useCallback((tag: Tags) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const clearTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  const hasTag = useCallback((tag: Tags) => {
    return selectedTags.includes(tag);
  }, [selectedTags]);

  const value: FeedFilterContextType = {
    selectedTags,
    addTag,
    removeTag,
    toggleTag,
    clearTags,
    hasTag,
    setTags: (tags: Tags[]) => setSelectedTags(tags),
  };

  return (
    <FeedFilterContext.Provider value={value}>
      {children}
    </FeedFilterContext.Provider>
  );
};

export const useFeedFilter = () => {
  const context = useContext(FeedFilterContext);
  if (context === undefined) {
    throw new Error('useFeedFilter must be used within a FeedFilterProvider');
  }
  return context;
};
