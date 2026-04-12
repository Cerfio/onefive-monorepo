import React from "react";
import {
    FileText,
    FileSpreadsheet,
    PresentationIcon,
    FileImage,
    FileVideo,
    File,
    Archive
} from "lucide-react";

export const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatStorageSize = (sizeInMB: number) => {
    if (sizeInMB < 1024) {
        return `${sizeInMB.toFixed(2)} MB`;
    }
    return `${(sizeInMB / 1024).toFixed(2)} GB`;
};

export const getFileIcon = (fileName: string, mimetype?: string): React.ReactNode => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    // Utiliser d'abord le mimetype si disponible
    if (mimetype) {
        if (mimetype.startsWith('image/')) {
            return React.createElement(FileImage, { className: "h-5 w-5 text-blue-500" });
        }

        if (mimetype.startsWith('video/')) {
            return React.createElement(FileVideo, { className: "h-5 w-5 text-purple-500" });
        }

        // Types MIME spécifiques
        switch (mimetype) {
            case 'application/pdf':
                return React.createElement(FileText, { className: "h-5 w-5 text-red-500" });
            case 'application/msword':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return React.createElement(FileText, { className: "h-5 w-5 text-blue-600" });
            case 'application/vnd.ms-excel':
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                return React.createElement(FileSpreadsheet, { className: "h-5 w-5 text-green-600" });
            case 'application/vnd.ms-powerpoint':
            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                return React.createElement(PresentationIcon, { className: "h-5 w-5 text-orange-500" });
            case 'application/zip':
            case 'application/x-rar-compressed':
                return React.createElement(Archive, { className: "h-5 w-5 text-yellow-600" });
        }
    }

    // Fallback sur l'extension si le mimetype n'est pas disponible ou reconnu
    switch (extension) {
        case 'pdf':
            return React.createElement(FileText, { className: "h-5 w-5 text-red-500" });
        case 'doc':
        case 'docx':
            return React.createElement(FileText, { className: "h-5 w-5 text-blue-600" });
        case 'xls':
        case 'xlsx':
            return React.createElement(FileSpreadsheet, { className: "h-5 w-5 text-green-600" });
        case 'ppt':
        case 'pptx':
            return React.createElement(PresentationIcon, { className: "h-5 w-5 text-orange-500" });
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
            return React.createElement(FileImage, { className: "h-5 w-5 text-blue-500" });
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'mkv':
            return React.createElement(FileVideo, { className: "h-5 w-5 text-purple-500" });
        case 'zip':
        case 'rar':
            return React.createElement(Archive, { className: "h-5 w-5 text-yellow-600" });
        default:
            return React.createElement(File, { className: "h-5 w-5 text-gray-500" });
    }
};