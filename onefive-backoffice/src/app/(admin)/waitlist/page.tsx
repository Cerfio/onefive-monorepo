'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { SearchLg, SearchMd, RefreshCw05, Users01, Download01 } from '@untitledui/icons';
import { Avatar, resolveAvatarUrl } from '@/components/application/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { SectionHeader } from '@/components/application/section-headers/section-headers';
import { PaginationPageMinimalCenter } from '@/components/application/pagination/pagination';
import { EmptyState } from '@/components/application/empty-state/empty-state';
import { TableSkeleton } from '@/components/application/table/table-skeleton';
import { useConfirm } from '@/components/application/modals/confirm-dialog';
import { api } from '@/lib/api';

type WaitlistRow = {
  id: string;
  firstName: string;
  lastName: string;
  avatarId?: string | null;
  user: { id: string; email: string };
  createdAt: string;
};

const PAGE_SIZE = 20;

export default function WaitlistPage() {
  const confirm = useConfirm();
  const [items, setItems] = useState<WaitlistRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [bulkCount, setBulkCount] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

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
        .get('admin/waitlist', { searchParams: params })
        .json<{ data: WaitlistRow[]; total: number }>();
      setItems(response.data ?? []);
      setTotal(response.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const accept = async (profileId: string) => {
    try {
      await api.patch(`admin/waitlist/${profileId}/accept`);
      toast.success('Utilisateur accepté');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'acceptation");
    }
  };

  const ignore = async (profileId: string) => {
    const ok = await confirm({
      title: 'Ignorer cet utilisateur ?',
      description: "L'utilisateur sera retiré de la waitlist visible.",
      confirmLabel: 'Ignorer',
      variant: 'warning',
    });
    if (!ok) return;
    try {
      await api.patch(`admin/waitlist/${profileId}/ignore`);
      toast.success('Utilisateur ignoré');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'action");
    }
  };

  const exportCsv = async () => {
    try {
      const res = await api.get('admin/waitlist/export').json<{ data: string }>();
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erreur lors de l'export");
    }
  };

  const bulkAccept = async () => {
    const count = parseInt(bulkCount, 10);
    if (!count || count < 1) {
      toast.error('Veuillez entrer un nombre valide');
      return;
    }
    const ok = await confirm({
      title: `Accepter ${count} personnes ?`,
      description: `Les ${count} personnes les plus anciennes de la waitlist seront acceptées et recevront un email d'activation.`,
      confirmLabel: `Accepter ${count}`,
      variant: 'info',
    });
    if (!ok) return;

    setBulkLoading(true);
    try {
      const res = await api
        .post('admin/waitlist/bulk-accept', { json: { count } })
        .json<{ data: { accepted: number } }>();
      toast.success(`${res.data.accepted} utilisateur(s) accepté(s)`);
      setBulkCount('');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'acceptation en lot");
    } finally {
      setBulkLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <SectionHeader.Root>
        <SectionHeader.Group>
          <div>
            <SectionHeader.Heading>Waitlist</SectionHeader.Heading>
            <SectionHeader.Subheading>
              Utilisateurs en attente d&apos;accès à la plateforme.
            </SectionHeader.Subheading>
          </div>
          <SectionHeader.Actions>
            <Button color="secondary" iconLeading={Download01} onClick={exportCsv}>
              Exporter CSV
            </Button>
            <Button color="secondary" iconLeading={RefreshCw05} onClick={load}>
              Rafraîchir
            </Button>
          </SectionHeader.Actions>
        </SectionHeader.Group>
      </SectionHeader.Root>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <form onSubmit={handleSearch} className="flex min-w-[240px] flex-1 gap-2">
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchInput}
            onChange={setSearchInput}
            icon={SearchMd}
            className="flex-1"
          />
          <Button type="submit">Rechercher</Button>
          {search && (
            <Button
              color="secondary"
              type="button"
              onClick={() => {
                setSearchInput('');
                setSearch('');
                setPage(0);
              }}
            >
              Effacer
            </Button>
          )}
        </form>

        <div className="flex items-end gap-2">
          <div className="w-24">
            <Input
              placeholder="Nb..."
              value={bulkCount}
              onChange={setBulkCount}
              type="number"
            />
          </div>
          <Button
            color="primary"
            iconLeading={Users01}
            onClick={bulkAccept}
            isDisabled={bulkLoading || !bulkCount}
          >
            {bulkLoading ? 'Acceptation...' : 'Accepter en lot'}
          </Button>
        </div>
      </div>

      {loading && <TableSkeleton columns={4} rows={6} />}
      {error && <p className="text-sm text-error-primary">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <EmptyState>
          <EmptyState.Header>
            <EmptyState.FeaturedIcon icon={SearchLg} color="gray" theme="modern" />
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>Waitlist vide</EmptyState.Title>
            <EmptyState.Description>
              {search ? `Aucun résultat pour "${search}"` : 'Aucun utilisateur en attente.'}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary md:px-6">
                    Utilisateur
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary md:px-6">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary md:px-6">
                    Date d&apos;inscription
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-quaternary md:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-secondary">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-secondary">
                    <td className="px-4 py-3 md:px-6 md:py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={resolveAvatarUrl(item.avatarId)}
                          firstName={item.firstName}
                          lastName={item.lastName}
                          size="sm"
                        />
                        <Link
                          href={`/users/${item.user.id}`}
                          className="text-sm font-medium text-brand-primary hover:underline"
                        >
                          {item.firstName} {item.lastName}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-tertiary md:px-6 md:py-4">
                      {item.user?.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-tertiary md:px-6 md:py-4">
                      {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-right md:px-6 md:py-4">
                      <div className="inline-flex gap-2">
                        <Button color="primary" size="sm" onClick={() => accept(item.id)}>
                          Accepter
                        </Button>
                        <Button color="secondary" size="sm" onClick={() => ignore(item.id)}>
                          Ignorer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <PaginationPageMinimalCenter
              page={page + 1}
              total={totalPages}
              onPageChange={(p) => setPage(p - 1)}
              className="mt-4"
            />
          )}
        </>
      )}
    </div>
  );
}
