import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart02, Download01, ChevronDown, RefreshCw01 } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { Select } from '@/components/base/select/select';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { Breadcrumbs } from '@/components/application/breadcrumbs/breadcrumbs';
import { toast } from 'sonner';
import { DashboardStat, UserAnalytics, FileAnalytics, ActivityLog } from '../../app/(protected)/dataroom/[id]/analytics/types';

interface AnalyticsHeaderProps {
  dataroomId: string;
  dashboardStats: DashboardStat[];
  selectedPeriod: '24h' | '7d' | '30d' | '90d';
  onPeriodChange: (period: '24h' | '7d' | '30d' | '90d') => void;
  isLoading: boolean;
  rawData: any;
  userAnalytics: UserAnalytics[];
  fileAnalytics: FileAnalytics[];
  activityLogs: ActivityLog[];
  lastUpdatedAt: Date | null;
  onRefresh: () => void;
}

function generateCSV(userAnalytics: UserAnalytics[], fileAnalytics: FileAnalytics[], activityLogs: ActivityLog[]): string {
  const lines: string[] = [];

  lines.push('--- UTILISATEURS ---');
  lines.push('Nom,Email,Rôle,Groupe,Vues totales,Documents uniques,Temps total,Dernière activité');
  userAnalytics.forEach(u => {
    lines.push(`"${u.name}","${u.email}","${u.role}","${u.group}",${u.totalViews},${u.uniqueDocuments},"${u.totalTimeSpent}","${u.lastActivity}"`);
  });

  lines.push('');
  lines.push('--- FICHIERS ---');
  lines.push('Nom,Catégorie,Vues totales,Viewers uniques,Temps moyen,Téléchargements');
  fileAnalytics.forEach(f => {
    lines.push(`"${f.name}","${f.category}",${f.totalViews},${f.uniqueViewers},"${f.avgTimeSpent}",${f.downloadCount}`);
  });

  lines.push('');
  lines.push('--- ACTIVITÉ ---');
  lines.push('Utilisateur,Action,Document,Date,Durée');
  activityLogs.forEach(l => {
    lines.push(`"${l.user.name}","${l.action}","${l.document}","${l.timestamp}","${l.duration}"`);
  });

  return lines.join('\n');
}

export const AnalyticsHeader = ({
  dataroomId,
  dashboardStats,
  selectedPeriod,
  onPeriodChange,
  isLoading,
  rawData,
  userAnalytics,
  fileAnalytics,
  activityLogs,
  lastUpdatedAt,
  onRefresh,
}: AnalyticsHeaderProps) => {
  const periodItems = [
    { label: "Dernières 24h", id: "24h" as const },
    { label: "7 derniers jours", id: "7d" as const },
    { label: "30 derniers jours", id: "30d" as const },
    { label: "90 derniers jours", id: "90d" as const },
  ];

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const exportData = {
      period: selectedPeriod,
      users: userAnalytics,
      files: fileAnalytics,
      activities: activityLogs,
      stats: dashboardStats,
      rawData,
      exportedAt: new Date().toISOString(),
    };
    downloadFile(
      JSON.stringify(exportData, null, 2),
      `dataroom-${dataroomId}-analytics-${selectedPeriod}.json`,
      'application/json'
    );
    toast.success('Données exportées en JSON');
  };

  const handleExportCSV = () => {
    const csv = generateCSV(userAnalytics, fileAnalytics, activityLogs);
    downloadFile(
      csv,
      `dataroom-${dataroomId}-analytics-${selectedPeriod}.csv`,
      'text/csv;charset=utf-8;'
    );
    toast.success('Données exportées en CSV');
  };

  const formatLastUpdated = () => {
    if (!lastUpdatedAt) return null;
    const now = new Date();
    const diffMs = now.getTime() - lastUpdatedAt.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin}min`;
    return `Il y a ${Math.floor(diffMin / 60)}h`;
  };

  return (
    <div className="space-y-4">
      <Breadcrumbs divider="chevron">
        <Breadcrumbs.Item href="/dataroom">DataRooms</Breadcrumbs.Item>
        <Breadcrumbs.Item href={`/dataroom/${dataroomId}`}>DataRoom</Breadcrumbs.Item>
        <Breadcrumbs.Item>Analytics</Breadcrumbs.Item>
      </Breadcrumbs>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <Link href={`/dataroom/${dataroomId}`}>
                <Button color="secondary" iconLeading={<ArrowLeft data-icon />} />
              </Link>
              <div className="w-12 h-12 bg-[#5E6AD2] rounded-lg flex items-center justify-center">
                <BarChart02 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#101828]">Analytics DataRoom</h1>
                <p className="text-[#475467] mt-1">Analysez l'engagement et l'activité de vos investisseurs</p>
              </div>
            </div>
            {lastUpdatedAt && (
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-[#98A2B3]">
                  Mis à jour {formatLastUpdated()}
                </span>
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="text-[#98A2B3] hover:text-[#475467] transition-colors disabled:opacity-50"
                >
                  <RefreshCw01 className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              placeholder="Période"
              items={periodItems}
              selectedKey={selectedPeriod}
              onSelectionChange={(key) => onPeriodChange(key as '24h' | '7d' | '30d' | '90d')}
            >
              {(item) => (
                <Select.Item id={item.id}>
                  {item.label}
                </Select.Item>
              )}
            </Select>
            <Dropdown.Root>
              <Button
                color="secondary"
                iconLeading={<Download01 data-icon />}
                iconTrailing={<ChevronDown data-icon />}
              >
                Exporter
              </Button>

              <Dropdown.Popover>
                <div className="space-y-3 p-4">
                  <div>
                    <h4 className="font-medium leading-none mb-2">Options d'export</h4>
                    <p className="text-sm text-muted-foreground">Choisissez le format</p>
                  </div>
                  <Dropdown.Menu>
                    <Dropdown.Section>
                      <Dropdown.Item
                        icon={Download01}
                        onAction={handleExportJSON}
                      >
                        Export JSON
                      </Dropdown.Item>
                      <Dropdown.Item
                        icon={Download01}
                        onAction={handleExportCSV}
                      >
                        Export CSV
                      </Dropdown.Item>
                    </Dropdown.Section>
                  </Dropdown.Menu>
                </div>
              </Dropdown.Popover>
            </Dropdown.Root>
          </div>
        </div>
      </div>
    </div>
  );
};
