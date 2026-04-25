import React, { useState, useEffect } from 'react';
import { Search, Building2, UserPlus, Loader2, X } from 'lucide-react';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/base/badges/badges';
import { searchInvestors, InvestorSearchPersonResult, InvestorSearchCompanyResult } from '@/queries/startup';

export type InvestorEntity = {
  type: 'person' | 'company';
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  logo?: string;
  website?: string;
  description?: string;
};

// Hook pour debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface InvestorSearchProps {
  onInvestorSelect: (investor: InvestorEntity) => void;
  selectedInvestorIds: string[];
  placeholder?: string;
}

export const InvestorSearch = ({
  onInvestorSelect,
  selectedInvestorIds = [],
  placeholder = "Rechercher un investisseur ou un fonds..."
}: InvestorSearchProps) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'companies'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    people: InvestorSearchPersonResult[];
    companies: InvestorSearchCompanyResult[];
  }>({ people: [], companies: [] });
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualType, setManualType] = useState<'person' | 'company'>('person');
  const [manualPerson, setManualPerson] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [manualCompany, setManualCompany] = useState({
    name: '',
    domain: '',
    logo: '',
  });

  // Debounce la recherche pour éviter trop de requêtes
  const debouncedQuery = useDebounce(query, 300);

  // Effectuer la recherche quand la query est debounced
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setIsLoading(true);
      searchInvestors(debouncedQuery, 10)
        .then((results) => {
          setSearchResults(results);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error searching investors:', error);
          setSearchResults({ people: [], companies: [] });
          setIsLoading(false);
        });
    } else {
      setSearchResults({ people: [], companies: [] });
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  // Construire l'URL de l'avatar depuis l'ID du fichier
  const getAvatarUrl = (avatarId?: string): string | undefined => {
    if (!avatarId) return undefined;
    // Si l'avatar est déjà une URL complète (ex: depuis le backend), on la retourne
    if (avatarId.startsWith('http')) return avatarId;
    return `${process.env.NEXT_PUBLIC_API_URL}/file/${avatarId}`;
  };

  const handlePersonSelect = (profile: InvestorSearchPersonResult) => {
    if (!selectedInvestorIds.includes(profile.id)) {
      onInvestorSelect({
        type: 'person',
        id: profile.id,
        name: `${profile.firstName} ${profile.lastName}`,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatar: getAvatarUrl(profile.avatar),
        description: profile.highlight,
      });
      setQuery('');
    }
  };

  const handleCompanySelect = (company: InvestorSearchCompanyResult) => {
    if (!selectedInvestorIds.includes(company.id)) {
      onInvestorSelect({
        type: 'company',
        id: company.id,
        name: company.name,
        logo: company.logo,
        website: company.website,
        description: company.description,
      });
      setQuery('');
    }
  };

  // Fonction pour extraire le domaine depuis l'input utilisateur
  const extractDomain = (input: string): string => {
    if (!input.trim()) return '';
    
    // Enlever les protocoles http://, https://
    let domain = input.trim().replace(/^https?:\/\//i, '');
    
    // Enlever www.
    domain = domain.replace(/^www\./i, '');
    
    // Enlever le slash final et tout ce qui suit
    domain = domain.split('/')[0];
    
    // Enlever les espaces
    domain = domain.trim();
    
    return domain;
  };

  // Générer l'URL du logo depuis le domaine
  const getLogoFromDomain = (domain: string): string => {
    if (!domain) return '';
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  };

  // Mettre à jour le logo quand le domaine change
  useEffect(() => {
    if (manualType === 'company' && manualCompany.domain) {
      const cleanDomain = extractDomain(manualCompany.domain);
      if (cleanDomain) {
        setManualCompany(prev => ({ ...prev, logo: getLogoFromDomain(cleanDomain) }));
      } else {
        setManualCompany(prev => ({ ...prev, logo: '' }));
      }
    }
  }, [manualCompany.domain, manualType]);

  const handleManualAdd = () => {
    if (manualType === 'person') {
      if (manualPerson.firstName.trim() && manualPerson.lastName.trim()) {
        onInvestorSelect({
          type: 'person',
          id: `manual-person-${Date.now()}`,
          name: `${manualPerson.firstName.trim()} ${manualPerson.lastName.trim()}`,
          firstName: manualPerson.firstName.trim(),
          lastName: manualPerson.lastName.trim(),
          email: manualPerson.email || undefined,
        });
        setManualPerson({ firstName: '', lastName: '', email: '' });
        setShowManualAdd(false);
        setQuery('');
      }
    } else {
      if (manualCompany.name.trim()) {
        const cleanDomain = extractDomain(manualCompany.domain);
        onInvestorSelect({
          type: 'company',
          id: `manual-company-${Date.now()}`,
          name: manualCompany.name.trim(),
          website: cleanDomain ? `https://${cleanDomain}` : undefined,
          logo: manualCompany.logo || undefined,
        });
        setManualCompany({ name: '', domain: '', logo: '' });
        setShowManualAdd(false);
        setQuery('');
      }
    }
  };

  const filteredPeople = activeTab === 'companies' ? [] : searchResults.people;
  const filteredCompanies = activeTab === 'people' ? [] : searchResults.companies;
  const hasResults = filteredPeople.length > 0 || filteredCompanies.length > 0;
  const showResults = query.length >= 2 && !isLoading;

  return (
    <div className="space-y-3">
      {/* Champ de recherche */}
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={query}
          onChange={setQuery}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
      </div>

      {/* Bouton d'ajout manuel toujours visible */}
      {!showManualAdd && (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setShowManualAdd(true);
              setManualType('person');
            }}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <UserPlus className="mr-2" size={14} />
            Ajouter une personne
          </Button>
          <Button
            onClick={() => {
              setShowManualAdd(true);
              setManualType('company');
            }}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Building2 className="mr-2" size={14} />
            Ajouter un fonds
          </Button>
        </div>
      )}

      {/* Tabs de filtrage */}
      {query.length >= 2 && (
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeTab === 'all'
                ? 'bg-violet-100 text-violet-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeTab === 'people'
                ? 'bg-violet-100 text-violet-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            👤 Personnes ({searchResults.people.length})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              activeTab === 'companies'
                ? 'bg-violet-100 text-violet-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🏢 Fonds ({searchResults.companies.length})
          </button>
        </div>
      )}

      {/* Résultats de recherche */}
      {showResults && (
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-gray-400" size={24} />
                <span className="ml-2 text-sm text-gray-500">Recherche en cours...</span>
              </div>
            ) : hasResults ? (
              <div className="space-y-4">
                {/* Personnes */}
                {filteredPeople.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Personnes ({filteredPeople.length})
                    </p>
                    <div className="space-y-2">
                      {filteredPeople.map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => handlePersonSelect(profile)}
                          disabled={selectedInvestorIds.includes(profile.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                        >
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage src={getAvatarUrl(profile.avatar)} alt={profile.name} />
                            <AvatarFallback>
                              {`${profile.firstName[0]}${profile.lastName[0]}`}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900">
                              {profile.firstName} {profile.lastName}
                            </div>
                            {profile.highlight && (
                              <div className="text-xs text-gray-500 truncate mt-0.5">
                                {profile.highlight}
                              </div>
                            )}
                          </div>
                          {selectedInvestorIds.includes(profile.id) && (
                            <Badge type="pill-color" color="gray" size="sm" className="flex-shrink-0">
                              Ajouté
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Entreprises / Fonds */}
                {filteredCompanies.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Fonds & Entreprises ({filteredCompanies.length})
                    </p>
                    <div className="space-y-2">
                      {filteredCompanies.map((company) => (
                        <button
                          key={company.id}
                          onClick={() => handleCompanySelect(company)}
                          disabled={selectedInvestorIds.includes(company.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                        >
                          <div className="h-12 w-12 flex-shrink-0 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {company.logo ? (
                              <img src={company.logo} alt={company.name} className="w-8 h-8 object-contain" />
                            ) : (
                              <Building2 className="text-gray-400" size={20} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900">
                              {company.name}
                            </div>
                            {company.description && (
                              <div className="text-xs text-gray-500 truncate mt-0.5">
                                {company.description}
                              </div>
                            )}
                          </div>
                          {selectedInvestorIds.includes(company.id) && (
                            <Badge type="pill-color" color="gray" size="sm" className="flex-shrink-0">
                              Ajouté
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Aucun résultat */
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                  <Search className="text-gray-400" size={24} />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Aucun résultat pour "<strong>{query}</strong>"
                </p>
                <p className="text-xs text-gray-500">
                  Utilisez les boutons ci-dessus pour ajouter manuellement un investisseur
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Formulaire d'ajout manuel */}
      {showManualAdd && (
        <Card className="border-gray-200 bg-gray-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {manualType === 'person' ? (
                    <UserPlus className="text-gray-700" size={20} />
                  ) : (
                    <Building2 className="text-gray-700" size={20} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Ajout manuel - {manualType === 'person' ? 'Personne' : 'Fonds/Entreprise'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {manualType === 'person' 
                      ? 'Ajouter une personne non présente dans la base'
                      : 'Ajouter un fonds ou une entreprise non présent dans la base'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowManualAdd(false);
                  setManualPerson({ firstName: '', lastName: '', email: '' });
                  setManualCompany({ name: '', domain: '', logo: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {manualType === 'person' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Prénom *"
                      placeholder="Ex: Marie"
                      value={manualPerson.firstName}
                      onChange={(value) => setManualPerson(prev => ({ ...prev, firstName: value }))}
                      className="bg-white"
                    />
                    <Input
                      label="Nom *"
                      placeholder="Ex: Dubois"
                      value={manualPerson.lastName}
                      onChange={(value) => setManualPerson(prev => ({ ...prev, lastName: value }))}
                      className="bg-white"
                    />
                  </div>
                  <Input
                    label="Email (optionnel)"
                    placeholder="marie.dubois@example.com"
                    type="email"
                    value={manualPerson.email}
                    onChange={(value) => setManualPerson(prev => ({ ...prev, email: value }))}
                    className="bg-white"
                  />
                  <Button
                    onClick={handleManualAdd}
                    disabled={!manualPerson.firstName.trim() || !manualPerson.lastName.trim()}
                    className="w-full"
                    size="lg"
                  >
                    <UserPlus className="mr-2" size={16} />
                    Ajouter {manualPerson.firstName || manualPerson.lastName ? `${manualPerson.firstName} ${manualPerson.lastName}`.trim() : "la personne"}
                  </Button>
                </>
              ) : (
                <>
                  <Input
                    label="Nom de l'entreprise/fonds *"
                    placeholder="Ex: Kima Ventures"
                    value={manualCompany.name}
                    onChange={(value) => setManualCompany(prev => ({ ...prev, name: value }))}
                    className="bg-white"
                  />
                  <Input
                    label="Nom de domaine (optionnel)"
                    placeholder="exemple.com"
                    value={manualCompany.domain}
                    onChange={(value) => setManualCompany(prev => ({ ...prev, domain: value }))}
                    className="bg-white"
                  />
                  {manualCompany.logo && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Logo détecté :</span>
                      <img 
                        src={manualCompany.logo} 
                        alt="Logo" 
                        className="h-4 w-4 object-contain"
                        onError={() => setManualCompany(prev => ({ ...prev, logo: '' }))}
                      />
                    </div>
                  )}
                  <Button
                    onClick={handleManualAdd}
                    disabled={!manualCompany.name.trim()}
                    className="w-full"
                    size="lg"
                  >
                    <Building2 className="mr-2" size={16} />
                    Ajouter {manualCompany.name || "l'investisseur"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvestorSearch;

