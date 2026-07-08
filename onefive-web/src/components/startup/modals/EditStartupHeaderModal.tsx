'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../base/buttons/button';
import { CloseButton } from '../../base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '../../application/modals/modal';
import { Input } from '../../base/input/input';
import { TextArea } from '../../base/textarea/textarea';
import { Select } from '../../base/select/select';
import { countries } from '@/utils/countries';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Camera, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useUploadStartupLogo, useUploadStartupCover } from '@/queries/startup';
import { BadgeSelector } from '@/components/startup';
import { SkillInput } from '@/components/profile/SkillInput';
import { SECTOR_OPTIONS } from '@/shared/constants/sector-colors';
import { VALIDATION_LIMITS } from '@/constants/validation-limits';

interface EditStartupHeaderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startupId: string;
  startupData: {
    name: string;
    tagline: string;
    description: string;
    logo: string;
    coverImage: string;
    website: string;
    countryCode: string;
    city: string;
    sectors?: string[];
    technologies?: string[];
  };
  onSave: (data: {
    name: string;
    tagline: string;
    description: string;
    logo: string;
    coverImage: string;
    website: string;
    countryCode: string;
    city: string;
    sectors: string[];
    technologies: string[];
  }) => void;
}

export const EditStartupHeaderModal: React.FC<EditStartupHeaderModalProps> = ({
  open,
  onOpenChange,
  startupId,
  startupData,
  onSave,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const uploadLogoMutation = useUploadStartupLogo();
  const uploadCoverMutation = useUploadStartupCover();

  const normalizeCountryCode = (code: string) =>
    countries.find(c => c.code.toLowerCase() === code?.toLowerCase())?.code || code;

  const [form, setForm] = useState({
    name: startupData.name,
    tagline: startupData.tagline,
    description: startupData.description,
    logo: startupData.logo,
    coverImage: startupData.coverImage,
    website: startupData.website,
    countryCode: normalizeCountryCode(startupData.countryCode),
    city: startupData.city,
    sectors: Array.isArray(startupData.sectors) ? startupData.sectors : [],
    technologies: Array.isArray(startupData.technologies) ? startupData.technologies : [],
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  // Stocker les fichiers en attente d'upload
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: startupData.name,
      tagline: startupData.tagline,
      description: startupData.description,
      logo: startupData.logo,
      coverImage: startupData.coverImage,
      website: startupData.website,
      countryCode: normalizeCountryCode(startupData.countryCode),
      city: startupData.city,
      sectors: Array.isArray(startupData.sectors) ? startupData.sectors : [],
    technologies: Array.isArray(startupData.technologies) ? startupData.technologies : [],
    });
    setLogoPreview(null);
    setCoverPreview(null);
    setPendingLogoFile(null);
    setPendingCoverFile(null);
  }, [startupData, open]);

  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPG, PNG ou WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux. Taille maximum : 5MB.');
      return;
    }

    // Preview local seulement - pas d'upload
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    
    // Stocker le fichier pour l'upload lors de la sauvegarde
    setPendingLogoFile(file);
  };

  const handleCoverSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPG, PNG ou WebP.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux. Taille maximum : 10MB.');
      return;
    }

    // Preview local seulement - pas d'upload
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    
    // Stocker le fichier pour l'upload lors de la sauvegarde
    setPendingCoverFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const updatedForm = { ...form };
      
      // Upload le logo si un nouveau fichier a été sélectionné
      if (pendingLogoFile) {
        const result = await uploadLogoMutation.mutateAsync({ startupId, file: pendingLogoFile });
        updatedForm.logo = result.url;
      }
      
      // Upload la cover si un nouveau fichier a été sélectionné
      if (pendingCoverFile) {
        const result = await uploadCoverMutation.mutateAsync({ startupId, file: pendingCoverFile });
        updatedForm.coverImage = result.url;
      }
      
      // Sauvegarder le formulaire avec les nouvelles URLs
      onSave({
        ...updatedForm,
        sectors: Array.isArray(updatedForm.sectors) ? updatedForm.sectors : [],
      });
      
      onOpenChange(false);
    } catch {
      toast.error('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  const displayLogo = logoPreview || form.logo;
  const displayCover = coverPreview || form.coverImage;

  return (
    <AriaDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      <Button style={{ display: 'none' }}>Trigger</Button>
      <ModalOverlay isDismissable>
        <Modal>
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-3xl">
              <CloseButton onClick={() => onOpenChange(false)} theme="light" size="lg" className="absolute top-3 right-3 z-10" />
              
              <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                <AriaHeading slot="title" className="text-md font-semibold text-primary">
                  Modifier les informations de la startup
                </AriaHeading>
                <p className="text-sm text-tertiary">Modifiez les informations principales de votre startup.</p>
              </div>

              <div className="h-5 w-full" />

              <form
                id="edit-startup-form"
                className="flex flex-col gap-6 px-4 sm:px-6 max-h-[60vh] overflow-y-auto py-4"
                onSubmit={handleSubmit}
              >
                {/* Image de couverture */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Image de couverture</h3>
                  <div
                    className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {displayCover ? (
                      <img
                        src={displayCover}
                        alt="Couverture"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Upload className="mb-2" size={24} />
                        <span className="text-sm">Ajouter une image de couverture</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="text-white" size={24} />
                    </div>
                    {pendingCoverFile && (
                      <div className="absolute bottom-2 left-2 bg-violet-500 text-white text-xs px-2 py-1 rounded">
                        Nouveau fichier sélectionné
                      </div>
                    )}
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverSelect}
                    className="hidden"
                  />
                  <p className="text-sm text-tertiary">JPG, PNG ou WebP. 10MB maximum. Dimensions recommandées : 1200x400px</p>
                </div>

                {/* Logo */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Logo</h3>
                  <div className="flex items-center gap-6">
                    <div
                      className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer group bg-gray-100"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {displayLogo ? (
                        <img
                          src={displayLogo}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Upload size={20} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="text-white" size={16} />
                      </div>
                      {pendingLogoFile && (
                        <div className="absolute -bottom-1 -right-1 bg-violet-500 w-3 h-3 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoSelect}
                      className="hidden"
                    />
                    <div>
                      <p className="font-medium text-primary">Changer le logo</p>
                      <p className="text-sm text-tertiary">JPG, PNG ou WebP. 5MB maximum.</p>
                      <p className="text-sm text-tertiary">Dimensions recommandées : 400x400px</p>
                    </div>
                  </div>
                </div>

                {/* Informations de base */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Informations de base</h3>
                  <Input
                    label="Nom"
                    value={form.name}
                    onChange={(value) => setForm({ ...form, name: value })}
                    placeholder="Nom de la startup"
                    isRequired
                  />
                  
                  <Input
                    label="Tagline"
                    value={form.tagline}
                    onChange={(value) => setForm({ ...form, tagline: value })}
                    placeholder="Phrase d'accroche courte"
                  />
                  
                  <TextArea
                    label="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Décrivez votre startup..."
                    className="min-h-24"
                  />
                  
                  <Input
                    label="Site web"
                    value={form.website}
                    onChange={(value) => setForm({ ...form, website: value })}
                    placeholder="https://..."
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Pays"
                      placeholder="Sélectionner un pays"
                      selectedKey={form.countryCode || null}
                      onSelectionChange={(key) => setForm({ ...form, countryCode: (key as string) || '' })}
                      items={countries.map(country => ({ id: country.code, label: country.name }))}
                    >
                      {(item) => <Select.Item id={item.id} label={item.label} />}
                    </Select>
                    <Input
                      label="Ville"
                      value={form.city}
                      onChange={(value) => setForm({ ...form, city: value })}
                      placeholder="Paris"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Secteurs</label>
                    <BadgeSelector
                      selected={form.sectors}
                      onChange={(sectors) => setForm({ ...form, sectors })}
                      max={VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT}
                      options={SECTOR_OPTIONS}
                    />
                    <p className="text-xs text-tertiary mt-1">
                      {form.sectors.length}/{VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT} secteurs sélectionnés
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Technologies</label>
                    <SkillInput
                      skills={form.technologies}
                      onSkillsChange={(technologies) => setForm({ ...form, technologies })}
                      placeholder="Ex: React, Node.js, PostgreSQL... (Entrée pour ajouter)"
                    />
                  </div>
                </div>
              </form>

              <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 sm:flex sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:pt-8 sm:pb-6">
                <Button
                  color="secondary"
                  size="lg"
                  onClick={() => onOpenChange(false)}
                  isDisabled={isSaving}
                >
                  Annuler
                </Button>
                <Button
                  color="primary"
                  size="lg"
                  onClick={handleSubmit}
                  isLoading={isSaving}
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </AriaDialogTrigger>
  );
};

export default EditStartupHeaderModal;
