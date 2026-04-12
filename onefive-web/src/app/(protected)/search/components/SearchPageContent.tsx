'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { User01, Building07, File05, MessageChatCircle, SearchLg } from '@untitledui/icons';
import { UserPlus, UserCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchResults } from '@/hooks/useSearch';
import { Spinner } from '@/components/base/spinner';
import { SearchPerson, SearchCompany, SearchPost, SearchDiscussion } from '@/queries/search';
import { Post } from '@/features/post/components/post';
import { DiscussionCard } from '@/app/(protected)/discussions/components/DiscussionCard';
import { UserMiniProfile } from '@/components/base/avatar/user-mini-profile';
import { Badge } from '@/components/base/badges/badges';
import type { BadgeColors } from '@/components/base/badges/badge-types';
import { useSendConnectionRequest, useCancelConnectionRequest } from '@/hooks/useConnection';
import { CancelConnectionModal } from '@/components/modals/CancelConnectionModal';
import { useNavigateToConversation } from '@/hooks/useNavigateToConversation';

type TabType = 'people' | 'companies' | 'posts' | 'discussions';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const tabs: TabConfig[] = [
  { id: 'people', label: 'Personnes', icon: User01 },
  { id: 'companies', label: 'Entreprises', icon: Building07 },
  { id: 'posts', label: 'Publications', icon: File05 },
  { id: 'discussions', label: 'Discussions', icon: MessageChatCircle },
];

const getAvatarUrl = (avatarId: string | null): string | undefined => {
  if (!avatarId) return undefined;
  if (avatarId.startsWith('http')) return avatarId;
  return `${process.env.NEXT_PUBLIC_API_URL}/file/${avatarId}`;
};

const truncateText = (text: string | null, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Configuration des couleurs et labels pour les rôles ecosystem
const _roleColors: Record<string, { bg: string; text: string; border: string }> = {
  FOUNDER: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  BUSINESS_ANGEL: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  VENTURE_CAPITALIST: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  INSTITUTIONAL_INVESTOR: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  MENTOR: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  STRATEGIC_ADVISOR: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  ADVISOR: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  INCUBATOR: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  SERVICE_PROVIDER: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  CORPORATE: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  OTHER: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
};

const roleLabels: Record<string, string> = {
  FOUNDER: 'Fondateur',
  BUSINESS_ANGEL: 'Business Angel',
  VENTURE_CAPITALIST: 'VC',
  INSTITUTIONAL_INVESTOR: 'Investisseur',
  MENTOR: 'Mentor',
  STRATEGIC_ADVISOR: 'Conseiller',
  ADVISOR: 'Conseiller',
  INCUBATOR: 'Incubateur',
  SERVICE_PROVIDER: 'Prestataire',
  CORPORATE: 'Corporate',
  OTHER: 'Autre',
};

// Fonction pour obtenir le badge de couleur selon le rôle
const getBadgeColor = (role: string): BadgeColors => {
  if (role === 'FOUNDER') return 'brand';
  if (['BUSINESS_ANGEL', 'VENTURE_CAPITALIST', 'INSTITUTIONAL_INVESTOR'].includes(role)) return 'success';
  if (role === 'MENTOR') return 'warning';
  if (['STRATEGIC_ADVISOR', 'ADVISOR'].includes(role)) return 'error';
  return 'brand';
};

export function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const tabParam = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'people');
  const hasUserChangedTab = useRef(false);

  // Fetch search results
  const { data, isLoading, isError, error } = useSearchResults(query, 20);

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    hasUserChangedTab.current = true;
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  // Reset user tab change flag when query changes
  useEffect(() => {
    hasUserChangedTab.current = false;
  }, [query]);

  // Sync tab from URL
  useEffect(() => {
    if (tabParam && tabs.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
      hasUserChangedTab.current = true; // User explicitly set tab in URL
    }
  }, [tabParam]);

  // Calculate counts for each tab
  const counts = {
    people: data?.people.length || 0,
    companies: data?.companies.length || 0,
    posts: data?.posts.length || 0,
    discussions: data?.discussions.length || 0,
  };

  const totalCount = counts.people + counts.companies + counts.posts + counts.discussions;

  // Auto-redirect to first tab with content only on initial load (if default tab is empty)
  useEffect(() => {
    // Only auto-redirect if:
    // 1. Data is loaded
    // 2. Current tab is empty
    // 3. There are results in other tabs
    // 4. User hasn't manually changed tabs yet
    if (!isLoading && data && counts[activeTab] === 0 && totalCount > 0 && !hasUserChangedTab.current) {
      // Find first tab with content
      const tabWithContent = tabs.find((tab) => counts[tab.id] > 0);
      if (tabWithContent && tabWithContent.id !== activeTab) {
        setActiveTab(tabWithContent.id);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tabWithContent.id);
        router.push(`/search?${params.toString()}`, { scroll: false });
      }
    }
  }, [isLoading, data, activeTab, counts, totalCount, searchParams, router]);

  // Early return for invalid query
  if (!query || query.length < 2) {
    return (
      <div className="min-h-screen bg-primary">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="text-center py-16">
            <SearchLg className="h-16 w-16 mx-auto text-tertiary mb-4" />
            <h2 className="text-xl font-semibold text-primary mb-2">Rechercher sur OneFive</h2>
            <p className="text-secondary">Entrez au moins 2 caractères pour rechercher</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">
            Résultats pour &quot;{query}&quot;
          </h1>
          {!isLoading && (
            <p className="text-secondary mt-1">
              {totalCount} résultat{totalCount !== 1 ? 's' : ''} trouvé{totalCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-primary">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = counts[tab.id];
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-brand-primary text-white'
                    : 'bg-secondary text-secondary hover:bg-tertiary hover:text-primary',
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span
                  className={cn(
                    'ml-1 px-2 py-0.5 text-xs rounded-full',
                    isActive ? 'bg-white/20' : 'bg-tertiary',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="text-center py-16">
            <div className="text-error mb-2">Une erreur est survenue</div>
            <p className="text-secondary text-sm">{(error as Error)?.message || 'Veuillez réessayer'}</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !isError && data && (
          <div className="space-y-4">
            {activeTab === 'people' && <PeopleResults people={data.people} />}
            {activeTab === 'companies' && <CompaniesResults companies={data.companies} />}
            {activeTab === 'posts' && <PostsResults posts={data.posts} />}
            {activeTab === 'discussions' && <DiscussionsResults discussions={data.discussions} />}
          </div>
        )}
      </div>
    </div>
  );
}

// People Results Component
function PeopleResults({ people }: { people: SearchPerson[] }) {
  const router = useRouter();
  const sendConnectionRequest = useSendConnectionRequest();
  const cancelConnectionRequest = useCancelConnectionRequest();
  const { navigateToConversation } = useNavigateToConversation();
  
  // État local pour suivre les statuts de connexion après actions
  const [connectionStates, setConnectionStates] = useState<Record<string, string | null>>(() => {
    // Initialiser avec les valeurs de l'API
    const initialState: Record<string, string | null> = {};
    people.forEach((person) => {
      if (person.relationshipStatus !== undefined) {
        initialState[person.id] = person.relationshipStatus;
      }
    });
    return initialState;
  });

  // État pour la modal de confirmation
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; personId: string | null; personName: string }>({
    isOpen: false,
    personId: null,
    personName: '',
  });

  if (people.length === 0) {
    return (
      <EmptyState
        icon={User01}
        title="Aucune personne trouvée"
        description="Essayez avec d'autres termes de recherche"
      />
    );
  }

  const handleConnectClick = (e: React.MouseEvent, personId: string) => {
    e.stopPropagation();
    
    // Mise à jour optimiste de l'état local
    setConnectionStates(prev => ({
      ...prev,
      [personId]: 'PENDING_SENT'
    }));
    
    // Appel API
    sendConnectionRequest.mutate(personId, {
      onError: () => {
        // Restaurer l'état précédent en cas d'erreur
        setConnectionStates(prev => ({
          ...prev,
          [personId]: people.find(p => p.id === personId)?.relationshipStatus || null
        }));
      }
    });
  };

  const handleCancelClick = (e: React.MouseEvent, personId: string, personName: string) => {
    e.stopPropagation();
    setCancelModal({ isOpen: true, personId, personName });
  };

  const handleConfirmCancel = () => {
    if (!cancelModal.personId) return;

    const personId = cancelModal.personId;
    
    // Mise à jour optimiste
    setConnectionStates(prev => ({
      ...prev,
      [personId]: null
    }));

    // Appel API
    cancelConnectionRequest.mutate(personId, {
      onSuccess: () => {
        setCancelModal({ isOpen: false, personId: null, personName: '' });
      },
      onError: () => {
        // Restaurer l'état précédent
        setConnectionStates(prev => ({
          ...prev,
          [personId]: 'PENDING_SENT'
        }));
        setCancelModal({ isOpen: false, personId: null, personName: '' });
      }
    });
  };

  const getConnectionButton = (status: string | null, personId: string, personName: string) => {
    if (!status || status === 'NONE') {
      return (
        <button
          onClick={(e) => handleConnectClick(e, personId)}
          disabled={sendConnectionRequest.isPending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors shrink-0 bg-brand-primary text-white hover:bg-brand-primary/90"
          aria-label={`Se connecter à ${personName}`}
        >
          <UserPlus className="h-4 w-4" />
          Se connecter
        </button>
      );
    }

    if (status === 'CONNECTED') {
      return (
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors shrink-0 bg-tertiary text-primary cursor-default"
          aria-label={`Connecté avec ${personName}`}
        >
          <UserCheck className="h-4 w-4" />
          Connecté
        </button>
      );
    }

    if (status === 'PENDING_SENT') {
      return (
        <button
          onClick={(e) => handleCancelClick(e, personId, personName)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-tertiary text-secondary hover:bg-red-50 hover:text-red-600 cursor-pointer shrink-0"
          aria-label={`Cliquer pour annuler la demande envoyée à ${personName}`}
          title="Cliquer pour annuler"
        >
          <Clock className="h-4 w-4" />
          En attente
        </button>
      );
    }

    if (status === 'PENDING_RECEIVED') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/profile/${personId}`);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors shrink-0 bg-brand-primary text-white hover:bg-brand-primary/90"
          aria-label={`Accepter la demande de ${personName}`}
        >
          <UserCheck className="h-4 w-4" />
          Accepter
        </button>
      );
    }

    return null;
  };

  return (
    <>
      <CancelConnectionModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, personId: null, personName: '' })}
        onConfirm={handleConfirmCancel}
        personName={cancelModal.personName}
        isLoading={cancelConnectionRequest.isPending}
      />
      <div className="space-y-3">
        {people.map((person) => {
          // Utiliser l'état local s'il existe, sinon la valeur de l'API
          const status = connectionStates[person.id] ?? person.relationshipStatus ?? null;
          
          return (
            <button
              key={person.id}
              onClick={() => router.push(`/profile/${person.id}`)}
              className="flex w-full items-center gap-4 p-4 bg-secondary rounded-xl hover:bg-tertiary transition-colors text-left"
            >
              <div onClick={(e) => e.stopPropagation()}>
                <UserMiniProfile
                  profileId={person.id}
                  firstName={person.firstName}
                  lastName={person.lastName}
                  avatar={person.avatar ? getAvatarUrl(person.avatar) : undefined}
                  highlight={person.highlight || undefined}
                  bio={person.bio || undefined}
                  ecosystemRoles={person.ecosystemRoles}
                  size="md"
                  onMessage={() => navigateToConversation(person.id)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-primary">{person.name}</p>
                  {/* Badges de rôle */}
                  {person.ecosystemRoles && person.ecosystemRoles.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {person.ecosystemRoles.slice(0, 2).map((role) => {
                        const label = roleLabels[role] || role;
                        const badgeColor = getBadgeColor(role);
                        return (
                          <Badge
                            key={role}
                            type="pill-color"
                            size="sm"
                            color={badgeColor}
                          >
                            {label}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
                {person.highlight && (
                  <p className="text-sm text-secondary truncate">{person.highlight}</p>
                )}
                {person.bio && !person.highlight && (
                  <p className="text-sm text-tertiary truncate">{truncateText(person.bio, 100)}</p>
                )}
              </div>
              {getConnectionButton(status, person.id, person.name)}
            </button>
          );
        })}
      </div>
    </>
  );
}

// Companies Results Component
function CompaniesResults({ companies }: { companies: SearchCompany[] }) {
  const router = useRouter();

  if (companies.length === 0) {
    return (
      <EmptyState
        icon={Building07}
        title="Aucune entreprise trouvée"
        description="Essayez avec d'autres termes de recherche"
      />
    );
  }

  return (
    <div className="space-y-3">
      {companies.map((company) => (
        <button
          key={company.id}
          onClick={() => router.push(`/startup/${company.id}`)}
          className="flex w-full items-center gap-4 p-4 bg-secondary rounded-xl hover:bg-tertiary transition-colors text-left"
        >
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="h-12 w-12 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary">
              <Building07 className="h-6 w-6 text-tertiary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-primary">{company.name}</p>
            {company.tagline && (
              <p className="text-sm text-secondary truncate">{company.tagline}</p>
            )}
            {company.description && !company.tagline && (
              <p className="text-sm text-tertiary truncate">{truncateText(company.description, 100)}</p>
            )}
          </div>
          {company.website && (
            <span className="text-sm text-brand-primary truncate max-w-32">
              {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// Posts Results Component
function PostsResults({ posts }: { posts: SearchPost[] }) {
  if (posts.length === 0) {
    return (
      <EmptyState
        icon={File05}
        title="Aucune publication trouvée"
        description="Essayez avec d'autres termes de recherche"
      />
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Post key={post.id} postId={post.id} />
      ))}
    </div>
  );
}

// Discussions Results Component
function DiscussionsResults({ discussions }: { discussions: SearchDiscussion[] }) {
  if (discussions.length === 0) {
    return (
      <EmptyState
        icon={MessageChatCircle}
        title="Aucune discussion trouvée"
        description="Essayez avec d'autres termes de recherche"
      />
    );
  }

  return (
    <div className="space-y-4">
      {discussions.map((discussion) => (
        <DiscussionCard key={discussion.id} discussion={discussion} />
      ))}
    </div>
  );
}

// Empty State Component
function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-16">
      <Icon className="h-12 w-12 mx-auto text-tertiary mb-4" />
      <h3 className="text-lg font-medium text-primary mb-1">{title}</h3>
      <p className="text-sm text-secondary">{description}</p>
    </div>
  );
}
