import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/base/dialog/dialog";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Label } from "@/components/base/label/label";
import { Plus, Trash2 } from "lucide-react";

interface Category {
    id: string;
    name: string;
    count?: number;
}

interface ManageCategoriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    onCreateCategory: (name: string) => void;
    onDeleteCategory: (id: string) => void;
    isCreating: boolean;
    isDeleting: boolean;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
    isOpen,
    onClose,
    categories,
    onCreateCategory,
    onDeleteCategory,
    isCreating,
    isDeleting,
}) => {
    const [newCategoryName, setNewCategoryName] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            onCreateCategory(newCategoryName.trim());
            setNewCategoryName('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Gérer les catégories</DialogTitle>
                    <DialogDescription>
                        Créez et supprimez des catégories pour organiser vos documents.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Formulaire de création */}
                    <form onSubmit={handleSubmit} className="space-y-2">
                        <Label htmlFor="new-category">Nouvelle catégorie</Label>
                        <div className="flex space-x-2">
                            <Input
                                id="new-category"
                                value={newCategoryName}
                                onChange={setNewCategoryName}
                                placeholder="Entrez le nom de la catégorie"
                            />
                            <Button type="submit" isDisabled={isCreating}>
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter
                            </Button>
                        </div>
                    </form>

                    {/* Liste des catégories */}
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm">{category.name}</span>
                                    {category.count !== undefined && (
                                        <span className="text-xs text-gray-500">
                                            ({category.count} documents)
                                        </span>
                                    )}
                                </div>
                                <Button
                                    color="tertiary"
                                    size="sm"
                                    onClick={() => onDeleteCategory(category.id)}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button color="secondary" onClick={onClose}>
                        Fermer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}; 