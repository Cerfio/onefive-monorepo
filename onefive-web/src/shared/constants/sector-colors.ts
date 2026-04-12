import type { BadgeColors } from '@/components/base/badges/badge-types';

/**
 * Configuration des couleurs pour chaque secteur d'activité
 * Permet d'associer une couleur spécifique à chaque secteur pour une meilleure identification visuelle
 */
export const sectorColors: Record<string, BadgeColors> = {
  // Tech Core
  'SaaS': 'blue',
  'FinTech': 'indigo',
  'HealthTech': 'pink',
  'EdTech': 'purple',
  'AI/ML': 'brand',
  'AI': 'brand', // alias pour rétrocompatibilité
  
  // E-commerce & Marketplace
  'Marketplace': 'orange',
  'E-commerce': 'warning',
  
  // Hardware & IoT
  'IoT': 'blue-light',
  
  // Green Tech
  'CleanTech': 'success',
  
  // Bio & Life Sciences
  'BioTech': 'pink',
  
  // Real Estate & Property
  'PropTech': 'indigo',
  
  // Food & Agriculture
  'FoodTech': 'orange',
  'AgriTech': 'success',
  
  // Professional Services
  'LegalTech': 'indigo',
  'HRTech': 'purple',
  
  // Security
  'CyberTech': 'error',
  
  // Retail & Commerce
  'RetailTech': 'warning',
  
  // Travel & Media
  'TravelTech': 'blue',
  'MediaTech': 'purple',
  'SportsTech': 'orange',

  // Autres
  'B2B': 'indigo',
  'Networking': 'blue',
  'Financial Services': 'indigo', // secteur LinkedIn / backend
};

/**
 * Liste des secteurs disponibles (ordre canonique pour toute l'app)
 */
export const SECTOR_OPTIONS = Object.keys(sectorColors);

/**
 * Obtient la couleur associée à un secteur
 * @param sector - Le nom du secteur
 * @returns La couleur Badge associée, ou 'gray' par défaut
 */
export const getSectorColor = (sector: string): BadgeColors => {
  return sectorColors[sector] || 'gray';
};

/**
 * Liste des secteurs disponibles avec leurs couleurs
 */
export const sectorsWithColors = Object.keys(sectorColors).map(sector => ({
  sector,
  color: sectorColors[sector],
}));

