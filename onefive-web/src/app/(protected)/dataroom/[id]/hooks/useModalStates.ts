import { useState } from "react";
import { Group } from "../types";

export function useModalStates() {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false);
    const [isRenameCategoryModalOpen, setIsRenameCategoryModalOpen] = useState(false);
    const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
    const [isDeleteFileModalOpen, setIsDeleteFileModalOpen] = useState(false);
    const [isRenameFileModalOpen, setIsRenameFileModalOpen] = useState(false);
    const [isChangeCategoryModalOpen, setIsChangeCategoryModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isGroupDetailsModalOpen, setIsGroupDetailsModalOpen] = useState(false);

    const [newCategoryName, setNewCategoryName] = useState('');
    const [categoryError, setCategoryError] = useState<string | null>(null);
    const [categoryToEdit, setCategoryToEdit] = useState<{ id: string; name: string } | null>(null);
    const [renameCategoryName, setRenameCategoryName] = useState('');
    const [renameCategoryError, setRenameCategoryError] = useState<string | null>(null);
    const [deleteConfirmationName, setDeleteConfirmationName] = useState('');

    const [newGroupName, setNewGroupName] = useState('');
    const [groupError, setGroupError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);
    const [selectedGroupForModal, setSelectedGroupForModal] = useState<Group | null>(null);

    const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);
    const [deleteFileConfirmation, setDeleteFileConfirmation] = useState('');
    const [fileToRename, setFileToRename] = useState<{ id: string; name: string } | null>(null);
    const [newFileName, setNewFileName] = useState('');
    const [renameFileError, setRenameFileError] = useState<string | null>(null);
    const [fileToChangeCategory, setFileToChangeCategory] = useState<{ id: string; name: string; category: string } | null>(null);
    const [newFileCategoryId, setNewFileCategoryId] = useState('');
    const [changeCategoryError, setChangeCategoryError] = useState<string | null>(null);

    const [inviteTargetGroupId, setInviteTargetGroupId] = useState<string | null>(null);
    const [inviteSearch, setInviteSearch] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [selectedProfile, setSelectedProfile] = useState<{ id: string; name: string; email: string; avatar?: string } | null>(null);

    const resetCategoryForm = () => {
        setNewCategoryName('');
        setCategoryError(null);
    };

    const resetRenameCategoryForm = () => {
        setRenameCategoryName('');
        setRenameCategoryError(null);
    };

    const resetGroupForm = () => {
        setNewGroupName('');
        setGroupError(null);
        setCurrentStep(1);
        setSelectedCategories([]);
    };

    const resetFileRenameForm = () => {
        setNewFileName('');
        setRenameFileError(null);
    };

    const resetChangeCategoryForm = () => {
        setNewFileCategoryId('');
        setChangeCategoryError(null);
    };

    return {
        isUploadModalOpen, setIsUploadModalOpen,
        isCreateCategoryModalOpen, setIsCreateCategoryModalOpen,
        isCreateGroupModalOpen, setIsCreateGroupModalOpen,
        isDeleteGroupModalOpen, setIsDeleteGroupModalOpen,
        isRenameCategoryModalOpen, setIsRenameCategoryModalOpen,
        isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen,
        isDeleteFileModalOpen, setIsDeleteFileModalOpen,
        isRenameFileModalOpen, setIsRenameFileModalOpen,
        isChangeCategoryModalOpen, setIsChangeCategoryModalOpen,
        isInviteModalOpen, setIsInviteModalOpen,
        isGroupDetailsModalOpen, setIsGroupDetailsModalOpen,

        newCategoryName, setNewCategoryName,
        categoryError, setCategoryError,
        categoryToEdit, setCategoryToEdit,
        renameCategoryName, setRenameCategoryName,
        renameCategoryError, setRenameCategoryError,
        deleteConfirmationName, setDeleteConfirmationName,
        resetCategoryForm, resetRenameCategoryForm,

        newGroupName, setNewGroupName,
        groupError, setGroupError,
        currentStep, setCurrentStep,
        slideDirection, setSlideDirection,
        selectedCategories, setSelectedCategories,
        selectedGroup, setSelectedGroup,
        selectedGroupForModal, setSelectedGroupForModal,
        resetGroupForm,

        fileToDelete, setFileToDelete,
        deleteFileConfirmation, setDeleteFileConfirmation,
        fileToRename, setFileToRename,
        newFileName, setNewFileName,
        renameFileError, setRenameFileError,
        fileToChangeCategory, setFileToChangeCategory,
        newFileCategoryId, setNewFileCategoryId,
        changeCategoryError, setChangeCategoryError,
        resetFileRenameForm, resetChangeCategoryForm,

        inviteTargetGroupId, setInviteTargetGroupId,
        inviteSearch, setInviteSearch,
        inviteEmail, setInviteEmail,
        selectedProfile, setSelectedProfile,
    };
}
