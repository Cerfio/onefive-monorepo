"use client";
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/base/buttons/button";
import { Badge } from '@/components/base/badges/badges';
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar2";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    Lock, 
    Users, 
    User, 
    Eye, 
    Download, 
    MessageSquare,
    Plus,
    X,
    Search,
    Mail,
    UserCheck,
    Edit3,
    Check,
    RotateCcw,
    MoreHorizontal,
    Trash2,
    Loader2
} from "lucide-react";
import { Group, DisplayedDocument } from "../../types";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchProfiles, Profile } from "@/hooks/useSearchProfiles";

interface FileAccessData {
    canView: boolean; // Toujours true par défaut
    canDownload: boolean;
    canComment: boolean;
    expiresAt?: string;
}

interface DirectFileAccess {
    id: string;
    userEmail: string;
    userName: string;
    userAvatar?: string;
    access: FileAccessData;
    grantedAt: string;
    status: 'accepted' | 'pending' | 'refused';
    invitedAt?: string;
}

interface FileAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: DisplayedDocument | null;
    groups: Group[];
    directAccesses?: DirectFileAccess[];
    onUpdateGroupAccess: (groupId: string, fileId: string, access: FileAccessData) => void;
    onAddDirectAccess: (fileId: string, userEmail: string, userName: string, access: FileAccessData) => void;
    onRemoveDirectAccess: (fileId: string, accessId: string) => void;
    onUpdateDirectAccess: (fileId: string, accessId: string, access: FileAccessData) => void;
}

export const FileAccessModal: React.FC<FileAccessModalProps> = ({
    isOpen,
    onClose,
    file,
    groups,
    directAccesses = [],
    onUpdateGroupAccess,
    onAddDirectAccess,
    onRemoveDirectAccess,
    onUpdateDirectAccess,
}) => {
    const [activeTab, setActiveTab] = useState<"groups" | "direct">("groups");
    const [groupAccess, setGroupAccess] = useState<{ [groupId: string]: FileAccessData }>({});
    const [showAddDirect, setShowAddDirect] = useState(false);
    const [editingAccess, setEditingAccess] = useState<string | null>(null);
    const [editAccessData, setEditAccessData] = useState<FileAccessData>({
        canView: true,
        canDownload: false,
        canComment: false,
    });
    // États pour la confirmation de suppression
    const [accessToRemove, setAccessToRemove] = useState<DirectFileAccess | null>(null);
    const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
    const [confirmationName, setConfirmationName] = useState('');
    const [isRemoving, setIsRemoving] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedPeople, setSelectedPeople] = useState<Array<{
        id?: string;
        name: string;
        email: string;
        avatar?: string;
        type: 'profile' | 'email';
    }>>([]);
    const [newDirectAccess, setNewDirectAccess] = useState({
        email: "",
        name: "",
        access: {
            canView: true,
            canDownload: false,
            canComment: false,
        }
    });

    // Debounce la recherche pour éviter trop de requêtes API
    const debouncedSearchValue = useDebounce(searchValue, 300);
    
    // Utiliser l'API de recherche de profils
    const { data: searchResults = [], isLoading: isSearching } = useSearchProfiles(debouncedSearchValue, 5);

    useEffect(() => {
        if (file && isOpen) {
            // Initialiser les accès des groupes
            const initialGroupAccess: { [groupId: string]: FileAccessData } = {};
            groups.forEach(group => {
                // Vérifier si le fichier est dans les accès spécifiques du groupe
                // TODO: Adapter selon la nouvelle logique sans specificFileAccess
        const hasFileAccess = group.files.some(f => f.id === file.id);
                initialGroupAccess[group.id] = {
                    canView: true, // Toujours true
                    canDownload: hasFileAccess,
                    canComment: false,
                };
            });
            setGroupAccess(initialGroupAccess);
        }
    }, [file, groups, isOpen]);

    const handleGroupAccessChange = (groupId: string, accessType: keyof FileAccessData, value: boolean) => {
        setGroupAccess(prev => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                [accessType]: value
            }
        }));
    };

    const handleSaveGroupAccess = (groupId: string) => {
        if (file) {
            onUpdateGroupAccess(groupId, file.id, groupAccess[groupId]);
        }
    };

    const _handleAddDirectAccess = () => {
        if (file && newDirectAccess.email) {
            onAddDirectAccess(
                file.id, 
                newDirectAccess.email, 
                newDirectAccess.name || newDirectAccess.email.split('@')[0],
                newDirectAccess.access
            );
            setNewDirectAccess({
                email: "",
                name: "",
                access: {
                    canView: true,
                    canDownload: false,
                    canComment: false,
                }
            });
            setShowAddDirect(false);
        }
    };

    const getAccessDescription = (access: FileAccessData) => {
        return (
            <div className="flex items-center gap-1">
                <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded border" title="Voir">
                    <Eye className="h-3 w-3 text-gray-600" />
                </div>
                {access.canDownload && (
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded border" title="Télécharger">
                        <Download className="h-3 w-3 text-gray-600" />
                    </div>
                )}
                {access.canComment && (
                    <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded border" title="Commenter">
                        <MessageSquare className="h-3 w-3 text-gray-600" />
                    </div>
                )}
            </div>
        );
    };

    // Fonctions pour l'édition des permissions
    const handleStartEdit = (access: DirectFileAccess) => {
        setEditingAccess(access.id);
        setEditAccessData(access.access);
    };

    const handleCancelEdit = () => {
        setEditingAccess(null);
        setEditAccessData({
            canView: true,
            canDownload: false,
            canComment: false,
        });
    };

    const handleSaveEdit = (accessId: string) => {
        if (file) {
            onUpdateDirectAccess(file.id, accessId, editAccessData);
            setEditingAccess(null);
        }
    };

    const handleEditAccessChange = (accessType: keyof FileAccessData, value: boolean) => {
        setEditAccessData(prev => ({
            ...prev,
            [accessType]: value
        }));
    };

    // Fonctions pour la gestion de la confirmation de suppression
    const handleRemoveAccessClick = (access: DirectFileAccess) => {
        setAccessToRemove(access);
        setShowRemoveConfirmation(true);
        setConfirmationName('');
    };

    const handleCloseRemoveConfirmation = () => {
        setConfirmationName('');
        setShowRemoveConfirmation(false);
        setAccessToRemove(null);
        setIsRemoving(false);
    };

    const handleSubmitRemoveAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (accessToRemove && file && confirmationName === accessToRemove.userName) {
            setIsRemoving(true);
            try {
                await onRemoveDirectAccess(file.id, accessToRemove.id);
                handleCloseRemoveConfirmation();
            } catch {
                setIsRemoving(false);
            }
        }
    };

    const isRemoveFormValid = confirmationName === accessToRemove?.userName && !isRemoving;

    if (!file) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5E6AD2]/10">
                            <Lock className="h-5 w-5 text-[#5E6AD2]" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle>Gérer les accès au fichier</DialogTitle>
                            <DialogDescription className="flex items-center gap-2 mt-1">
                                {file.icon}
                                <span className="truncate">{file.name}</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "groups" | "direct")} className="flex-1">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="groups" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Groupes ({groups.length})
                        </TabsTrigger>
                        <TabsTrigger value="direct" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Accès directs ({directAccesses.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="groups" className="space-y-4 mt-4 overflow-y-auto max-h-96">
                        {groups.length === 0 ? (
                            <div className="text-center py-12 border rounded-lg">
                                <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                <p className="text-gray-500">Aucun groupe disponible</p>
                                <p className="text-sm text-gray-500">
                                    Créez d'abord des groupes pour gérer les accès
                                </p>
                            </div>
                        ) : (
                            groups.map((group) => (
                                <div key={group.id} className="border rounded-lg p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5E6AD2]/10">
                                                <Users className="h-4 w-4 text-[#5E6AD2]" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{group.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {group.members.length} membre{group.members.length > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        {getAccessDescription(groupAccess[group.id] || { canView: true, canDownload: false, canComment: false })}
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium">Permissions</Label>
                                        <div className="space-y-2">
                                            {/* Note : Permission de voir toujours activée */}
                                            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <Eye className="h-4 w-4 text-green-600" />
                                                <Label className="flex items-center gap-2 text-green-700 font-medium">
                                                    Voir le fichier (toujours activé)
                                                </Label>
                                            </div>

                                            {/* Permission de télécharger */}
                                            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Download className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-sm">Télécharger le fichier</p>
                                                        <p className="text-xs text-gray-500">
                                                            Autoriser le téléchargement
                                                        </p>
                                                    </div>
                                                </div>
                                                <Checkbox
                                                    isSelected={groupAccess[group.id]?.canDownload || false}
                                                    onChange={(checked: boolean) =>
                                                        handleGroupAccessChange(group.id, 'canDownload', checked)
                                                    }
                                                />
                                            </div>

                                            {/* Permission de commenter */}
                                            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <MessageSquare className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-sm">Commenter le fichier</p>
                                                        <p className="text-xs text-gray-500">
                                                            Laisser des commentaires
                                                        </p>
                                                    </div>
                                                </div>
                                                <Checkbox
                                                    isSelected={groupAccess[group.id]?.canComment || false}
                                                    onChange={(checked: boolean) =>
                                                        handleGroupAccessChange(group.id, 'canComment', checked)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2 border-t">
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleSaveGroupAccess(group.id)}
                                            className="bg-[#5E6AD2] hover:bg-[#4F58B8]"
                                        >
                                            Enregistrer
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="direct" className="space-y-4 mt-4 overflow-y-auto max-h-96">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium">Accès directs</h3>
                            <Button 
                                size="sm" 
                                onClick={() => setShowAddDirect(true)}
                                className="bg-[#5E6AD2] hover:bg-[#4F58B8]"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter un accès
                            </Button>
                        </div>

                        {showAddDirect && (
                            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">Nouvel accès direct</h4>
                                    <Button 
                                        color="tertiary" 
                                        size="sm"
                                        onClick={() => {
                                            setShowAddDirect(false);
                                            setSelectedPeople([]);
                                            setSearchValue('');
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Champ de recherche */}
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Rechercher un nom ou saisir un email..."
                                            value={searchValue}
                                            onChange={setSearchValue}
                                            className="pl-10"
                                        />
                                    </div>

                                    {/* Résultats de recherche */}
                                    {searchValue && (
                                        <div className="space-y-2">
                                            {/* Recherche dans les profils */}
                                            {(() => {
                                                // Afficher le loader pendant la recherche
                                                if (isSearching) {
                                                    return (
                                                        <div className="flex items-center justify-center py-4">
                                                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                                            <span className="ml-2 text-sm text-gray-500">Recherche en cours...</span>
                                                        </div>
                                                    );
                                                }

                                                // Filtrer les utilisateurs déjà sélectionnés
                                                const filteredResults = searchResults.filter(
                                                    (user: Profile) => !selectedPeople.some(p => p.id === user.id)
                                                );

                                                if (filteredResults.length > 0) {
                                                    return (
                                                        <div className="border rounded-lg bg-white divide-y max-h-40 overflow-y-auto">
                                                            {filteredResults.map((user: Profile) => (
                                                                <button
                                                                    key={user.id}
                                                                    className="w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-gray-50 cursor-pointer"
                                                                    onClick={() => {
                                                                        setSelectedPeople(prev => [...prev, { 
                                                                            id: user.id,
                                                                            name: user.name, 
                                                                            email: user.email || `${user.firstName?.toLowerCase() || ''}.${user.lastName?.toLowerCase() || ''}@onefive.com`,
                                                                            avatar: user.avatar || '',
                                                                            type: 'profile' 
                                                                        }]);
                                                                        setSearchValue('');
                                                                    }}
                                                                >
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarImage src={user.avatar || ''} alt={user.name} />
                                                                        <AvatarFallback className="text-xs">
                                                                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-sm">{user.name}</p>
                                                                        {user.highlight && (
                                                                            <p className="text-xs text-gray-500">{user.highlight}</p>
                                                                        )}
                                                                    </div>
                                                                    <Plus className="h-4 w-4 text-gray-400" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    );
                                                }

                                                // Message pour recherche trop courte
                                                if (searchValue.length > 0 && searchValue.length < 2) {
                                                    return (
                                                        <div className="p-3 text-center text-gray-400 text-xs">
                                                            Tapez au moins 2 caractères pour rechercher
                                                        </div>
                                                    );
                                                }

                                                // Aucun profil trouvé
                                                const isEmailFormat = searchValue.includes('@') && searchValue.includes('.');

                                                if (isEmailFormat) {
                                                    return (
                                                        <Button
                                                            color="secondary"
                                                            onClick={() => {
                                                                const name = searchValue.split('@')[0];
                                                                setSelectedPeople(prev => [...prev, {
                                                                    name,
                                                                    email: searchValue,
                                                                    type: 'email'
                                                                }]);
                                                                setSearchValue('');
                                                            }}
                                                            className="w-full justify-start"
                                                        >
                                                            <Mail className="h-4 w-4 mr-2" />
                                                            Inviter {searchValue}
                                                        </Button>
                                                    );
                                                } else {
                                                    return (
                                                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                            <div className="flex items-start gap-2">
                                                                <Users className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                                                <div className="text-sm flex-1">
                                                                    <p className="font-medium text-orange-800">Profil non trouvé</p>
                                                                    <p className="text-orange-700 mt-1">
                                                                        Aucun profil trouvé pour "{searchValue}". Tapez un email complet (ex: nom@domaine.com) pour envoyer une invitation.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            })()}
                                        </div>
                                    )}
                                </div>

                                {/* Personnes sélectionnées */}
                                {selectedPeople.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium">
                                            {selectedPeople.length} personne{selectedPeople.length > 1 ? 's' : ''} sélectionnée{selectedPeople.length > 1 ? 's' : ''}
                                        </p>
                                        
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {selectedPeople.map((person) => (
                                                <div key={person.email} className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={person.avatar} alt={person.name} />
                                                        <AvatarFallback className="text-xs">
                                                            {person.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{person.name}</p>
                                                        <p className="text-xs text-gray-500">{person.email}</p>
                                                    </div>
                                                    <Badge type="pill-color" color={person.type === 'profile' ? 'brand' : 'gray'} size="sm">
                                                        {person.type === 'profile' ? 'Profil' : 'Email'}
                                                    </Badge>
                                                    <Button
                                                        color="tertiary"
                                                        size="sm"
                                                        onClick={() => setSelectedPeople(prev => prev.filter(p => p.email !== person.email))}
                                                        className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Configuration des permissions */}
                                <div className="space-y-2">
                                    <Label>Permissions par défaut</Label>
                                    <div className="space-y-2">
                                        {/* Note : Permission de voir toujours activée */}
                                        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <Eye className="h-4 w-4 text-green-600" />
                                            <Label className="flex items-center gap-2 text-green-700 font-medium">
                                                Voir le fichier (toujours activé)
                                            </Label>
                                        </div>

                                        {/* Permission de télécharger */}
                                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Download className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-sm">Télécharger le fichier</p>
                                                    <p className="text-xs text-gray-500">
                                                        Autoriser le téléchargement
                                                    </p>
                                                </div>
                                            </div>
                                            <Checkbox
                                                isSelected={newDirectAccess.access.canDownload}
                                                onChange={(checked: boolean) =>
                                                    setNewDirectAccess(prev => ({
                                                        ...prev,
                                                        access: { ...prev.access, canDownload: checked }
                                                    }))
                                                }
                                            />
                                        </div>

                                        {/* Permission de commenter */}
                                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <MessageSquare className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-sm">Commenter le fichier</p>
                                                    <p className="text-xs text-gray-500">
                                                        Laisser des commentaires
                                                    </p>
                                                </div>
                                            </div>
                                            <Checkbox
                                                isSelected={newDirectAccess.access.canComment}
                                                onChange={(checked: boolean) =>
                                                    setNewDirectAccess(prev => ({
                                                        ...prev,
                                                        access: { ...prev.access, canComment: checked }
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button 
                                        onClick={() => {
                                            selectedPeople.forEach(person => {
                                                if (file) {
                                                    onAddDirectAccess(file.id, person.email, person.name, newDirectAccess.access);
                                                }
                                            });
                                            setSelectedPeople([]);
                                            setShowAddDirect(false);
                                        }}
                                        disabled={selectedPeople.length === 0}
                                        className="bg-[#5E6AD2] hover:bg-[#4F58B8]"
                                    >
                                        Inviter {selectedPeople.length} personne{selectedPeople.length > 1 ? 's' : ''}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {directAccesses.length === 0 && !showAddDirect ? (
                            <div className="text-center py-12 border rounded-lg">
                                <User className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                <p className="text-gray-500">Aucun accès direct configuré</p>
                                <p className="text-sm text-gray-500">
                                    Ajoutez des accès directs pour des utilisateurs spécifiques
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {directAccesses.map((access) => (
                                    <div key={access.id} className={`border rounded-lg p-4 group ${
                                        access.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-white'
                                    }`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={access.userAvatar} />
                                                    <AvatarFallback>
                                                        {access.userName.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{access.userName}</p>
                                                    <p className="text-sm text-gray-500">{access.userEmail}</p>
                                                    {access.status === 'pending' && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <UserCheck className="h-3 w-3 text-yellow-600" />
                                                            <span className="text-xs text-yellow-700">
                                                                Invitation en attente
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                                                                            <div className="flex items-center gap-2">
                                                    {access.status === 'accepted' ? (
                                                        getAccessDescription(editingAccess === access.id ? editAccessData : access.access)
                                                    ) : (
                                                        <Badge type="pill-color" color="warning" size="sm">
                                                            En attente
                                                        </Badge>
                                                    )}
                                                
                                                {editingAccess === access.id ? (
                                                    // Mode édition - boutons directs
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            color="tertiary"
                                                            size="sm"
                                                            onClick={() => handleSaveEdit(access.id)}
                                                            className="hover:bg-green-50 hover:text-green-600 h-8 w-8"
                                                            title="Sauvegarder"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            color="tertiary"
                                                            size="sm"
                                                            onClick={handleCancelEdit}
                                                            className="hover:bg-gray-50 hover:text-gray-600 h-8 w-8"
                                                            title="Annuler"
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    // Mode lecture - dropdown menu
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                color="tertiary"
                                                                size="sm"
                                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {access.status === 'accepted' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleStartEdit(access)}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Edit3 className="h-4 w-4 mr-2" />
                                                                    Modifier les permissions
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={() => handleRemoveAccessClick(access)}
                                                                className="text-red-600 cursor-pointer"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Supprimer l'accès
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {access.status === 'accepted' 
                                                ? `Accès accordé le ${new Date(access.grantedAt).toLocaleDateString('fr-FR')}`
                                                : `Invité le ${new Date(access.invitedAt || access.grantedAt).toLocaleDateString('fr-FR')}`
                                            }
                                        </div>
                                        
                                        {/* Édition des permissions pour les accès acceptés */}
                                        {access.status === 'accepted' && editingAccess === access.id && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <div className="space-y-3">
                                                    <p className="text-xs font-medium text-gray-700 mb-2">Modifier les permissions</p>
                                                    
                                                    {/* Permission de voir - Toujours activée */}
                                                    <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                                        <Eye className="h-4 w-4 text-green-600" />
                                                        <Label className="text-sm font-medium text-green-700">
                                                            Voir le fichier (toujours activé)
                                                        </Label>
                                                    </div>

                                                    {/* Permission de télécharger */}
                                                    <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <Download className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm font-medium">Télécharger le fichier</span>
                                                        </div>
                                                        <Checkbox
                                                            isSelected={editAccessData.canDownload}
                                                            onChange={(checked: boolean) => handleEditAccessChange('canDownload', checked)}
                                                        />
                                                    </div>

                                                    {/* Permission de commenter */}
                                                    <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <MessageSquare className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm font-medium">Commenter le fichier</span>
                                                        </div>
                                                        <Checkbox
                                                            isSelected={editAccessData.canComment}
                                                            onChange={(checked: boolean) => handleEditAccessChange('canComment', checked)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button color="secondary" onClick={onClose}>
                        Fermer
                    </Button>
                </DialogFooter>

                {/* Modal de confirmation de suppression */}
                <Dialog open={showRemoveConfirmation} onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        handleCloseRemoveConfirmation();
                    }
                }}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600">
                                <X className="h-5 w-5" />
                                Supprimer l'accès
                            </DialogTitle>
                            <DialogDescription>
                                Cette action est irréversible. <strong>{accessToRemove?.userName}</strong> perdra immédiatement l'accès à ce fichier.
                                <br /><br />
                                Pour confirmer, veuillez taper <strong className="text-red-600">{accessToRemove?.userName}</strong> ci-dessous.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitRemoveAccess}>
                            <div className="py-4">
                                <Label htmlFor="remove-confirm-name">Confirmer le nom de l'utilisateur</Label>
                                <Input
                                    id="remove-confirm-name"
                                    value={confirmationName}
                                    onChange={setConfirmationName}
                                    placeholder={`Tapez "${accessToRemove?.userName}"`}
                                    className="mt-2"
                                    autoComplete="off"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    color="secondary"
                                    onClick={handleCloseRemoveConfirmation}
                                    isDisabled={isRemoving}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary-destructive"
                                    isDisabled={!isRemoveFormValid}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {isRemoving ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                            Suppression...
                                        </div>
                                    ) : (
                                        "Supprimer l'accès"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </DialogContent>
        </Dialog>
    );
}; 