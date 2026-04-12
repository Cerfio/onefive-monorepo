'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { Button } from './button';
import { ChevronsUpDown } from 'lucide-react';
import isEmptyObject from '@/utils/isEmptyObject';
import capitalizeFirstLetter from '@/utils/capitalizeFirstLetter';
import { useState, useMemo } from 'react';

// Normalize string for comparison (lowercase, remove accents)
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove accents
};

// Calculate relevance score for sorting
const calculateRelevanceScore = (label: string, search: string): number => {
  const normalizedLabel = normalizeString(label);
  const normalizedSearch = normalizeString(search);
  
  // Exact match (case-insensitive)
  if (normalizedLabel === normalizedSearch) {
    return 1000;
  }
  
  // Starts with search term
  if (normalizedLabel.startsWith(normalizedSearch)) {
    return 500;
  }
  
  // Contains search term at word boundary (e.g., "Paris" in "Paris, France")
  const wordBoundaryRegex = new RegExp(`\\b${normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
  if (wordBoundaryRegex.test(normalizedLabel)) {
    return 300;
  }
  
  // Contains search term anywhere
  if (normalizedLabel.includes(normalizedSearch)) {
    return 100;
  }
  
  return 0;
};

const InputSelect = ({
  search,
  setSearch,
  data,
  placeholder,
  placeholderInput,
  messageNotFound,
  keyLabel,
  value,
  setValue,
  defaultKey,
  isDisabled,
}: {
  search?: string;
  setSearch?: (value: string) => void;
  data: any[];
  placeholder: string;
  placeholderInput: string;
  messageNotFound: string;
  keyLabel: string;
  value: any;
  setValue: (value: any) => void;
  defaultKey: string;
  isDisabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  
  // Manual filtering with normalization and smart sorting
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    if (!search || search.trim() === '') {
      return data;
    }
    
    const normalizedSearch = normalizeString(search);
    
    // Check if search is exactly "Paris" (case-insensitive)
    const isExactParisSearch = normalizedSearch === 'paris';
    
    // Filter and calculate relevance scores
    const resultsWithScores = data
      .map(item => {
        const label = item.hasOwnProperty(keyLabel) ? item[keyLabel] : item[defaultKey];
        const normalizedLabel = normalizeString(label || '');
        const matches = normalizedLabel.includes(normalizedSearch);
        
        if (!matches) {
          return null;
        }
        
        // Si on cherche exactement "Paris", exclure les arrondissements
        if (isExactParisSearch) {
          // Exclure si le nom contient "Arrondissement" (insensible à la casse)
          // Vérifier à la fois dans le label et dans le nom original
          const labelLower = (label || '').toLowerCase();
          const originalNameLower = item.originalCity?.name?.toLowerCase() || '';
          
          if (labelLower.includes('arrondissement') || originalNameLower.includes('arrondissement')) {
            return null;
          }
          
          // Vérifier via featureCode si disponible
          if (item.originalCity?.featureCode) {
            const featureCode = item.originalCity.featureCode;
            // Les arrondissements ont souvent des codes comme PPLX, ADM4, etc.
            if (featureCode === 'PPLX' || 
                featureCode === 'ADM4' ||
                (featureCode.startsWith('ADM') && featureCode !== 'ADM1')) {
              return null;
            }
          }
        }
        
        const score = calculateRelevanceScore(label || '', search);
        return { item, label, score };
      })
      .filter((result): result is { item: any; label: string; score: number } => result !== null);
    
    // Sort by relevance score (descending), then alphabetically
    const sortedResults = resultsWithScores.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Higher score first
      }
      // If same score, sort alphabetically
      return (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' });
    });
    
    const results = sortedResults.map(result => result.item);
    
    return results;
  }, [data, search, keyLabel, defaultKey]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={isDisabled}
          variant="outline"
          role="combobox"
          className="w-full h-11 justify-between font-normal text-sm truncate"
        >
          {!isEmptyObject(value)
            ? capitalizeFirstLetter(value[keyLabel])
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[264px] p-0">
        <Command 
          shouldFilter={false}
        >
          <CommandInput
            placeholder={placeholderInput}
            value={search}
            onValueChange={(e) => setSearch && setSearch(e)}
          />
          <CommandList>
            {filteredData.length === 0 && (
               <CommandEmpty>{messageNotFound}</CommandEmpty>
            )}
            <CommandGroup className="h-40 overflow-y-scroll">
              {filteredData.map((item, index) => {
                let label;
                if (item.hasOwnProperty(keyLabel)) {
                  label = item[keyLabel];
                } else {
                  label = item[defaultKey];
                }
                
                // Ensure label is a string
                const labelStr = String(label || '');
                
                // Generate unique key
                const itemKey = `${labelStr}-${index}`;
                
                return (
                  <CommandItem
                    key={itemKey}
                    value={labelStr} // Pass the label as value
                    onSelect={() => {
                      setValue(item);
                      setOpen(false);
                    }}
                  >
                    {labelStr}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default InputSelect;
