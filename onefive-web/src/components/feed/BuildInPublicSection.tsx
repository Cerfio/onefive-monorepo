'use client';

import { useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Rocket, TrendingUp, Calendar, X, Megaphone, Plus } from 'lucide-react';
import { HelpCircle } from '@untitledui/icons';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';
import { Tags } from '@/enums';
import { useFeedFilter } from '@/contexts/FeedFilterContext';
import { motion, AnimatePresence } from 'framer-motion';

interface BuildInPublicSectionProps {
  onQuickCreate?: (type: 'update' | 'metrics' | 'launch') => void;
}

export const BuildInPublicSection: React.FC<BuildInPublicSectionProps> = ({
  onQuickCreate,
}) => {
  const { hasTag, toggleTag } = useFeedFilter();
  const [isExpanded, setIsExpanded] = useState(false);
  const isFilterActive = hasTag(Tags.BUILD_IN_PUBLIC);

  const quickActions = [
    { 
      type: 'update' as const, 
      label: 'Update', 
      icon: Calendar, 
      color: 'text-purple-600',
      tooltip: 'Partagez une mise à jour sur l\'avancement de votre projet'
    },
    { 
      type: 'metrics' as const, 
      label: 'Métriques', 
      icon: TrendingUp, 
      color: 'text-green-600',
      tooltip: 'Publiez vos métriques de croissance (utilisateurs, revenus, etc.)'
    },
    { 
      type: 'launch' as const, 
      label: 'Launch', 
      icon: Rocket, 
      color: 'text-blue-600',
      tooltip: 'Annoncez le lancement d\'un nouveau produit ou d\'une fonctionnalité'
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#5E6AD2] to-[#8B5CF6] rounded-lg flex items-center justify-center">
            <Megaphone className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Build in Public</h3>
            <p className="text-sm text-gray-500">Partagez votre progression</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            color={isFilterActive ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => toggleTag(Tags.BUILD_IN_PUBLIC)}
          >
            {isFilterActive ? 'Filtrer' : 'Voir tout'}
          </Button>
          <Button 
            color="primary" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-gray-100">
              <div className="flex gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <div key={action.type} className="flex-1 relative group">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          onQuickCreate?.(action.type);
                          setIsExpanded(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onQuickCreate?.(action.type);
                            setIsExpanded(false);
                          }
                        }}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all ${action.color} relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{action.label}</span>
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="ml-auto"
                        >
                          <Tooltip title={action.tooltip}>
                            <TooltipTrigger className="opacity-0 group-hover:opacity-100 transition-opacity cursor-help">
                              <HelpCircle className="size-4 text-gray-400" />
                            </TooltipTrigger>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

