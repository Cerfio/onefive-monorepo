import React, { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { api } from '@/utils/kyInstance';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder: string;
  aspectRatio: 'square' | 'wide';
}

export const ImageUpload = ({ value, onChange, placeholder, aspectRatio }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validation du type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Validation de la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Utiliser l'API réelle
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('storage/upload', {
        body: formData,
      });

      const result: any = await response.json();
      onChange(result.data.url);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className={`relative border-2 border-dashed rounded-lg transition-all overflow-hidden ${
      value ? 'border-gray-300' : 'border-gray-200 hover:border-gray-300'
    } ${aspectRatio === 'square' ? 'aspect-square' : 'aspect-[16/9]'}`}>

      {value ? (
        <img
          src={value}
          alt={placeholder}
          className="w-full h-full object-cover rounded-md"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
          <Upload className="mb-2" size={24} />
          <span className="text-sm text-center">{placeholder}</span>
          <span className="text-xs text-center mt-1">JPG, PNG max 5MB</span>
        </div>
      )}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isUploading}
      />

      {isUploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="text-white flex items-center gap-2">
            <Loader2 className="animate-spin" size={20} />
            Upload...
          </div>
        </div>
      )}

      {/* Bouton de modification si image déjà uploadée */}
      {value && !isUploading && (
        <div className="absolute top-2 right-2">
          <button
            type="button"
            onClick={() => (document.querySelector('input[type="file"]') as HTMLElement)?.click()}
            className="bg-white rounded-full p-1 shadow-sm hover:shadow-md transition-shadow"
          >
            <Upload size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
