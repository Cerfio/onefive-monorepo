/**
 * Alternative loader for cities.json using require
 * This is a fallback approach if dynamic import doesn't work
 */

let citiesData: any[] | null = null;

export function loadCitiesSync(): any[] {
  if (citiesData !== null) {
    return citiesData;
  }

  // Only load on client side
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    // Use require for synchronous loading
    citiesData = require('cities.json');
    return citiesData || [];
  } catch {
    citiesData = [];
    return [];
  }
}

/**
 * Get cities for a specific country
 */
export function getCitiesForCountry(countryCode: string): any[] {
  const allCities = loadCitiesSync();
  
  if (!countryCode || allCities.length === 0) {
    return [];
  }
  
  const filtered = allCities.filter(
    city => city.country?.toUpperCase() === countryCode.toUpperCase()
  );
  
  return filtered;
}
