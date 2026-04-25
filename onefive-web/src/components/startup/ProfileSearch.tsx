import React, { useState, useEffect } from 'react';
import { Search, User, Mail } from 'lucide-react';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/base/badges/badges';
import { ProfileSearchResult } from '@/queries/startup';
import { InviteByEmailForm } from './InviteByEmailForm';
import { useSearchProfiles } from '@/hooks/useSearchProfiles';

interface ProfileSearchProps {
  onProfileSelect: (profile: ProfileSearchResult) => void;
  onEmailInvite: (email: string, firstName: string, lastName: string) => void;
  selectedProfiles: string[];
  maxResults?: number;
  placeholder?: string;
}

export const ProfileSearch = ({
  onProfileSelect,
  onEmailInvite,
  selectedProfiles = [],
  maxResults = 5,
  placeholder = "Rechercher un utilisateur OneFive..."
}: ProfileSearchProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

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
    return apiResults.map(profile => ({
      id: profile.id,
      name: profile.name,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar || undefined,
      highlight: profile.highlight || undefined,
      countryCode: profile.countryCode || 'FR'
    }));
  }, [apiResults]);

  const handleProfileSelect = (profile: ProfileSearchResult) => {
    if (!selectedProfiles.includes(profile.id)) {
      onProfileSelect(profile);
      setQuery('');
    }
  };

  const handleEmailSubmit = (email: string, firstName: string, lastName: string) => {
    onEmailInvite(email, firstName, lastName);
    setShowEmailForm(false);
    setQuery('');
  };

  const hasResults = searchResults && searchResults.length > 0;
  const noResults = query.length >= 2 && !isLoading && !hasResults;

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(value: string) => setQuery(value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
      </div>

      {/* Search Results */}
      {query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="py-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : hasResults ? (
            <div className="py-2">
              {searchResults.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleProfileSelect(profile)}
                  disabled={selectedProfiles.includes(profile.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar} alt={`${profile.firstName} ${profile.lastName}`} />
                    <AvatarFallback>
                      {`${profile.firstName[0]}${profile.lastName[0]}`}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">
                      {profile.firstName} {profile.lastName}
                    </div>
                    {profile.highlight && (
                      <div className="text-xs text-gray-500 truncate">
                        {profile.highlight}
                      </div>
                    )}
                  </div>
                  {selectedProfiles.includes(profile.id) && (
                    <Badge type="pill-color" color="gray" size="sm">
                      Ajouté
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          ) : noResults ? (
            <div className="p-4">
              <div className="text-center mb-4">
                <User className="mx-auto text-gray-400 mb-2" size={24} />
                <p className="text-sm text-gray-600 mb-1">
                  Aucun résultat pour "{query}"
                </p>
                <p className="text-xs text-gray-500">
                  Cette personne n'est pas encore sur OneFive
                </p>
              </div>

              {showEmailForm ? (
                <InviteByEmailForm
                  searchQuery={query}
                  onInvite={handleEmailSubmit}
                  onCancel={() => setShowEmailForm(false)}
                />
              ) : (
                <div className="space-y-2">
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => setShowEmailForm(true)}
                    className="w-full"
                  >
                    <Mail className="mr-2" size={16} />
                    Inviter par email
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    Ils recevront une invitation à rejoindre OneFive
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ProfileSearch;
