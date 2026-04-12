'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/application/modals/confirm-dialog';
import { SearchLg, SearchMd, RefreshCw05 } from '@untitledui/icons';
import { Avatar, resolveAvatarUrl } from '@/components/application/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { Input } from '@/components/base/input/input';
import { SectionHeader } from '@/components/application/section-headers/section-headers';
import { PaginationPageMinimalCenter } from '@/components/application/pagination/pagination';
import { EmptyState } from '@/components/application/empty-state/empty-state';
import { TableSkeleton } from '@/components/application/table/table-skeleton';

type PostRow = {
  id: string;
  content: string;
  createdAt: string;
  isHidden?: boolean;
  author?: { firstName: string; lastName: string; avatarId?: string | null } | null;
  _count: { comments: number; reactions: number };
};

const PAGE_SIZE = 20;

export default function PostsPage() {
  const confirm = useConfirm();
  const [items, setItems] = useState<PostRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

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
        .get('admin/posts', { searchParams: params })
        .json<{ data: PostRow[]; total: number }>();
      setItems(response.data ?? []);
      setTotal(response.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const remove = async (postId: string) => {
    const ok = await confirm({
      title: 'Supprimer ce post ?',
      description: 'Le post et tous ses commentaires seront supprimés définitivement.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`admin/posts/${postId}`);
      toast.success('Post supprimé');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const toggleHide = async (postId: string, currentlyHidden: boolean) => {
    try {
      await api.patch(`admin/posts/${postId}/hide`, {
        json: { isHidden: !currentlyHidden },
      });
      toast.success(currentlyHidden ? 'Post affiché' : 'Post masqué');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
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
            <SectionHeader.Heading>Modération posts</SectionHeader.Heading>
            <SectionHeader.Subheading>
              Visualiser et modérer les publications de la communauté.
            </SectionHeader.Subheading>
          </div>
          <SectionHeader.Actions>
            <Button color="secondary" iconLeading={RefreshCw05} onClick={load}>
              Rafraîchir
            </Button>
          </SectionHeader.Actions>
        </SectionHeader.Group>
      </SectionHeader.Root>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <Input
          placeholder="Rechercher par contenu ou auteur..."
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

      {loading && <TableSkeleton columns={5} rows={6} />}
      {error && <p className="text-sm text-error-primary">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <EmptyState>
          <EmptyState.Header>
            <EmptyState.FeaturedIcon icon={SearchLg} color="gray" theme="modern" />
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>Aucun post</EmptyState.Title>
            <EmptyState.Description>
              {search ? `Aucun résultat pour "${search}"` : 'Aucun post à modérer.'}
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
                    Auteur
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Contenu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Engagement
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-quaternary">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-secondary">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-secondary">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={resolveAvatarUrl(item.author?.avatarId)}
                          firstName={item.author?.firstName}
                          lastName={item.author?.lastName}
                          size="xs"
                        />
                        <span className="text-sm font-medium text-primary">
                          {item.author
                            ? `${item.author.firstName} ${item.author.lastName}`
                            : 'Anonyme'}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <Link
                        href={`/posts/${item.id}`}
                        className="block truncate text-sm text-primary hover:text-brand-primary hover:underline"
                      >
                        {item.content?.slice(0, 120) || '(vide)'}
                      </Link>
                      {item.isHidden && (
                        <Badge color="warning" size="sm" className="mt-1">
                          Masqué
                        </Badge>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex gap-2">
                        <Badge color="gray" size="sm">
                          {item._count.comments} com.
                        </Badge>
                        <Badge color="gray" size="sm">
                          {item._count.reactions} réac.
                        </Badge>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-tertiary">
                      {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/posts/${item.id}`}>
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
