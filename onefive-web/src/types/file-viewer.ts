export interface Comment {
    id: string;
    text: string;
    author: string;
    timestamp: Date;
    pageNumber: number;
}

export interface Reply {
    id: string;
    text: string;
    author: string;
    timestamp: Date;
}

export interface CommentThread {
    id: string;
    text: string;
    author: string;
    timestamp: Date;
    replies: Reply[];
}

export interface ModernReply {
    id: string;
    text: string;
    author: string;
    timestamp: Date;
}

export interface ModernComment {
    id: string;
    text: string;
    author: string;
    timestamp: Date;
    replies: ModernReply[];
}

export interface VideoEvent {
    type: 'play' | 'pause' | 'timeupdate' | 'ended' | 'seeked';
    timestamp: Date;
    currentTime: number;
    duration: number;
    percentage: number;
}

export interface VideoChapter {
    id: string;
    title: string;
    startTime: number;
    endTime: number;
}

export interface VideoReaction {
    id: string;
    type: 'like' | 'question' | 'important';
    timestamp: number;
    author: string;
}

export interface FileDocument {
    uri: string;
    fileName: string;
    mimetype: string;
}

export interface UploaderInfo {
    firstName: string;
    lastName: string;
    avatar: string;
    headline: string;
}

export interface StartupInfo {
    name: string;
    logo: string;
    headline: string;
}

export interface FileMetadata {
    id: string;
    name: string;
    size: number;
    mimetype: string;
    storageId: string;
    category: { id: string; name: string };
    uploadedBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface SessionData {
    eventType: string;
    dataroomId: string;
    fileId: string;
    sessionDuration?: number;
    currentPage?: number;
    currentTime?: number;
    duration?: number;
    percentage?: number;
    timestamp: string;
} 