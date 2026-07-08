"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NumberFlow from '@number-flow/react';
import {
    SearchLg as Search,
    File01 as FileText,
    Users01 as Users,
    Eye,
    Clock,
    BarChart01 as BarChart2,
    LogOut01 as LogOut,
} from "@untitledui/icons";
import { Info } from "lucide-react";
import { Input } from "@/components/base/input/input";
import { Badge } from "@/components/base/badges/badges";
import { Select } from "@/components/base/select/select";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDatarooms, leaveDataroom } from "@/queries/dataroom";
import Navbar from "@/components/navbar";
import DataroomPageSkeleton from "./components/DataroomPageSkeleton";
import { toast } from "sonner";

const DataroomListPage = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const leaveDataroomMut = useMutation({
        mutationFn: ({ dataroomId }: { dataroomId: string }) => leaveDataroom({ dataroomId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["datarooms"] });
            toast.success("Vous avez quitté la dataroom");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Erreur lors de la sortie de la dataroom");
        },
    });
    
    // États
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("recent");
    const [filterBy, setFilterBy] = useState("all");
    const [viewMode, setViewMode] = useState<"all" | "owned" | "shared">("all");
    const [animatedStats, setAnimatedStats] = useState({
        totalDatarooms: 0,
        totalDocuments: 0,
        totalViews: 0,
        totalMembers: 0,
    });

    const { data: datarooms, isLoading, isError, error } = useQuery({
        queryKey: ["datarooms"],
        queryFn: getDatarooms,
    });

    // Fonction helper pour la navigation
    const navigateTo = (path: string) => () => router.push(path);

    // Fonctions utilitaires
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return "Aujourd'hui";
        if (diffInDays === 1) return "Hier";
        if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
        if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
        return `Il y a ${Math.floor(diffInDays / 30)} mois`;
    };

    // Filtrage des datarooms selon le mode de vue
    const filteredDatarooms = datarooms
        ?.filter((dataroom) => {
            const name = dataroom.name || '';
            const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (filterBy === "all") return matchesSearch;
            if (filterBy === "recent") return matchesSearch && new Date(dataroom.lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            if (filterBy === "active") return matchesSearch && dataroom.viewCount > 50;
            return matchesSearch;
        })
        .filter(dataroom => {
            if (viewMode === "all") return true;
            if (viewMode === "owned") return dataroom.isOwner;
            if (viewMode === "shared") return !dataroom.isOwner;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "recent") return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
            if (sortBy === "documents") return b.documentCount - a.documentCount;
            if (sortBy === "views") return b.viewCount - a.viewCount;
            return 0;
        }) || [];

    // Statistiques globales
    const stats = {
        totalDatarooms: datarooms?.length || 0,
        totalDocuments: datarooms?.reduce((acc, curr) => acc + curr.documentCount, 0) || 0,
        totalViews: datarooms?.reduce((acc, curr) => acc + curr.viewCount, 0) || 0,
        totalMembers: datarooms?.reduce((acc, curr) => acc + curr.memberCount, 0) || 0,
    };

    // Séparer les datarooms en deux catégories
    const ownedDatarooms = filteredDatarooms.filter(dataroom => dataroom.isOwner);
    const sharedDatarooms = filteredDatarooms.filter(dataroom => !dataroom.isOwner);

    // Animation des stats depuis 0 vers les valeurs finales avec effet cascade optimal
    React.useEffect(() => {
        if (stats.totalDatarooms > 0) {
            // Animation en cascade optimale pour chaque statistique
            const timers = [
                setTimeout(() => setAnimatedStats(prev => ({ ...prev, totalDatarooms: stats.totalDatarooms })), 50),
                setTimeout(() => setAnimatedStats(prev => ({ ...prev, totalDocuments: stats.totalDocuments })), 100),
                setTimeout(() => setAnimatedStats(prev => ({ ...prev, totalViews: stats.totalViews })), 150),
                setTimeout(() => setAnimatedStats(prev => ({ ...prev, totalMembers: stats.totalMembers })), 200),
            ];
            
            return () => timers.forEach(timer => clearTimeout(timer));
        }
    }, [stats.totalDatarooms, stats.totalDocuments, stats.totalViews, stats.totalMembers]);

    if (isLoading) {
        return <DataroomPageSkeleton />;
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-red-500 text-xl mb-4">Une erreur est survenue</div>
                <div className="text-gray-500">{(error as Error)?.message || 'Erreur inconnue'}</div>
            </div>
        );
    }

    return (
        <div className="bg-[#FCFCFD] min-h-screen">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div>
                                    <h1 className="text-2xl font-bold text-[#101828]">Data Rooms</h1>
                                    <p className="text-[#475467] mt-1">
                                        Gérez et accédez à toutes vos data rooms
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 mt-4 pt-4 border-t border-gray-100">
                        <Info className="w-5 h-5 text-[#5E6AD2] flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-[#475467]">
                            Pour créer une dataroom, vous devez créer une startup ou avoir été invité dans une startup. Une dataroom est toujours associée à une startup.
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-[#5E6AD2] transition-colors">
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            Total Data Rooms
                            <BarChart2 className="w-4 h-4 text-gray-400" data-icon />
                        </p>
                        <div className="text-2xl font-semibold mt-1 text-[#5E6AD2]">
                            <NumberFlow 
                                value={animatedStats.totalDatarooms} 
                                animated={true}
                                transformTiming={{ duration: 150, easing: 'ease-out' }}
                                spinTiming={{ duration: 150, easing: 'ease-out' }}
                            />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-[#5E6AD2] transition-colors">
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            Documents
                            <FileText className="w-4 h-4 text-gray-400" data-icon />
                        </p>
                        <div className="text-2xl font-semibold mt-1 text-[#5E6AD2]">
                            <NumberFlow 
                                value={animatedStats.totalDocuments} 
                                animated={true}
                                transformTiming={{ duration: 150, easing: 'ease-out' }}
                                spinTiming={{ duration: 150, easing: 'ease-out' }}
                            />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-[#5E6AD2] transition-colors">
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            Vues
                            <Eye className="w-4 h-4 text-gray-400" data-icon />
                        </p>
                        <div className="text-2xl font-semibold mt-1 text-[#5E6AD2]">
                            <NumberFlow 
                                value={animatedStats.totalViews} 
                                animated={true}
                                transformTiming={{ duration: 150, easing: 'ease-out' }}
                                spinTiming={{ duration: 150, easing: 'ease-out' }}
                                format={{ notation: animatedStats.totalViews > 999 ? 'compact' : 'standard' }}
                            />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-[#5E6AD2] transition-colors">
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            Membres
                            <Users className="w-4 h-4 text-gray-400" data-icon />
                        </p>
                        <div className="text-2xl font-semibold mt-1 text-[#5E6AD2]">
                            <NumberFlow 
                                value={animatedStats.totalMembers} 
                                animated={true}
                                transformTiming={{ duration: 150, easing: 'ease-out' }}
                                spinTiming={{ duration: 150, easing: 'ease-out' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Input
                                placeholder="Rechercher une data room..."
                                value={searchQuery}
                                onChange={setSearchQuery}
                                icon={Search}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <Select 
                                placeholder="Voir" 
                                selectedKey={viewMode} 
                                onSelectionChange={(value) => setViewMode(value as "all" | "owned" | "shared")}
                                items={[
                                    { id: "all", label: "Toutes" },
                                    { id: "owned", label: "Mes datarooms" },
                                    { id: "shared", label: "Partagées" }
                                ]}
                            >
                                {(item) => (
                                    <Select.Item id={item.id}>
                                        {item.label}
                                    </Select.Item>
                                )}
                            </Select>

                            <Select 
                                placeholder="Filtrer par" 
                                selectedKey={filterBy} 
                                onSelectionChange={(value) => setFilterBy(value as string)}
                                items={[
                                    { id: "all", label: "Toutes" },
                                    { id: "recent", label: "Récentes" },
                                    { id: "active", label: "Actives" }
                                ]}
                            >
                                {(item) => (
                                    <Select.Item id={item.id}>
                                        {item.label}
                                    </Select.Item>
                                )}
                            </Select>

                            <Select
                                placeholder="Trier par" 
                                selectedKey={sortBy} 
                                onSelectionChange={(value) => setSortBy(value as string)}
                                items={[
                                    { id: "recent", label: "Plus récentes" },
                                    { id: "documents", label: "Plus de documents" },
                                    { id: "views", label: "Plus de vues" }
                                ]}
                            >
                                {(item) => (
                                    <Select.Item id={item.id}>
                                        {item.label}
                                    </Select.Item>
                                )}
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Mes Datarooms */}
                {(viewMode === "all" || viewMode === "owned") && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-[#101828]">Mes Datarooms</h2>
                            <Badge type="pill-color" color="gray" size="sm">
                                {ownedDatarooms.length} dataroom{ownedDatarooms.length > 1 ? 's' : ''}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ownedDatarooms.map((dataroom) => (
                                <Link
                                    key={dataroom.id}
                                    href={`/dataroom/${dataroom.id}`}
                                    data-testid="dataroom-card"
                                    className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-[#5E6AD2] transition-all hover:shadow-md group relative"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3 max-w-[60%]">
                                            <div className="relative flex-shrink-0">
                                                {dataroom.logo ? (
                                                    <Image
                                                        src={dataroom.logo}
                                                        alt={dataroom.name || 'Logo'}
                                                        width={40}
                                                        height={40}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-[#5E6AD2] flex items-center justify-center text-white font-semibold">
                                                        {(dataroom.name ? dataroom.name.charAt(0) : '?')}
                                                    </div>
                                                )}
                                                {(dataroom as any).newDocuments > 0 && (
                                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                                                        {(dataroom as any).newDocuments}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-[#101828] group-hover:text-[#5E6AD2] transition-colors truncate">
                                                    {dataroom.name}
                                                </h3>
                                            </div>
                                        </div>
                                        <div
                                            className="flex items-center gap-2"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                        >
                                            <Badge type="pill-color" color="brand" size="sm">
                                                Propriétaire
                                            </Badge>
                                            <Dropdown.Root>
                                                <Dropdown.DotsButton />
                                                <Dropdown.Popover>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item icon={Eye} onAction={navigateTo(`/dataroom/${dataroom.id}`)}>
                                                            Voir la dataroom
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown.Popover>
                                            </Dropdown.Root>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                        <div className="text-center">
                                            <p className="text-sm text-gray-500">Documents</p>
                                            <p className="font-semibold text-[#101828]">
                                                <NumberFlow 
                                                    value={dataroom.documentCount} 
                                                    animated={true}
                                                    transformTiming={{ duration: 150, easing: 'ease-out' }}
                                                    trend={1}
                                                />
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-500">Vues</p>
                                            <p className="font-semibold text-[#101828]">
                                                <NumberFlow 
                                                    value={dataroom.viewCount} 
                                                    animated={true}
                                                    transformTiming={{ duration: 150, easing: 'ease-out' }}
                                                    trend={1}
                                                    format={{ notation: dataroom.viewCount > 999 ? 'compact' : 'standard' }}
                                                />
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-500">Membres</p>
                                            <p className="font-semibold text-[#101828]">
                                                <NumberFlow 
                                                    value={dataroom.memberCount} 
                                                    animated={true}
                                                    transformTiming={{ duration: 150, easing: 'ease-out' }}
                                                    trend={1}
                                                />
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" data-icon />
                                                <span>Dernière activité</span>
                                            </div>
                                            <span>{formatDate(dataroom.lastActivity)}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {ownedDatarooms.length === 0 && (
                                <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" data-icon />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune dataroom personnelle</h3>
                                    <p className="text-gray-500">
                                        Vous n'avez pas encore de dataroom personnelle
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Datarooms partagées */}
                {(viewMode === "all" || viewMode === "shared") && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-[#101828]">Datarooms partagées</h2>
                            <Badge type="pill-color" color="gray" size="sm">
                                {sharedDatarooms.length} dataroom{sharedDatarooms.length > 1 ? 's' : ''}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sharedDatarooms.map((dataroom) => (
                                <Link
                                    key={dataroom.id}
                                    href={`/dataroom/${dataroom.id}`}
                                    data-testid="dataroom-card"
                                    className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-[#5E6AD2] transition-all hover:shadow-md group relative"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3 max-w-[60%]">
                                            <div className="relative flex-shrink-0">
                                                {dataroom.logo ? (
                                                    <Image
                                                        src={dataroom.logo}
                                                        alt={dataroom.name || 'Logo'}
                                                        width={40}
                                                        height={40}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                                                        {dataroom.name ? dataroom.name.charAt(0) : '?'}
                                                    </div>
                                                )}
                                                {(dataroom as any).newDocuments > 0 && (
                                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                                                        {(dataroom as any).newDocuments}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-[#101828] group-hover:text-[#5E6AD2] transition-colors truncate">
                                                    {dataroom.name}
                                                </h3>
                                            </div>
                                        </div>
                                        <div
                                            className="flex items-center gap-2"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                        >
                                            <Badge type="pill-color" color="gray" size="sm">
                                                Invité
                                            </Badge>
                                            <Dropdown.Root>
                                                <Dropdown.DotsButton />
                                                <Dropdown.Popover>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item icon={Eye} onAction={navigateTo(`/dataroom/${dataroom.id}`)}>
                                                            Voir la dataroom
                                                        </Dropdown.Item>
                                                        <Dropdown.Item
                                                            icon={LogOut}
                                                            onAction={() => {
                                                                if (window.confirm(`Quitter la dataroom "${dataroom.name}" ?`)) {
                                                                    leaveDataroomMut.mutate({ dataroomId: dataroom.id });
                                                                }
                                                            }}
                                                            className="text-red-600"
                                                        >
                                                            Quitter la dataroom
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown.Popover>
                                            </Dropdown.Root>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="text-center">
                                            <p className="text-sm text-gray-500">Documents</p>
                                            <p className="font-semibold text-[#101828]">
                                                <NumberFlow 
                                                    value={dataroom.documentCount} 
                                                    animated={true}
                                                    transformTiming={{ duration: 150, easing: 'ease-out' }}
                                                    trend={1}
                                                />
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" data-icon />
                                                <span>Dernière activité</span>
                                            </div>
                                            <span>{formatDate(dataroom.lastActivity)}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {sharedDatarooms.length === 0 && (
                                <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" data-icon />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune dataroom partagée</h3>
                                    <p className="text-gray-500">
                                        Vous n'avez pas encore accès à des datarooms partagées
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Message si aucune data room trouvée */}
                {filteredDatarooms.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" data-icon />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune data room trouvée</h3>
                        <p className="text-gray-500 mb-4">
                            {searchQuery
                                ? "Aucune data room ne correspond à votre recherche"
                                : "Vous n'avez pas encore de data room"}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DataroomListPage;
