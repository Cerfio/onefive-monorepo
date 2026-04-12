export const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getFileTypeLabel = (mimetype: string): string => {
    if (mimetype === "application/pdf") return "PDF";
    if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "DOCX";
    if (mimetype.startsWith('image/')) return mimetype.split('/')[1].toUpperCase();
    if (mimetype.startsWith('video/')) return mimetype.split('/')[1].toUpperCase();
    return "FICHIER";
};

export const isImageFile = (mimetype: string): boolean => {
    return mimetype.startsWith('image/');
};

export const isVideoFile = (mimetype: string): boolean => {
    return mimetype.startsWith('video/');
};

export const isPDFFile = (mimetype: string): boolean => {
    return mimetype === "application/pdf";
};

export const isDocxFile = (mimetype: string): boolean => {
    return mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}; 