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
import { Badge } from '@/components/base/badges/badges';
import { Checkbox } from "@/components/ui/checkbox";
import { Group } from "../types";
import { Shield, FolderClosed, Users } from "lucide-react";

interface ManagePermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: Group | null;
    categories: Array<{
        id: string;
        name: string;
        count: number | undefined;
    }>;
    onUpdatePermissions: (groupId: string, permissions: { [categoryId: string]: boolean }) => void;
}

export const ManagePermissionsModal: React.FC<ManagePermissionsModalProps> = ({
    isOpen,
    onClose,
    group,
    categories,
    onUpdatePermissions,
}) => {
    const [permissions, setPermissions] = useState<{ [categoryId: string]: boolean }>({});

    useEffect(() => {
        if (group && isOpen) {
            setPermissions(group.categoryAccess || {});
        }
    }, [group, isOpen]);

    const handlePermissionChange = (categoryId: string, hasAccess: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [categoryId]: hasAccess
        }));
    };

    const handleSave = () => {
        if (group) {
            onUpdatePermissions(group.id, permissions);
            onClose();
        }
    };

    const handleSelectAll = () => {
        const allPermissions: { [categoryId: string]: boolean } = {};
        categories.forEach(category => {
            if (category.id !== 'all') {
                allPermissions[category.id] = true;
            }
        });
        setPermissions(allPermissions);
    };

    const handleDeselectAll = () => {
        const noPermissions: { [categoryId: string]: boolean } = {};
        categories.forEach(category => {
            if (category.id !== 'all') {
                noPermissions[category.id] = false;
            }
        });
        setPermissions(noPermissions);
    };

    if (!group) return null;

    const enabledCount = Object.values(permissions).filter(Boolean).length;
    const totalCategories = categories.filter(cat => cat.id !== 'all').length;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5E6AD2]/10">
                            <Shield className="h-5 w-5 text-[#5E6AD2]" />
                        </div>
                        <div>
                            <DialogTitle>Gérer les permissions</DialogTitle>
                            <DialogDescription>
                                Définir les catégories accessibles au groupe "{group.name}"
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Group Info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="h-4 w-4 text-gray-500" />
                        <div>
                            <p className="font-medium text-sm">{group.name}</p>
                            <p className="text-xs text-gray-500">
                                {group.members.length} membre{group.members.length > 1 ? 's' : ''}
                            </p>
                        </div>
                        <Badge type="badge-modern" color="gray" size="sm" className="ml-auto">
                            {enabledCount}/{totalCategories} catégories
                        </Badge>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                            className="flex-1"
                        >
                            Tout sélectionner
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDeselectAll}
                            className="flex-1"
                        >
                            Tout désélectionner
                        </Button>
                    </div>

                    {/* Categories List */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Catégories de documents
                        </h4>
                        {categories
                            .filter(category => category.id !== 'all')
                            .map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <FolderClosed className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-sm">{category.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {category.count} document{(category.count || 0) > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <Checkbox
                                    checked={permissions[category.id] || false}
                                    onCheckedChange={(checked: boolean) => 
                                        handlePermissionChange(category.id, checked)
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button onClick={handleSave} className="bg-[#5E6AD2] hover:bg-[#4F58B8]">
                        Enregistrer les permissions
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 