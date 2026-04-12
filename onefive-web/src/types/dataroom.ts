export interface File {
    id: string;
    name: string;
    mimeType: string;
    size: number;
}

export interface Member {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface Group {
    id: string;
    name: string;
    memberCount: number;
    categoryAccess: Record<string, boolean>;
    files: Document[];
}

export interface DirectAccess {
    id: string;
    userId: string;
    name: string;
    email: string;
    avatar: string;
    categoryAccess: Record<string, boolean>;
}

export interface UserProfile {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    headline?: string;
    avatar?: string;
}

export interface Dataroom {
    id: string;
    viewCount: number;
    documentCount: number;
    lastActivity: string;
    categories: { name: string; fileCount: number; }[];
    groups: { name: string; memberCount: number; }[];
    files: { viewCount: number; category: string; }[];
}

export interface DataroomFile {
    id: string;
    name: string;
    mimeType: string;
    size: number;
}

export interface Category {
    id: string;
    name: string;
    fileCount: number;
}

export interface Document {
    id: string;
    name: string;
    icon: React.ReactNode;
    category: string;
    uploaded: string;
    views: number;
    size: string;
    mimetype: string;
} 