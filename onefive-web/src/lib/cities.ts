/**
 * Cities utility functions for OneFive
 * Uses cities.json package for comprehensive city data with lazy loading
 */

// Cache pour stocker les villes filtrées par pays
const citiesCache: Record<string, any[]> = {};

// Cache pour le module cities.json chargé
let citiesDataPromise: Promise<any[]> | null = null;

/**
 * Charge le module cities.json de manière lazy (seulement quand nécessaire)
 * Utilise une approche avec eval pour éviter que Next.js résolve le module au build time
 * @returns Promise avec le tableau de toutes les villes
 */
async function loadCitiesData(): Promise<any[]> {
  if (citiesDataPromise) {
    return citiesDataPromise;
  }

  citiesDataPromise = (async () => {
    // Ne charger que côté client (browser) pour éviter les problèmes SSR
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      // Utiliser une chaîne dynamique pour éviter que Next.js résolve le module au build time
      // Cette approche permet de charger le module seulement au runtime
      const citiesModule = 'cities' + '.json';
      const module = await import(/* @vite-ignore */ citiesModule);
      // Le package cities.json exporte un tableau par défaut
      const citiesData = module.default || module;
      return citiesData;
    } catch {
      return [];
    }
  })();

  return citiesDataPromise;
}

/**
 * Interface pour une ville du package cities.json
 */
interface City {
  name: string;
  country: string;
  subcountry?: string;
  geonameid?: number;
  [key: string]: any; // Pour permettre d'autres champs du package cities.json
}

/**
 * Get localized cities list for a specific country
 * @param countryCode ISO 3166-1 alpha-2 country code (e.g., "FR", "US", "GB")
 * @param language Language code (e.g., 'en', 'fr', 'es')
 * @param search Optional search term to filter cities
 * @returns Promise resolving to array of city objects with localized names
 */
export async function getLocalizedCitiesAsync(
  countryCode: string,
  language: string = 'en',
  search?: string
): Promise<Array<{
  [key: string]: string | any; // Dynamic keys like 'en', 'fr', etc.
  asciiName: string;
  originalCity?: City; // Données originales pour identifier les arrondissements
}>> {
  if (!countryCode) return [];

  const cacheKey = `${countryCode.toUpperCase()}_${language}`;
  
  // Vérifier le cache d'abord
  if (citiesCache[cacheKey] && !search) {
    return citiesCache[cacheKey];
  }

  try {
    // Charger les données de manière lazy
    const allCities = await loadCitiesData();
    
    // Filtrer par code pays
    let filteredCities = (allCities as City[]).filter(
      city => city.country?.toUpperCase() === countryCode.toUpperCase()
    );
    
    // Filter by search term if provided
    if (search && search.trim()) {
      // Normalize search term: lowercase, remove accents
      const normalizedSearch = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      filteredCities = filteredCities.filter(city => {
        const cityName = city.name || '';
        // Normalize city name for comparison
        const normalizedCityName = cityName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normalizedCityName.includes(normalizedSearch);
      });
    }
    
    // Limiter les résultats pour éviter les problèmes de performance
    // Trier par nom pour avoir un ordre cohérent
    filteredCities = filteredCities
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .slice(0, 1000);
    
    // Map cities to the format expected by InputSelect
    const result: Array<{ 
      [key: string]: string | any; 
      asciiName: string;
      originalCity?: City; // Préserver les données originales pour identifier les arrondissements
    }> = filteredCities.map(city => {
      const cityName = city.name || '';
      return {
        [language]: cityName,
        asciiName: cityName,
        originalCity: city, // Préserver toutes les données originales
      };
    });

    // Mettre en cache si pas de recherche
    if (!search) {
      citiesCache[cacheKey] = result;
    }
    
    return result;
  } catch {
    return [];
  }
}

/**
 * Synchronous version that uses cached data or returns empty array
 * Use this for initial render, then use async version for actual data
 */
export function getLocalizedCities(
  countryCode: string,
  language: string = 'en',
  search?: string
): Array<{
  [key: string]: string | any;
  asciiName: string;
  originalCity?: City;
}> {
  const cacheKey = `${countryCode.toUpperCase()}_${language}`;
  const cached = citiesCache[cacheKey];
  
  if (cached) {
    // Si on a une recherche, filtrer le cache
    if (search && search.trim()) {
      // Normalize search term: lowercase, remove accents
      const normalizedSearch = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return cached.filter(city => {
        const cityName = city[language] || '';
        const asciiName = city.asciiName || '';
        // Normalize both for comparison
        const normalizedCityName = cityName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normalizedAsciiName = asciiName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normalizedCityName.includes(normalizedSearch) || normalizedAsciiName.includes(normalizedSearch);
      });
    }
    return cached;
  }
  
  // Retourner un tableau vide si pas encore chargé
  // Le composant utilisera la version async pour charger les données
  return [];
}

/**
 * Check if a country has cities data available
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns Promise resolving to true if cities data exists for this country
 */
export async function hasCitiesData(countryCode: string): Promise<boolean> {
  if (!countryCode) return false;
  
  try {
    const allCities = await loadCitiesData();
    return (allCities as City[]).some(
      city => city.country?.toUpperCase() === countryCode.toUpperCase()
    );
  } catch {
    return false;
  }
}
