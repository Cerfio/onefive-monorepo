import React, { useState, useEffect } from 'react';
import { Search, Mail, UserPlus, Loader2 } from 'lucide-react';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';
import { Avatar } from '@/components/base/avatar/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/base/badges/badges';
import { ProfileSearchResult } from '@/queries/startup';
import { useSearchProfiles } from '@/hooks/useSearchProfiles';

interface SmartProfileSearchProps {
  onProfileSelect: (profile: ProfileSearchResult) => void;
  onEmailInvite: (email: string, firstName: string, lastName: string) => void;
  selectedProfiles: string[];
  maxResults?: number;
  placeholder?: string;
}

// Fonction pour détecter si une chaîne est un email
const isEmail = (str: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str.trim());
};

export const SmartProfileSearch = ({
  onProfileSelect,
  onEmailInvite,
  selectedProfiles = [],
  maxResults = 5,
  placeholder = "Rechercher sur OneFive ou entrer un email..."
}: SmartProfileSearchProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Use real API for profile search
  const { data: apiResults = [], isLoading } = useSearchProfiles(
    debouncedQuery,
    maxResults
  );

  // Convert API results to ProfileSearchResult format if needed
  const searchResults = React.useMemo(() => {
    if (query.length < 2 || isEmail(query)) {
      return [];
    }
    
    // Map API results to ProfileSearchResult format
    return apiResults.map(profile => ({
      id: profile.id,
      name: profile.name,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar || undefined,
      highlight: profile.highlight || undefined,
      countryCode: profile.countryCode || 'FR'
    }));
  }, [apiResults, query]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (isEmail(value)) {
      setEmailInput(value);
    }
  };

  const handleProfileSelect = (profile: ProfileSearchResult) => {
    if (!selectedProfiles.includes(profile.id)) {
      onProfileSelect(profile);
      setQuery('');
      setEmailInput('');
      setFirstName('');
      setLastName('');
    }
  };

  const handleEmailInvite = () => {
    const email = isEmail(query) ? query : emailInput;
    if (email && firstName && lastName) {
      onEmailInvite(email, firstName, lastName);
      setQuery('');
      setEmailInput('');
      setFirstName('');
      setLastName('');
    }
  };

  const hasResults = searchResults.length > 0;
  const noResults = query.length >= 2 && !isEmail(query) && !isLoading && !hasResults;
  const emailDetected = isEmail(query);

  // Déterminer si le formulaire d'invitation est valide
  const canInvite = emailDetected
    ? firstName.trim() !== '' && lastName.trim() !== ''
    : emailInput.trim() !== '' && isEmail(emailInput) && firstName.trim() !== '' && lastName.trim() !== '';

  return (
    <div className="space-y-4">
      {/* Champ de recherche */}
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={query}
          onChange={handleQueryChange}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
      </div>

      {/* Cas 1: Email détecté */}
      {emailDetected && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Email détecté</p>
                <p className="text-xs text-blue-700">Inviter cette personne par email</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  label="Email"
                  value={query}
                  onChange={() => {}} // Email verrouillé depuis la recherche
                  isDisabled
                  className="bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  L'email a été détecté automatiquement
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Prénom"
                  placeholder="Prénom"
                  value={firstName}
                  onChange={setFirstName}
                  className="bg-white"
                />
                <Input
                  label="Nom"
                  placeholder="Nom"
                  value={lastName}
                  onChange={setLastName}
                  className="bg-white"
                />
              </div>
              
              <Button
                onClick={handleEmailInvite}
                isDisabled={!canInvite}
                className="w-full"
                size="lg"
                color="primary"
                iconLeading={<Mail data-icon />}
              >
                Inviter {query}
              </Button>
              
              <p className="text-xs text-center text-gray-500">
                Cette personne recevra une invitation à rejoindre OneFive et votre startup
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cas 2: Résultats de recherche trouvés */}
      {!emailDetected && query.length >= 2 && (
        <>
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-gray-400" size={24} />
                  <span className="ml-2 text-sm text-gray-500">Recherche en cours...</span>
                </div>
              </CardContent>
            </Card>
          ) : hasResults ? (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-gray-700 mb-4">
                  Résultats de recherche ({searchResults.length})
                </p>
                <div className="space-y-2">
                  {searchResults.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => handleProfileSelect(profile)}
                      disabled={selectedProfiles.includes(profile.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Avatar
                        size="lg"
                        src={profile.avatar}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        initials={`${profile.firstName[0]}${profile.lastName[0]}`}
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium text-sm text-gray-900">
                          {profile.firstName} {profile.lastName}
                        </div>
                        {profile.highlight && (
                          <div className="text-xs text-gray-500 truncate mt-1">
                            {profile.highlight}
                          </div>
                        )}
                      </div>
                      {selectedProfiles.includes(profile.id) && (
                        <Badge type="pill-color" color="gray" size="sm" className="flex-shrink-0">
                          Ajouté
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : noResults ? (
            /* Cas 3: Aucun résultat - proposer invitation */
            <Card className="border-gray-300">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                    <UserPlus className="text-gray-400" size={24} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Aucun résultat pour "<strong>{query}</strong>"
                  </p>
                  <p className="text-xs text-gray-500">
                    Cette personne n'est pas encore sur OneFive
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      label="Email"
                      placeholder="email@exemple.com"
                      value={emailInput}
                      onChange={setEmailInput}
                      className="bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      L'email de la personne que vous souhaitez inviter
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Prénom"
                      placeholder="Prénom"
                      value={firstName}
                      onChange={setFirstName}
                      className="bg-white"
                    />
                    <Input
                      label="Nom"
                      placeholder="Nom"
                      value={lastName}
                      onChange={setLastName}
                      className="bg-white"
                    />
                  </div>
                  
                  <Button
                    onClick={handleEmailInvite}
                    isDisabled={!canInvite}
                    className="w-full"
                    size="lg"
                    color="primary"
                    iconLeading={<Mail data-icon />}
                  >
                    Inviter par email
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500">
                    Ils recevront une invitation à rejoindre OneFive et votre startup
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
};

export default SmartProfileSearch;
