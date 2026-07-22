import { Button } from '@/components/base/buttons/button';
import { X, Filter } from 'lucide-react';
import { Select } from '@/components/base/select/select';
import { Badge } from '@/components/base/badges/badges';
import { motion } from 'framer-motion';

interface SpotlightFiltersProps {
  dateFilter: string;
  setDateFilter: (value: string) => void;
  pricingFilter: string;
  setPricingFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  sectorFilter: string;
  setSectorFilter: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  distanceFilter: string;
  setDistanceFilter: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const filterOptions = {
  dateRange: [
    { value: 'all', label: 'Toutes les dates' },
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'next-month', label: 'Mois prochain' },
  ],
  pricing: [
    { value: 'all', label: 'Tous les prix' },
    { value: 'free', label: 'Gratuit' },
    { value: 'paid', label: 'Payant' },
    { value: 'donation', label: 'Donation' },
  ],
  placeType: [
    { value: 'all', label: 'Tous les types' },
    { value: 'EVENT', label: 'Événements' },
    { value: 'CONTEST', label: 'Concours' },
    { value: 'INCUBATOR', label: 'Incubateurs' },
    { value: 'ACCELERATOR', label: 'Accélérateurs' },
    { value: 'COWORKINGSPACE', label: 'Coworking' },
  ],
  sector: [
    { value: 'all', label: 'Tous les domaines' },
    { value: 'TECH', label: 'Tech' },
    { value: 'AI', label: 'Intelligence Artificielle' },
    { value: 'FINTECH', label: 'Fintech' },
    { value: 'HEALTHTECH', label: 'Healthtech' },
    { value: 'EDTECH', label: 'Edtech' },
    { value: 'GREENTECH', label: 'Greentech & Climat' },
    { value: 'ECOMMERCE', label: 'E-commerce & Retail' },
    { value: 'SOCIALIMPACT', label: 'Impact Social' },
    { value: 'LEGALTECH', label: 'Legaltech & RegTech' },
    { value: 'PROPTECH', label: 'Immobilier & Proptech' },
    { value: 'FOODTECH', label: 'Foodtech & AgriTech' },
    { value: 'MOBILITY', label: 'Mobilité & Transport' },
    { value: 'GAMING', label: 'Gaming & Esport' },
    { value: 'MEDIA', label: 'Média & Créativité' },
    { value: 'CYBERSECURITY', label: 'Cybersécurité' },
    { value: 'BIOTECH', label: 'Biotech & Sciences' },
    { value: 'WEB3', label: 'Web3 & Blockchain' },
    { value: 'HR', label: 'RH & Future of Work' },
    { value: 'DESIGN', label: 'Design & Créativité' },
    { value: 'MARKETING', label: 'Marketing & Growth' },
    { value: 'BUSINESS', label: 'Business & Strategy' },
    { value: 'LUXURY', label: 'Luxe' },
    { value: 'BEAUTY', label: 'Beauté & Cosmétique' },
    { value: 'SPORTS', label: 'Sport' },
    { value: 'QUANTUM', label: 'Quantique' },
    { value: 'ADTECH', label: 'Adtech & Publicité' },
    { value: 'URBAN', label: 'Ville & Urbanisme' },
    { value: 'INSURTECH', label: 'Insurtech' },
    { value: 'OTHER', label: 'Autre' },
  ],
  sortBy: [
    { value: 'recent', label: 'Plus récent' },
    { value: 'name', label: 'Nom (A-Z)' },
    { value: 'distance', label: 'Distance' },
    { value: 'date', label: 'Date' },
  ],
  distance: [
    { value: '5', label: '5 km' },
    { value: '10', label: '10 km' },
    { value: '25', label: '25 km' },
    { value: '50', label: '50 km' },
    { value: '100', label: '100 km' },
  ]
};

export const SpotlightFilters = ({
  dateFilter,
  setDateFilter,
  pricingFilter,
  setPricingFilter,
  typeFilter,
  setTypeFilter,
  sectorFilter,
  setSectorFilter,
  sortBy,
  setSortBy,
  distanceFilter,
  setDistanceFilter,
  onClearFilters,
  hasActiveFilters,
}: SpotlightFiltersProps) => {
  // Filtres actifs pour affichage
  const activeFilters = [
    { key: 'date', value: dateFilter, label: filterOptions.dateRange.find(f => f.value === dateFilter)?.label },
    { key: 'type', value: typeFilter, label: filterOptions.placeType.find(f => f.value === typeFilter)?.label },
    { key: 'sector', value: sectorFilter, label: filterOptions.sector.find(f => f.value === sectorFilter)?.label },
    { key: 'pricing', value: pricingFilter, label: filterOptions.pricing.find(f => f.value === pricingFilter)?.label },
    { key: 'distance', value: distanceFilter, label: `${distanceFilter} km` },
  ].filter(filter => filter.value !== 'all' && filter.value !== '25');

  return (
    <div className="space-y-6">
      {/* Header avec filtres actifs */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtres actifs :</span>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  type="pill-color"
                  color="blue"
                  size="sm"
                >
                  {filter.label}
                </Badge>
              ))}
            </div>
          </div>
          <Button
            color="tertiary"
            size="sm"
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            Effacer
          </Button>
        </motion.div>
      )}

      {/* Grille de filtres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Date</label>
          <Select
            selectedKey={dateFilter}
            onSelectionChange={(key) => setDateFilter(key as string)}
            placeholder="Sélectionner une date"
            className={`transition-all duration-200 ${dateFilter !== 'all' ? 'border-blue-500 bg-blue-50' : ''}`}
          >
            {filterOptions.dateRange.map(option => (
              <Select.Item key={option.value} id={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select>
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Type</label>
          <Select
            selectedKey={typeFilter}
            onSelectionChange={(key) => setTypeFilter(key as string)}
            placeholder="Sélectionner un type"
            className={`transition-all duration-200 ${typeFilter !== 'all' ? 'border-blue-500 bg-blue-50' : ''}`}
          >
            {filterOptions.placeType.map(option => (
              <Select.Item key={option.value} id={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select>
        </div>

        {/* Secteur */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Secteur</label>
          <Select
            selectedKey={sectorFilter}
            onSelectionChange={(key) => setSectorFilter(key as string)}
            placeholder="Sélectionner un secteur"
            className={`transition-all duration-200 ${sectorFilter !== 'all' ? 'border-blue-500 bg-blue-50' : ''}`}
          >
            {filterOptions.sector.map(option => (
              <Select.Item key={option.value} id={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select>
        </div>

        {/* Prix */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Prix</label>
          <Select
            selectedKey={pricingFilter}
            onSelectionChange={(key) => setPricingFilter(key as string)}
            placeholder="Sélectionner un prix"
            className={`transition-all duration-200 ${pricingFilter !== 'all' ? 'border-blue-500 bg-blue-50' : ''}`}
          >
            {filterOptions.pricing.map(option => (
              <Select.Item key={option.value} id={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select>
        </div>

        {/* Distance */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Distance</label>
          <Select
            selectedKey={distanceFilter}
            onSelectionChange={(key) => setDistanceFilter(key as string)}
            placeholder="Sélectionner une distance"
            className={`transition-all duration-200 ${distanceFilter !== '25' ? 'border-blue-500 bg-blue-50' : ''}`}
          >
            {filterOptions.distance.map(option => (
              <Select.Item key={option.value} id={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select>
        </div>

        {/* Tri */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Trier par</label>
          <Select
            selectedKey={sortBy}
            onSelectionChange={(key) => setSortBy(key as string)}
            placeholder="Sélectionner un tri"
            className={`transition-all duration-200 ${sortBy !== 'recent' ? 'border-blue-500 bg-blue-50' : ''}`}
          >
            {filterOptions.sortBy.map(option => (
              <Select.Item key={option.value} id={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}; 