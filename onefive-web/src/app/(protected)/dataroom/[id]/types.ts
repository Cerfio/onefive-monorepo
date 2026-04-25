import { ReactNode } from 'react';

export interface VersionEntry {
    version: number;
    uploadedAt: string;
    uploadedBy: string;
    size: number;
    fileId: string;
}

export interface DataroomFile {
    id: string;
    name: string;
    mimetype: string;
    size: number;
    category: string;
    uploaded: string;
    views: number;
    version: number;
    originalFileId?: string;
    previousVersionId?: string;
    hasNewVersion?: boolean;
    lastVersionUpdate?: string;
    versionHistory?: VersionEntry[];
}

export interface Member {
    id: string;
    profileId?: string;
    name: string;
    email: string;
    avatar: string;
    role?: string;
    createdAt?: string;
}

export enum InvitationStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REFUSED = 'REFUSED'
}

export interface Invitation {
    id: string;
    email: string;
    name: string;
    status: InvitationStatus;
    invitedAt: string;
}

export interface Group {
    id: string;
    name: string;
    memberCount?: number;
    members: Member[];
    invitations: Invitation[];
    categoryAccess: Record<string, boolean>;
    files: DataroomFile[];
}

export interface DataroomCategory {
    id: string;
    name: string;
    fileCount: number;
}

export interface DataroomGroup {
    id: string;
    name: string;
    memberCount: number;
    invitations?: Invitation[];
}

export interface DataroomApiFile {
    id: string;
    name: string;
    size: number;
    mimetype: string;
    category: string;
    viewCount: number;
    createdAt: string;
}

export interface Dataroom {
    id: string;
    name: string | null;
    startupId: string;
    logo?: string | null;
    documentCount: number;
    viewCount: number;
    totalViews: number;
    uniqueViewers: number;
    avgSessionDuration: number;
    categories: DataroomCategory[];
    groups: DataroomGroup[];
    files: DataroomApiFile[];
    lastActivity?: string;
}

export interface DisplayedDocument {
    id: string;
    name: string;
    icon: ReactNode;
    category: string;
    uploaded: string;
    createdAt: string;
    views: number;
    size: string;
    mimetype: string;
    version?: number;
    originalFileId?: string;
    previousVersionId?: string;
    hasNewVersion?: boolean;
    lastVersionUpdate?: string;
    versionHistory?: VersionEntry[];
    viewedByCurrentUser?: boolean;
}

export interface DerivedCategory {
    id: string;
    name: string;
    count: number;
    fileCount: number;
}

export interface DataroomStat {
    label: string;
    value: string | number;
    isTime?: boolean;
}

export interface DirectAccess {
    id: string;
    email: string;
    role: string;
    group: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}
