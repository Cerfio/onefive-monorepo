import React, { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    Reply,
    Trash2,
    Send,
    Download,
    Pencil,
    X,
    Check,
    Info,
    Keyboard,
    SkipBack,
    SkipForward,
} from "lucide-react";
import { Tooltip } from "@/components/base/tooltip/tooltip";
import type { FileComment } from "@/queries/dataroom-comments";
import type { FileMetadata } from "@/types/file-viewer";
import { getFileTypeLabel } from "@/utils/file-utils";
import type { KeyboardShortcut } from "@/hooks/useKeyboardShortcuts";

interface NavigationBarProps {
    fileName?: string;
    fileType: string;
    comments: FileComment[];
    isCommentsPanelOpen: boolean;
    setIsCommentsPanelOpen: (open: boolean) => void;
    pageNumber?: number;
    totalPages?: number;
    onPreviousPage?: () => void;
    onNextPage?: () => void;
    onAddComment: (content: string, pageNumber?: number, parentId?: string) => void;
    onDeleteComment?: (commentId: string) => void;
    onEditComment?: (commentId: string, content: string) => void;
    onScrollToPage?: (page: number) => void;
    isCreating?: boolean;
    currentProfileId?: string;
    onDownload?: () => void;
    onPrevFile?: () => void;
    onNextFile?: () => void;
    hasPrevFile?: boolean;
    hasNextFile?: boolean;
    fileMetadata?: FileMetadata;
    viewCount?: number;
    shortcuts?: KeyboardShortcut[];
}

const AuthorAvatar = ({ author }: { author: FileComment['author'] }) => {
    const avatarUrl = author.avatar?.url;
    const initials = `${author.firstName.charAt(0)}${author.lastName.charAt(0)}`;

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={`${author.firstName} ${author.lastName}`}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
        );
    }

    return (
        <div className="w-8 h-8 rounded-full bg-[#5E6AD2] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-medium">{initials}</span>
        </div>
    );
};

const formatCommentDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);

    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `il y a ${diffMin}min`;
    if (diffH < 24) return `il y a ${diffH}h`;
    if (diffD < 7) return `il y a ${diffD}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 octets';
    const k = 1024;
    const sizes = ['octets', 'Ko', 'Mo', 'Go', 'To'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ShortcutHelpSheet = ({ shortcuts }: { shortcuts: KeyboardShortcut[] }) => {
    const categories = shortcuts.reduce((acc, s) => {
        const cat = s.category || 'Général';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(s);
        return acc;
    }, {} as Record<string, KeyboardShortcut[]>);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="p-2 text-gray-400 hover:text-[#5E6AD2] transition-colors hidden sm:block">
                    <Keyboard className="h-4 w-4" />
                </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[360px] p-0">
                <div className="h-full flex flex-col">
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle>Raccourcis clavier</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-auto p-4 space-y-6">
                        {Object.entries(categories).map(([category, items]) => (
                            <div key={category}>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{category}</h3>
                                <div className="space-y-1.5">
                                    {items.map((s) => (
                                        <div key={s.label} className="flex items-center justify-between py-1">
                                            <span className="text-sm text-gray-700">{s.description}</span>
                                            <kbd className="px-2 py-0.5 text-xs font-mono bg-gray-100 border border-gray-200 rounded text-gray-600">
                                                {s.label}
                                            </kbd>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

const MobileInfoSheet = ({ fileMetadata, viewCount }: { fileMetadata?: FileMetadata; viewCount?: number }) => {
    if (!fileMetadata) return null;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="p-2 text-gray-600 hover:text-[#5E6AD2] transition-colors md:hidden">
                    <Info className="h-5 w-5" />
                </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-xl max-h-[60vh]">
                <SheetHeader className="pb-3">
                    <SheetTitle>Informations du fichier</SheetTitle>
                </SheetHeader>
                <div className="space-y-3 pb-4">
                    <InfoRow label="Type" value={getFileTypeLabel(fileMetadata.mimetype)} />
                    <InfoRow label="Taille" value={formatFileSize(fileMetadata.size)} />
                    {fileMetadata.category && <InfoRow label="Catégorie" value={fileMetadata.category.name} />}
                    {viewCount !== undefined && <InfoRow label="Vues" value={`${viewCount}`} />}
                    {fileMetadata.createdAt && (
                        <InfoRow label="Ajouté le" value={new Date(fileMetadata.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })} />
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
);

const NavigationBar: React.FC<NavigationBarProps> = ({
    fileName,
    fileType,
    comments,
    isCommentsPanelOpen,
    setIsCommentsPanelOpen,
    pageNumber,
    totalPages,
    onPreviousPage,
    onNextPage,
    onAddComment,
    onDeleteComment,
    onEditComment,
    onScrollToPage,
    isCreating,
    currentProfileId,
    onDownload,
    onPrevFile,
    onNextFile,
    hasPrevFile,
    hasNextFile,
    fileMetadata,
    viewCount,
    shortcuts,
}) => {
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<{ id: string; authorName: string } | null>(null);
    const [commentPage, setCommentPage] = useState<'current' | 'general'>('general');
    const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);

    const handleSubmit = () => {
        if (!newComment.trim()) return;
        const targetPage = commentPage === 'current' && pageNumber ? pageNumber : undefined;
        onAddComment(newComment.trim(), targetPage, replyingTo?.id);
        setNewComment("");
        setReplyingTo(null);
    };

    const handleEditSave = () => {
        if (!editingComment || !editingComment.content.trim()) return;
        onEditComment?.(editingComment.id, editingComment.content.trim());
        setEditingComment(null);
    };

    const totalComments = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

    const renderCommentContent = (comment: { id: string; content: string; author: FileComment['author']; createdAt: string }, isReply = false) => {
        const isOwn = currentProfileId === comment.author.id;
        const isEditing = editingComment?.id === comment.id;

        return (
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                            {comment.author.firstName} {comment.author.lastName}
                        </p>
                        <span className="text-xs text-gray-400">
                            {formatCommentDate(comment.createdAt)}
                        </span>
                    </div>
                    {isOwn && !isEditing && (
                        <div className="flex items-center space-x-0.5">
                            {onEditComment && (
                                <button
                                    onClick={() => setEditingComment({ id: comment.id, content: comment.content })}
                                    className="p-1 text-gray-300 hover:text-[#5E6AD2] transition-colors"
                                >
                                    <Pencil className="h-3 w-3" />
                                </button>
                            )}
                            {onDeleteComment && (
                                <button
                                    onClick={() => onDeleteComment(comment.id)}
                                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
                {isEditing ? (
                    <div className="mt-1 space-y-2">
                        <textarea
                            value={editingComment.content}
                            onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] focus:border-transparent resize-none"
                            rows={2}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSave(); }
                                if (e.key === 'Escape') setEditingComment(null);
                            }}
                        />
                        <div className="flex items-center space-x-1.5">
                            <button
                                onClick={handleEditSave}
                                disabled={!editingComment.content.trim()}
                                className="p-1 text-[#5E6AD2] hover:bg-[#5E6AD2]/10 rounded transition-colors disabled:opacity-50"
                            >
                                <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => setEditingComment(null)}
                                className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
                        {!isReply && (
                            <button
                                onClick={() => setReplyingTo({
                                    id: comment.id,
                                    authorName: `${comment.author.firstName} ${comment.author.lastName}`,
                                })}
                                className="flex items-center space-x-1 mt-2 text-xs text-gray-400 hover:text-[#5E6AD2] transition-colors"
                            >
                                <Reply className="h-3 w-3" />
                                <span>Répondre</span>
                            </button>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{fileName}</h1>
                <span className="px-2 py-1 text-xs font-medium text-[#5E6AD2] bg-[#5E6AD2]/10 rounded-full flex-shrink-0">
                    {getFileTypeLabel(fileType)}
                </span>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
                <MobileInfoSheet fileMetadata={fileMetadata} viewCount={viewCount} />

                {(hasPrevFile || hasNextFile) && (
                    <div className="hidden sm:flex items-center space-x-1 border-r border-gray-200 pr-2 mr-1">
                        <Tooltip delay={300} title="Fichier précédent (J)">
                            <button
                                onClick={onPrevFile}
                                disabled={!hasPrevFile}
                                className="p-1.5 text-gray-500 hover:text-[#5E6AD2] disabled:opacity-30 transition-colors"
                            >
                                <SkipBack className="h-4 w-4" />
                            </button>
                        </Tooltip>
                        <Tooltip delay={300} title="Fichier suivant (K)">
                            <button
                                onClick={onNextFile}
                                disabled={!hasNextFile}
                                className="p-1.5 text-gray-500 hover:text-[#5E6AD2] disabled:opacity-30 transition-colors"
                            >
                                <SkipForward className="h-4 w-4" />
                            </button>
                        </Tooltip>
                    </div>
                )}

                {onDownload && (
                    <Tooltip delay={300} title="Télécharger (D)">
                        <button
                            onClick={onDownload}
                            className="p-2 text-gray-600 hover:text-[#5E6AD2] transition-colors"
                        >
                            <Download className="h-5 w-5" />
                        </button>
                    </Tooltip>
                )}

                <Sheet open={isCommentsPanelOpen} onOpenChange={(open) => {
                    setIsCommentsPanelOpen(open);
                    if (!open) { setReplyingTo(null); setEditingComment(null); }
                }}>
                    <SheetTrigger asChild>
                        <button className="p-2 text-gray-600 hover:text-[#5E6AD2] relative transition-colors">
                            <MessageCircle className="h-5 w-5" />
                            {totalComments > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#5E6AD2] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                    {totalComments}
                                </span>
                            )}
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[400px] sm:w-[480px] p-0">
                        <div className="h-full flex flex-col">
                            <SheetHeader className="p-4 border-b">
                                <SheetTitle>Commentaires ({totalComments})</SheetTitle>
                            </SheetHeader>
                            <div className="flex-1 overflow-auto p-4 space-y-4 bg-gray-50">
                                {comments.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        <MessageCircle className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                                        <p className="text-sm">Aucun commentaire</p>
                                        <p className="text-xs text-gray-400 mt-1">Soyez le premier à commenter</p>
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className={`space-y-2 ${comment.id.startsWith('optimistic-') ? 'opacity-60' : ''}`}>
                                            <div className="bg-white p-3 rounded-lg shadow-sm">
                                                <div className="flex items-start space-x-3">
                                                    <AuthorAvatar author={comment.author} />
                                                    <div className="flex-1 min-w-0">
                                                        {comment.pageNumber && (
                                                            <button
                                                                onClick={() => onScrollToPage?.(comment.pageNumber!)}
                                                                className="text-xs text-[#5E6AD2] hover:underline mb-1"
                                                            >
                                                                Page {comment.pageNumber}
                                                            </button>
                                                        )}
                                                        {renderCommentContent(comment)}
                                                    </div>
                                                </div>
                                            </div>

                                            {comment.replies.length > 0 && (
                                                <div className="ml-8 space-y-2">
                                                    {comment.replies.map((reply) => (
                                                        <div key={reply.id} className={`bg-white p-3 rounded-lg shadow-sm border-l-2 border-[#5E6AD2]/20 ${reply.id.startsWith('optimistic-') ? 'opacity-60' : ''}`}>
                                                            <div className="flex items-start space-x-2.5">
                                                                <AuthorAvatar author={reply.author} />
                                                                {renderCommentContent(reply, true)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 border-t bg-white">
                                {replyingTo && (
                                    <div className="flex items-center justify-between mb-2 px-2 py-1.5 bg-[#5E6AD2]/5 rounded-md">
                                        <span className="text-xs text-[#5E6AD2]">
                                            Réponse à {replyingTo.authorName}
                                        </span>
                                        <button
                                            onClick={() => setReplyingTo(null)}
                                            className="text-xs text-gray-400 hover:text-gray-600"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                )}
                                {!replyingTo && pageNumber !== undefined && totalPages !== undefined && (
                                    <div className="flex items-center space-x-2 mb-2">
                                        <select
                                            value={commentPage}
                                            onChange={(e) => setCommentPage(e.target.value as 'current' | 'general')}
                                            className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600"
                                        >
                                            <option value="general">Général</option>
                                            <option value="current">Page {pageNumber}</option>
                                        </select>
                                    </div>
                                )}
                                <div className="flex space-x-2">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder={replyingTo ? "Écrire une réponse..." : "Ajouter un commentaire..."}
                                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] focus:border-transparent resize-none"
                                        rows={2}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSubmit();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!newComment.trim() || isCreating}
                                        className="self-end bg-[#5E6AD2] text-white p-2.5 rounded-lg hover:bg-[#5E6AD2]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                {pageNumber !== undefined && totalPages !== undefined && (
                    <>
                        <button
                            onClick={onPreviousPage}
                            disabled={pageNumber <= 1}
                            className="p-2 text-gray-600 hover:text-[#5E6AD2] disabled:opacity-50 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="text-sm text-gray-600 tabular-nums">
                            {pageNumber} / {totalPages}
                        </span>
                        <button
                            onClick={onNextPage}
                            disabled={pageNumber >= totalPages}
                            className="p-2 text-gray-600 hover:text-[#5E6AD2] disabled:opacity-50 transition-colors"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}

                {shortcuts && shortcuts.length > 0 && <ShortcutHelpSheet shortcuts={shortcuts} />}
            </div>
        </div>
    );
};

export default NavigationBar;
