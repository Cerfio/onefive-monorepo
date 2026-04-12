import React, { useMemo } from 'react';
import { Users, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/base/input/input';
import { Badge } from '@/components/base/badges/badges';
import { Select } from '@/components/base/select/select';
import { Avatar } from '@/components/base/avatar/avatar';
import { EmptyState } from '@/components/application/empty-state/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { getAvatarUrl } from '@/utils/avatar';
import { UserAnalytics, SortField, SortDirection } from '../../app/(protected)/dataroom/[id]/analytics/types';

const ITEMS_PER_PAGE = 10;

interface UsersListProps {
  users: UserAnalytics[];
  onUserSelect: (user: UserAnalytics) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  page: number;
  onPageChange: (page: number) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  selectedGroup: string;
  onGroupChange: (group: string) => void;
}

export const UsersList = ({
  users,
  onUserSelect,
  searchQuery,
  setSearchQuery,
  isLoading,
  sortField,
  sortDirection,
  onSort,
  page,
  onPageChange,
  selectedRole,
  onRoleChange,
  selectedGroup,
  onGroupChange,
}: UsersListProps) => {
  const roles = useMemo(() => {
    const set = new Set(users.map(u => u.role).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [users]);

  const groups = useMemo(() => {
    const set = new Set(users.map(u => u.group).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [users]);

  const filteredAndSorted = useMemo(() => {
    let result = users.filter(user =>
      (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedRole === 'all' || user.role === selectedRole) &&
      (selectedGroup === 'all' || user.group === selectedGroup)
    );

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'totalViews': cmp = a.totalViews - b.totalViews; break;
        case 'uniqueDocuments': cmp = a.uniqueDocuments - b.uniqueDocuments; break;
        case 'totalTimeSpent': cmp = a.totalTimeSpent.localeCompare(b.totalTimeSpent); break;
        default: cmp = a.totalViews - b.totalViews;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [users, searchQuery, selectedRole, selectedGroup, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE));
  const paginatedUsers = filteredAndSorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs text-[#475467] hover:text-[#101828] transition-colors font-medium"
    >
      {label}
      {sortField === field && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
    </button>
  );

  const roleItems = roles.map(r => ({ label: r === 'all' ? 'Tous les rôles' : r, id: r }));
  const groupItems = groups.length > 1
    ? groups.map(g => ({ label: g === 'all' ? 'Tous les groupes' : g, id: g }))
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Analytics par utilisateur
              <span className="text-sm font-normal text-[#98A2B3]">({filteredAndSorted.length})</span>
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {roles.length > 2 && (
              <Select
                placeholder="Rôle"
                items={roleItems}
                selectedKey={selectedRole}
                onSelectionChange={(key) => {
                  onRoleChange(key as string);
                  onPageChange(1);
                }}
              >
                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
              </Select>
            )}
            {groupItems && groups.length > 2 && (
              <Select
                placeholder="Groupe"
                items={groupItems}
                selectedKey={selectedGroup}
                onSelectionChange={(key) => {
                  onGroupChange(key as string);
                  onPageChange(1);
                }}
              >
                {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
              </Select>
            )}
            <div className="flex items-center gap-4 ml-auto">
              <SortButton field="totalViews" label="Vues" />
              <SortButton field="uniqueDocuments" label="Documents" />
              <SortButton field="name" label="Nom" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-2">
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))
          ) : filteredAndSorted.length === 0 ? (
            <div className="py-8">
              <EmptyState size="sm">
                <EmptyState.Header pattern="none">
                  <EmptyState.FeaturedIcon icon={Users} color="gray" />
                </EmptyState.Header>
                <EmptyState.Content>
                  <EmptyState.Title>Aucun utilisateur trouvé</EmptyState.Title>
                  <EmptyState.Description>
                    {searchQuery ? "Essayez avec d'autres termes de recherche." : "Les utilisateurs apparaîtront ici après leur première visite."}
                  </EmptyState.Description>
                </EmptyState.Content>
              </EmptyState>
            </div>
          ) : (
            paginatedUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 hover:border-indigo-200 cursor-pointer transition-all duration-200 hover:shadow-sm"
                onClick={() => onUserSelect(user)}
              >
                <div className="flex items-center gap-4">
                  <Avatar
                    src={getAvatarUrl(user.avatar)}
                    alt={user.name}
                    initials={user.name.split(' ').map(n => n[0]).join('')}
                    size="md"
                    className="shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-[#101828]">{user.name}</h3>
                    <p className="text-xs text-[#475467] truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge type="pill-color" color="brand" size="sm">{user.role}</Badge>
                      {user.group && <Badge type="pill-color" color="gray" size="sm">{user.group}</Badge>}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 text-center max-sm:hidden">
                  <div>
                    <p className="text-lg font-bold text-[#101828]">{user.totalViews}</p>
                    <p className="text-xs text-[#98A2B3]">Vues</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#101828]">{user.uniqueDocuments}</p>
                    <p className="text-xs text-[#98A2B3]">Documents</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#101828]">{user.totalTimeSpent}</p>
                    <p className="text-xs text-[#98A2B3]">Temps</p>
                  </div>
                </div>
                <div className="sm:hidden text-right">
                  <p className="text-lg font-bold text-[#101828]">{user.totalViews}</p>
                  <p className="text-xs text-[#98A2B3]">vues</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-[#475467]">
            {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredAndSorted.length)} sur {filteredAndSorted.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
