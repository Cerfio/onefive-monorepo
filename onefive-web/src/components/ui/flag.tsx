import React from 'react';
import { getCountryFlag } from '@/lib/country';

interface FlagProps {
  countryCode: string;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}

/**
 * Flag component that displays a country flag from a country code
 * Uses flag URLs from countries.tsx via getCountryFlag helper
 */
export const Flag: React.FC<FlagProps> = ({ 
  countryCode, 
  width = 20, 
  height = 15, 
  className = '', 
  alt 
}) => {
  const flagUrl = getCountryFlag(countryCode);
  
  if (!flagUrl) {
    // Fallback: display country code if flag not found
    return (
      <div 
        className={`bg-gray-200 rounded-sm flex items-center justify-center text-xs text-gray-500 ${className}`}
        style={{ width, height }}
      >
        {countryCode}
      </div>
    );
  }

  return (
    <img
      src={flagUrl}
      alt={alt || `${countryCode} flag`}
      width={width}
      height={height}
      className={`rounded-sm ${className}`}
      loading="lazy"
    />
  );
}; 