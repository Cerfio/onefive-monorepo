import { Button } from '@/components/ui/button';
import { Input } from '@/components/base/input/input';
import { Autocomplete } from '@react-google-maps/api';
import { MutableRefObject } from 'react';
import { Search, X, Loader2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpotlightSearchProps {
  search: string;
  setSearch: (search: string) => void;
  autocompleteRef: MutableRefObject<google.maps.places.Autocomplete | null>;
  onPlaceChanged: () => void;
  onAutocompleteLoad: (autocomplete: google.maps.places.Autocomplete) => void;
  onSearch: () => void;
  isSearching?: boolean;
  resultsCount?: number;
  recentSearches?: string[];
}

export const SpotlightSearch = ({
  search,
  setSearch,
  autocompleteRef: _autocompleteRef,
  onPlaceChanged,
  onAutocompleteLoad,
  onSearch: _onSearch,
  isSearching = false,
  resultsCount = 0,
  recentSearches = [],
}: SpotlightSearchProps) => {
  return (
    <div className="relative">
      <Autocomplete
        onLoad={onAutocompleteLoad}
        onPlaceChanged={onPlaceChanged}
        className="w-full"
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <AnimatePresence mode="wait">
              {isSearching ? (
                <motion.div 
                  key="loading" 
                  initial={{ opacity: 0, rotate: 0 }} 
                  animate={{ opacity: 1, rotate: 360 }} 
                  exit={{ opacity: 0 }} 
                  transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-4 w-4 text-[#5E6AD2]" />
                </motion.div>
              ) : (
                <motion.div 
                  key="search" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                >
                  <Search className="h-4 w-4 text-gray-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <Input
            value={search}
            type="search"
            placeholder="Rechercher un lieu, un événement..."
            onChange={setSearch}
            className="pl-10 pr-10 rounded-lg"
            aria-label="Rechercher des événements et incubateurs"
          />
          
          <AnimatePresence>
            {search && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearch('')}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Autocomplete>
      
      {/* Recherches récentes */}
      <AnimatePresence>
        {recentSearches.length > 0 && !search && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10 min-w-[300px]"
          >
            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Recherches récentes
            </div>
            {recentSearches.map((recentSearch, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSearch(recentSearch)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                aria-label={`Rechercher ${recentSearch}`}
              >
                {recentSearch}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {search && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="absolute top-full left-0 mt-2 text-sm text-[#475467]"
          >
            <motion.span 
              key={resultsCount} 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }} 
              transition={{ type: "spring", stiffness: 500 }}
            >
              {resultsCount} résultat{resultsCount > 1 ? 's' : ''}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 