import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    uploadFiles,
    createCategory,
    updateCategory,
    deleteCategory,
    updateFile,
    deleteFile,
    createGroup,
    updateGroup,
    deleteGroup,
    createInvitation,
    acceptInvitation,
    declineInvitation,
    deleteInvitation,
    getGroup,
    updateGroupPermissions,
    removeMember,
    leaveDataroom,
} from "@/queries/dataroom";

const MAX_UPLOAD_SIZE_PER_REQUEST = 100;

export function useDataroomMutations(dataroomId: string) {
    const queryClient = useQueryClient();

    const invalidateDataroom = () => {
        queryClient.invalidateQueries({ queryKey: ["dataroom", dataroomId] });
    };

    const invalidateFiles = () => {
        queryClient.invalidateQueries({ queryKey: ["dataroom-files", dataroomId] });
    };

    const upload = useMutation({
        mutationFn: (formData: FormData) => uploadFiles(dataroomId, formData),
        onSuccess: () => {
            invalidateDataroom();
            invalidateFiles();
            toast.success("Fichiers téléchargés avec succès");
        },
        onError: (error: any) => {
            const status = error?.response?.status;
            const message = error?.response?.data?.message || error?.message;

            if (status === 413) {
                toast.error(`Fichiers trop volumineux. Réduisez à moins de ${MAX_UPLOAD_SIZE_PER_REQUEST}MB.`);
            } else if (status === 400) {
                toast.error("Format non supporté : " + (message || "Vérifiez vos fichiers"));
            } else if (status === 403) {
                toast.error("Vous n'avez pas l'autorisation de télécharger");
            } else if (status === 500) {
                toast.error("Erreur serveur. Veuillez réessayer.");
            } else {
                toast.error("Erreur lors du téléchargement : " + (message || "Erreur inconnue"));
            }
        },
    });

    const createCategoryMut = useMutation({
        mutationFn: (name: string) => createCategory({ dataroomId, name }),
        onSuccess: () => {
            invalidateDataroom();
            toast.success("Catégorie créée avec succès");
        },
    });

    const updateCategoryMut = useMutation({
        mutationFn: ({ categoryId, name }: { categoryId: string; name: string }) =>
            updateCategory({ dataroomId, categoryId, name }),
        onSuccess: () => invalidateDataroom(),
    });

    const deleteCategoryMut = useMutation({
        mutationFn: ({ categoryId }: { categoryId: string }) =>
            deleteCategory({ dataroomId, categoryId }),
        onSuccess: () => invalidateDataroom(),
    });

    const updateFileMut = useMutation({
        mutationFn: ({ fileId, name }: { fileId: string; name: string }) =>
            updateFile({ dataroomId, fileId, name }),
        onSuccess: () => {
            invalidateFiles();
            toast.success("Fichier renommé avec succès");
        },
    });

    const changeFileCategoryMut = useMutation({
        mutationFn: ({ fileId, categoryId }: { fileId: string; categoryId: string }) =>
            updateFile({ dataroomId, fileId, categoryId }),
        onSuccess: () => {
            invalidateFiles();
            invalidateDataroom();
            toast.success("Catégorie du fichier mise à jour");
        },
    });

    const deleteFileMut = useMutation({
        mutationFn: ({ fileId }: { fileId: string }) =>
            deleteFile({ dataroomId, fileId }),
        onSuccess: () => {
            invalidateFiles();
            invalidateDataroom();
            toast.success("Fichier supprimé avec succès");
        },
        onError: () => toast.error("Erreur lors de la suppression du fichier"),
    });

    const createGroupMut = useMutation({
        mutationFn: (params: {
            name: string;
            hasAllAccess: boolean;
            canUpload: boolean;
            canShare: boolean;
            canManageUsers: boolean;
            canManageGroups: boolean;
        }) => createGroup({ dataroomId, ...params }),
        onSuccess: () => invalidateDataroom(),
    });

    const updateGroupMut = useMutation({
        mutationFn: ({ groupId, name }: { groupId: string; name: string }) =>
            updateGroup({ dataroomId, groupId, name }),
        onSuccess: (_data, variables) => {
            invalidateDataroom();
            toast.success(`Groupe "${variables.name}" renommé`);
        },
        onError: () => toast.error("Erreur lors de la mise à jour du groupe"),
    });

    const deleteGroupMut = useMutation({
        mutationFn: ({ groupId }: { groupId: string }) =>
            deleteGroup({ dataroomId, groupId }),
        onSuccess: () => {
            invalidateDataroom();
            toast.success("Groupe supprimé avec succès");
        },
        onError: () => toast.error("Erreur lors de la suppression du groupe"),
    });

    const createInvitationMut = useMutation({
        mutationFn: (params: {
            groupId: string;
            profileId: string;
            existingUser?: { profileInvitedId: string };
            newUser?: { email: string; firstname: string; lastname: string; dataroomName: string };
        }) => createInvitation({ dataroomId, ...params }),
        onSuccess: () => {
            invalidateDataroom();
            toast.success("Invitation envoyée avec succès");
        },
        onError: () => toast.error("Erreur lors de l'envoi de l'invitation"),
    });

    const acceptInvitationMut = useMutation({
        mutationFn: ({ invitationId, profileId }: { invitationId: string; profileId: string }) =>
            acceptInvitation({ dataroomId, invitationId, profileId }),
        onSuccess: () => {
            invalidateDataroom();
            toast.success("Invitation acceptée");
        },
        onError: () => toast.error("Erreur lors de l'acceptation de l'invitation"),
    });

    const declineInvitationMut = useMutation({
        mutationFn: ({ invitationId, profileId }: { invitationId: string; profileId: string }) =>
            declineInvitation({ dataroomId, invitationId, profileId }),
        onSuccess: () => {
            invalidateDataroom();
            toast.info("Invitation refusée");
        },
        onError: () => toast.error("Erreur lors du refus de l'invitation"),
    });

    const deleteInvitationMut = useMutation({
        mutationFn: ({ invitationId, profileId }: { invitationId: string; profileId: string }) =>
            deleteInvitation({ dataroomId, invitationId, profileId }),
        onSuccess: () => {
            invalidateDataroom();
            toast.info("Invitation annulée");
        },
        onError: () => toast.error("Erreur lors de l'annulation de l'invitation"),
    });

    const updatePermissionsMut = useMutation({
        mutationFn: ({ groupId, permissions }: {
            groupId: string;
            permissions: Array<{ categoryId: string; canView: boolean; canDownload: boolean; canComment: boolean }>;
        }) => updateGroupPermissions({ dataroomId, groupId, permissions }),
        onSuccess: () => {
            invalidateDataroom();
            toast.success("Permissions mises à jour");
        },
        onError: () => toast.error("Erreur lors de la mise à jour des permissions"),
    });

    const removeMemberMut = useMutation({
        mutationFn: ({ groupId, memberId }: { groupId: string; memberId: string }) =>
            removeMember({ dataroomId, groupId, memberId }),
        onSuccess: () => {
            invalidateDataroom();
            toast.success("Membre retiré du groupe");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Erreur lors du retrait du membre";
            toast.error(message);
        },
    });

    const getGroupDetailsMut = useMutation({
        mutationFn: (groupId: string) => getGroup({ dataroomId, groupId }),
    });

    const leaveDataroomMut = useMutation({
        mutationFn: () => leaveDataroom({ dataroomId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["datarooms"] });
            toast.success("Vous avez quitté la dataroom");
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || "Erreur lors de la sortie de la dataroom";
            toast.error(message);
        },
    });

    return {
        upload,
        createCategory: createCategoryMut,
        updateCategory: updateCategoryMut,
        deleteCategory: deleteCategoryMut,
        updateFile: updateFileMut,
        changeFileCategory: changeFileCategoryMut,
        deleteFile: deleteFileMut,
        createGroup: createGroupMut,
        updateGroup: updateGroupMut,
        deleteGroup: deleteGroupMut,
        createInvitation: createInvitationMut,
        acceptInvitation: acceptInvitationMut,
        declineInvitation: declineInvitationMut,
        deleteInvitation: deleteInvitationMut,
        updateGroupPermissions: updatePermissionsMut,
        removeMember: removeMemberMut,
        getGroupDetails: getGroupDetailsMut,
        leaveDataroom: leaveDataroomMut,
    };
}
