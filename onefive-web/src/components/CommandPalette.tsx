'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Home05,
  Users01,
  Stars02,
  Folder,
  MessageChatCircle,
  BarChart03,
  Settings01,
  User01,
  SearchLg,
} from '@untitledui/icons';
import { useSearchBarSuggestions } from '@/hooks/useSearch';

const NAV_ITEMS: { label: string; href: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'Feed', href: '/feed', Icon: Home05 },
  { label: 'Réseau', href: '/network', Icon: Users01 },
  { label: 'Spotlight', href: '/spotlight', Icon: Stars02 },
  { label: 'Data rooms', href: '/dataroom', Icon: Folder },
  { label: 'Messages', href: '/messages', Icon: MessageChatCircle },
  { label: 'Analytics', href: '/analytics', Icon: BarChart03 },
  { label: 'Mes investissements', href: '/my-investments', Icon: BarChart03 },
  { label: 'Mon profil', href: '/profile/current_user', Icon: User01 },
  { label: 'Paramètres', href: '/settings', Icon: Settings01 },
];

/**
 * Palette de commandes ⌘K : naviguer + rechercher (personnes, startups,
 * discussions) dans toute l'app. Ouverte via ⌘K / Ctrl+K.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const { data: results, isFetching } = useSearchBarSuggestions(query);

  const go = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  const navMatches = NAV_ITEMS.filter((n) =>
    n.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 px-4 pt-[14vh]"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <Command shouldFilter={false} loop>
          <div className="flex items-center gap-2 border-b border-gray-100 px-4">
            <SearchLg className="h-4 w-4 shrink-0 text-gray-400" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Rechercher ou naviguer…"
              className="w-full bg-transparent py-3.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            <kbd className="hidden shrink-0 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-400 sm:inline">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[50vh] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-gray-400">
              {isFetching ? 'Recherche…' : 'Aucun résultat'}
            </Command.Empty>

            {navMatches.length > 0 && (
              <Command.Group
                heading="Navigation"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-400"
              >
                {navMatches.map((n) => (
                  <Command.Item
                    key={n.href}
                    value={`nav-${n.label}`}
                    onSelect={() => go(n.href)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 aria-selected:bg-gray-100"
                  >
                    <n.Icon className="h-4 w-4 text-gray-400" />
                    {n.label}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {!!results?.people?.length && (
              <Command.Group
                heading="Personnes"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-400"
              >
                {results.people.map((p) => (
                  <Command.Item
                    key={`p-${p.id}`}
                    value={`person-${p.id}`}
                    onSelect={() => go(`/profile/${p.id}`)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 aria-selected:bg-gray-100"
                  >
                    <User01 className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{p.name}</span>
                    {p.highlight && (
                      <span className="ml-auto truncate text-xs text-gray-400">{p.highlight}</span>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {!!results?.companies?.length && (
              <Command.Group
                heading="Startups"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-400"
              >
                {results.companies.map((c) => (
                  <Command.Item
                    key={`c-${c.id}`}
                    value={`company-${c.id}`}
                    onSelect={() => go(`/startup/${c.id}`)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 aria-selected:bg-gray-100"
                  >
                    <Folder className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{c.name}</span>
                    {c.tagline && (
                      <span className="ml-auto truncate text-xs text-gray-400">{c.tagline}</span>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {!!results?.discussions?.length && (
              <Command.Group
                heading="Discussions"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-400"
              >
                {results.discussions.map((d) => (
                  <Command.Item
                    key={`d-${d.id}`}
                    value={`discussion-${d.id}`}
                    onSelect={() => go(`/discussion/${d.id}`)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 aria-selected:bg-gray-100"
                  >
                    <MessageChatCircle className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{d.question}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
