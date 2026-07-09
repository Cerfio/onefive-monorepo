'use client';
import Navbar from '@/components/navbar';
import { Post, FeedSkeleton } from '@/features/post/components/post';
import { CreatePostButton } from '@/components/feed/CreatePostButton';
import { CreatePostModal } from '@/components/feed/CreatePostModal';
import { UnifiedComposerModal } from '@/components/feed/UnifiedComposerModal';
import { FeedPollsSection } from '@/components/feed/FeedPollsSection';
import { CreateBuildInPublicModal } from '@/components/feed/CreateBuildInPublicModal';
import CreatePostSkeleton from '@/features/post/components/CreatePostSkeleton';
import { useFeed } from '@/features/post/hooks/queries';
import { useMe } from '@/hooks/useUser';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Tags } from '@/enums';
import { getCountryName } from '@/lib/country';
import {
  useProfileSuggestions,
  useStartupSuggestions,
  useProfileStatistics,
  useBookmarks,
  useToggleProfileFollow,
  useToggleStartupFollow,
} from '@/hooks/useFeedExtra';
import { getProfileRoleLabel } from '@/sharing-enum/profile';
import { useFeedFilter } from '@/contexts/FeedFilterContext';
import { TagFilter } from '@/components/feed/TagFilter';
import { BuildInPublicSection } from '@/components/feed/BuildInPublicSection';
import { InterestsSection } from '@/components/feed/InterestsSection';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Eye, Users, Zap, Bookmark } from 'lucide-react';
import { Button } from "@/components/base/buttons/button";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { UserMiniProfile } from "@/components/base/avatar/user-mini-profile";
import { Badge } from "@/components/base/badges/badges";
import { Avatar } from '@/components/base/avatar/avatar';
import { useNavigateToConversation } from '@/hooks/useNavigateToConversation';

// Local interfaces removed - now using types from hooks

// Mock data removed - now using real APIs

// Composant de bookmarks
function BookmarksSection() {
  const { data: bookmarks, isLoading, error } = useBookmarks(5, 0); // Limit to 5 for sidebar

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-sm">Mes bookmarks</div>
          <Bookmark className="h-4 w-4 text-[#5E6AD2]" />
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-2 rounded-lg">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !bookmarks) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-sm">Mes bookmarks</div>
          <Bookmark className="h-4 w-4 text-[#5E6AD2]" />
        </div>
        <div className="text-sm text-gray-500">Aucun bookmark pour le moment</div>
      </div>
    );
  }

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg hover:border-[#5E6AD2]/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-sm">Mes bookmarks</div>
        <Bookmark className="h-4 w-4 text-[#5E6AD2]" />
      </div>
      <div className="space-y-2">
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer group">
            <div className="font-medium text-sm group-hover:text-[#5E6AD2] transition-colors duration-200">{bookmark.title}</div>
            <div className="text-xs text-gray-500 truncate">{bookmark.excerpt}</div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex gap-1">
                {bookmark.tags.slice(0, 2).map((tag, tagIndex) => (
                  <span key={`tag-${tag}-${tagIndex}`} className="text-xs bg-[#5E6AD2]/10 text-[#5E6AD2] px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-400">{formatRelativeTime(bookmark.bookmarkedAt)}</span>
            </div>
          </div>
        ))}
      </div>
      {bookmarks.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Aucun bookmark pour le moment
        </div>
      )}
    </div>
  );
}

// Composant de suggestions de startups
function StartupSuggestions() {
  const { data: startups, isLoading, error } = useStartupSuggestions(5, 0); // Limit to 5 for sidebar
  const toggleStartupFollow = useToggleStartupFollow();

  const handleStartupFollow = (startupId: string, isCurrentlyFollowing: boolean) => {
    toggleStartupFollow.toggle(startupId, isCurrentlyFollowing);
  };

  // Fonction pour obtenir la couleur du badge selon les catégories
  const getCategoryBadgeColor = (categories: string[]) => {
    if (categories.includes('B2B')) return 'brand';
    if (categories.includes('B2C')) return 'success';
    if (categories.includes('SaaS')) return 'warning';
    if (categories.includes('Marketplace')) return 'error';
    return 'brand';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="font-semibold text-sm mb-2">Startups à suivre</div>
        <ul className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <li key={i} className="flex items-start gap-3 p-2 rounded-lg">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse mb-1 w-16"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error || !startups) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="font-semibold text-sm mb-2">Startups à suivre</div>
        <div className="text-sm text-gray-500">Impossible de charger les suggestions</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg hover:border-[#5E6AD2]/20 transition-all duration-300">
      <div className="font-semibold text-sm mb-2">Startups à suivre</div>
      <ul className="space-y-3">
        {startups.map((startup) => (
          <li key={startup.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer group">
            <div className="w-8 h-8 group-hover:scale-110 transition-transform duration-200">
              <Avatar
                size="sm"
                src={undefined} // No logo URL in our data yet
                alt={startup.name}
                initials={startup.name.split(' ').map(n => n[0]).join('')}
                className="w-full h-full rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm group-hover:text-[#5E6AD2] transition-colors duration-200 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {startup.name}
              </div>
              {startup.categories.length > 0 && (
                <Badge type="pill-color" color={getCategoryBadgeColor(startup.categories)} size="sm" className="text-xs px-1.5 py-0.5 h-4 mb-1">
                  {startup.categories[0]}
                </Badge>
              )}
              <div className="text-xs text-gray-500 truncate mb-1">
                {startup.tagline || `${startup.city}, ${getCountryName(startup.countryCode)}`}
              </div>
              <div className="flex gap-1 text-xs text-gray-400">
                <span>{startup.membersCount} membre{startup.membersCount > 1 ? 's' : ''}</span>
                <span>•</span>
                <span>{startup.followersCount} abonné{startup.followersCount > 1 ? 's' : ''}</span>
              </div>
            </div>
            <Button
              color={startup.isFollowed ? "primary" : "secondary"}
              size="sm"
              className="text-xs px-2 py-1 h-6 flex-shrink-0 transition-all duration-200"
              onClick={() => handleStartupFollow(startup.id, startup.isFollowed)}
              disabled={toggleStartupFollow.isLoading}
            >
              {startup.isFollowed ? 'Suivi(e)' : 'Suivre'}
            </Button>
          </li>
        ))}
      </ul>
      {startups.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Aucune suggestion pour le moment
        </div>
      )}
    </div>
  );
}

// EventCalendar component removed - not needed anymore

// Composant de statistiques personnelles
function PersonalStats() {
  const { data: stats, isLoading, error } = useProfileStatistics();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="font-semibold text-sm mb-3">Mes statistiques</div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="font-semibold text-sm mb-3">Mes statistiques</div>
        <div className="text-sm text-gray-500">Impossible de charger les statistiques</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg hover:border-[#5E6AD2]/20 transition-all duration-300">
      <div className="font-semibold text-sm mb-3">Mes statistiques</div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Posts vus</span>
          </div>
          <span className="font-semibold text-sm">{stats.postsViewed.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Engagement</span>
          </div>
          <span className="font-semibold text-sm">{stats.engagement}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Connexions</span>
          </div>
          <span className="font-semibold text-sm">{stats.connections}</span>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Niveau {stats.level}</span>
            <span className="text-xs text-gray-500">{stats.experience}%</span>
          </div>
          <ProgressBar min={0} max={100} value={stats.experience} className="h-2" />
        </div>
      </div>
    </div>
  );
}

// BadgeSystem and DailyChallenges components removed - not needed anymore

// Sidebar gauche : Profil résumé, stats, raccourcis
function FeedLeftSidebar() {
  const { data: user, isLoading, error } = useMe();

  if (isLoading) {
    return (
      <aside className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse mb-2"></div>
          <div className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-32"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-24"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-20"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
        </div>
      </aside>
    );
  }

  if (error || !user) {
    return (
      <aside className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gray-300 mb-2 flex items-center justify-center">
            <span className="text-gray-500 text-2xl">👤</span>
          </div>
          <div className="text-sm text-gray-500">Profil non disponible</div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col items-center hover:shadow-lg hover:border-[#5E6AD2]/20 transition-all duration-300 cursor-pointer group">
        {/* Avatar + nom + titre */}
        <div className="w-20 h-20 mb-2 group-hover:scale-105 transition-transform duration-300">
          <Avatar
            size="2xl"
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
            firstName={user.firstName}
            lastName={user.lastName}
            className="w-full h-full"
          />
        </div>
        <div className="font-semibold text-lg group-hover:text-[#5E6AD2] transition-colors duration-300">{user.firstName} {user.lastName}</div>
        {user.highlight && (
          <div className="text-sm text-gray-500 mb-2">{user.highlight}</div>
        )}
        {/* Streak */}
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-bold">🔥 Streak:</span> {user.streak || 0} jours
        </div>
        {/* Stats */}
        <div className="flex gap-4 text-xs text-gray-600 mb-2">
          <div><span className="font-bold">{user.connectionCount || 0}</span> connexions</div>
          <div><span className="font-bold">{user.postCount || 0}</span> posts</div>
        </div>
        {/* Bouton profil */}
        <Button color="primary" size="sm" className="mt-2">Voir mon profil</Button>
      </div>

      {/* Centres d'intérêt */}
      <InterestsSection />

      {/* Statistiques personnelles */}
      <PersonalStats />
    </aside>
  );
}

// Sidebar droite : Suggestions
function FeedRightSidebar() {
  return (
    <aside className="space-y-6">
      {/* Suggestions de profils */}
      <ProfileSuggestionsSection />
      
      {/* Suggestions de startups */}
      <StartupSuggestions />
      
      {/* Bookmarks section */}
      <BookmarksSection />
    </aside>
  );
}

// Composant de suggestions de profils
function ProfileSuggestionsSection() {
  const { data: profiles, isLoading, error } = useProfileSuggestions(5, 0); // Limit to 5 for sidebar
  const toggleProfileFollow = useToggleProfileFollow();
  const { navigateToConversation } = useNavigateToConversation();

  const handleProfileFollow = (profileId: string, isCurrentlyFollowing: boolean) => {
    toggleProfileFollow.toggle(profileId, isCurrentlyFollowing);
  };

  // Fonction pour obtenir la couleur du badge selon les ecosystemRoles
  const getBadgeColor = (ecosystemRoles: string[]) => {
    if (ecosystemRoles.includes('FOUNDER')) return 'brand';
    if (ecosystemRoles.includes('BUSINESS_ANGEL') || ecosystemRoles.includes('VENTURE_CAPITALIST') || ecosystemRoles.includes('INSTITUTIONAL_INVESTOR')) return 'success';
    if (ecosystemRoles.includes('MENTOR')) return 'warning';
    if (ecosystemRoles.includes('STRATEGIC_ADVISOR')) return 'error';
    return 'brand';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="font-semibold text-sm mb-2">Suggestions de profils</div>
        <ul className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <li key={i} className="flex items-start gap-3 p-2 rounded-lg">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse mb-1 w-16"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error || !profiles) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="font-semibold text-sm mb-2">Suggestions de profils</div>
        <div className="text-sm text-gray-500">Impossible de charger les suggestions</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg hover:border-[#5E6AD2]/20 transition-all duration-300">
      <div className="font-semibold text-sm mb-2">Suggestions de profils</div>
      <ul className="space-y-3">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
            <UserMiniProfile
              profileId={profile.id}
              firstName={profile.firstName}
              lastName={profile.lastName}
              avatar={profile.avatar}
              highlight={profile.highlight}
              bio={profile.bio}
              isFollowing={profile.isFollowed}
              stats={{ followers: profile.followersCount, following: 0, posts: 0 }}
              ecosystemRoles={profile.ecosystemRoles || []}
              countryCode={profile.countryCode}
              size="sm"
              onMessage={() => navigateToConversation(profile.id)}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm group-hover:text-[#5E6AD2] transition-colors duration-200 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {profile.firstName} {profile.lastName}
              </div>
              {profile.ecosystemRoles && profile.ecosystemRoles.length > 0 && (
                <Badge type="pill-color" color={getBadgeColor(profile.ecosystemRoles)} size="sm" className="text-xs px-1.5 py-0.5 h-4 mb-1">
                  {getProfileRoleLabel(profile.ecosystemRoles[0])}
                </Badge>
              )}
              <div className="text-xs text-gray-500 truncate">
                {profile.highlight || profile.bio || `${profile.followersCount} abonné${profile.followersCount > 1 ? 's' : ''}`}
              </div>
            </div>
            <Button
              color={profile.isFollowed ? "primary" : "secondary"}
              size="sm"
              className="text-xs px-2 py-1 h-6 flex-shrink-0 transition-all duration-200"
              onClick={() => handleProfileFollow(profile.id, profile.isFollowed)}
              disabled={toggleProfileFollow.isLoading}
            >
              {profile.isFollowed ? 'Suivi(e)' : 'Suivre'}
            </Button>
          </li>
        ))}
      </ul>
      {profiles.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Aucune suggestion pour le moment
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  const [showSidebars, _setShowSidebars] = useState(true);
  const { selectedTags, setTags, addTag } = useFeedFilter();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const createPostRef = useRef<HTMLDivElement>(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isBuildInPublicModalOpen, setIsBuildInPublicModalOpen] = useState(false);
  const [buildInPublicType, setBuildInPublicType] = useState<'update' | 'metrics' | 'launch' | undefined>();

  const handleTagClick = useCallback((tag: Tags) => {
    addTag(tag);
    // Scroll vers le haut pour voir les filtres
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [addTag]);

  const handleQuickCreate = useCallback((type: 'update' | 'metrics' | 'launch') => {
    setBuildInPublicType(type);
    setIsBuildInPublicModalOpen(true);
  }, []);

  const handleCreatePostClick = useCallback(() => {
    setIsCreatePostModalOpen(true);
  }, []);

  const handlePostCreated = useCallback(() => {
    // Le hook useCreatePost gère déjà la mise à jour optimistique du cache
    // Pas besoin d'invalider le feed ici, cela causerait la disparition du post
  }, []);

  // On mount: hydrate from URL ?tags=a,b,c
  useEffect(() => {
    const urlTags = searchParams.get('tags');
    if (urlTags) {
      const parts = urlTags.split(',').filter(Boolean);
      // Filter only valid Tags
      const valid = parts.filter((p) => Object.values((Tags as any)).includes(p)) as any;
      if (valid.length > 0) {
        // setTags typed expects Tags[]
        setTags(valid as any);
      }
    }
  }, []);

  // Reflect selection to URL (replace to avoid history spam)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','));
    } else {
      params.delete('tags');
    }
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
  }, [selectedTags, router, pathname, searchParams]);

  // Hook pour récupérer le feed
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed(10, selectedTags);

  // Toutes les données du feed aplaties et dédupliquées
  const allPosts = data?.pages.flatMap((page: any) => page.items) ?? [];
  // Dédupliquer les posts par ID pour éviter les clés dupliquées
  const feedPosts = Array.from(
    new Map(allPosts.map((post: any) => [post.id, post])).values()
  );

  // Callback mémoïsé : évite que l'effet de useInfiniteScroll se ré-exécute
  // à chaque render (une fonction inline changerait de référence à chaque fois).
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Hook pour le chargement automatique au scroll
  const loadMoreRef = useInfiniteScroll(
    handleLoadMore,
    hasNextPage ?? false,
    isFetchingNextPage ?? false,
    '200px', // Déclenche le chargement 200px avant la fin
  );

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K pour focus sur la recherche
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Échap pour fermer les modales
      // if (event.key === 'Escape') {
      //   setIsModalOpen(false);
      // }

      // Flèches pour naviguer dans le feed
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        // Logique de navigation dans le feed
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFCFD]">
      <div className="w-full max-w-screen-xl mx-auto">
        <Navbar />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - User Profile */}
          {showSidebars && (
            <div className="lg:col-span-3 hidden lg:block">
              <FeedLeftSidebar />
            </div>
          )}

          {/* Main Feed */}
          <div className={`space-y-4 flex flex-col ${showSidebars ? 'lg:col-span-6' : 'lg:col-span-8 lg:col-start-3'}`}>
            <TagFilter />
            <BuildInPublicSection onQuickCreate={handleQuickCreate} />
            <div ref={createPostRef}>
              {isLoading ? (
                <CreatePostSkeleton />
              ) : (
                <CreatePostButton onClick={handleCreatePostClick} />
              )}
            </div>

            <FeedPollsSection />

            {/* Modale de création de post */}
            <UnifiedComposerModal
              open={isCreatePostModalOpen}
              onOpenChange={setIsCreatePostModalOpen}
            />
            {/* Modale de création de post Build in Public */}
            <CreateBuildInPublicModal
              open={isBuildInPublicModalOpen}
              onOpenChange={(open) => {
                setIsBuildInPublicModalOpen(open);
                if (!open) setBuildInPublicType(undefined);
              }}
              initialType={buildInPublicType}
              onPostCreated={handlePostCreated}
            />

            {/* États de chargement et d'erreur */}
            {isLoading && (
              <FeedSkeleton count={3} />
            )}

            {isError && (
              <div className="bg-red-50 rounded-lg p-4 mb-4">
                <p className="text-red-600">
                  Erreur lors du chargement du feed: {error instanceof Error ? error.message : 'Une erreur est survenue'}
                </p>
                <Button
                  color="primary"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Réessayer
                </Button>
              </div>
            )}

            {/* Posts du feed */}
            {!isLoading && !isError && feedPosts.map((post, index) => (
              <Post key={post.id ?? `post-${index}`} post={post} onTagClick={handleTagClick} />
            ))}

            {/* Pagination infinie - Chargement automatique au scroll */}
            {hasNextPage && (
              <>
                {/* Élément invisible pour déclencher le chargement au scroll */}
                <div ref={loadMoreRef} className="h-1" />
                {/* Effet shimmer pendant le chargement */}
                {isFetchingNextPage && (
                  <FeedSkeleton count={2} />
                )}
              </>
            )}

            {/* Message quand il n'y a plus de posts */}
            {!hasNextPage && feedPosts.length > 0 && (
              <div className="text-center py-4 text-gray-500">
                Vous avez vu tous les posts ! 🎉
              </div>
            )}

            {/* Message quand le feed est vide */}
            {!isLoading && !isError && feedPosts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Aucun post pour le moment.</p>
                <p className="text-sm text-gray-400">Soyez le premier à publier quelque chose !</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Suggestions */}
          {showSidebars && (
            <div className="lg:col-span-3 hidden lg:block">
              <FeedRightSidebar />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
