'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const getCompanyIconUrl = (domain: string): string => {
  if (!domain) return '';
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
};

export const CompanyIcon = ({ domain, companyName, logoUrl, size = 24 }: { domain?: string, companyName: string, logoUrl?: string | null, size?: number }) => {
  // Priorité : logoUrl > domain (duckduckgo) > fallback lettre
  const [error, setError] = useState(!logoUrl && !domain);

  useEffect(() => {
      setError(!logoUrl && !domain);
  }, [domain, logoUrl]);

  const imageUrl = logoUrl || (domain ? getCompanyIconUrl(domain) : '');

  if (error || !imageUrl) {
    return (
        <div 
            className="rounded-lg flex-shrink-0 flex items-center justify-center bg-gray-100"
            style={{ height: size + 16, width: size + 16 }}
        >
            <div className="w-6 h-6 bg-gray-300 rounded-md flex items-center justify-center text-xs text-gray-600">
                {companyName.charAt(0).toUpperCase()}
            </div>
      </div>
    );
  }

  return (
    <div 
      className="rounded-lg flex-shrink-0 flex items-center justify-center bg-gray-100"
      style={{ height: size + 16, width: size + 16 }}
    >
        <Image 
            src={imageUrl} 
            alt={companyName} 
            width={size} 
            height={size} 
            className="rounded-md object-contain"
            onError={() => setError(true)}
            unoptimized={!!logoUrl} // Désactiver l'optimisation pour les URLs externes/S3
        />
    </div>
  );
}; 