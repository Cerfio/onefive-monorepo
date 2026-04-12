'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/application/modals/confirm-dialog';
import { SearchLg, SearchMd, RefreshCw05 } from '@untitledui/icons';
import { StartupLogo } from '@/components/application/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Badge } from '@/components/base/badges/badges';
import { SectionHeader } from '@/components/application/section-headers/section-headers';
import { PaginationPageMinimalCenter } from '@/components/application/pagination/pagination';
import { EmptyState } from '@/components/application/empty-state/empty-state';
import { TableSkeleton } from '@/components/application/table/table-skeleton';

type StartupRow = {
  id: string;
  name: string;
  city: string;
  countryCode: string;
  categories: string[];
  teamSize: number | null;
  description: string | null;
  tagline: string | null;
  logo: string | null;
  createdAt: string;
};

const PAGE_SIZE = 20;

export default function StartupsPage() {
  const confirm = useConfirm();
  const [items, setItems] = useState<StartupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        skip: String(page * PAGE_SIZE),
        take: String(PAGE_SIZE),
      };
      if (search) params.search = search;

      const response = await api
        .get('admin/startups', { searchParams: params })
        .json<{ data: StartupRow[]; total: number }>();
      setItems(response.data ?? []);
      setTotal(response.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const remove = async (startupId: string) => {
    const ok = await confirm({
      title: 'Supprimer cette startup ?',
      description: 'Cette action est irréversible.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`admin/startups/${startupId}`);
      toast.success('Startup supprimée');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <SectionHeader.Root>
        <SectionHeader.Group>
          <div>
            <SectionHeader.Heading>Startups</SectionHeader.Heading>
            <SectionHeader.Subheading>
              Les startups enregistrées sur la plateforme.
            </SectionHeader.Subheading>
          </div>
          <SectionHeader.Actions>
            <Button color="secondary" iconLeading={RefreshCw05} onClick={load}>
              Rafraîchir
            </Button>
          </SectionHeader.Actions>
        </SectionHeader.Group>
      </SectionHeader.Root>

      <form onSubmit={handleSearch} className="mb-4 flex items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <Input
            placeholder="Rechercher une startup..."
            value={searchInput}
            onChange={setSearchInput}
            icon={SearchMd}
          />
        </div>
        <Button type="submit" color="secondary" size="md">
          Rechercher
        </Button>
      </form>

      {loading && <TableSkeleton columns={5} rows={6} />}
      {error && <p className="text-sm text-error-primary">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <EmptyState>
          <EmptyState.Header>
            <EmptyState.FeaturedIcon icon={SearchLg} color="gray" theme="modern" />
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>Aucune startup</EmptyState.Title>
            <EmptyState.Description>
              {search
                ? `Aucun résultat pour « ${search} ».`
                : 'Aucune startup enregistrée.'}
            </EmptyState.Description>
          </EmptyState.Content>
        </EmptyState>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
            <table className="min-w-full divide-y divide-border-secondary">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Startup
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Localisation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Catégories
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Équipe
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Créée le
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-quaternary">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-secondary">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-secondary">
                    <td className="px-4 py-3">
                      <Link href={`/startups/${item.id}`} className="flex items-center gap-3">
                        <StartupLogo src={item.logo} name={item.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-primary hover:text-brand-primary hover:underline">
                            {item.name}
                          </p>
                          {item.tagline && (
                            <p className="mt-0.5 max-w-xs truncate text-xs text-quaternary">
                              {item.tagline}
                            </p>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-tertiary">
                      {item.city}, {item.countryCode}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {item.categories?.length > 0 ? (
                          item.categories.slice(0, 3).map((cat) => (
                            <Badge key={cat} color="gray" size="sm">
                              {cat}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-quaternary">-</span>
                        )}
                        {item.categories?.length > 3 && (
                          <Badge color="gray" size="sm">+{item.categories.length - 3}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-tertiary">
                      {item.teamSize ? `${item.teamSize} pers.` : '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-tertiary">
                      {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/startups/${item.id}`}>
                        <Button color="secondary" size="sm">
                          Voir
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationPageMinimalCenter
            page={page + 1}
            total={totalPages}
            onPageChange={(p) => setPage(p - 1)}
          />
        </>
      )}
    </div>
  );
}
