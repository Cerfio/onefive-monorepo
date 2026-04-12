import React, { useMemo } from 'react';
import { FileText, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/base/input/input';
import { Badge } from '@/components/base/badges/badges';
import { EmptyState } from '@/components/application/empty-state/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { FileAnalytics, FileSortField, SortDirection } from '../../app/(protected)/dataroom/[id]/analytics/types';

const ITEMS_PER_PAGE = 10;

interface FilesTabProps {
  fileAnalytics: FileAnalytics[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onFileSelect: (file: FileAnalytics) => void;
  isLoading: boolean;
  sortField: FileSortField;
  sortDirection: SortDirection;
  onSort: (field: FileSortField) => void;
  page: number;
  onPageChange: (page: number) => void;
}

export const FilesTab = ({
  fileAnalytics,
  searchQuery,
  setSearchQuery,
  onFileSelect,
  isLoading,
  sortField,
  sortDirection,
  onSort,
  page,
  onPageChange,
}: FilesTabProps) => {
  const filteredAndSorted = useMemo(() => {
    let result = fileAnalytics.filter(file =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'totalViews': cmp = a.totalViews - b.totalViews; break;
        case 'uniqueViewers': cmp = a.uniqueViewers - b.uniqueViewers; break;
        case 'downloadCount': cmp = a.downloadCount - b.downloadCount; break;
        default: cmp = a.totalViews - b.totalViews;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [fileAnalytics, searchQuery, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE));
  const paginatedFiles = filteredAndSorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const SortButton = ({ field, label }: { field: FileSortField; label: string }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs text-[#475467] hover:text-[#101828] transition-colors font-medium"
    >
      {label}
      {sortField === field && (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Analytics par fichier
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
          <div className="flex items-center gap-4 ml-auto">
            <SortButton field="totalViews" label="Vues" />
            <SortButton field="uniqueViewers" label="Viewers" />
            <SortButton field="downloadCount" label="Téléchargements" />
            <SortButton field="name" label="Nom" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex items-center gap-8">
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-8" />
                </div>
              </div>
            ))
          ) : filteredAndSorted.length === 0 ? (
            <div className="py-8">
              <EmptyState size="sm">
                <EmptyState.Header pattern="none">
                  <EmptyState.FeaturedIcon icon={FileText} color="gray" />
                </EmptyState.Header>
                <EmptyState.Content>
                  <EmptyState.Title>Aucun fichier trouvé</EmptyState.Title>
                  <EmptyState.Description>
                    {searchQuery
                      ? "Essayez avec d'autres termes de recherche."
                      : "Les analytics s'afficheront une fois que des documents seront ajoutés à la dataroom."}
                  </EmptyState.Description>
                </EmptyState.Content>
              </EmptyState>
            </div>
          ) : (
            paginatedFiles.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 hover:border-indigo-200 cursor-pointer transition-all duration-200 hover:shadow-sm"
                onClick={() => onFileSelect(file)}
              >
                <div className="min-w-0 flex-1 mr-4">
                  <h3 className="font-semibold text-sm text-[#101828] truncate">{file.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge type="pill-color" color="gray" size="sm">{file.category || 'Document'}</Badge>
                    {file.uploadedAt && (
                      <span className="text-xs text-[#98A2B3]">Ajouté {file.uploadedAt}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-center max-sm:hidden">
                  <div>
                    <div className="text-lg font-bold text-[#101828]">{file.totalViews}</div>
                    <div className="text-xs text-[#98A2B3]">Vues</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-indigo-600">{file.uniqueViewers}</div>
                    <div className="text-xs text-[#98A2B3]">Viewers</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[#101828]">{file.avgTimeSpent}</div>
                    <div className="text-xs text-[#98A2B3]">Temps moyen</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[#101828]">{file.downloadCount}</div>
                    <div className="text-xs text-[#98A2B3]">Downloads</div>
                  </div>
                </div>
                <div className="sm:hidden text-right">
                  <div className="text-lg font-bold text-[#101828]">{file.totalViews}</div>
                  <div className="text-xs text-[#98A2B3]">vues</div>
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
