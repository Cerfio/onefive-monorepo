'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/base/input/input';
import {
  ButtonGroup,
  ButtonGroupItem,
} from '@/components/base/button-group/button-group';
import { Sort } from '@/enums';

interface DiscussionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: Sort;
  onSortChange: (value: Sort) => void;
}

export const DiscussionFilters = ({ 
  search, 
  onSearchChange,
  sort,
  onSortChange,
}: DiscussionFiltersProps) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      // Handle search submission if needed
    }
  };

  const sortOptions: { id: Sort; label: string }[] = [
    { id: Sort.INTERESTING, label: 'Intéressant' },
    { id: Sort.NEWEST, label: 'Nouveau' },
    { id: Sort.POPULAR, label: 'Populaire' },
    { id: Sort.WEEK, label: 'Semaine' },
    { id: Sort.MONTH, label: 'Mois' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.4, duration: 0.6 }} 
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <ButtonGroup
              selectedKeys={new Set([sort])}
              onSelectionChange={keys => {
                const [value] = Array.from(keys);
                if (value) {
                  onSortChange(value as Sort);
                }
              }}
            >
              {sortOptions.map(option => (
                <ButtonGroupItem key={option.id} id={option.id}>
                  {option.label}
                </ButtonGroupItem>
              ))}
            </ButtonGroup>
          </div>
          <div className="relative flex-1 lg:w-[400px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              placeholder="Rechercher des discussions..."
              className="pl-10 rounded-lg"
              onChange={onSearchChange}
              value={search}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 