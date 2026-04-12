/**
 * Country utility functions for OneFive
 * Uses Intl.DisplayNames for i18n and countries.tsx for flag URLs
 */

import countries from '@/utils/countries';

/**
 * Get the localized country name from a country code
 * @param countryCode ISO 3166-1 alpha-2 country code (e.g., "FR", "US", "GB")
 * @param language Optional language code (defaults to localStorage 'language' or 'en')
 * @returns Localized country name or the country code if not found
 * 
 * @example
 * getCountryName("FR", "fr") // "France"
 * getCountryName("FR", "en") // "France" 
 * getCountryName("FR", "es") // "Francia"
 * getCountryName("US") // "United States" (if language in localStorage is 'en')
 */
/**
 * Format a location string "City, CC" to display "City, CountryName"
 * @param location Location in format "City, CountryCode" (e.g. "Paris, EE")
 * @returns Formatted location (e.g. "Paris, Estonia")
 */
export function formatLocationDisplay(location: string, language?: string): string {
  if (!location?.trim()) return '';
  const parts = location.split(',').map(s => s.trim());
  if (parts.length >= 2) {
    const [city, countryCode] = parts;
    return `${city}, ${getCountryName(countryCode, language)}`;
  }
  return location;
}

export function getCountryName(countryCode: string, language?: string): string {
  if (!countryCode) return '';
  
  try {
    // Get language from parameter, localStorage, or default to 'en'
    const lang = language || 
                 (typeof window !== 'undefined' ? sessionStorage.getItem('language') : null) || 
                 'en';
    
    const regionNames = new Intl.DisplayNames([lang], { type: 'region' });
    return regionNames.of(countryCode.toUpperCase()) || countryCode;
  } catch (error) {
    console.warn(`Failed to get country name for ${countryCode}:`, error);
    return countryCode;
  }
}

/**
 * Get the flag URL for a country code from countries.tsx
 * @param countryCode ISO 3166-1 alpha-2 country code (e.g., "FR", "US", "GB")
 * @returns Flag URL or null if not found
 * 
 * @example
 * getCountryFlag("FR") // "https://www.untitledui.com/images/flags/FR.svg"
 */
export function getCountryFlag(countryCode: string): string | null {
  if (!countryCode) return null;
  
  const country = countries.find(
    c => c.code.toUpperCase() === countryCode.toUpperCase()
  );
  
  return country?.flag || null;
}

/**
 * Get country data (name, flag, phone code, etc.) from a country code
 * @param countryCode ISO 3166-1 alpha-2 country code (e.g., "FR", "US", "GB")
 * @returns Country object or null if not found
 */
export function getCountryData(countryCode: string) {
  if (!countryCode) return null;
  
  return countries.find(
    c => c.code.toUpperCase() === countryCode.toUpperCase()
  ) || null;
}

/**
 * Check if a country code is valid
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns true if the country code exists in our database
 */
export function isValidCountryCode(countryCode: string): boolean {
  if (!countryCode || countryCode.length !== 2) return false;
  
  return countries.some(
    c => c.code.toUpperCase() === countryCode.toUpperCase()
  );
}

/**
 * Get localized countries list for use in select components
 * @param language Language code (e.g., 'en', 'fr', 'es')
 * @param search Optional search term to filter countries
 * @returns Array of country objects with localized names
 */
export function getLocalizedCountries(language: string = 'en', search?: string): Array<{
  [key: string]: string | undefined;
  alpha2: string;
  flag?: string;
}> {
  try {
    const regionNames = new Intl.DisplayNames([language], { type: 'region' });
    
    let filteredCountries = countries;
    
    // Filter by search term if provided
    if (search && search.trim()) {
      // Normalize search term: lowercase, remove accents, remove hyphens/spaces
      const normalizedSearch = search
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[-\s]/g, '');
      
      filteredCountries = countries.filter(country => {
        const localizedName = regionNames.of(country.code) || country.name;
        
        // Normalize all searchable fields for comparison
        const normalizedLocalizedName = localizedName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[-\s]/g, '');
        
        const normalizedCountryName = country.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[-\s]/g, '');
        
        const normalizedCode = country.code.toLowerCase();
        
        return (
          normalizedLocalizedName.includes(normalizedSearch) ||
          normalizedCountryName.includes(normalizedSearch) ||
          normalizedCode.includes(normalizedSearch)
        );
      });
    }
    
    // Map countries to the format expected by InputSelect
    return filteredCountries.map(country => {
      const localizedName = regionNames.of(country.code) || country.name;
      
      // Create an object with the language key and other properties
      const result: { [key: string]: string | undefined; alpha2: string; flag?: string } = {
        [language]: localizedName,
        alpha2: country.code,
      };
      
      // Optionally add flag URL if needed
      if (country.flag) {
        result.flag = country.flag;
      }
      
      return result;
    });
  } catch (error) {
    console.warn(`Failed to get localized countries for language ${language}:`, error);
    // Fallback to English names
    return countries.map(country => ({
      [language]: country.name,
      alpha2: country.code,
      flag: country.flag,
    }));
  }
}

