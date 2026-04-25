import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/base/badges/badges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

export interface AdvancedFilterState {
  location: string[];
  role: string[];
  industry: string[];
  stage: string[];
  experience: string[];
  activeGoals: string[];
  badges: string[];
  status: string[];
  remote: boolean;
  hiring: boolean;
  verified: boolean;
}

interface FilterSection {
  key: keyof AdvancedFilterState;
  title: string;
  options: string[];
  isBoolean?: boolean;
  isCollapsed?: boolean;
}

interface AdvancedFiltersProps {
  filters: AdvancedFilterState;
  onFilterChange: (key: keyof AdvancedFilterState, value: any, checked?: boolean) => void;
  onResetFilters: () => void;
  activeTab: 'people' | 'startups';
  className?: string;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  activeTab,
  className = ''
}) => {
  const [collapsedSections, setCollapsedSections] = React.useState<string[]>([]);

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => 
      prev.includes(sectionKey)
        ? prev.filter(key => key !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  const peopleFilters: FilterSection[] = [
    {
      key: 'location',
      title: 'Localisation',
      options: [
        'Paris, France',
        'London, UK',
        'Berlin, Germany',
        'Barcelona, Spain',
        'Amsterdam, Netherlands',
        'Lyon, France',
        'Madrid, Spain',
        'Milan, Italy',
        'Stockholm, Sweden',
        'Dublin, Ireland'
      ]
    },
    {
      key: 'role',
      title: 'Rôle',
      options: [
        'Founder',
        'Co-founder',
        'CEO',
        'CTO',
        'VP Sales',
        'VP Marketing',
        'Product Manager',
        'Développeur',
        'Designer',
        'Investisseur',
        'Business Angel',
        'Consultant',
        'Mentor'
      ]
    },
    {
      key: 'industry',
      title: 'Secteur',
      options: [
        'SaaS',
        'FinTech',
        'HealthTech',
        'AI',
        'E-commerce',
        'GreenTech',
        'B2B',
        'CleanTech',
        'EdTech',
        'PropTech',
        'FoodTech',
        'MarketingTech',
        'HR Tech',
        'LegalTech'
      ]
    },
    {
      key: 'experience',
      title: 'Expérience',
      options: [
        '0-2 ans',
        '3-5 ans',
        '5-10 ans',
        '10+ ans'
      ]
    },
    {
      key: 'activeGoals',
      title: 'Objectifs Actifs',
      options: [
        'Recherche un co-fondateur',
        'Cherche à investir',
        'Propose du mentorat',
        'Cherche un emploi',
        'Cherche des partenaires',
        'Lève des fonds',
        'Recrute une équipe',
        'Développe son réseau',
        'Cherche des clients',
        'Partage son expertise'
      ]
    },
    {
      key: 'badges',
      title: 'Badges Onefive',
      options: [
        'Early Adopter',
        'Top Contributeur',
        'Expert vérifié',
        'Mentor certifié',
        'Investisseur actif',
        'Serial Entrepreneur',
        'Rising Star',
        'Community Leader'
      ]
    }
  ];

  const startupFilters: FilterSection[] = [
    {
      key: 'location',
      title: 'Localisation',
      options: [
        'Paris, France',
        'London, UK',
        'Berlin, Germany',
        'Barcelona, Spain',
        'Amsterdam, Netherlands',
        'Lyon, France',
        'Madrid, Spain',
        'Milan, Italy',
        'Stockholm, Sweden',
        'Dublin, Ireland'
      ]
    },
    {
      key: 'industry',
      title: 'Secteur',
      options: [
        'SaaS',
        'FinTech',
        'HealthTech',
        'AI',
        'E-commerce',
        'GreenTech',
        'B2B',
        'CleanTech',
        'EdTech',
        'PropTech',
        'FoodTech',
        'MarketingTech',
        'HR Tech',
        'LegalTech'
      ]
    },
    {
      key: 'stage',
      title: 'Stade de financement',
      options: [
        'Idée',
        'Pré-seed',
        'Seed',
        'Série A',
        'Série B',
        'Série C+',
        'Scale-up',
        'IPO Ready'
      ]
    },
    {
      key: 'status',
      title: 'Statut',
      options: [
        'En recherche de financement',
        'Recrute activement',
        'Recherche partenaires',
        'En croissance',
        'Pivot en cours',
        'Expansion internationale',
        'Nouvellement lancée'
      ]
    }
  ];

  const booleanFilters = [
    { key: 'remote' as const, label: 'Ouvert au télétravail', activeTab: 'people' },
    { key: 'hiring' as const, label: 'Recrute actuellement', activeTab: 'startups' },
    { key: 'verified' as const, label: 'Profils vérifiés seulement', activeTab: 'both' }
  ];

  const currentFilters = activeTab === 'people' ? peopleFilters : startupFilters;

  const getActiveFiltersCount = () => {
    return Object.entries(filters).reduce((count, [_key, value]) => {
      if (Array.isArray(value)) {
        return count + value.length;
      }
      if (typeof value === 'boolean' && value) {
        return count + 1;
      }
      return count;
    }, 0);
  };

  const renderFilterSection = (section: FilterSection) => {
    const isCollapsed = collapsedSections.includes(section.key);
    const activeCount = Array.isArray(filters[section.key]) ? (filters[section.key] as string[]).length : 0;

    return (
      <div key={section.key} className="border-b border-gray-200 last:border-b-0">
        <button
          onClick={() => toggleSection(section.key)}
          className="flex items-center justify-between w-full py-3 text-left hover:bg-gray-50 px-4 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{section.title}</span>
            {activeCount > 0 && (
              <Badge type="pill-color" color="gray" size="sm">
                {activeCount}
              </Badge>
            )}
          </div>
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          )}
        </button>
        {!isCollapsed && (
          <div className="px-4 pb-3">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {section.options.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${section.key}-${option}`}
                    checked={(filters[section.key] as string[])?.includes(option) || false}
                    onCheckedChange={(checked) => 
                      onFilterChange(section.key, option, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={`${section.key}-${option}`} 
                    className="text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={`w-80 h-fit ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtres avancés</CardTitle>
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
        {getActiveFiltersCount() > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(filters).map(([key, value]) => {
              if (Array.isArray(value) && value.length > 0) {
                return value.map(item => (
                  <button
                    key={`${key}-${item}`}
                    type="button"
                    onClick={() => onFilterChange(key as keyof AdvancedFilterState, item, false)}
                    className="cursor-pointer"
                  >
                    <Badge
                      type="pill-color"
                      color="gray"
                      size="sm"
                      className="hover:bg-gray-200"
                    >
                      {item}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  </button>
                ));
              }
              if (typeof value === 'boolean' && value) {
                const booleanFilter = booleanFilters.find(f => f.key === key);
                if (booleanFilter) {
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onFilterChange(key as keyof AdvancedFilterState, false)}
                      className="cursor-pointer"
                    >
                      <Badge
                        type="pill-color"
                        color="gray"
                        size="sm"
                        className="hover:bg-gray-200"
                      >
                        {booleanFilter.label}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    </button>
                  );
                }
              }
              return null;
            })}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {currentFilters.map(renderFilterSection)}
          
          <div className="p-4 space-y-3">
            <h4 className="font-medium text-gray-900">Options</h4>
            {booleanFilters
              .filter(filter => filter.activeTab === 'both' || filter.activeTab === activeTab)
              .map(filter => (
                <div key={filter.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={filter.key}
                    checked={filters[filter.key] as boolean}
                    onCheckedChange={(checked) => 
                      onFilterChange(filter.key, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={filter.key} 
                    className="text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                  >
                    {filter.label}
                  </label>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedFilters; 