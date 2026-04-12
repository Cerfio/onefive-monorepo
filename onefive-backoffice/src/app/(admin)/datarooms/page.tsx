'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { SearchLg } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { SectionHeader } from '@/components/application/section-headers/section-headers';
import { PaginationPageMinimalCenter } from '@/components/application/pagination/pagination';
import { EmptyState } from '@/components/application/empty-state/empty-state';
import { TableSkeleton } from '@/components/application/table/table-skeleton';

type DataroomRow = {
  id: string;
  createdAt: string;
  startup: {
    id: string;
    name: string;
    city: string;
    countryCode: string;
  };
  _count: {
    files: number;
    members: number;
    groups: number;
  };
};

const PAGE_SIZE = 20;

export default function DataroomsPage() {
  const [items, setItems] = useState<DataroomRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api
        .get('admin/datarooms', {
          searchParams: { skip: String(page * PAGE_SIZE), take: String(PAGE_SIZE) },
        })
        .json<{ data: DataroomRow[]; total: number }>();
      setItems(response.data ?? []);
      setTotal(response.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <SectionHeader.Root>
        <SectionHeader.Group>
          <div>
            <SectionHeader.Heading>Datarooms</SectionHeader.Heading>
            <SectionHeader.Subheading>Vue lecture seule des datarooms de la plateforme.</SectionHeader.Subheading>
          </div>
          <SectionHeader.Actions>
            <Button color="secondary" onClick={load}>Rafraîchir</Button>
          </SectionHeader.Actions>
        </SectionHeader.Group>
      </SectionHeader.Root>

      {loading && <TableSkeleton columns={6} rows={5} />}
      {error && <p className="text-sm text-error-primary">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <EmptyState>
          <EmptyState.Header>
            <EmptyState.FeaturedIcon icon={SearchLg} color="gray" theme="modern" />
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>Aucune dataroom</EmptyState.Title>
            <EmptyState.Description>Aucune dataroom créée.</EmptyState.Description>
          </EmptyState.Content>
        </EmptyState>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
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
                    Fichiers
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Membres
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Groupes
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
                      <Link href={`/startups/${item.startup.id}`} className="block">
                        <p className="text-sm font-medium text-primary hover:text-brand-primary hover:underline">
                          {item.startup.name}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-tertiary">
                      {item.startup.city}, {item.startup.countryCode}
                    </td>
                    <td className="px-4 py-3 text-sm text-tertiary">{item._count.files}</td>
                    <td className="px-4 py-3 text-sm text-tertiary">{item._count.members}</td>
                    <td className="px-4 py-3 text-sm text-tertiary">{item._count.groups}</td>
                    <td className="px-4 py-3 text-sm text-tertiary">
                      {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/startups/${item.startup.id}`}>
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
