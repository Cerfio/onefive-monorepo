"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import OnefiveLogo from '@/images/onefiveLogo.png';
import { Button } from "@/components/base/buttons/button";
import Navbar from '@/components/navbar';
import { Skeleton } from "@/components/base/skeleton/skeleton";
import { getDataroom, getDataroomFiles, getSignedUrl, deleteFile as deleteFileApi, createCategory } from "@/queries/dataroom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import "@cyntler/react-doc-viewer/dist/index.css";
import { formatFileSize } from '@/utils/fileUtils';
import { formatStorageSize, formatDate, getFileIcon } from './utils';
import { Group, InvitationStatus, DerivedCategory } from './types';
import { useDataroomMutations } from './hooks/useDataroomMutations';
import { useModalStates } from './hooks/useModalStates';
import { useViewedFiles } from './hooks/useViewedFiles';
import { DataroomMain } from './components/DataroomMain';
import { ConfirmModal } from '@/components/startup/modals/ConfirmModal';
import { UploadModal } from './components/modals/UploadModal';
import { DeleteGroupModal } from './components/modals/DeleteGroupModal';
import { CreateCategoryModal } from "@/components/dataroom/CreateCategoryModal";
import { ShareLinksModal } from "@/components/dataroom/ShareLinksModal";
import { ChangeCategoryModal } from './components/modals/ChangeCategoryModal';
import { InviteToGroupModal } from './components/modals/InviteToGroupModal';
import {
    CreateGroupWithStepsModal,
    RenameCategoryModal,
    DeleteCategoryModal,
    DeleteFileModal,
    RenameFileModal,
    GroupDetailsModal
} from './components/modals';
import { toast } from "sonner";
import { selfProfileType } from '@/queries/profile';

const FILE_SIZE_LIMIT = 50;
const DATAROOM_TOTAL_LIMIT = 1;
const MAX_FILES_PER_UPLOAD = 10;
const MAX_UPLOAD_SIZE_PER_REQUEST = 100;

function parseFileSize(sizeStr: string): number {
    const match = sizeStr.match(/^([\d.]+)\s*(B|KB|MB|GB)$/i);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    const multipliers: Record<string, number> = { 'B': 1, 'KB': 1024, 'MB': 1024 ** 2, 'GB': 1024 ** 3 };
    return value * (multipliers[unit] || 0);
}

const DataroomPage = () => {
    const params = useParams();
    const dataroomId = params.id as string;
    const router = useRouter();
    const queryClient = useQueryClient();
    const mutations = useDataroomMutations(dataroomId);
    const modals = useModalStates();

    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [currentPage, setCurrentPage] = useState(1);
    const [filesToUpload, setFilesToUpload] = useState<{ file: File; category: string }[]>([]);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isShareLinksModalOpen, setIsShareLinksModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);
    const [lastCreatedGroupId, setLastCreatedGroupId] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 20;

    const selfProfile = queryClient.getQueryData(['selfProfile']) as selfProfileType | undefined;
    const currentUserProfileId = selfProfile?.id || '';

    // "Non vu" tracking via localStorage (soft, per-device).
    const { isViewed, markAsViewed } = useViewedFiles(dataroomId, currentUserProfileId);

    // --- Queries ---

    const { data: dataroom, isLoading, isError, error } = useQuery({
        queryKey: ["dataroom", dataroomId],
        queryFn: () => getDataroom({ dataroomId }),
    });

    const { data: files, isLoading: isLoadingFiles, error: filesError } = useQuery({
        queryKey: ["dataroom-files", dataroomId, selectedCategory],
        queryFn: () => getDataroomFiles({ dataroomId, categoryId: selectedCategory === "all" ? undefined : selectedCategory }),
        enabled: !!dataroomId,
        // keepPreviousData removed (deprecated react-query v5) — placeholderData below handles it
        staleTime: 30000,
        placeholderData: (prev: any) => prev,
        refetchOnWindowFocus: false,
        retry: false,
    });

    // --- Derived data (useMemo instead of useEffect + setState) ---

    const storageUsed = useMemo(() => {
        if (!dataroom?.files) return 0;
        return dataroom.files.reduce((total: number, file: any) => total + file.size, 0) / (1024 * 1024);
    }, [dataroom?.files]);

    const categories: DerivedCategory[] = useMemo(() => [
        { id: "all", name: "Tous les fichiers", count: dataroom?.documentCount ?? 0, fileCount: dataroom?.documentCount ?? 0 },
        ...((dataroom?.categories ?? []) as any[])
            .sort((a: any, b: any) => a.name.localeCompare(b.name))
            .map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                count: cat.fileCount ?? 0,
                fileCount: cat.fileCount ?? 0,
            })),
    ], [dataroom?.categories, dataroom?.documentCount]);

    const dataroomStats = useMemo(() => [
        { label: "Documents", value: dataroom?.documentCount || 0 },
        { label: "Vues uniques", value: dataroom?.uniqueViewers || 0 },
        { label: "Vues totales", value: dataroom?.totalViews || dataroom?.viewCount || 0 },
        { label: "Durée moy.", value: Math.floor((dataroom?.avgSessionDuration || 0) / 1000), isTime: true },
    ], [dataroom]);

    const formattedFiles = useMemo(() => {
        if (!files) return [];
        return files.map((file: any) => ({
            id: file.id,
            name: file.name,
            icon: getFileIcon(file.name, file.mimetype),
            category: file.category,
            uploaded: formatDate(file.createdAt),
            createdAt: file.createdAt,
            views: file.viewCount,
            size: formatFileSize(file.size),
            mimetype: file.mimetype,
            viewedByCurrentUser: isViewed(file.id),
        }));
    }, [files, isViewed]);

    const displayedDocuments = useMemo(() => {
        let filtered = formattedFiles;

        if (searchQuery.trim()) {
            filtered = filtered.filter((f: any) =>
                f.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'recent': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'name-asc': return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                case 'name-desc': return b.name.toLowerCase().localeCompare(a.name.toLowerCase());
                case 'size-desc': return parseFileSize(b.size) - parseFileSize(a.size);
                case 'size-asc': return parseFileSize(a.size) - parseFileSize(b.size);
                default: return 0;
            }
        });
    }, [formattedFiles, searchQuery, sortBy]);

    const totalPages = Math.ceil(displayedDocuments.length / ITEMS_PER_PAGE);
    const paginatedDocuments = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return displayedDocuments.slice(start, start + ITEMS_PER_PAGE);
    }, [displayedDocuments, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sortBy, selectedCategory]);

    // --- Side effects ---

    useEffect(() => {
        if (!dataroom?.groups) return;
        setGroups(dataroom.groups.map((group: any) => ({
            id: group.id,
            name: group.name,
            memberCount: group.memberCount,
            members: [],
            invitations: (group.invitations || []).map((inv: any) => ({
                id: inv.id, email: inv.email, name: inv.name,
                status: inv.status as InvitationStatus, invitedAt: inv.invitedAt,
            })),
            categoryAccess: {},
            files: [],
        })));
    }, [dataroom?.groups]);

    useEffect(() => {
        if (!filesError) return;
        const status = (filesError as any)?.response?.status;
        const message = (filesError as any)?.response?.data?.message || (filesError as any)?.message;
        if (status === 403) toast.error("Vous n'avez pas l'autorisation de voir ces fichiers");
        else if (status === 404) toast.error("Cette catégorie n'existe plus");
        else toast.error("Erreur lors du chargement : " + (message || "Erreur inconnue"));
    }, [filesError]);

    // --- File upload handlers (deduplicated) ---

    const processNewFiles = (fileArray: File[]) => {
        const validFiles = fileArray.filter(file => {
            if (file.size > FILE_SIZE_LIMIT * 1024 * 1024) {
                toast.error(`"${file.name}" dépasse la limite de ${FILE_SIZE_LIMIT}MB`);
                return false;
            }
            return true;
        });
        if (validFiles.length === 0) return;

        const currentTotal = filesToUpload.reduce((acc, i) => acc + i.file.size, 0);
        const newTotal = validFiles.reduce((acc, f) => acc + f.size, 0);
        if ((currentTotal + newTotal) / (1024 * 1024) > MAX_UPLOAD_SIZE_PER_REQUEST) {
            toast.error(`Limite de ${MAX_UPLOAD_SIZE_PER_REQUEST}MB par requête dépassée.`);
            return;
        }

        const defaultCategory = categories.find(c => c.id !== 'all')?.id || '';
        setFilesToUpload(prev => [
            ...prev,
            ...validFiles.map(file => ({ file, category: defaultCategory })),
        ]);

        if (validFiles.length < fileArray.length) {
            toast.info(`${validFiles.length} fichier(s) ajouté(s), ${fileArray.length - validFiles.length} ignoré(s).`);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processNewFiles(Array.from(e.target.files));
    };

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files) processNewFiles(Array.from(e.dataTransfer.files));
    };

    const handleUploadSubmit = async () => {
        if (filesToUpload.length === 0) return;
        try {
            setIsUploading(true);
            if (filesToUpload.length > MAX_FILES_PER_UPLOAD) {
                toast.error(`Maximum ${MAX_FILES_PER_UPLOAD} fichiers à la fois.`); return;
            }
            const totalMB = filesToUpload.reduce((a, i) => a + i.file.size, 0) / (1024 * 1024);
            if (totalMB > MAX_UPLOAD_SIZE_PER_REQUEST) {
                toast.error(`Taille totale (${totalMB.toFixed(2)}MB) dépasse la limite.`); return;
            }
            if (storageUsed + totalMB > DATAROOM_TOTAL_LIMIT * 1024) {
                toast.error("Espace de stockage insuffisant."); return;
            }
            if (filesToUpload.some(i => !i.category)) {
                toast.error("Assignez une catégorie à tous les fichiers."); return;
            }

            const formData = new FormData();
            filesToUpload.forEach((item, index) => {
                formData.append(`files[${index}].file`, item.file);
                formData.append(`files[${index}].category`, item.category);
            });

            await mutations.upload.mutateAsync(formData);
            setFilesToUpload([]);
            modals.setIsUploadModalOpen(false);
        } catch {
            // Error handled by mutation
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = async (doc: any) => {
        let toastId: string | number | undefined;
        try {
            const { url } = await getSignedUrl(dataroomId, doc.id, 'download');
            if (!url) { toast.error("Impossible de générer le lien"); return; }

            toastId = toast.loading(`Téléchargement de "${doc.name}" - 0%`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const reader = response.body?.getReader();
            const contentLength = +(response.headers.get('Content-Length') ?? '0');
            if (!reader) throw new Error('Flux non lisible');

            let receivedLength = 0;
            const chunks: Uint8Array[] = [];
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                receivedLength += value.length;
                if (contentLength > 0) {
                    toast.loading(`Téléchargement de "${doc.name}" - ${Math.round((receivedLength / contentLength) * 100)}%`, { id: toastId });
                }
            }

            const blob = new Blob(chunks as BlobPart[]);
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', doc.name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            toast.success(`"${doc.name}" téléchargé`, { id: toastId });
        } catch (error: any) {
            const status = error?.response?.status;
            const msg = status === 403 ? "Vous n'avez pas l'autorisation"
                : status === 404 ? "Ce fichier n'existe plus"
                : "Erreur : " + (error?.message || "Erreur inconnue");
            if (toastId) toast.error(msg, { id: toastId });
            else toast.error(msg);
        }
    };

    // --- Category handlers ---

    const handleCreateCategory = () => {
        const name = modals.newCategoryName.trim();
        if (!name) { modals.setCategoryError("Le nom ne peut pas être vide"); return; }
        mutations.createCategory.mutate(name, {
            onSuccess: () => { modals.setIsCreateCategoryModalOpen(false); modals.resetCategoryForm(); },
            onError: () => modals.setCategoryError("Erreur lors de la création"),
        });
    };

    // Modèle de data room : crée en une fois un jeu de catégories-types de
    // levée (celles qui n'existent pas déjà).
    const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
    const handleApplyCategoryTemplate = async (names: string[]) => {
        const existing = new Set(
            categories.map((c) => (c.name || '').toLowerCase()),
        );
        const toCreate = names.filter((n) => !existing.has(n.toLowerCase()));
        if (toCreate.length === 0) {
            toast.info('Ces catégories existent déjà');
            return;
        }
        setIsApplyingTemplate(true);
        try {
            for (const name of toCreate) {
                await createCategory({ dataroomId, name });
            }
            queryClient.invalidateQueries({ queryKey: ["dataroom", dataroomId] });
            queryClient.invalidateQueries({ queryKey: ["dataroom-files", dataroomId] });
            toast.success(`${toCreate.length} catégorie${toCreate.length > 1 ? 's' : ''} ajoutée${toCreate.length > 1 ? 's' : ''}`);
            modals.setIsCreateCategoryModalOpen(false);
        } catch {
            toast.error("Erreur lors de l'application du modèle");
        } finally {
            setIsApplyingTemplate(false);
        }
    };

    // --- Group handlers ---

    const handleCreateGroup = (data: {
        name: string; hasAllAccess: boolean; canUpload: boolean;
        canShare: boolean; canManageUsers: boolean; canManageGroups: boolean;
    }) => {
        if (!data.name.trim()) return;
        mutations.createGroup.mutate(data, {
            onSuccess: (result) => {
                setLastCreatedGroupId(result?.id || null);
                toast.success(`Groupe "${data.name}" créé`);
            },
            onError: () => modals.setGroupError("Erreur lors de la création du groupe"),
        });
    };

    const handleDeleteGroup = () => {
        if (!modals.selectedGroup) return;
        mutations.deleteGroup.mutate({ groupId: modals.selectedGroup.id }, {
            onSuccess: () => { modals.setIsDeleteGroupModalOpen(false); modals.setSelectedGroup(null); },
        });
    };

    const handleLeaveDataroom = () => setIsLeaveModalOpen(true);

    const confirmLeaveDataroom = async () => {
        try {
            await mutations.leaveDataroom.mutateAsync();
            setIsLeaveModalOpen(false);
            router.push('/dataroom');
        } catch {
            // Toast handled in mutation
        }
    };

    // --- File CRUD handlers ---

    const handleDeleteFile = () => {
        if (!modals.fileToDelete || modals.deleteFileConfirmation !== modals.fileToDelete.name) return;
        mutations.deleteFile.mutate({ fileId: modals.fileToDelete.id }, {
            onSuccess: () => {
                modals.setIsDeleteFileModalOpen(false);
                modals.setDeleteFileConfirmation('');
                modals.setFileToDelete(null);
            },
        });
    };

    // --- Invitation handlers ---

    const handleInviteToGroup = (groupId: string, email: string, name: string = '') => {
        const targetGroup = groups.find(g => g.id === groupId);
        if (targetGroup?.members?.some(m => m.email === email)) {
            toast.error('Cette personne est déjà membre'); return;
        }
        if (targetGroup?.invitations?.some(i => i.email === email && i.status === InvitationStatus.PENDING)) {
            toast.error('Invitation déjà en attente'); return;
        }
        const [firstname, lastname] = name.split(' ');
        mutations.createInvitation.mutate({
            groupId, profileId: currentUserProfileId,
            newUser: { email, firstname: firstname || '', lastname: lastname || '', dataroomName: 'Dataroom' },
        });
    };

    const handleInvitationResponse = (_groupId: string, invitationId: string, status: 'accepted' | 'refused') => {
        if (status === 'accepted') mutations.acceptInvitation.mutate({ invitationId, profileId: currentUserProfileId });
        else mutations.declineInvitation.mutate({ invitationId, profileId: currentUserProfileId });
    };

    const handleCancelInvitation = (_groupId: string, invitationId: string) => {
        mutations.deleteInvitation.mutate({ invitationId, profileId: currentUserProfileId });
    };

    const handleRemoveMember = async (groupId: string, memberId: string) => {
        await mutations.removeMember.mutateAsync({ groupId, memberId });
        setGroups(prev => prev.map(g =>
            g.id === groupId ? { ...g, members: g.members.filter(m => m.id !== memberId) } : g
        ));
    };

    const handleOpenGroupDetails = (group: Group) => {
        mutations.getGroupDetails.mutate(group.id, {
            onSuccess: (data) => {
                modals.setSelectedGroupForModal({
                    id: data.id,
                    name: data.name,
                    members: data.members.map((m: any) => ({
                        id: m.id, profileId: m.profileId,
                        name: m.name || (m.firstName && m.lastName ? `${m.firstName} ${m.lastName}` : 'Membre'),
                        email: m.email || '', role: m.role || 'Membre',
                        avatar: m.avatar || '', createdAt: m.createdAt,
                    })),
                    invitations: data.invitations.map((i: any) => ({
                        id: i.id, email: i.email, name: i.name,
                        status: i.status as InvitationStatus, invitedAt: i.invitedAt,
                    })),
                    categoryAccess: data.permissions?.reduce((acc: Record<string, boolean>, p: any) => {
                        acc[p.categoryId] = p.canView; return acc;
                    }, {}) || {},
                    categoryPermissions: data.permissions?.reduce((acc: Record<string, { canView: boolean; canDownload: boolean; canComment: boolean }>, p: any) => {
                        acc[p.categoryId] = { canView: !!p.canView, canDownload: !!p.canDownload, canComment: !!p.canComment }; return acc;
                    }, {}) || {},
                    files: [],
                });
                modals.setIsGroupDetailsModalOpen(true);
            },
            onError: () => toast.error("Erreur lors du chargement des détails du groupe"),
        });
    };

    const handleUpdatePermissions = (
        groupId: string,
        permissions: Record<string, { canView: boolean; canDownload: boolean; canComment: boolean }>,
    ) => {
        const formatted = Object.entries(permissions).map(([categoryId, p]) => ({
            categoryId, canView: p.canView, canDownload: p.canDownload, canComment: p.canComment,
        }));
        mutations.updateGroupPermissions.mutate({ groupId, permissions: formatted });
        setGroups(prev => prev.map(g =>
            g.id === groupId
                ? { ...g, categoryAccess: Object.fromEntries(Object.entries(permissions).map(([k, p]) => [k, p.canView])) }
                : g
        ));
    };

    // --- Adapted data for child components ---

    const adaptedGroups = groups.map(group => ({
        ...group,
        memberCount: group.memberCount ?? group.members.length,
    }));

    const adaptedDataroom = dataroom ? {
        ...dataroom,
        id: (dataroom as any).id || dataroomId,
        name: (dataroom as any).name || 'Dataroom',
        lastActivity: (dataroom as any).lastActivity || new Date().toISOString(),
    } : undefined;

    const isFilteringFiles = isLoadingFiles && !files;

    // --- Loading state ---

    if (isLoading || isLoadingFiles) {
        return (
            <div className="bg-[#FCFCFD] min-h-screen">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header skeleton */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <Skeleton className="w-10 h-10 rounded-lg" />
                                    <div>
                                        <Skeleton className="h-7 w-40 mb-2" />
                                        <Skeleton className="h-4 w-72" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-4">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Skeleton className="h-10 w-28 rounded-lg" />
                                <Skeleton className="h-10 w-40 rounded-lg" />
                            </div>
                        </div>
                        <div className="mt-5 pt-5 border-t border-gray-100">
                            <Skeleton className="h-2 w-full rounded" />
                        </div>
                    </div>

                    {/* Stats skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                        ))}
                    </div>

                    {/* Content skeleton */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <Skeleton className="h-5 w-24 mb-4" />
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-8 w-full mb-2 rounded-lg" />
                                ))}
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <Skeleton className="h-5 w-32 mb-4" />
                                {[1, 2].map((i) => (
                                    <Skeleton key={i} className="h-8 w-full mb-2 rounded-lg" />
                                ))}
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                                <Skeleton className="h-10 w-full rounded-lg" />
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
                                        <Skeleton className="w-5 h-5 rounded" />
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-5 w-20 rounded-full ml-auto" />
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // --- Error states ---

    if (isError) {
        const errorStatus = (error as any)?.response?.status || (error as any)?.status;
        const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message;

        if (errorStatus === 404) {
            return (
                <div className="min-h-screen bg-[#FCFCFD] flex items-center justify-center">
                    <div className="text-center space-y-6 max-w-md mx-auto px-4">
                        <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
                            <Image quality={100} width={48} height={48} src={OnefiveLogo} alt="Onefive logo" />
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-2xl font-bold text-gray-900">Dataroom non trouvée</h1>
                            <p className="text-gray-600">Cette dataroom n'existe pas ou vous n'avez pas les permissions pour y accéder.</p>
                        </div>
                        <div className="space-y-3">
                            <Button onClick={() => router.push('/dataroom')} className="w-full bg-[#5E6AD2] hover:bg-[#4C59BD] text-white">
                                Retour aux datarooms
                            </Button>
                            <p className="text-sm text-gray-500">Si vous pensez qu'il s'agit d'une erreur, contactez la personne qui vous a partagé ce lien.</p>
                        </div>
                    </div>
                </div>
            );
        }

        if (errorStatus === 403) {
            return (
                <div className="min-h-screen bg-[#FCFCFD] flex items-center justify-center">
                    <div className="text-center space-y-6 max-w-md mx-auto px-4">
                        <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
                            <Image quality={100} width={96} height={96} src={OnefiveLogo} alt="OneFive Logo" className="object-contain opacity-75" />
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-2xl font-bold text-gray-900">Accès refusé</h1>
                            <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette dataroom.</p>
                        </div>
                        <div className="space-y-3">
                            <Button onClick={() => router.push('/dataroom')} className="w-full bg-[#5E6AD2] hover:bg-[#4C59BD] text-white">
                                Retour aux datarooms
                            </Button>
                            <p className="text-sm text-gray-500">Contactez l'administrateur de cette dataroom pour demander l'accès.</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-[#FCFCFD] flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md mx-auto px-4">
                    <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
                        <Image quality={100} width={96} height={96} src={OnefiveLogo} alt="OneFive Logo" className="object-contain opacity-75" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-2xl font-bold text-gray-900">Erreur de chargement</h1>
                        <p className="text-gray-600">Une erreur est survenue lors du chargement de la dataroom.</p>
                        {errorMessage && <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">{errorMessage}</p>}
                    </div>
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <Button onClick={() => window.location.reload()} color="secondary" size="md" className="flex-1">Réessayer</Button>
                            <Button onClick={() => router.push('/dataroom')} color="primary" size="md" className="flex-1">Retour</Button>
                        </div>
                        <p className="text-sm text-gray-500">Si le problème persiste, contactez le support technique.</p>
                    </div>
                </div>
            </div>
        );
    }

    // --- Render ---

    return (
        <div className="bg-[#FCFCFD] min-h-screen">
            <Navbar />

            <DataroomMain
                dataroom={adaptedDataroom as any}
                isOwner={Boolean((dataroom as any)?.isOwner)}
                onOpenShareLinks={() => setIsShareLinksModalOpen(true)}
                categories={categories}
                groups={adaptedGroups as any}
                displayedDocuments={paginatedDocuments}
                totalDocuments={displayedDocuments.length}
                selectedCategory={selectedCategory}
                storageUsed={storageUsed}
                storagePercentage={storageUsed / (DATAROOM_TOTAL_LIMIT * 1024) * 100}
                dataroomStats={dataroomStats}
                isFilteringFiles={isFilteringFiles}
                searchQuery={searchQuery}
                sortBy={sortBy}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onSetSearchQuery={setSearchQuery}
                onSetSortBy={setSortBy}
                onSetSelectedCategory={setSelectedCategory}
                onSetIsUploadModalOpen={modals.setIsUploadModalOpen}
                onSetIsCreateCategoryModalOpen={modals.setIsCreateCategoryModalOpen}
                onSetIsCreateGroupModalOpen={modals.setIsCreateGroupModalOpen}
                onSetIsRenameCategoryModalOpen={modals.setIsRenameCategoryModalOpen}
                onSetIsDeleteCategoryModalOpen={modals.setIsDeleteCategoryModalOpen}
                onSetIsDeleteGroupModalOpen={modals.setIsDeleteGroupModalOpen}
                onSetIsDeleteFileModalOpen={modals.setIsDeleteFileModalOpen}
                onSetIsRenameFileModalOpen={modals.setIsRenameFileModalOpen}
                onSetIsChangeCategoryModalOpen={modals.setIsChangeCategoryModalOpen}
                onSetCategoryToEdit={modals.setCategoryToEdit}
                onSetRenameCategoryName={modals.setRenameCategoryName}
                onSetSelectedGroup={modals.setSelectedGroup}
                onSetNewGroupName={modals.setNewGroupName}
                onSetFileToDelete={modals.setFileToDelete}
                onSetFileToRename={modals.setFileToRename}
                onSetNewFileName={modals.setNewFileName}
                onSetFileToChangeCategory={modals.setFileToChangeCategory}
                onSetNewFileCategoryId={modals.setNewFileCategoryId}
                onHandleDocumentClick={(doc) => {
                    markAsViewed(doc.id);
                    window.open(`/dataroom/${dataroomId}/file/${doc.id}`, '_blank');
                }}
                onHandleDownload={handleDownload}
                formatStorageSize={formatStorageSize}
                DATAROOM_TOTAL_LIMIT={DATAROOM_TOTAL_LIMIT}
                onLeaveDataroom={handleLeaveDataroom}
                isLeavingDataroom={mutations.leaveDataroom.isLoading}
                onInvite={(groupId) => { modals.setInviteTargetGroupId(groupId); modals.setIsInviteModalOpen(true); }}
                onInvitationResponse={handleInvitationResponse}
                onOpenGroupDetails={handleOpenGroupDetails}
                onDirectFilesDrop={(files) => {
                    processNewFiles(files);
                    modals.setIsUploadModalOpen(true);
                }}
                onBulkDelete={async (ids) => {
                    // Bypass per-file mutation toasts; use raw API + a single aggregate toast.
                    const results = await Promise.allSettled(
                        ids.map(id => deleteFileApi({ dataroomId, fileId: id }))
                    );
                    const failures = results.filter(r => r.status === 'rejected').length;
                    const successes = ids.length - failures;
                    queryClient.invalidateQueries({ queryKey: ["dataroom-files", dataroomId] });
                    queryClient.invalidateQueries({ queryKey: ["dataroom", dataroomId] });
                    if (successes > 0) {
                        toast.success(`${successes} fichier(s) supprimé(s)`);
                    }
                    if (failures > 0) {
                        toast.error(`${failures} suppression(s) en échec`);
                    }
                }}
            />

            <UploadModal
                isOpen={modals.isUploadModalOpen}
                onClose={() => modals.setIsUploadModalOpen(false)}
                filesToUpload={filesToUpload}
                setFilesToUpload={setFilesToUpload}
                handleFileChange={handleFileChange}
                handleFileDrop={handleFileDrop}
                handleRemoveFile={(index: number) => {
                    setFilesToUpload(prev => prev.filter((_, i) => i !== index));
                }}
                handleCategoryChange={(index: number, category: string) => {
                    setFilesToUpload(prev => prev.map((item, i) => i === index ? { ...item, category } : item));
                }}
                categories={categories}
                onUpload={handleUploadSubmit}
                isUploading={isUploading}
                uploadError=""
                uploadLimit={Math.min(
                    MAX_UPLOAD_SIZE_PER_REQUEST * 1024 * 1024,
                    Math.max(0, (DATAROOM_TOTAL_LIMIT * 1024 - storageUsed) * 1024 * 1024)
                )}
            />

            <DeleteGroupModal
                isOpen={modals.isDeleteGroupModalOpen}
                onClose={() => modals.setIsDeleteGroupModalOpen(false)}
                group={modals.selectedGroup ? { ...modals.selectedGroup, members: [], categoryAccess: {}, files: [], invitations: [] } : null}
                onConfirm={handleDeleteGroup}
            />

            <CreateCategoryModal
                isOpen={modals.isCreateCategoryModalOpen}
                onOpenChange={modals.setIsCreateCategoryModalOpen}
                newCategoryName={modals.newCategoryName}
                setNewCategoryName={modals.setNewCategoryName}
                categoryError={modals.categoryError || ""}
                setCategoryError={modals.setCategoryError}
                handleCreateCategory={handleCreateCategory}
                createCategoryMutation={mutations.createCategory}
                dataroom={adaptedDataroom}
                onApplyTemplate={handleApplyCategoryTemplate}
                isApplyingTemplate={isApplyingTemplate}
            />

            <CreateGroupWithStepsModal
                isOpen={modals.isCreateGroupModalOpen}
                onClose={() => { modals.setIsCreateGroupModalOpen(false); setLastCreatedGroupId(null); }}
                currentStep={modals.currentStep}
                setCurrentStep={modals.setCurrentStep}
                slideDirection={modals.slideDirection}
                setSlideDirection={modals.setSlideDirection}
                newGroupName={modals.newGroupName}
                setNewGroupName={modals.setNewGroupName}
                groupError={modals.groupError || ""}
                setGroupError={modals.setGroupError}
                groups={adaptedGroups as any}
                categories={categories}
                selectedCategories={modals.selectedCategories}
                setSelectedCategories={modals.setSelectedCategories}
                onCreateGroup={() => handleCreateGroup({
                    name: modals.newGroupName,
                    hasAllAccess: false, canUpload: false, canShare: false,
                    canManageUsers: false, canManageGroups: false,
                })}
                onInviteToGroup={handleInviteToGroup}
                lastCreatedGroupId={lastCreatedGroupId}
            />

            <RenameCategoryModal
                isOpen={modals.isRenameCategoryModalOpen}
                onClose={() => modals.setIsRenameCategoryModalOpen(false)}
                categoryToEdit={modals.categoryToEdit ? {
                    ...modals.categoryToEdit,
                    count: categories.find(c => c.id === modals.categoryToEdit?.id)?.count,
                } : null}
                renameCategoryName={modals.renameCategoryName}
                setRenameCategoryName={modals.setRenameCategoryName}
                renameCategoryError={modals.renameCategoryError || ""}
                setRenameCategoryError={modals.setRenameCategoryError}
                updateCategoryMutation={mutations.updateCategory}
                dataroom={adaptedDataroom}
            />

            <DeleteCategoryModal
                isOpen={modals.isDeleteCategoryModalOpen}
                onClose={() => modals.setIsDeleteCategoryModalOpen(false)}
                categoryToEdit={modals.categoryToEdit ? {
                    ...modals.categoryToEdit,
                    count: categories.find(c => c.id === modals.categoryToEdit?.id)?.count,
                } : null}
                deleteConfirmationName={modals.deleteConfirmationName}
                setDeleteConfirmationName={modals.setDeleteConfirmationName}
                deleteCategoryMutation={mutations.deleteCategory}
            />

            <DeleteFileModal
                isOpen={modals.isDeleteFileModalOpen}
                onClose={() => modals.setIsDeleteFileModalOpen(false)}
                fileToDelete={modals.fileToDelete}
                deleteFileConfirmation={modals.deleteFileConfirmation}
                setDeleteFileConfirmation={modals.setDeleteFileConfirmation}
                onDeleteFile={handleDeleteFile}
            />

            <RenameFileModal
                isOpen={modals.isRenameFileModalOpen}
                onClose={() => modals.setIsRenameFileModalOpen(false)}
                fileToRename={modals.fileToRename}
                newFileName={modals.newFileName}
                setNewFileName={modals.setNewFileName}
                renameFileError={modals.renameFileError || ""}
                setRenameFileError={modals.setRenameFileError}
                updateFileMutation={mutations.updateFile}
                displayedDocuments={displayedDocuments}
            />

            <ChangeCategoryModal
                isOpen={modals.isChangeCategoryModalOpen}
                onClose={() => modals.setIsChangeCategoryModalOpen(false)}
                fileToChangeCategory={modals.fileToChangeCategory}
                newFileCategoryId={modals.newFileCategoryId}
                setNewFileCategoryId={modals.setNewFileCategoryId}
                changeCategoryError={modals.changeCategoryError || ""}
                setChangeCategoryError={modals.setChangeCategoryError}
                updateFileMutation={mutations.changeFileCategory}
                categories={categories}
            />

            <InviteToGroupModal
                isOpen={modals.isInviteModalOpen}
                onClose={() => modals.setIsInviteModalOpen(false)}
                inviteSearch={modals.inviteSearch}
                setInviteSearch={modals.setInviteSearch}
                inviteEmail={modals.inviteEmail}
                setInviteEmail={modals.setInviteEmail}
                selectedProfile={modals.selectedProfile}
                setSelectedProfile={modals.setSelectedProfile}
                inviteTargetGroupId={modals.inviteTargetGroupId || ''}
                groups={adaptedGroups as any}
                onInviteToGroup={handleInviteToGroup}
                isLoading={mutations.createInvitation.isLoading}
            />

            <GroupDetailsModal
                isOpen={modals.isGroupDetailsModalOpen}
                onClose={() => { modals.setIsGroupDetailsModalOpen(false); modals.setSelectedGroupForModal(null); }}
                group={modals.selectedGroupForModal}
                categories={categories}
                onUpdatePermissions={handleUpdatePermissions}
                onInvite={handleInviteToGroup}
                onInvitationResponse={handleInvitationResponse}
                onRemoveMember={handleRemoveMember}
                onCancelInvitation={handleCancelInvitation}
            />

            <ShareLinksModal
                open={isShareLinksModalOpen}
                onClose={() => setIsShareLinksModalOpen(false)}
                dataroomId={dataroomId}
                groups={groups.map((g) => ({ id: g.id, name: g.name }))}
            />

            <ConfirmModal
                open={isLeaveModalOpen}
                onOpenChange={setIsLeaveModalOpen}
                title="Quitter cette dataroom ?"
                description="Vous perdrez l'accès immédiatement. Il faudra une nouvelle invitation pour y revenir."
                confirmLabel="Quitter"
                variant="danger"
                isLoading={mutations.leaveDataroom.isPending}
                onConfirm={confirmLeaveDataroom}
            />
        </div>
    );
};

export default DataroomPage;
