import React from 'react';
import { FileText, Users, Eye, Clock, Download } from 'lucide-react';
import { Badge } from '@/components/base/badges/badges';
import { Avatar } from '@/components/base/avatar/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { SlideoutMenu } from '@/components/application/slideout-menus/slideout-menu';
import { getAvatarUrl } from '@/utils/avatar';
import { FileAnalytics } from '../../app/(protected)/dataroom/[id]/analytics/types';

interface FileDetailsSidebarProps {
  file: FileAnalytics | null;
  isOpen: boolean;
  onClose: () => void;
  fileDetails: any;
  isLoadingFileDetails: boolean;
}

export const FileDetailsSidebar = ({
  file,
  isOpen,
  onClose,
  fileDetails,
  isLoadingFileDetails,
}: FileDetailsSidebarProps) => {
  if (!file) return null;

  const totalViews = fileDetails?.totalViews ?? file.totalViews;
  const uniqueViewers = fileDetails?.uniqueViewers ?? file.uniqueViewers;
  const userActivity = fileDetails?.userActivity || [];

  return (
    <SlideoutMenu.Trigger isOpen={isOpen} onOpenChange={onClose}>
      <SlideoutMenu isDismissable>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h3 className="text-lg font-semibold text-[#101828] truncate">{file.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge type="pill-color" color="gray" size="sm">{file.category || 'Document'}</Badge>
                {file.uploadedAt && (
                  <span className="text-xs text-[#98A2B3]">Ajouté {file.uploadedAt}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <SlideoutMenu.Content>
          {/* Stats */}
          {isLoadingFileDetails ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center p-3 bg-white rounded-xl border border-gray-200">
                  <Skeleton className="h-6 w-10 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Eye className="h-3.5 w-3.5 text-[#98A2B3]" />
                  <p className="text-xl font-bold text-[#101828]">{totalViews}</p>
                </div>
                <p className="text-xs text-[#475467]">Vues</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-3.5 w-3.5 text-[#98A2B3]" />
                  <p className="text-xl font-bold text-indigo-600">{uniqueViewers}</p>
                </div>
                <p className="text-xs text-[#475467]">Viewers</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-3.5 w-3.5 text-[#98A2B3]" />
                  <p className="text-xl font-bold text-[#101828]">{file.avgTimeSpent}</p>
                </div>
                <p className="text-xs text-[#475467]">Temps moyen</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Download className="h-3.5 w-3.5 text-[#98A2B3]" />
                  <p className="text-xl font-bold text-[#101828]">{file.downloadCount}</p>
                </div>
                <p className="text-xs text-[#475467]">Downloads</p>
              </div>
            </div>
          )}

          {/* Qui a consulté ce fichier */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#101828]">
              <Users className="h-4 w-4 text-indigo-600" />
              Qui a consulté ce fichier
            </h4>
            <div className="space-y-2">
              {isLoadingFileDetails ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))
              ) : userActivity.length > 0 ? (
                userActivity.map((viewer: any) => (
                  <div key={viewer.userId} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <Avatar
                      src={getAvatarUrl(viewer.userAvatar)}
                      alt={viewer.userName}
                      initials={viewer.userName?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      size="sm"
                      className="shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#101828] truncate">{viewer.userName}</p>
                      {viewer.userEmail && (
                        <p className="text-xs text-[#98A2B3] truncate">{viewer.userEmail}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {viewer.timeSpentFormatted && (
                        <p className="text-xs text-[#98A2B3]">{viewer.timeSpentFormatted}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#98A2B3] text-center py-4">
                  Aucune donnée de consultation disponible
                </p>
              )}
            </div>
          </div>
        </SlideoutMenu.Content>
      </SlideoutMenu>
    </SlideoutMenu.Trigger>
  );
};
