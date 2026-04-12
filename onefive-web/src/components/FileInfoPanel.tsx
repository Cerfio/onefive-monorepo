import React, { useState } from "react";
import { 
    ChevronLeft, 
    ChevronRight, 
    FileText, 
    HardDrive, 
    FolderOpen, 
    Calendar, 
    Clock,
    Shield,
    Eye,
} from "lucide-react";
import type { FileMetadata } from "@/types/file-viewer";
import { getFileTypeLabel } from "@/utils/file-utils";

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 octets';
    const k = 1024;
    const sizes = ['octets', 'Ko', 'Mo', 'Go', 'To'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

interface FileInfoPanelProps {
    fileMetadata?: FileMetadata;
    viewCount?: number;
}

const MetadataRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
    <div className="flex items-center space-x-3">
        <div className="p-2 bg-[#5E6AD2]/10 rounded-lg flex-shrink-0">
            <Icon className="h-4 w-4 text-[#5E6AD2]" />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
        </div>
    </div>
);

const FileInfoPanel: React.FC<FileInfoPanelProps> = ({ fileMetadata, viewCount }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (isCollapsed) {
        return (
            <div className="hidden md:flex w-12 bg-white border-r border-gray-200 flex-col items-center pt-4 transition-all duration-200">
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="p-2 text-gray-400 hover:text-[#5E6AD2] hover:bg-gray-100 rounded-lg transition-colors"
                    title="Afficher les informations"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="hidden md:flex w-80 bg-white border-r border-gray-200 flex-col transition-all duration-200">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-gray-900">Informations</h2>
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Masquer le panneau"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                </div>

                {fileMetadata ? (
                    <div className="space-y-4">
                        <MetadataRow
                            icon={FileText}
                            label="Type"
                            value={getFileTypeLabel(fileMetadata.mimetype)}
                        />
                        <MetadataRow
                            icon={HardDrive}
                            label="Taille"
                            value={formatFileSize(fileMetadata.size)}
                        />
                        {fileMetadata.category && (
                            <MetadataRow
                                icon={FolderOpen}
                                label="Catégorie"
                                value={fileMetadata.category.name}
                            />
                        )}
                        {viewCount !== undefined && (
                            <MetadataRow
                                icon={Eye}
                                label="Consultations"
                                value={`${viewCount} vue${viewCount !== 1 ? 's' : ''}`}
                            />
                        )}
                        {fileMetadata.createdAt && (
                            <MetadataRow
                                icon={Calendar}
                                label="Ajouté le"
                                value={formatDate(fileMetadata.createdAt)}
                            />
                        )}
                        {fileMetadata.updatedAt && (
                            <MetadataRow
                                icon={Clock}
                                label="Modifié le"
                                value={formatDate(fileMetadata.updatedAt)}
                            />
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
                                <div className="flex-1 space-y-1.5">
                                    <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
                                    <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-auto p-6">
                <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <Shield className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                        Document confidentiel partagé dans le cadre de la due diligence. 
                        Ne pas diffuser en dehors de cette dataroom.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FileInfoPanel;
