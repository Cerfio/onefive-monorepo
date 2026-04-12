import React from 'react';
import { Activity, Eye, FileText, Clock } from 'lucide-react';
import { Badge } from '@/components/base/badges/badges';
import { Avatar } from '@/components/base/avatar/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { SlideoutMenu } from '@/components/application/slideout-menus/slideout-menu';
import { getAvatarUrl } from '@/utils/avatar';
import { UserAnalytics } from '../../app/(protected)/dataroom/[id]/analytics/types';

interface UserDetailsSidebarProps {
  user: UserAnalytics | null;
  isOpen: boolean;
  onClose: () => void;
  userDetails: any;
  userTimelineData: any;
  isLoadingUserDetails: boolean;
  isLoadingUserTimeline: boolean;
}

export const UserDetailsSidebar = ({
  user,
  isOpen,
  onClose,
  userDetails,
  userTimelineData,
  isLoadingUserDetails,
  isLoadingUserTimeline,
}: UserDetailsSidebarProps) => {
  if (!user) return null;

  const totalViews = userDetails?.totalViews ?? user.totalViews;
  const filesViewed = userDetails?.filesViewed ?? user.uniqueDocuments;
  const totalTime = userDetails?.totalTimeFormatted ?? user.totalTimeSpent;
  const fileActivity = userDetails?.fileActivity || [];
  const timeline = userTimelineData?.timeline || [];

  return (
    <SlideoutMenu.Trigger isOpen={isOpen} onOpenChange={onClose}>
      <SlideoutMenu isDismissable>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar
              src={getAvatarUrl(user.avatar)}
              alt={user.name}
              initials={user.name.split(' ').map(n => n[0]).join('')}
              size="lg"
              className="shrink-0"
            />
            <div className="text-left min-w-0">
              <h3 className="text-lg font-semibold text-[#101828]">{user.name}</h3>
              <p className="text-sm text-[#475467] truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge type="pill-color" color="brand" size="sm">{user.role}</Badge>
                {user.group && <Badge type="pill-color" color="gray" size="sm">{user.group}</Badge>}
              </div>
            </div>
          </div>
        </div>

        <SlideoutMenu.Content>
          {/* Stats */}
          {isLoadingUserDetails ? (
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center p-3 bg-white rounded-xl border border-gray-200">
                  <Skeleton className="h-6 w-10 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Eye className="h-3.5 w-3.5 text-[#98A2B3]" />
                  <p className="text-xl font-bold text-[#101828]">{totalViews}</p>
                </div>
                <p className="text-xs text-[#475467]">Vues</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <FileText className="h-3.5 w-3.5 text-[#98A2B3]" />
                  <p className="text-xl font-bold text-[#101828]">{filesViewed}</p>
                </div>
                <p className="text-xs text-[#475467]">Documents</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-3.5 w-3.5 text-[#98A2B3]" />
                  <p className="text-xl font-bold text-[#101828]">{totalTime}</p>
                </div>
                <p className="text-xs text-[#475467]">Temps total</p>
              </div>
            </div>
          )}

          {/* Documents consultés */}
          {fileActivity.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#101828]">
                <FileText className="h-4 w-4 text-indigo-600" />
                Documents consultés
              </h4>
              <div className="space-y-2">
                {fileActivity.map((file: any) => (
                  <div key={file.fileId} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#101828] truncate">{file.fileName}</p>
                      {file.category && (
                        <span className="text-xs text-[#98A2B3]">{file.category}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-right shrink-0 ml-3">
                      <div>
                        <p className="text-sm font-semibold text-[#101828]">{file.views}</p>
                        <p className="text-xs text-[#98A2B3]">vues</p>
                      </div>
                      {(file.timeSpentFormatted || file.timeSpent) && (
                        <div>
                          <p className="text-sm font-semibold text-[#101828]">
                            {file.timeSpentFormatted || `${Math.floor(file.timeSpent / 60)}m`}
                          </p>
                          <p className="text-xs text-[#98A2B3]">temps</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#101828]">
              <Activity className="h-4 w-4 text-indigo-600" />
              Activité récente
            </h4>
            <div className="space-y-2">
              {isLoadingUserTimeline ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-3 p-2">
                    <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : timeline.length > 0 ? (
                timeline.slice(0, 10).map((event: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      event.action === 'Consulté' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Eye className="h-3 w-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#101828]">
                        {event.action} <span className="font-medium">{event.fileName}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#98A2B3]">{event.timestamp}</span>
                        {event.duration && event.duration > 0 && (
                          <span className="text-xs text-[#98A2B3]">
                            ({Math.floor(event.duration / 60)}m {event.duration % 60}s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#98A2B3] text-center py-4">Aucune activité récente</p>
              )}
            </div>
          </div>
        </SlideoutMenu.Content>
      </SlideoutMenu>
    </SlideoutMenu.Trigger>
  );
};
