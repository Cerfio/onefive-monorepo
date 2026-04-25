import React from 'react';
import { Activity, Eye, Download } from 'lucide-react';
import { EmptyState } from '@/components/application/empty-state/empty-state';
import { Skeleton } from '@/components/base/skeleton/skeleton';
import { ActivityLog } from '../../app/(protected)/dataroom/[id]/analytics/types';

const ITEMS_PER_PAGE = 15;

interface TimelineTabProps {
  activityLogs: ActivityLog[];
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export const TimelineTab = ({ activityLogs, isLoading, page, onPageChange }: TimelineTabProps) => {
  const totalPages = Math.max(1, Math.ceil(activityLogs.length / ITEMS_PER_PAGE));
  const paginatedLogs = activityLogs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Timeline d'activité
            <span className="text-sm font-normal text-[#98A2B3]">({activityLogs.length})</span>
          </h2>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-1">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          ) : activityLogs.length === 0 ? (
            <div className="py-8">
              <EmptyState size="sm">
                <EmptyState.Header pattern="none">
                  <EmptyState.FeaturedIcon icon={Activity} color="gray" />
                </EmptyState.Header>
                <EmptyState.Content>
                  <EmptyState.Title>Aucune activité récente</EmptyState.Title>
                  <EmptyState.Description>
                    Les interactions avec les documents s'afficheront ici dès que vos investisseurs commenceront à consulter la dataroom.
                  </EmptyState.Description>
                </EmptyState.Content>
              </EmptyState>
            </div>
          ) : (
            paginatedLogs.map(log => (
              <div
                key={log.id}
                className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    log.action === 'Consulté' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {log.action === 'Consulté' ? <Eye className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-[#101828]">{log.user.name}</span>
                    <span className="text-xs text-[#98A2B3]">{log.user.role}</span>
                  </div>
                  <div className="text-sm text-[#475467]">
                    {log.action} <span className="font-medium">{log.document}</span>
                  </div>
                  {log.duration !== '0s' && log.duration !== '-' && (
                    <div className="text-xs text-[#98A2B3]">Durée: {log.duration}</div>
                  )}
                </div>
                <div className="text-right text-xs text-[#98A2B3] shrink-0">
                  {log.timestamp}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-[#475467]">
            {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, activityLogs.length)} sur {activityLogs.length}
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
