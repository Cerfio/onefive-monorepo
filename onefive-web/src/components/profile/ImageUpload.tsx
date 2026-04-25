'use client';

import { useRef, useState } from 'react';
import { Button } from '../base/buttons/button';
import { Camera, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { AvatarCropModal } from './modals/AvatarCropModal';
import { CoverCropModal } from './modals/CoverCropModal';

interface ImageUploadProps {
  currentImage?: string;
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  isUploading?: boolean;
  type: 'avatar' | 'cover';
  className?: string;
  previewImage?: string | null;
  hasPendingFile?: boolean;
}

export const ImageUpload = ({
  currentImage,
  onImageSelect,
  onImageRemove,
  isUploading = false,
  type,
  className = '',
  previewImage,
  hasPendingFile = false,
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isCoverCropModalOpen, setIsCoverCropModalOpen] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format de fichier non supporté. Utilisez JPG, PNG ou WebP.');
      return;
    }

    const maxSize = type === 'avatar' ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB pour avatar, 5MB pour cover
    if (file.size > maxSize) {
      const maxSizeText = type === 'avatar' ? '2MB' : '5MB';
      toast.error(`Le fichier est trop volumineux. Taille maximum : ${maxSizeText}.`);
      return;
    }

    // Pour les avatars et covers, ouvrir le modal de crop
    if (type === 'avatar') {
      setSelectedFile(file);
      setIsCropModalOpen(true);
      return;
    }

    if (type === 'cover') {
      setSelectedFile(file);
      setIsCoverCropModalOpen(true);
      return;
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    // Créer une prévisualisation de l'image croppée
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(croppedFile);

    // Appeler le callback parent avec le fichier croppé
    onImageSelect(croppedFile);
    setIsCropModalOpen(false);
    setSelectedFile(null);
  };

  const handleCropCancel = () => {
    setIsCropModalOpen(false);
    setSelectedFile(null);
    // Reset l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCoverCropCancel = () => {
    setIsCoverCropModalOpen(false);
    setSelectedFile(null);
    // Reset l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCoverCropComplete = (croppedFile: File) => {
    // Créer une prévisualisation de l'image croppée
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(croppedFile);

    // Appeler le callback parent avec le fichier croppé
    onImageSelect(croppedFile);
    setIsCoverCropModalOpen(false);
    setSelectedFile(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const _handleRemovePreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove?.();
  };

  // Utiliser previewImage du parent si fourni, sinon le preview local, sinon currentImage
  const displayImage = previewImage || preview || currentImage;
  const showPendingIndicator = hasPendingFile || !!preview;

  if (type === 'avatar') {
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <img
            src={displayImage || '/default-avatar.svg'}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-200"
          />
          <Button
            size="sm"
            color="secondary"
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
            onClick={handleButtonClick}
            isDisabled={isUploading}
            isLoading={isUploading}
          >
            {!isUploading && <Camera className="h-4 w-4" />}
          </Button>
          {showPendingIndicator && (
            <div className="absolute -top-1 -right-1 bg-violet-500 w-3 h-3 rounded-full border-2 border-white" title="Nouveau fichier sélectionné" />
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Modal de crop pour avatar */}
        <AvatarCropModal
          file={selectedFile}
          isOpen={isCropModalOpen}
          onClose={handleCropCancel}
          onCropComplete={handleCropComplete}
        />
      </div>
    );
  }

  // Cover image
  return (
    <div className={`relative ${className}`}>
      <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
        {displayImage ? (
          <img
            src={displayImage}
            alt="Photo de couverture"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="text-center text-white">
              <Upload className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Ajouter une photo de couverture</p>
            </div>
          </div>
        )}
        
        <Button
          size="sm"
          color="secondary"
          className="absolute bottom-4 right-4 h-10 w-10 rounded-full p-0 bg-white/90 hover:bg-white text-gray-700 border border-gray-300 shadow-lg"
          onClick={handleButtonClick}
          isDisabled={isUploading}
          isLoading={isUploading}
        >
          {!isUploading && <Camera className="h-5 w-5" />}
        </Button>

        {showPendingIndicator && (
          <div className="absolute bottom-2 left-2 bg-violet-500 text-white text-xs px-2 py-1 rounded">
            Nouveau fichier sélectionné
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Modal de crop pour cover */}
      <CoverCropModal
        file={selectedFile}
        isOpen={isCoverCropModalOpen}
        onClose={handleCoverCropCancel}
        onCropComplete={handleCoverCropComplete}
      />
    </div>
  );
};
