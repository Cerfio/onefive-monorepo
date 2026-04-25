"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Eye,
    FolderClosed,
    Plus,
    Clock,
    ChevronDown,
    X,
    Folder,
} from "@untitledui/icons";
import { InfoIcon, BarChart3, Download, Trash2, Search, Lock, Upload, Users, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Badge } from "@/components/base/badges/badges";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { Table, TableCard } from "@/components/application/table/table";
import { PaginationPageDefault } from "@/components/application/pagination/pagination";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import NumberFlow from '@number-flow/react';
import { Dataroom, Group, DisplayedDocument, DerivedCategory, DataroomStat } from '../types';
import { getFileIcon } from '../utils';
import { UploadNewVersionModal } from './UploadNewVersionModal';
import { VersionHistoryModal } from './VersionHistoryModal';
import { FileText } from "lucide-react";

const CATEGORY_BADGE_COLORS = [
    "brand", "success", "purple", "blue", "indigo",
    "orange", "pink", "blue-light", "warning", "gray-blue",
] as const;

function getCategoryColor(categoryName: string): typeof CATEGORY_BADGE_COLORS[number] {
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
        hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return CATEGORY_BADGE_COLORS[Math.abs(hash) % CATEGORY_BADGE_COLORS.length];
}

interface DataroomMainProps {
    dataroom: Dataroom | undefined;
    categories: DerivedCategory[];
    groups: Group[];
    displayedDocuments: DisplayedDocument[];
    selectedCategory: string;
    storageUsed: number;
    storagePercentage: number;
    dataroomStats: DataroomStat[];
    totalDocuments: number;
    isFilteringFiles: boolean;
    searchQuery: string;
    sortBy: string;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onSetSearchQuery: (query: string) => void;
    onSetSortBy: (sortBy: string) => void;
    onSetSelectedCategory: (categoryId: string) => void;
    onSetIsUploadModalOpen: (open: boolean) => void;
    onSetIsCreateCategoryModalOpen: (open: boolean) => void;
    onSetIsCreateGroupModalOpen: (open: boolean) => void;
    onSetIsRenameCategoryModalOpen: (open: boolean) => void;
    onSetIsDeleteCategoryModalOpen: (open: boolean) => void;
    onSetIsDeleteGroupModalOpen: (open: boolean) => void;
    onSetIsDeleteFileModalOpen: (open: boolean) => void;
    onSetIsRenameFileModalOpen: (open: boolean) => void;
    onSetIsChangeCategoryModalOpen: (open: boolean) => void;
    onSetCategoryToEdit: (category: any) => void;
    onSetRenameCategoryName: (name: string) => void;
    onSetSelectedGroup: (group: Group) => void;
    onSetNewGroupName: (name: string) => void;
    onSetFileToDelete: (file: { id: string; name: string }) => void;
    onSetFileToRename: (file: { id: string; name: string }) => void;
    onSetNewFileName: (name: string) => void;
    onSetFileToChangeCategory: (file: { id: string; name: string; category: string }) => void;
    onSetNewFileCategoryId: (categoryId: string) => void;
    onHandleDocumentClick: (doc: any) => void;
    onHandleDownload: (doc: any) => void;
    formatStorageSize: (sizeInMB: number) => string;
    DATAROOM_TOTAL_LIMIT: number;
    onLeaveDataroom: () => void;
    isLeavingDataroom: boolean;
    onInvite: (groupId: string) => void;
    onInvitationResponse: (groupId: string, invitationId: string, status: 'accepted' | 'refused') => void;
    onOpenGroupDetails: (group: Group) => void;
    onUploadNewVersion: (file: File, documentId: string) => Promise<void>;
    onDownloadVersion: (versionId: string, version: number) => void;
    onViewVersion: (versionId: string, version: number) => void;
    onDirectFilesDrop?: (files: File[]) => void;
    onBulkDelete?: (ids: string[]) => Promise<void>;
    isOwner?: boolean;
}

const AccessGroupsSidebar: React.FC<{
    groups: Group[];
    onOpenGroupDetails: (group: Group) => void;
    onSetSelectedGroup: (group: Group) => void;
    onSetNewGroupName: (name: string) => void;
    onSetIsDeleteGroupModalOpen: (open: boolean) => void;
    onSetIsCreateGroupModalOpen: (open: boolean) => void;
}> = ({ groups, onOpenGroupDetails, onSetSelectedGroup, onSetNewGroupName, onSetIsDeleteGroupModalOpen, onSetIsCreateGroupModalOpen }) => {
    const [groupSearch, setGroupSearch] = useState('');
    
    const filteredGroups = useMemo(() => {
        if (!groupSearch.trim()) return groups;
        const query = groupSearch.toLowerCase();
        return groups.filter(g => g.name.toLowerCase().includes(query));
    }, [groups, groupSearch]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6 flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-[#5E6AD2]" />
                    Groupes d'accès
                    <Badge type="pill-color" color="gray" size="sm" className="ml-2">
                        {groups.length}
                    </Badge>
                </h2>
                {groups.length > 3 && (
                    <div className="mt-2">
                        <Input
                            placeholder="Filtrer les groupes..."
                            value={groupSearch}
                            onChange={setGroupSearch}
                            size="sm"
                        />
                    </div>
                )}
            </div>

            <div className="p-2 flex-1 overflow-y-auto">
                <ul className="space-y-1">
                    {filteredGroups.map((group) => {
                        const pendingCount = group.invitations?.filter(i => i.status === 'PENDING').length || 0;
                        const memberCount = group.memberCount ?? group.members.length;
                        const isEmpty = memberCount === 0 && pendingCount === 0;

                        return (
                            <li key={group.id}>
                                <div className="flex items-center w-full rounded-lg hover:bg-gray-50 group">
                                    <button
                                        onClick={() => onOpenGroupDetails(group)}
                                        className="flex-grow flex items-center px-3 py-2 rounded-l-lg text-sm min-w-0"
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <Users className={`w-4 h-4 flex-shrink-0 ${isEmpty ? 'text-gray-300' : 'text-gray-400'}`} />
                                            <span className={`truncate ${isEmpty ? 'text-gray-400' : ''}`}>
                                                {group.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {pendingCount > 0 && (
                                                <Badge type="pill-color" color="warning" size="sm">
                                                    {pendingCount} inv.
                                                </Badge>
                                            )}
                                            <Badge type="pill-color" color={isEmpty ? "gray" : "gray"} size="sm">
                                                {memberCount}
                                            </Badge>
                                        </div>
                                    </button>
                                    <Dropdown.Root>
                                        <Dropdown.DotsButton />
                                        <Dropdown.Popover>
                                            <Dropdown.Menu>
                                                <Dropdown.Section>
                                                    <Dropdown.Item
                                                        icon={Settings}
                                                        onAction={() => {
                                                                    onSetSelectedGroup(group);
                                                                    onSetNewGroupName(group.name);
                                                                }}
                                                    >
                                                        Renommer
                                                    </Dropdown.Item>
                                                </Dropdown.Section>
                                                <Dropdown.Separator />
                                                <Dropdown.Section>
                                                    <Dropdown.Item
                                                        icon={Trash2}
                                                        onAction={() => {
                                                                    onSetSelectedGroup(group);
                                                                    onSetIsDeleteGroupModalOpen(true);
                                                                }}
                                                    >
                                                        Supprimer
                                                    </Dropdown.Item>
                                                </Dropdown.Section>
                                            </Dropdown.Menu>
                                        </Dropdown.Popover>
                                    </Dropdown.Root>
                                </div>
                            </li>
                        );
                    })}
                    {filteredGroups.length === 0 && groupSearch && (
                        <li className="px-3 py-2 text-sm text-gray-400 text-center">
                            Aucun groupe trouvé
                        </li>
                    )}
                </ul>
            </div>

            <div className="p-4 border-t border-gray-100">
                <Button
                    color="secondary"
                    size="md"
                    iconLeading={<Plus data-icon />}
                    onClick={() => onSetIsCreateGroupModalOpen(true)}
                >
                    Nouveau groupe
                </Button>
            </div>
        </div>
    );
};

export const DataroomMain: React.FC<DataroomMainProps> = ({
    dataroom,
    categories,
    groups,
    displayedDocuments,
    totalDocuments,
    selectedCategory,
    storageUsed,
    storagePercentage,
    dataroomStats,
    isFilteringFiles,
    searchQuery,
    sortBy,
    currentPage,
    totalPages,
    onPageChange,
    onSetSearchQuery,
    onSetSortBy,
    onSetSelectedCategory,
    onSetIsUploadModalOpen,
    onSetIsCreateCategoryModalOpen,
    onSetIsCreateGroupModalOpen,
    onSetIsRenameCategoryModalOpen,
    onSetIsDeleteCategoryModalOpen,
    onSetIsDeleteGroupModalOpen,
    onSetIsDeleteFileModalOpen,
    onSetIsRenameFileModalOpen,
    onSetIsChangeCategoryModalOpen,
    onSetCategoryToEdit,
    onSetRenameCategoryName,
    onSetSelectedGroup,
    onSetNewGroupName,
    onSetFileToDelete,
    onSetFileToRename,
    onSetNewFileName,
    onSetFileToChangeCategory,
    onSetNewFileCategoryId: _onSetNewFileCategoryId,
    onHandleDocumentClick,
    onHandleDownload,
    formatStorageSize,
    DATAROOM_TOTAL_LIMIT,
    onLeaveDataroom,
    isLeavingDataroom,
    onInvite: _onInvite,
    onInvitationResponse: _onInvitationResponse,
    onOpenGroupDetails,
    onUploadNewVersion,
    onDownloadVersion,
    onViewVersion,
    onDirectFilesDrop,
    onBulkDelete,
    isOwner = false,
}) => {
    const router = useRouter();
    const [logoError, setLogoError] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const dragCounterRef = React.useRef(0);

    const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
        if (!onDirectFilesDrop) return;
        if (!e.dataTransfer.types?.includes('Files')) return;
        e.preventDefault();
        dragCounterRef.current += 1;
        setIsDragActive(true);
    };

    const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
        if (!onDirectFilesDrop) return;
        if (!e.dataTransfer.types?.includes('Files')) return;
        e.preventDefault();
    };

    const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
        if (!onDirectFilesDrop) return;
        e.preventDefault();
        dragCounterRef.current -= 1;
        if (dragCounterRef.current <= 0) {
            dragCounterRef.current = 0;
            setIsDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLElement>) => {
        if (!onDirectFilesDrop) return;
        e.preventDefault();
        dragCounterRef.current = 0;
        setIsDragActive(false);
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length > 0) onDirectFilesDrop(files);
    };

    // Versioning state (owned by this component only)
    const [documentForVersioning, setDocumentForVersioning] = useState<DisplayedDocument | null>(null);
    const [isUploadNewVersionModalOpen, setIsUploadNewVersionModalOpen] = useState(false);
    const [isVersionHistoryModalOpen, setIsVersionHistoryModalOpen] = useState(false);

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    // Reset selection when category or search changes
    useEffect(() => {
        setSelectedIds(new Set());
    }, [selectedCategory, searchQuery]);

    // Prune selections that no longer exist in displayedDocuments (e.g. after delete or pagination)
    useEffect(() => {
        setSelectedIds(prev => {
            if (prev.size === 0) return prev;
            const visibleIds = new Set(displayedDocuments.map(d => d.id));
            const next = new Set<string>();
            prev.forEach(id => { if (visibleIds.has(id)) next.add(id); });
            return next.size === prev.size ? prev : next;
        });
    }, [displayedDocuments]);

    const toggleSelected = (id: string, checked: boolean) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const handleBulkDelete = async () => {
        if (!onBulkDelete || selectedIds.size === 0) return;
        const ids = Array.from(selectedIds);
        try {
            setIsBulkDeleting(true);
            await onBulkDelete(ids);
            setSelectedIds(new Set());
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const allSelected = selectedIds.size > 0 && selectedIds.size === displayedDocuments.length;
    const isIndeterminate = selectedIds.size > 0 && selectedIds.size < displayedDocuments.length;

    // Stats animation with cascade effect
    const [animatedStats, setAnimatedStats] = useState(
        dataroomStats.map(() => ({ label: "", value: 0 }))
    );

    useEffect(() => {
        if (!dataroomStats?.length) return;
        const timers = dataroomStats.map((stat, index) =>
            setTimeout(() => {
                setAnimatedStats(prev => {
                    const next = [...prev];
                    next[index] = {
                        label: stat.label,
                        value: typeof stat.value === 'string' ? 0 : (stat.value as number) || 0,
                    };
                    return next;
                });
            }, 100 + (index * 75))
        );
        return () => timers.forEach(clearTimeout);
    }, [dataroomStats]);

    // Formatted time values derived from animatedStats (no setInterval needed)
    const animatedTimeValues = useMemo(() =>
        dataroomStats.map((stat, index) =>
            stat?.isTime ? formatDuration(animatedStats[index]?.value || 0) : ""
        ),
        [animatedStats, dataroomStats]
    );

    const getInitials = (name?: string | null) => {
        if (!name) return "DR";
        const words = name.trim().split(/\s+/);
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <main
            className="relative max-w-7xl mx-auto px-4 py-8"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDragActive && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-brand-solid/10 backdrop-blur-sm"
                >
                    <div className="rounded-2xl border-2 border-dashed border-brand-solid bg-primary px-8 py-6 shadow-xl">
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="h-10 w-10 text-brand" data-icon />
                            <p className="text-lg font-semibold text-primary">Déposez vos fichiers</p>
                            <p className="text-sm text-tertiary">Ils seront ajoutés à votre dataroom</p>
                        </div>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-3">
                                {dataroom?.logo && !logoError ? (
                                    <Image
                                        src={dataroom.logo}
                                        alt={dataroom?.name || "Logo"}
                                        width={40}
                                        height={40}
                                        className="rounded-lg object-cover"
                                        onError={() => setLogoError(true)}
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-[#5E6AD2] rounded-lg flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {getInitials(dataroom?.name)}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-2xl font-bold text-[#101828]">Data Room</h1>
                                    <p className="text-[#475467] mt-1">
                                        Gérez vos documents et suivez l'engagement des investisseurs
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-2 text-sm text-[#475467]">
                                <Users className="h-4 w-4" />
                                <span>{dataroom?.groups.reduce((acc: number, group: any) => acc + group.memberCount, 0)} membres</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#475467]">
                                <FileText className="h-4 w-4" />
                                <span>{dataroom?.documentCount} documents</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#475467]">
                                <Eye className="h-4 w-4" />
                                <span>{dataroom?.viewCount} vues</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            color="secondary"
                            size="md"
                            iconLeading={<LogOut data-icon />}
                            onClick={onLeaveDataroom}
                            isLoading={isLeavingDataroom}
                        >
                            Quitter
                        </Button>
                        <Button
                            color="secondary"
                            size="md"
                            iconLeading={<BarChart3 data-icon />}
                            onClick={() => router.push(`/dataroom/${dataroom?.id}/analytics`)}
                        >
                            Analytics
                        </Button>
                        <Button
                            color="primary"
                            size="md"
                            iconLeading={<Upload data-icon />}
                            onClick={() => onSetIsUploadModalOpen(true)}
                        >
                            Importer des fichiers
                        </Button>
                    </div>
                </div>

                <div className="mt-5 pt-5 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-[#344054]">Stockage utilisé</h3>
                        <Tooltip title={`${storageUsed < 1
                            ? `${(storageUsed * 1024).toFixed(0)} KB utilisés`
                            : `${storageUsed.toFixed(2)} MB utilisés`
                            } sur ${DATAROOM_TOTAL_LIMIT} GB disponibles`}>
                            <TooltipTrigger>
                                <span className="text-sm text-gray-500 cursor-help">
                                    {formatStorageSize(storageUsed)} / {formatStorageSize(DATAROOM_TOTAL_LIMIT * 1024)}
                                </span>
                            </TooltipTrigger>
                        </Tooltip>
                    </div>
                    <ProgressBar min={0} max={100} value={storagePercentage} />
                    {storagePercentage > 90 && (
                        <p className="mt-2 text-xs text-amber-600">
                            Attention : vous approchez de la limite de stockage.
                        </p>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {dataroomStats.map((stat, index) => {
                    const tooltipText: Record<string, string> = {
                        "Documents": "Nombre total de fichiers dans la dataroom",
                        "Vues uniques": "Nombre de visiteurs distincts",
                        "Vues totales": "Nombre total de consultations",
                        "Durée moy.": "Temps moyen passé par session",
                    };
                    return (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-[#5E6AD2] transition-colors"
                    >
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            {stat.label}
                            <Tooltip title={tooltipText[stat.label] || stat.label}>
                                <TooltipTrigger>
                                    <InfoIcon className="w-4 h-4 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                            </Tooltip>
                        </p>
                        <div className="text-2xl font-semibold mt-1 text-[#5E6AD2]">
                            {typeof stat.value === 'string' ? (
                                stat.value
                            ) : stat.isTime ? (
                                <span className="tabular-nums">
                                    {animatedTimeValues[index] || "0s"}
                                </span>
                            ) : (
                                <NumberFlow
                                    value={animatedStats[index]?.value || 0}
                                    animated={true}
                                    transformTiming={{
                                        duration: 150 + (index * 25),
                                        easing: 'ease-out'
                                    }}
                                    trend={1}
                                    format={{
                                        notation: (animatedStats[index]?.value || 0) > 999 ? 'compact' : 'standard'
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    );
                })}
            </div>

            <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
                {/* Sidebar - Categories */}
                <div className="w-full lg:w-64 flex-shrink-0 flex flex-col h-full">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-semibold">Catégories</h2>
                        </div>

                        <div className="p-2 flex-1 overflow-y-auto">
                            <ul className="space-y-1">
                                {categories.map((category) => (
                                    <li key={category.id}>
                                        <div className="flex items-center w-full rounded-lg hover:bg-gray-50 group">
                                            <button
                                                onClick={() => onSetSelectedCategory(category.id)}
                                                className={`flex-grow flex items-center px-3 py-2 rounded-l-lg text-sm min-w-0 ${selectedCategory === category.id
                                                    ? "bg-[#5E6AD2]/10 text-[#5E6AD2] font-medium"
                                                    : ""
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <FolderClosed
                                                        className={`w-4 h-4 flex-shrink-0 ${selectedCategory === category.id
                                                            ? "text-[#5E6AD2]"
                                                            : "text-gray-400"
                                                            }`}
                                                    />
                                                    <span className="truncate">
                                                        {category.name}
                                                    </span>
                                                </div>
                                                <Badge type="pill-color" color="gray" size="sm">
                                                    {category.count}
                                                </Badge>
                                            </button>
                                            {category.id !== "all" && (
                                                <Dropdown.Root>
                                                    <Dropdown.DotsButton />
                                                    <Dropdown.Popover>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Section>
                                                                <Dropdown.Item
                                                                    icon={Settings}
                                                                    onAction={() => {
                                                                        onSetCategoryToEdit(category);
                                                                        onSetRenameCategoryName(category.name);
                                                                        onSetIsRenameCategoryModalOpen(true);
                                                                    }}
                                                                >
                                                                    Renommer
                                                                </Dropdown.Item>
                                                            </Dropdown.Section>
                                                            <Dropdown.Separator />
                                                            <Dropdown.Section>
                                                                <Dropdown.Item
                                                                    icon={Trash2}
                                                                    onAction={() => {
                                                                        onSetCategoryToEdit(category);
                                                                        onSetIsDeleteCategoryModalOpen(true);
                                                                    }}
                                                                >
                                                                    Supprimer
                                                                </Dropdown.Item>
                                                            </Dropdown.Section>
                                                        </Dropdown.Menu>
                                                    </Dropdown.Popover>
                                                </Dropdown.Root>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="p-4 border-t border-gray-100">
                            <Button
                                color="secondary"
                                size="md"
                                iconLeading={<Plus data-icon />}
                                onClick={() => onSetIsCreateCategoryModalOpen(true)}
                            >
                                Nouvelle catégorie
                            </Button>
                        </div>
                    </div>

                    {/* Access groups */}
                    <AccessGroupsSidebar
                        groups={groups}
                        onOpenGroupDetails={onOpenGroupDetails}
                        onSetSelectedGroup={onSetSelectedGroup}
                        onSetNewGroupName={onSetNewGroupName}
                        onSetIsDeleteGroupModalOpen={onSetIsDeleteGroupModalOpen}
                        onSetIsCreateGroupModalOpen={onSetIsCreateGroupModalOpen}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-x-auto">
                    {/* Filters and Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Rechercher des fichiers..."
                                    value={searchQuery}
                                    onChange={(value) => onSetSearchQuery(value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => onSetSearchQuery('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <Dropdown.Root>
                                <Button
                                    color="secondary"
                                    size="sm"
                                    iconLeading={<Clock data-icon />}
                                    iconTrailing={<ChevronDown data-icon />}
                                >
                                    {sortBy === 'recent' ? 'Plus récent' :
                                        sortBy === 'oldest' ? 'Plus ancien' :
                                            sortBy === 'name-asc' ? 'Nom A-Z' :
                                                sortBy === 'name-desc' ? 'Nom Z-A' :
                                                    sortBy === 'size-desc' ? 'Plus volumineux' :
                                                        sortBy === 'size-asc' ? 'Plus petit' : 'Trier par'}
                                </Button>
                                <Dropdown.Popover>
                                    <Dropdown.Menu>
                                        <Dropdown.Section>
                                            <Dropdown.Item icon={Clock} onAction={() => onSetSortBy('recent')}>Plus récent</Dropdown.Item>
                                            <Dropdown.Item icon={Clock} onAction={() => onSetSortBy('oldest')}>Plus ancien</Dropdown.Item>
                                        </Dropdown.Section>
                                        <Dropdown.Separator />
                                        <Dropdown.Section>
                                            <Dropdown.Item icon={FileText} onAction={() => onSetSortBy('name-asc')}>Nom A-Z</Dropdown.Item>
                                            <Dropdown.Item icon={FileText} onAction={() => onSetSortBy('name-desc')}>Nom Z-A</Dropdown.Item>
                                        </Dropdown.Section>
                                        <Dropdown.Separator />
                                        <Dropdown.Section>
                                            <Dropdown.Item icon={Download} onAction={() => onSetSortBy('size-desc')}>Plus volumineux</Dropdown.Item>
                                            <Dropdown.Item icon={Download} onAction={() => onSetSortBy('size-asc')}>Plus petit</Dropdown.Item>
                                        </Dropdown.Section>
                                    </Dropdown.Menu>
                                </Dropdown.Popover>
                            </Dropdown.Root>
                        </div>
                    </div>

                    {/* Bulk action bar */}
                    {selectedIds.size > 0 && (
                        <div className="sticky top-2 z-10 flex items-center justify-between gap-3 rounded-xl bg-primary p-3 shadow-md ring-1 ring-secondary mb-3">
                            <span className="text-sm font-medium text-primary">
                                {selectedIds.size} sélectionné(s)
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    color="secondary"
                                    size="sm"
                                    onClick={() => setSelectedIds(new Set())}
                                    isDisabled={isBulkDeleting}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    color="primary-destructive"
                                    size="sm"
                                    iconLeading={<Trash2 data-icon />}
                                    onClick={handleBulkDelete}
                                    isLoading={isBulkDeleting}
                                >
                                    Supprimer
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Document Table */}
                    <TableCard.Root>
                        <TableCard.Header
                            title="Documents"
                            badge={`${totalDocuments} fichier${totalDocuments !== 1 ? 's' : ''}`}
                        />

                        {isFilteringFiles ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5E6AD2] mb-4"></div>
                                <p className="text-gray-500 text-sm">Chargement des fichiers...</p>
                            </div>
                        ) : displayedDocuments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4">
                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                        {searchQuery ? (
                                            <Search className="w-8 h-8 text-gray-400" />
                                        ) : (
                                            <FolderClosed className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchQuery
                                        ? `Aucun résultat pour "${searchQuery}"`
                                        : selectedCategory === "all"
                                            ? "Aucun fichier dans cette dataroom"
                                            : "Aucun fichier dans cette catégorie"
                                    }
                                </h3>
                                <p className="text-gray-500 text-center mb-6 max-w-md">
                                    {searchQuery
                                        ? "Essayez de modifier votre recherche ou de supprimer des filtres."
                                        : selectedCategory === "all"
                                            ? "Commencez par télécharger vos premiers documents pour partager avec vos investisseurs."
                                            : `Il n'y a encore aucun fichier dans la catégorie "${categories.find(c => c.id === selectedCategory)?.name}".`
                                    }
                                </p>
                                {!searchQuery && (
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            color="primary"
                                            size="md"
                                            iconLeading={<Upload data-icon />}
                                            onClick={() => onSetIsUploadModalOpen(true)}
                                        >
                                            Importer des fichiers
                                        </Button>
                                        {selectedCategory === "all" && (
                                            <Button
                                                color="secondary"
                                                size="md"
                                                iconLeading={<Plus data-icon />}
                                                onClick={() => onSetIsCreateCategoryModalOpen(true)}
                                            >
                                                Créer une catégorie
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Table aria-label="Documents" className="bg-primary">
                                <Table.Header>
                                    <Table.Head id="select" className="w-11">
                                        <Checkbox
                                            aria-label="Tout sélectionner"
                                            isSelected={allSelected}
                                            isIndeterminate={isIndeterminate}
                                            onChange={(checked) =>
                                                setSelectedIds(
                                                    checked
                                                        ? new Set(displayedDocuments.map(d => d.id))
                                                        : new Set()
                                                )
                                            }
                                        />
                                    </Table.Head>
                                    <Table.Head id="name" label="Nom" isRowHeader allowsSorting className="w-full max-lg:min-w-80" />
                                    <Table.Head id="category" label="Catégorie" allowsSorting />
                                    <Table.Head id="uploaded" label="Ajouté" allowsSorting />
                                    <Table.Head id="size" label="Taille" allowsSorting />
                                    <Table.Head id="actions" />
                                </Table.Header>

                                <Table.Body items={displayedDocuments}>
                                    {(doc) => (
                                        <Table.Row id={doc.id}>
                                            <Table.Cell className="w-11">
                                                <Checkbox
                                                    aria-label={`Sélectionner ${doc.name}`}
                                                    isSelected={selectedIds.has(doc.id)}
                                                    onChange={(checked) => toggleSelected(doc.id, checked)}
                                                />
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="flex items-center gap-3">
                                                    <div className="group-hover:scale-110 transition-transform flex-shrink-0">
                                                        {getFileIcon(doc.name, doc.mimetype)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <Tooltip title={`${doc.name} - Version ${doc.version || 1}`}>
                                                            <TooltipTrigger>
                                                                <div>
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <p className="font-medium text-sm group-hover:text-[#5E6AD2] truncate">{doc.name}</p>
                                                                        {isOwner ? (
                                                                            doc.views > 0 && (
                                                                                <Badge type="pill-color" color="gray" size="sm" className="flex-shrink-0">
                                                                                    {doc.views} vue{doc.views > 1 ? 's' : ''}
                                                                                </Badge>
                                                                            )
                                                                        ) : (
                                                                            !doc.viewedByCurrentUser && (
                                                                                <Badge type="pill-color" color="brand" size="sm" className="flex-shrink-0">
                                                                                    Nouveau
                                                                                </Badge>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                    {doc.lastVersionUpdate && (
                                                                        <div className="mt-1">
                                                                            <Badge type="pill-color" color="success" size="sm">
                                                                                Mise à jour récente
                                                                            </Badge>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TooltipTrigger>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell className="whitespace-nowrap">
                                                <Badge
                                                    type="pill-color"
                                                    color={getCategoryColor(doc.category)}
                                                    size="sm"
                                                >
                                                    {doc.category}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell className="whitespace-nowrap text-sm text-gray-500">
                                                {doc.uploaded}
                                            </Table.Cell>
                                            <Table.Cell className="whitespace-nowrap text-sm text-gray-500">
                                                {doc.size}
                                            </Table.Cell>
                                            <Table.Cell className="px-4">
                                                <div className="flex justify-end gap-0.5">
                                                    <ButtonUtility
                                                        size="xs"
                                                        color="tertiary"
                                                        tooltip="Voir"
                                                        icon={Eye}
                                                        onClick={() => onHandleDocumentClick(doc)}
                                                    />
                                                    <ButtonUtility
                                                        size="xs"
                                                        color="tertiary"
                                                        tooltip="Télécharger"
                                                        icon={Download}
                                                        onClick={() => onHandleDownload(doc)}
                                                    />
                                                    <Dropdown.Root>
                                                        <Dropdown.DotsButton />
                                                        <Dropdown.Popover>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Section>
                                                                    <Dropdown.Item
                                                                        icon={Upload}
                                                                        onAction={() => {
                                                                            setDocumentForVersioning(doc);
                                                                            setIsUploadNewVersionModalOpen(true);
                                                                        }}
                                                                    >
                                                                        Nouvelle version
                                                                    </Dropdown.Item>
                                                                    <Dropdown.Item
                                                                        icon={Clock}
                                                                        onAction={() => {
                                                                            setDocumentForVersioning(doc);
                                                                            setIsVersionHistoryModalOpen(true);
                                                                        }}
                                                                    >
                                                                        Historique des versions
                                                                    </Dropdown.Item>
                                                                </Dropdown.Section>
                                                                <Dropdown.Separator />
                                                                <Dropdown.Section>
                                                                    <Dropdown.Item
                                                                        icon={Folder}
                                                                        onAction={() => {
                                                                            onSetFileToChangeCategory({ id: doc.id, name: doc.name, category: doc.category });
                                                                            onSetIsChangeCategoryModalOpen(true);
                                                                        }}
                                                                    >
                                                                        Changer de catégorie
                                                                    </Dropdown.Item>
                                                                    <Dropdown.Item
                                                                        icon={Settings}
                                                                        onAction={() => {
                                                                            onSetFileToRename({ id: doc.id, name: doc.name });
                                                                            onSetNewFileName(doc.name);
                                                                            onSetIsRenameFileModalOpen(true);
                                                                        }}
                                                                    >
                                                                        Renommer
                                                                    </Dropdown.Item>
                                                                </Dropdown.Section>
                                                                <Dropdown.Separator />
                                                                <Dropdown.Section>
                                                                    <Dropdown.Item
                                                                        icon={Trash2}
                                                                        onAction={() => {
                                                                            onSetFileToDelete({ id: doc.id, name: doc.name });
                                                                            onSetIsDeleteFileModalOpen(true);
                                                                        }}
                                                                    >
                                                                        Supprimer
                                                                    </Dropdown.Item>
                                                                </Dropdown.Section>
                                                            </Dropdown.Menu>
                                                        </Dropdown.Popover>
                                                    </Dropdown.Root>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table>
                        )}
                    </TableCard.Root>

                    {totalPages > 1 && (
                        <PaginationPageDefault
                            page={currentPage}
                            total={totalPages}
                            onPageChange={onPageChange}
                        />
                    )}
                </div>
            </div>

            {/* Versioning modals (state owned by this component) */}
            <UploadNewVersionModal
                isOpen={isUploadNewVersionModalOpen}
                onClose={() => {
                    setIsUploadNewVersionModalOpen(false);
                    setDocumentForVersioning(null);
                }}
                document={documentForVersioning}
                onUploadNewVersion={onUploadNewVersion}
            />

            <VersionHistoryModal
                isOpen={isVersionHistoryModalOpen}
                onClose={() => {
                    setIsVersionHistoryModalOpen(false);
                    setDocumentForVersioning(null);
                }}
                document={documentForVersioning}
                onDownloadVersion={onDownloadVersion}
                onViewVersion={onViewVersion}
            />
        </main>
    );
};

function formatDuration(seconds: number): string {
    if (!seconds || seconds === 0) return "0s";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${seconds}s`;
}
