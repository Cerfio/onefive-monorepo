import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateGroup: (groupData: {
        name: string;
        hasAllAccess: boolean;
        canUpload: boolean;
        canShare: boolean;
        canManageUsers: boolean;
        canManageGroups: boolean;
    }) => void;
    isCreating: boolean;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
    isOpen,
    onClose,
    onCreateGroup,
    isCreating,
}) => {
    const [name, setName] = React.useState('');
    const [hasAllAccess, setHasAllAccess] = React.useState(false);
    const [canUpload, setCanUpload] = React.useState(false);
    const [canShare, setCanShare] = React.useState(false);
    const [canManageUsers, setCanManageUsers] = React.useState(false);
    const [canManageGroups, setCanManageGroups] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateGroup({
            name,
            hasAllAccess,
            canUpload,
            canShare,
            canManageUsers,
            canManageGroups,
        });
    };

    const resetForm = () => {
        setName('');
        setHasAllAccess(false);
        setCanUpload(false);
        setCanShare(false);
        setCanManageUsers(false);
        setCanManageGroups(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Créer un nouveau groupe</DialogTitle>
                    <DialogDescription>
                        Créez un groupe pour organiser vos utilisateurs et définir leurs permissions.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom du groupe</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Entrez le nom du groupe"
                            required
                        />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <Label className="text-base font-medium">Permissions du groupe</Label>
                        
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="hasAllAccess"
                                    checked={hasAllAccess}
                                    onCheckedChange={(checked) => setHasAllAccess(checked as boolean)}
                                />
                                <Label htmlFor="hasAllAccess" className="text-sm font-normal">
                                    Accès à tous les fichiers
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="canUpload"
                                    checked={canUpload}
                                    onCheckedChange={(checked) => setCanUpload(checked as boolean)}
                                />
                                <Label htmlFor="canUpload" className="text-sm font-normal">
                                    Peut télécharger des fichiers
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="canShare"
                                    checked={canShare}
                                    onCheckedChange={(checked) => setCanShare(checked as boolean)}
                                />
                                <Label htmlFor="canShare" className="text-sm font-normal">
                                    Peut partager des fichiers
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="canManageUsers"
                                    checked={canManageUsers}
                                    onCheckedChange={(checked) => setCanManageUsers(checked as boolean)}
                                />
                                <Label htmlFor="canManageUsers" className="text-sm font-normal">
                                    Peut gérer les utilisateurs
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="canManageGroups"
                                    checked={canManageGroups}
                                    onCheckedChange={(checked) => setCanManageGroups(checked as boolean)}
                                />
                                <Label htmlFor="canManageGroups" className="text-sm font-normal">
                                    Peut gérer les groupes
                                </Label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose} type="button">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isCreating}>
                            {isCreating ? "Création..." : "Créer le groupe"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}; 