export interface DashboardStat {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'stable';
}

export interface UserAnalytics {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    group: string;
    totalViews: number;
    uniqueDocuments: number;
    totalTimeSpent: string;
    lastActivity: string;
    documentsViewed: DocumentViewed[] | string[];
}

export interface DocumentViewed {
    id: string;
    name: string;
    viewedAt: string;
    timeSpent: string;
    views: number;
}

export interface FileAnalytics {
    id: string;
    name: string;
    category: string;
    totalViews: number;
    uniqueViewers: number;
    avgTimeSpent: string;
    downloadCount: number;
    uploadedAt: string;
    viewers: FileViewer[] | { userId?: string; userName?: string; }[];
}

export interface FileViewer {
    id: string;
    name: string;
    avatar?: string;
    viewedAt: string;
    timeSpent: string;
    views: number;
}

export interface ActivityLog {
    id: string;
    user: {
        name: string;
        avatar?: string;
        role: string;
    };
    action: string;
    document: string;
    timestamp: string;
    duration: string;
}

export interface UserTimelineEvent {
    id: string;
    timestamp: string;
    action: string;
    document: string;
    duration: string;
    details: string;
}

export interface ActivityChartDataPoint {
    date: string;
    views: number;
    uniqueViewers: number;
}

export type SortField = 'name' | 'totalViews' | 'uniqueDocuments' | 'totalTimeSpent' | 'lastActivity';
export type SortDirection = 'asc' | 'desc';
export type FileSortField = 'name' | 'totalViews' | 'uniqueViewers' | 'avgTimeSpent' | 'downloadCount';

export interface BackendDataroomAnalytics {
    dataroomId: string;
    totalViews: number;
    uniqueViewers: number;
    avgSessionDuration: number;
    topFiles: TopFileData[];
    userActivity: UserActivityData[];
}

export interface TopFileData {
    fileId: string;
    fileName: string;
    views: number;
}

export interface UserActivityData {
    userId: string;
    userName: string;
    lastActivity: string;
    totalTime: number;
}

export interface BackendFileAnalytics {
    fileId: string;
    fileName: string;
    totalViews: number;
    uniqueViewers: number;
    avgSessionDuration: number;
    userActivity: UserActivityData[];
}

export interface BackendUserAnalytics {
    userId: string;
    userName: string;
    totalViews: number;
    totalTime: number;
    lastActivity: string;
    fileActivity: FileActivityData[];
}

export interface FileActivityData {
    fileId: string;
    fileName: string;
    views: number;
    timeSpent: number;
}

export interface TrackingEvent {
    eventType: string;
    dataroomId: string;
    fileId: string;
    sessionId: string;
    timestamp: string;
    sessionDuration?: number;
    additionalData?: Record<string, any>;
}

export interface SaveTrackingEventsDto {
    events: TrackingEvent[];
    metadata?: {
        timestamp?: string;
        userAgent?: string;
        batchSize?: number;
    };
} 