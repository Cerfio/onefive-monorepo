'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/application/modals/confirm-dialog';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { Input } from '@/components/base/input/input';
import { NativeSelect } from '@/components/base/select/select-native';
import { SectionHeader } from '@/components/application/section-headers/section-headers';
import { PaginationPageMinimalCenter } from '@/components/application/pagination/pagination';
import { EmptyState } from '@/components/application/empty-state/empty-state';
import { TableSkeleton } from '@/components/application/table/table-skeleton';
import { SearchMd, RefreshCw05, Download01 } from '@untitledui/icons';
import { Avatar, resolveAvatarUrl } from '@/components/application/avatar/avatar';

type AdminUserRow = {
  id: string;
  email: string;
  isEmailVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  profile: {
    firstName: string;
    lastName: string;
    waitlistStatus: string;
    avatarId?: string | null;
  } | null;
  startups: Array<{ id: string; name: string }>;
};

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'active', label: 'Actifs' },
  { value: 'banned', label: 'Bannis' },
];

export default function UsersPage() {
  const confirm = useConfirm();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        skip: String(page * PAGE_SIZE),
        take: String(PAGE_SIZE),
      };
      if (search) params.search = search;

      const response = await api
        .get('admin/users', { searchParams: params })
        .json<{ data: AdminUserRow[] | { items: AdminUserRow[]; total: number }; total?: number }>();
      const items = Array.isArray(response.data)
        ? response.data
        : Array.isArray((response.data as any)?.items)
          ? (response.data as any).items
          : [];
      const responseTotal = response.total ?? (response.data as any)?.total ?? 0;
      setUsers(items);
      setTotal(responseTotal);
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = (Array.isArray(users) ? users : []).filter((u) => {
    if (statusFilter === 'banned') return u.isBanned;
    if (statusFilter === 'active') return !u.isBanned;
    return true;
  });

  const toggleSelectAll = () => {
    const allSelected = filteredUsers.length > 0 && filteredUsers.every((u) => selectedIds.has(u.id));
    setSelectedIds(allSelected ? new Set() : new Set(filteredUsers.map((u) => u.id)));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkBan = async () => {
    const ok = await confirm({
      title: `Bannir ${selectedIds.size} utilisateur(s) ?`,
      description: 'Les utilisateurs sélectionnés ne pourront plus accéder à la plateforme.',
      confirmLabel: 'Bannir',
      variant: 'warning',
    });
    if (!ok) return;
    try {
      await api.post('admin/users/bulk-ban', { json: { ids: Array.from(selectedIds), isBanned: true } }).json();
      toast.success(`${selectedIds.size} utilisateur(s) banni(s)`);
      setSelectedIds(new Set());
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du ban groupé');
    }
  };

  const bulkDelete = async () => {
    const ok = await confirm({
      title: `Supprimer ${selectedIds.size} utilisateur(s) ?`,
      description: 'Cette action est irréversible. Toutes les données des utilisateurs sélectionnés seront supprimées.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.post('admin/users/bulk-delete', { json: { ids: Array.from(selectedIds) } }).json();
      toast.success(`${selectedIds.size} utilisateur(s) supprimé(s)`);
      setSelectedIds(new Set());
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression groupée');
    }
  };

  const exportCsv = async () => {
    try {
      const response = await api.get('admin/users/export').json<{ data: string }>();
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'utilisateurs.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export CSV téléchargé');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'export");
    }
  };

  const toggleBan = async (userId: string, isBanned: boolean) => {
    const ok = await confirm({
      title: isBanned ? 'Débannir cet utilisateur ?' : 'Bannir cet utilisateur ?',
      description: isBanned
        ? "L'utilisateur pourra à nouveau accéder à la plateforme."
        : "L'utilisateur ne pourra plus accéder à la plateforme.",
      confirmLabel: isBanned ? 'Débannir' : 'Bannir',
      variant: isBanned ? 'info' : 'warning',
    });
    if (!ok) return;
    try {
      await api.patch(`admin/users/${userId}/ban`, { json: { isBanned: !isBanned } }).json();
      toast.success(isBanned ? 'Utilisateur débanni' : 'Utilisateur banni');
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du ban');
    }
  };

  const deleteUser = async (userId: string) => {
    const ok = await confirm({
      title: 'Supprimer cet utilisateur ?',
      description: 'Cette action est irréversible. Toutes les données de cet utilisateur seront supprimées.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`admin/users/${userId}`);
      toast.success('Utilisateur supprimé');
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

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
            <SectionHeader.Heading>Utilisateurs</SectionHeader.Heading>
            <SectionHeader.Subheading>
              Gérer les utilisateurs de la plateforme.
            </SectionHeader.Subheading>
          </div>
          <SectionHeader.Actions>
            <Button color="secondary" iconLeading={Download01} onClick={exportCsv}>
              Exporter CSV
            </Button>
            <Button color="secondary" iconLeading={RefreshCw05} onClick={loadUsers}>
              Rafraîchir
            </Button>
          </SectionHeader.Actions>
        </SectionHeader.Group>
      </SectionHeader.Root>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchInput}
            onChange={setSearchInput}
            icon={SearchMd}
            className="min-w-[240px] flex-1"
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
        <div className="w-44">
          <NativeSelect
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-border-secondary bg-secondary px-4 py-2.5">
          <span className="text-sm font-medium text-secondary">
            {selectedIds.size} sélectionné(s)
          </span>
          <div className="ml-auto flex gap-2">
            <Button color="secondary" size="sm" onClick={bulkBan}>
              Bannir
            </Button>
            <Button color="primary-destructive" size="sm" onClick={bulkDelete}>
              Supprimer
            </Button>
          </div>
        </div>
      )}

      {loading && <TableSkeleton columns={8} rows={6} />}
      {error && <p className="text-sm text-error-primary">{error}</p>}

      {!loading && !error && filteredUsers.length === 0 && (
        <EmptyState>
          <EmptyState.Header>
            <EmptyState.FeaturedIcon icon={SearchMd} color="gray" theme="modern" />
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>Aucun utilisateur</EmptyState.Title>
            <EmptyState.Description>
              {search ? `Aucun résultat pour "${search}"` : 'Aucun utilisateur inscrit.'}
            </EmptyState.Description>
          </EmptyState.Content>
        </EmptyState>
      )}

      {!loading && !error && filteredUsers.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
            <table className="min-w-full divide-y divide-border-secondary">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 md:px-6">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-gray-300"
                      checked={filteredUsers.length > 0 && filteredUsers.every((u) => selectedIds.has(u.id))}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-quaternary md:px-6">
                    Utilisateur
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-quaternary md:px-6">
                    Email vérifié
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-quaternary md:px-6">
                    Waitlist
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-quaternary md:px-6">
                    Startups
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-quaternary md:px-6">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-quaternary md:px-6">
                    Inscrit le
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-quaternary md:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-secondary">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-secondary">
                    <td className="px-4 py-3 md:px-6 md:py-4">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-gray-300"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                      />
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4">
                      <Link href={`/users/${user.id}`} className="flex items-center gap-3">
                        <Avatar
                          src={resolveAvatarUrl(user.profile?.avatarId)}
                          firstName={user.profile?.firstName}
                          lastName={user.profile?.lastName}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-medium text-primary">
                            {user.profile
                              ? `${user.profile.firstName} ${user.profile.lastName}`
                              : 'Sans profil'}
                          </p>
                          <p className="text-xs text-quaternary">{user.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4">
                      {user.isEmailVerified ? (
                        <Badge color="success" size="sm">Vérifié</Badge>
                      ) : (
                        <Badge color="warning" size="sm">Non vérifié</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-tertiary md:px-6 md:py-4">
                      {user.profile?.waitlistStatus ? (
                        <Badge
                          color={
                            user.profile.waitlistStatus === 'ACTIVE'
                              ? 'success'
                              : user.profile.waitlistStatus === 'WAITING'
                                ? 'warning'
                                : 'gray'
                          }
                          size="sm"
                        >
                          {user.profile.waitlistStatus}
                        </Badge>
                      ) : (
                        <span className="text-xs text-quaternary">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.startups?.length > 0 ? (
                          user.startups.map((startup) => (
                            <Link key={startup.id} href={`/startups/${startup.id}`}>
                              <Badge color="brand" size="sm" className="cursor-pointer hover:opacity-80">
                                {startup.name}
                              </Badge>
                            </Link>
                          ))
                        ) : (
                          <span className="text-xs text-quaternary">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4">
                      {user.isBanned ? (
                        <Badge color="error" size="sm">Banni</Badge>
                      ) : (
                        <Badge color="success" size="sm">Actif</Badge>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-tertiary md:px-6 md:py-4">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-right md:px-6 md:py-4">
                      <Link href={`/users/${user.id}`}>
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
