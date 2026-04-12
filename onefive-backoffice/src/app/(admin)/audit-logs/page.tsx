'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { SearchLg, SearchMd, RefreshCw05, Download01 } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Badge } from '@/components/base/badges/badges';
import { NativeSelect } from '@/components/base/select/select-native';
import { SectionHeader } from '@/components/application/section-headers/section-headers';
import { PaginationPageMinimalCenter } from '@/components/application/pagination/pagination';
import { EmptyState } from '@/components/application/empty-state/empty-state';
import { TableSkeleton } from '@/components/application/table/table-skeleton';

type AuditLog = {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  ipAddress: string | null;
  adminUser: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

const PAGE_SIZE = 50;

const ACTION_COLORS: Record<string, 'error' | 'warning' | 'success' | 'brand' | 'gray'> = {
  DELETE: 'error',
  BAN: 'error',
  CREATE: 'success',
  UPDATE: 'brand',
  ACCEPT: 'success',
  REJECT: 'warning',
  REVOKE: 'warning',
};

function getActionColor(action: string): 'error' | 'warning' | 'success' | 'brand' | 'gray' {
  for (const [key, color] of Object.entries(ACTION_COLORS)) {
    if (action.toUpperCase().includes(key)) return color;
  }
  return 'gray';
}

const resourceTypeOptions = [
  { value: '', label: 'Toutes les ressources' },
  { value: 'user', label: 'user' },
  { value: 'profile', label: 'profile' },
  { value: 'post', label: 'post' },
  { value: 'discussion', label: 'discussion' },
  { value: 'spotlight', label: 'spotlight' },
  { value: 'startup', label: 'startup' },
  { value: 'admin_user', label: 'admin_user' },
  { value: 'admin_invitation', label: 'admin_invitation' },
  { value: 'report', label: 'report' },
  { value: 'feedback', label: 'feedback' },
];

function getMetadataSummary(metadata?: Record<string, unknown> | null): string {
  if (!metadata) return '-';
  if (typeof metadata.acceptedCount === 'number') {
    return `${metadata.acceptedCount} ressource(s) impactée(s)`;
  }
  if (typeof metadata.targetEmail === 'string') {
    return metadata.targetEmail;
  }
  if (typeof metadata.email === 'string') {
    return metadata.email;
  }
  if (typeof metadata.roleKey === 'string') {
    return metadata.roleKey;
  }
  if (typeof metadata.waitlistStatus === 'string') {
    return metadata.waitlistStatus;
  }
  if (typeof metadata.spotType === 'string') {
    return metadata.spotType;
  }
  return Object.keys(metadata).length > 0 ? `${Object.keys(metadata).length} détail(s)` : '-';
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  useEffect(() => {
    setPage(0);
  }, [resourceFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        skip: String(page * PAGE_SIZE),
        take: String(PAGE_SIZE),
      };
      if (search) params.search = search;
      if (resourceFilter) params.resourceType = resourceFilter;

      const response = await api
        .get('admin/audit-logs', { searchParams: params })
        .json<{ data: AuditLog[]; total: number }>();
      setLogs(response.data ?? []);
      setTotal(response.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page, search, resourceFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = async () => {
    try {
      const res = await api.get('admin/audit-logs/export').json<{ data: string }>();
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export réussi');
    } catch {
      toast.error("Erreur lors de l'export");
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <SectionHeader.Root>
        <SectionHeader.Group>
          <div>
            <SectionHeader.Heading>Audit logs</SectionHeader.Heading>
            <SectionHeader.Subheading>
              Historique des actions admin sur la plateforme.
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

      <form onSubmit={handleSearch} className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <Input
            placeholder="Rechercher par action ou admin..."
            value={searchInput}
            onChange={setSearchInput}
            icon={SearchMd}
          />
        </div>
        <div className="w-52">
          <NativeSelect
            options={resourceTypeOptions}
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
          />
        </div>
        <Button type="submit" color="secondary" size="md">
          Rechercher
        </Button>
        {search && (
          <Button
            color="secondary"
            type="button"
            size="md"
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

      {loading && <TableSkeleton columns={6} rows={8} />}
      {error && <p className="text-sm text-error-primary">{error}</p>}

      {!loading && !error && logs.length === 0 && (
        <EmptyState>
          <EmptyState.Header>
            <EmptyState.FeaturedIcon icon={SearchLg} color="gray" theme="modern" />
          </EmptyState.Header>
          <EmptyState.Content>
            <EmptyState.Title>Aucun log</EmptyState.Title>
            <EmptyState.Description>Aucune action admin enregistrée.</EmptyState.Description>
          </EmptyState.Content>
        </EmptyState>
      )}

      {!loading && !error && logs.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary">
            <table className="min-w-full divide-y divide-border-secondary">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Admin
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Resource
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-quaternary">
                    Résumé
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-quaternary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-secondary">
                {logs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-secondary">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-tertiary">
                      {new Date(log.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={getActionColor(log.action)} size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {log.adminUser ? (
                        <div>
                          <p className="text-sm font-medium text-primary">
                            {`${log.adminUser.firstName ?? ''} ${log.adminUser.lastName ?? ''}`.trim() ||
                              log.adminUser.email}
                          </p>
                          {log.adminUser.firstName && (
                            <p className="text-xs text-quaternary">{log.adminUser.email}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-quaternary">Système</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-primary">{log.resourceType}</p>
                        {log.resourceId && (
                          <p className="font-mono text-xs text-quaternary">
                            {log.resourceId.slice(0, 12)}...
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-tertiary">
                      {getMetadataSummary(log.metadata)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/audit-logs/${log.id}`}>
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
