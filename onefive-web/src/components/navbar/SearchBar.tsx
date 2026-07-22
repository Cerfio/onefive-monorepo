'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SearchLg, User01, Building07, MessageChatCircle } from '@untitledui/icons';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Input } from '../base/input/input';
import { useSearchBarSuggestions } from '@/hooks/useSearch';
import { Spinner } from '../base/spinner';
import { Avatar } from '../base/avatar/avatar';
import { SearchBarPerson, SearchBarCompany, SearchBarDiscussion } from '@/queries/search';
import posthog from 'posthog-js';

interface SearchBarProps extends Omit<React.ComponentProps<typeof Input>, 'ref'> {
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
}

const getAvatarUrl = (avatarId: string | null): string | undefined => {
  if (!avatarId) return undefined;
  if (avatarId.startsWith('http')) return avatarId;
  return `${process.env.NEXT_PUBLIC_API_URL}/file/${avatarId}`;
};

const SearchBar: React.FC<SearchBarProps> = ({
  className,
  onSearchFocus,
  onSearchBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch suggestions
  const { data, isLoading } = useSearchBarSuggestions(debouncedQuery, 10);

  // Flatten results for keyboard navigation
  const allResults = [
    ...(data?.people || []).map((p) => ({ type: 'person' as const, data: p })),
    ...(data?.companies || []).map((c) => ({ type: 'company' as const, data: c })),
    ...(data?.discussions || []).map((d) => ({ type: 'discussion' as const, data: d })),
  ];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    setIsOpen(query.length >= 2);
    onSearchFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onSearchBlur?.();
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length >= 2);
    setHighlightedIndex(-1);
  };

  const navigateToResult = useCallback(
    (result: (typeof allResults)[0]) => {
      if (result.type === 'person') {
        router.push(`/profile/${result.data.id}`);
      } else if (result.type === 'company') {
        router.push(`/startup/${result.data.id}`);
      } else if (result.type === 'discussion') {
        router.push(`/discussions/${result.data.id}`);
      }
      setIsOpen(false);
      setQuery('');
    },
    [router],
  );

  const navigateToSearchPage = useCallback(() => {
    if (query.trim().length >= 2) {
      posthog.capture('search_submitted', { query: query.trim().substring(0, 100) });
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  }, [query, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Toujours permettre la touche Entrée pour la recherche
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && allResults[highlightedIndex]) {
        navigateToResult(allResults[highlightedIndex]);
      } else {
        navigateToSearchPage();
      }
      return;
    }

    // Permettre les raccourcis natifs du navigateur (Ctrl+A, Ctrl+C, etc.)
    if (e.ctrlKey || e.metaKey) {
      return; // Ne pas intercepter les raccourcis système
    }

    // Les autres touches ne fonctionnent que si le dropdown est ouvert
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (allResults.length === 0) {
          // Pas de résultats, ne rien faire
          return;
        }
        // Si on est à -1 (aucune sélection), aller directement au premier élément disponible
        if (highlightedIndex === -1) {
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (allResults.length === 0) {
          // Pas de résultats, ne rien faire
          return;
        }
        // Si on est déjà au premier élément, revenir à -1 (aucune sélection)
        if (highlightedIndex <= 0) {
          setHighlightedIndex(-1);
        } else {
          setHighlightedIndex((prev) => prev - 1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handlePersonClick = (person: SearchBarPerson) => {
    router.push(`/profile/${person.id}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleCompanyClick = (company: SearchBarCompany) => {
    router.push(`/startup/${company.id}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleDiscussionClick = (discussion: SearchBarDiscussion) => {
    router.push(`/discussions/${discussion.id}`);
    setIsOpen(false);
    setQuery('');
  };

  const showDropdown = isOpen && query.length >= 2;

  return (
    <div className={cn('relative w-full md:w-80', isFocused && 'transform scale-[1.02]', className)}>
      <Input
        {...props}
        ref={inputRef}
        shortcut
        size="sm"
        aria-label="Search"
        placeholder="Rechercher"
        icon={SearchLg}
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-2 max-h-[400px] overflow-y-auto rounded-xl border border-primary bg-primary shadow-lg"
          role="listbox"
          aria-label="Search suggestions"
        >
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Spinner size="sm" />
            </div>
          )}

          {/* Results */}
          {!isLoading && data && (
            <>
              {/* People section */}
              {data.people.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-tertiary uppercase tracking-wider bg-secondary">
                    Personnes
                  </div>
                  {data.people.map((person, index) => {
                    const resultIndex = index;
                    return (
                      <button
                        key={person.id}
                        onClick={() => handlePersonClick(person)}
                        onMouseEnter={() => setHighlightedIndex(resultIndex)}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                          highlightedIndex === resultIndex ? 'bg-secondary' : 'hover:bg-secondary',
                        )}
                        role="option"
                        aria-selected={highlightedIndex === resultIndex}
                      >
                        <Avatar
                          size="sm"
                          src={getAvatarUrl(person.avatar)}
                          firstName={person.firstName}
                          lastName={person.lastName}
                          placeholderIcon={User01}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary truncate">{person.name}</p>
                          {person.highlight && (
                            <p className="text-xs text-tertiary truncate">{person.highlight}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Companies section */}
              {data.companies.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-tertiary uppercase tracking-wider bg-secondary">
                    Entreprises
                  </div>
                  {data.companies.map((company, index) => {
                    const resultIndex = (data.people?.length || 0) + index;
                    return (
                      <button
                        key={company.id}
                        onClick={() => handleCompanyClick(company)}
                        onMouseEnter={() => setHighlightedIndex(resultIndex)}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                          highlightedIndex === resultIndex ? 'bg-secondary' : 'hover:bg-secondary',
                        )}
                        role="option"
                        aria-selected={highlightedIndex === resultIndex}
                      >
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tertiary">
                            <Building07 className="h-4 w-4 text-tertiary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary truncate">{company.name}</p>
                          {(company.tagline || company.description) && (
                            <p className="text-xs text-tertiary truncate">
                              {company.tagline || company.description}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Discussions section */}
              {data.discussions && data.discussions.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-tertiary uppercase tracking-wider bg-secondary">
                    Discussions
                  </div>
                  {data.discussions.map((discussion, index) => {
                    const resultIndex = (data.people?.length || 0) + (data.companies?.length || 0) + index;
                    return (
                      <button
                        key={discussion.id}
                        onClick={() => handleDiscussionClick(discussion)}
                        onMouseEnter={() => setHighlightedIndex(resultIndex)}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                          highlightedIndex === resultIndex ? 'bg-secondary' : 'hover:bg-secondary',
                        )}
                        role="option"
                        aria-selected={highlightedIndex === resultIndex}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tertiary">
                          <MessageChatCircle className="h-4 w-4 text-tertiary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary truncate">{discussion.question}</p>
                          <p className="text-xs text-tertiary truncate">
                            {discussion.answerCount} réponse{discussion.answerCount > 1 ? 's' : ''}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* See all results link - Always shown when there's a query */}
              <button
                onClick={navigateToSearchPage}
                className="flex w-full items-center justify-center gap-2 border-t border-primary px-4 py-3 text-sm font-medium text-brand-primary hover:bg-secondary transition-colors"
              >
                <SearchLg className="h-4 w-4" />
                Voir tous les résultats pour &quot;{query}&quot;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

SearchBar.displayName = 'SearchBar';

export default SearchBar;