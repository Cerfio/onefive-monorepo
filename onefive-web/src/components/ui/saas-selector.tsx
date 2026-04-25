'use client';

import * as React from 'react';
import { X, Globe } from 'lucide-react';

import { cn } from '@/lib/utils/core/cn';
import { SaaS, saasList } from '../../config/saas';
import Image from 'next/image';
import { Input } from '@/components/base/input/input';

interface SaaSSelectorProps {
  value: SaaS | null;
  onValueChange: (value: SaaS | null) => void;
}

// Validation de domaine plus robuste
const isValidDomain = (domain: string): boolean => {
  // Pattern pour valider un domaine (ex: google.com, sub.domain.com, etc.)
  const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainPattern.test(domain);
};

// Fonction pour obtenir l'URL du favicon via DuckDuckGo
const getFaviconUrl = (domain: string): string => {
  if (!domain) return '';
  // S'assurer que le domaine est propre
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
  return `https://icons.duckduckgo.com/ip3/${cleanDomain}.ico`;
};

export function SaaSSelector({ value, onValueChange }: SaaSSelectorProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [faviconError, setFaviconError] = React.useState(false);

  // Initialiser l'input avec la valeur actuelle si elle existe
  React.useEffect(() => {
    if (value) {
      setInputValue(value.domain || value.name);
      setFaviconError(false);
    }
  }, [value]);

  const handleInputChange = (domain: string) => {
    setInputValue(domain);
    setError(null); // Réinitialiser l'erreur pendant la saisie

    if (!domain.trim()) {
      onValueChange(null);
      return;
    }

    // Ne pas sélectionner automatiquement pendant la saisie
    // On laisse l'utilisateur taper librement
  };

  const handleBlur = () => {
    const domain = inputValue.trim();
    
    if (!domain) {
      onValueChange(null);
      setError(null);
      return;
    }

    // Nettoyer le domaine (enlever https://, http://, www.)
    const cleanDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .toLowerCase();

    // Chercher dans la liste des SaaS existants (match exact uniquement)
    const existingSaaS = saasList.find(
      (saas) =>
        saas.domain.toLowerCase() === cleanDomain ||
        saas.name.toLowerCase() === cleanDomain
    );

    if (existingSaaS) {
      onValueChange(existingSaaS);
      setInputValue(existingSaaS.domain || existingSaaS.name);
      setError(null);
      setFaviconError(false);
    } else if (isValidDomain(cleanDomain)) {
      // Si c'est un domaine valide, créer un nouveau SaaS
      const domainName = cleanDomain.split('.')[0];
      const newSaaS: SaaS = {
        id: cleanDomain,
        name: domainName.charAt(0).toUpperCase() + domainName.slice(1),
        domain: cleanDomain,
        logoUrl: getFaviconUrl(cleanDomain),
      };
      onValueChange(newSaaS);
      setInputValue(cleanDomain);
      setError(null);
      setFaviconError(false);
    } else {
      // Si ce n'est pas un domaine valide, afficher une erreur
      setError('Veuillez entrer un domaine valide (ex: facebook.com)');
      onValueChange(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    }
  };

  const handleClear = () => {
    setInputValue('');
    onValueChange(null);
    setError(null);
    setFaviconError(false);
  };

  return (
    <div className="space-y-1">
      <div className="relative">
        {/* Icône du favicon à gauche si valeur sélectionnée */}
        {value && !faviconError && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <Image
              src={getFaviconUrl(value.domain)}
              alt={value.name}
              width={16}
              height={16}
              className="rounded-sm"
              onError={() => setFaviconError(true)}
            />
          </div>
        )}
        
        {/* Icône par défaut si favicon en erreur */}
        {value && faviconError && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        
        <Input
          type="text"
          placeholder="facebook.com"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full',
            value && 'pl-8', // Padding à gauche si favicon
            value && 'pr-8'  // Padding à droite si bouton clear
          )}
        />
        
        {/* Bouton clear à droite */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Effacer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Message d'erreur */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
