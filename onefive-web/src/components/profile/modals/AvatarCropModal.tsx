'use client';

import { type SyntheticEvent, useState, useEffect } from "react";
import { Crop01 } from "@untitledui/icons";
import { Heading as AriaHeading } from "react-aria-components";
import { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icons";
import { Cropper } from "@/components/shared-assets/image-cropper/cropper";

interface AvatarCropModalProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

export const AvatarCropModal = ({ 
  file, 
  isOpen, 
  onClose, 
  onCropComplete 
}: AvatarCropModalProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [imageData, setImageData] = useState<{ src: string; alt: string } | null>(null);

  // Aspect ratio 1:1 pour avatar carré
  const aspect = 1;

  // Créer l'URL de l'image quand le fichier change
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImageData({ src: url, alt: file.name });
      
      // Nettoyer l'URL quand le composant se démonte ou le fichier change
      return () => URL.revokeObjectURL(url);
    } else {
      setImageData(null);
    }
  }, [file]);

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;

    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90, // 90% de l'image pour un avatar
        },
        aspect,
        width,
        height,
      ),
      width,
      height,
    );

    setCrop(crop);
  };

  const handleSave = async () => {
    if (!crop || !imageData || !file) return;

    try {
      // Créer un canvas pour cropper l'image
      const image = new Image();
      image.src = imageData.src;
      
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      // Calculer les dimensions du crop en pixels
      const scaleX = image.naturalWidth / 100;
      const scaleY = image.naturalHeight / 100;
      
      const cropX = (crop.x ?? 0) * scaleX;
      const cropY = (crop.y ?? 0) * scaleY;
      const cropWidth = (crop.width ?? 0) * scaleX;
      const cropHeight = (crop.height ?? 0) * scaleY;

      // Définir la taille finale de l'avatar (512x512px)
      const outputSize = 512;
      canvas.width = outputSize;
      canvas.height = outputSize;

      // Dessiner l'image croppée sur le canvas
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        outputSize,
        outputSize
      );

      // Convertir le canvas en blob puis en File
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          onCropComplete(croppedFile);
          onClose();
        }
      }, 'image/jpeg', 0.9); // Qualité 90%

    } catch (error) {
      console.error('Erreur lors du crop:', error);
    }
  };

  if (!isOpen || !imageData) return null;

  return (
    <ModalOverlay isDismissable isOpen={isOpen} onOpenChange={onClose}>
      <Modal>
        <Dialog>
          <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl sm:max-w-120">
            <CloseButton 
              onClick={onClose} 
              theme="light" 
              size="lg" 
              className="absolute top-3 right-3 z-20" 
            />
            
            <div className="flex gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
              <FeaturedIcon 
                color="gray" 
                size="lg" 
                theme="modern" 
                icon={Crop01} 
                className="max-sm:hidden" 
              />

              <div className="z-10 flex flex-col gap-0.5">
                <AriaHeading slot="title" className="text-md font-semibold text-primary">
                  Recadrer votre avatar
                </AriaHeading>
                <p className="text-sm text-tertiary">
                  Ajustez votre image pour créer un avatar parfait. Format carré 512x512px.
                </p>
              </div>
            </div>

            <div className="h-5 w-full" />
            
            <div className="flex flex-col gap-4 px-4 sm:px-6 md:gap-5">
              <Cropper
                aspect={aspect}
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                className="h-80 w-full self-stretch sm:h-96"
                circularCrop // Pour un aperçu circulaire comme un avatar
              >
                <Cropper.Img 
                  {...imageData}
                  onLoad={handleImageLoad} 
                />
              </Cropper>

              <div className="text-center">
                <p className="text-xs text-tertiary">
                  Déplacez et redimensionnez la zone de sélection pour ajuster votre avatar
                </p>
              </div>
            </div>

            <div className="z-10 flex flex-col pt-6 pb-4 sm:pt-8 sm:pb-6">
              <div className="w-full border-t border-secondary max-md:hidden" />
              <div className="h-4 w-full max-md:hidden sm:h-6" />
              <div className="flex flex-1 flex-col-reverse gap-3 px-4 sm:flex-row sm:justify-end sm:px-6">
                <Button color="secondary" size="lg" onClick={onClose}>
                  Annuler
                </Button>
                <Button color="primary" size="lg" onClick={handleSave}>
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
};
