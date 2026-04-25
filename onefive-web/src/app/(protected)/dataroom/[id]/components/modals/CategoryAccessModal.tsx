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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar2";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/ui/label";
import { 
    Users, 
    User, 
    Eye, 
    Download, 
    MessageSquare,
    Plus,
    X,
    Search,
    Edit3,
    Check,
    RotateCcw,
    Trash2,
    FolderClosed,
    Loader2
} from "lucide-react";
import { Group } from "../../types";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchProfiles, Profile } from "@/hooks/useSearchProfiles";

interface CategoryAccessData {
    canView: boolean; // Toujours true par défaut
    canDownload: boolean;
    canComment: boolean;
}

interface DirectCategoryAccess {
    id: string;
    userEmail: string;
    userName: string;
    userAvatar?: string;
    access: CategoryAccessData;
    grantedAt: string;
    status: 'accepted' | 'pending' | 'refused';
    invitedAt?: string;
}

interface CategoryAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: {
        id: string;
        name: string;
        count?: number;
    } | null;
    groups: Group[];
    directAccesses?: DirectCategoryAccess[];
    onUpdateGroupAccess: (groupId: string, categoryId: string, access: CategoryAccessData) => void;
    onAddDirectAccess: (categoryId: string, userEmail: string, userName: string, access: CategoryAccessData) => void;
    onRemoveDirectAccess: (categoryId: string, accessId: string) => void;
    onUpdateDirectAccess: (categoryId: string, accessId: string, access: CategoryAccessData) => void;
}

export const CategoryAccessModal: React.FC<CategoryAccessModalProps> = ({
    isOpen,
    onClose,
    category,
    groups,
    directAccesses = [],
    onUpdateGroupAccess,
    onAddDirectAccess,
    onRemoveDirectAccess,
    onUpdateDirectAccess,
}) => {
    const [activeTab, setActiveTab] = useState<"groups" | "direct">("groups");
    const [groupAccess, setGroupAccess] = useState<{ [groupId: string]: CategoryAccessData }>({});
    const [showAddDirect, setShowAddDirect] = useState(false);
    const [editingAccess, setEditingAccess] = useState<string | null>(null);
    const [editAccessData, setEditAccessData] = useState<CategoryAccessData>({
        canView: true,
        canDownload: false,
        canComment: false,
    });
    const [searchValue, setSearchValue] = useState('');
    const [_selectedPeople, _setSelectedPeople] = useState<Array<{
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
        if (category && isOpen) {
            // Initialiser les accès des groupes pour cette catégorie
            const initialGroupAccess: { [groupId: string]: CategoryAccessData } = {};
            groups.forEach(group => {
                // Vérifier si le groupe a accès à cette catégorie
                const hasCategoryAccess = group.categoryAccess?.[category.id] || false;
                initialGroupAccess[group.id] = {
                    canView: true, // Toujours true
                    canDownload: hasCategoryAccess,
                    canComment: false,
                };
            });
            setGroupAccess(initialGroupAccess);
        }
    }, [category, groups, isOpen]);

    const handleGroupAccessChange = (groupId: string, accessType: keyof CategoryAccessData, value: boolean) => {
        setGroupAccess(prev => ({
            ...prev,
            [groupId]: {
                ...prev[groupId],
                [accessType]: value
            }
        }));
    };

    const handleSaveGroupAccess = (groupId: string) => {
        if (category) {
            onUpdateGroupAccess(groupId, category.id, groupAccess[groupId]);
        }
    };

    const handleAddDirectAccess = () => {
        if (category && newDirectAccess.email) {
            onAddDirectAccess(
                category.id, 
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

    const getAccessDescription = (access: CategoryAccessData) => {
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

    const handleStartEdit = (access: DirectCategoryAccess) => {
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
        if (category) {
            onUpdateDirectAccess(category.id, accessId, editAccessData);
            setEditingAccess(null);
        }
    };

    const handleEditAccessChange = (accessType: keyof CategoryAccessData, value: boolean) => {
        setEditAccessData(prev => ({
            ...prev,
            [accessType]: value
        }));
    };

    const handleRemoveDirectAccess = (accessId: string) => {
        if (category) {
            onRemoveDirectAccess(category.id, accessId);
        }
    };

    if (!category) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5E6AD2]/10">
                            <FolderClosed className="h-5 w-5 text-[#5E6AD2]" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle>Permissions de la catégorie</DialogTitle>
                            <DialogDescription className="flex items-center gap-2 mt-1">
                                <span className="truncate">{category.name}</span>
                                {category.count !== undefined && (
                                    <Badge variant="outline" className="ml-2">
                                        {category.count} fichiers
                                    </Badge>
                                )}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "groups" | "direct")} className="flex-1">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="groups" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Accès par groupes
                        </TabsTrigger>
                        <TabsTrigger value="direct" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Accès directs
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="groups" className="space-y-4 mt-4 overflow-y-auto max-h-96">
                        {groups.map((group) => (
                            <div key={group.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                            <Users className="h-4 w-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{group.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {group.members.length} membres
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
                                                Voir les fichiers de la catégorie (toujours activé)
                                            </Label>
                                        </div>

                                        {/* Permission de télécharger */}
                                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Download className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-sm">Télécharger les fichiers</p>
                                                    <p className="text-xs text-gray-500">
                                                        Autoriser le téléchargement des fichiers de cette catégorie
                                                    </p>
                                                </div>
                                            </div>
                                            <Checkbox
                                                checked={groupAccess[group.id]?.canDownload || false}
                                                onCheckedChange={(checked: boolean) => 
                                                    handleGroupAccessChange(group.id, 'canDownload', checked)
                                                }
                                            />
                                        </div>

                                        {/* Permission de commenter */}
                                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <MessageSquare className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-sm">Commenter les fichiers</p>
                                                    <p className="text-xs text-gray-500">
                                                        Autoriser les commentaires sur les fichiers de cette catégorie
                                                    </p>
                                                </div>
                                            </div>
                                            <Checkbox
                                                checked={groupAccess[group.id]?.canComment || false}
                                                onCheckedChange={(checked: boolean) => 
                                                    handleGroupAccessChange(group.id, 'canComment', checked)
                                                }
                                            />
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
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="direct" className="space-y-4 mt-4 overflow-y-auto max-h-96">
                        <div className="flex justify-between items-center">
                            <h3 className="font-medium">Accès directs à la catégorie</h3>
                            <Button 
                                size="sm" 
                                onClick={() => setShowAddDirect(true)}
                                className="bg-[#5E6AD2] hover:bg-[#4F58B8]"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter un accès
                            </Button>
                        </div>

                        {/* Formulaire d'ajout d'accès direct */}
                        {showAddDirect && (
                            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Nouvel accès direct</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowAddDirect(false)}
                                        className="text-gray-500 hover:text-red-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Recherche d'utilisateurs */}
                                <div className="space-y-2">
                                    <Label>Rechercher un utilisateur</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            type="text"
                                            placeholder="Nom ou email..."
                                            className="pl-10"
                                            value={searchValue}
                                            onChange={setSearchValue}
                                        />
                                    </div>
                                </div>

                                {/* Résultats de recherche */}
                                {searchValue && (
                                    <div className="space-y-2">
                                        {isSearching ? (
                                            <div className="flex items-center justify-center py-4">
                                                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                                <span className="ml-2 text-sm text-gray-500">Recherche en cours...</span>
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map((user: Profile) => (
                                                <div 
                                                    key={user.id}
                                                    className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                                                    onClick={() => {
                                                        setNewDirectAccess(prev => ({
                                                            ...prev,
                                                            email: user.email || `${user.firstName?.toLowerCase() || ''}.${user.lastName?.toLowerCase() || ''}@onefive.com`,
                                                            name: user.name
                                                        }));
                                                        setSearchValue('');
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={user.avatar || ''} alt={user.name} />
                                                            <AvatarFallback className="text-xs">
                                                                {user.name.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium">{user.name}</p>
                                                            {user.highlight && (
                                                                <p className="text-xs text-gray-500">{user.highlight}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Plus className="h-4 w-4 text-gray-400" />
                                                </div>
                                            ))
                                        ) : debouncedSearchValue.length >= 2 ? (
                                            <div className="p-3 text-center text-gray-500 text-sm">
                                                Aucun utilisateur trouvé pour "{debouncedSearchValue}"
                                            </div>
                                        ) : searchValue.length > 0 && searchValue.length < 2 ? (
                                            <div className="p-3 text-center text-gray-400 text-xs">
                                                Tapez au moins 2 caractères pour rechercher
                                            </div>
                                        ) : null}
                                    </div>
                                )}

                                {/* Formulaire d'accès direct */}
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                placeholder="user@example.com"
                                                value={newDirectAccess.email}
                                                onChange={(value) => setNewDirectAccess(prev => ({
                                                    ...prev,
                                                    email: value
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <Label>Nom (optionnel)</Label>
                                            <Input
                                                type="text"
                                                placeholder="Nom d'affichage"
                                                value={newDirectAccess.name}
                                                onChange={(value) => setNewDirectAccess(prev => ({
                                                    ...prev,
                                                    name: value
                                                }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Configuration des permissions */}
                                    <div className="space-y-2">
                                        <Label>Permissions par défaut</Label>
                                        <div className="space-y-2">
                                            {/* Note : Permission de voir toujours activée */}
                                            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <Eye className="h-4 w-4 text-green-600" />
                                                <Label className="flex items-center gap-2 text-green-700 font-medium">
                                                    Voir les fichiers de la catégorie (toujours activé)
                                                </Label>
                                            </div>

                                            {/* Permission de télécharger */}
                                            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Download className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-sm">Télécharger les fichiers</p>
                                                        <p className="text-xs text-gray-500">
                                                            Autoriser le téléchargement
                                                        </p>
                                                    </div>
                                                </div>
                                                <Checkbox
                                                    checked={newDirectAccess.access.canDownload}
                                                    onCheckedChange={(checked: boolean) => 
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
                                                        <p className="font-medium text-sm">Commenter les fichiers</p>
                                                        <p className="text-xs text-gray-500">
                                                            Autoriser les commentaires
                                                        </p>
                                                    </div>
                                                </div>
                                                <Checkbox
                                                    checked={newDirectAccess.access.canComment}
                                                    onCheckedChange={(checked: boolean) => 
                                                        setNewDirectAccess(prev => ({
                                                            ...prev,
                                                            access: { ...prev.access, canComment: checked }
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowAddDirect(false)}
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleAddDirectAccess}
                                            disabled={!newDirectAccess.email}
                                            className="bg-[#5E6AD2] hover:bg-[#4F58B8]"
                                        >
                                            Ajouter l'accès
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Liste des accès directs existants */}
                        {directAccesses.length === 0 && !showAddDirect ? (
                            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                                <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-gray-500 text-sm">Aucun accès direct configuré</p>
                                <p className="text-gray-400 text-xs">
                                    Ajoutez des accès directs pour des utilisateurs spécifiques
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {directAccesses.map((access) => (
                                    <div 
                                        key={access.id} 
                                        className="border border-gray-200 rounded-lg p-4 space-y-3 group hover:border-gray-300 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={access.userAvatar} alt={access.userName} />
                                                    <AvatarFallback className="text-xs">
                                                        {access.userName.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{access.userName}</p>
                                                    <p className="text-xs text-gray-500">{access.userEmail}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Badge 
                                                            variant={access.status === 'accepted' ? 'default' : 
                                                                    access.status === 'pending' ? 'outline' : 'destructive'}
                                                            className="text-xs"
                                                        >
                                                            {access.status === 'accepted' ? 'Accepté' :
                                                             access.status === 'pending' ? 'En attente' : 'Refusé'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {editingAccess === access.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleSaveEdit(access.id)}
                                                            className="hover:bg-green-50 hover:text-green-600 h-8 w-8"
                                                            title="Sauvegarder"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={handleCancelEdit}
                                                            className="hover:bg-gray-50 hover:text-gray-600 h-8 w-8"
                                                            title="Annuler"
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        {getAccessDescription(access.access)}
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {access.status === 'accepted' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleStartEdit(access)}
                                                                    className="h-8 w-8"
                                                                    title="Modifier les permissions"
                                                                >
                                                                    <Edit3 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleRemoveDirectAccess(access.id)}
                                                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                                                title="Supprimer l'accès"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
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
                                                            Voir les fichiers de la catégorie (toujours activé)
                                                        </Label>
                                                    </div>

                                                    {/* Permission de télécharger */}
                                                    <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <Download className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm font-medium">Télécharger les fichiers</span>
                                                        </div>
                                                        <Checkbox
                                                            checked={editAccessData.canDownload}
                                                            onCheckedChange={(checked: boolean) => handleEditAccessChange('canDownload', checked)}
                                                        />
                                                    </div>

                                                    {/* Permission de commenter */}
                                                    <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <MessageSquare className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm font-medium">Commenter les fichiers</span>
                                                        </div>
                                                        <Checkbox
                                                            checked={editAccessData.canComment}
                                                            onCheckedChange={(checked: boolean) => handleEditAccessChange('canComment', checked)}
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
                    <Button variant="outline" onClick={onClose}>
                        Fermer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};