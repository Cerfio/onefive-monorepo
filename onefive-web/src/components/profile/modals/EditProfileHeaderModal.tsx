'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../../base/buttons/button';
import { CloseButton } from '../../base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '../../application/modals/modal';
import { Input } from '../../base/input/input';
import { TextArea } from '../../base/textarea/textarea';
import { Select } from '../../base/select/select';
import { countries } from '@/utils/countries';
import { ExternalLink, Trash2 } from 'lucide-react';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { useUpdateProfile, useUploadAvatar, useUploadCover } from '@/queries/profile';
import { useForm, Controller, useFieldArray, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImageUpload } from '../ImageUpload';
import { ProfileRole, getAllProfileRolesWithMetadata } from '@/sharing-enum/profile';
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '@/constants/validation-limits';

const ROLE_ITEMS = getAllProfileRolesWithMetadata().map(({ role, metadata }) => ({
  id: role,
  label: `${metadata.emoji} ${metadata.shortLabelMale}`,
}));

const ROLE_ITEMS_WITH_EMPTY = [
  { id: '', label: 'Aucun' },
  ...ROLE_ITEMS,
];

// Schema de validation
const socialSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Le titre est obligatoire').max(VALIDATION_LIMITS.PROFILE.SOCIAL_TITLE_MAX, VALIDATION_MESSAGES.TITLE_TOO_LONG),
  url: z.string().url('URL invalide').min(1, 'L\'URL est obligatoire').max(VALIDATION_LIMITS.PROFILE.SOCIAL_URL_MAX),
});

const profileSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est obligatoire').max(VALIDATION_LIMITS.PROFILE.FIRST_NAME_MAX, VALIDATION_MESSAGES.FIRST_NAME_TOO_LONG),
  lastName: z.string().min(1, 'Le nom est obligatoire').max(VALIDATION_LIMITS.PROFILE.LAST_NAME_MAX, VALIDATION_MESSAGES.LAST_NAME_TOO_LONG),
  title: z.string().min(1, 'Le titre est obligatoire').max(VALIDATION_LIMITS.PROFILE.TITLE_MAX, VALIDATION_MESSAGES.TITLE_TOO_LONG),
  bio: z.string().min(1, 'La bio est obligatoire').max(VALIDATION_LIMITS.PROFILE.BIO_MAX, VALIDATION_MESSAGES.BIO_TOO_LONG),
  socials: z.array(socialSchema).max(VALIDATION_LIMITS.PROFILE.SOCIALS_MAX_COUNT, 'Maximum 5 liens sociaux').default([]),
  countryCode: z.string().optional(),
  city: z.string().optional(),
  mainRole: z
    .union([z.nativeEnum(ProfileRole), z.literal('')])
    .refine((v) => v !== '', { message: 'Sélectionnez votre rôle principal' }),
  secondaryRole: z.union([z.nativeEnum(ProfileRole), z.literal('')]).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Modal pour modifier l'en-tête du profil
const EditProfileHeaderModal = ({ open, onOpenChange, profileData, onSave: _onSave }: { open: boolean, onOpenChange: (isOpen: boolean) => void, profileData: any, onSave: (data: any) => void }) => {
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const uploadCoverMutation = useUploadCover();
  
  // Stocker les fichiers en attente d'upload
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Extraire prénom et nom du nom complet avec sécurité
  const safeName = String(profileData?.name || '');
  const nameParts = safeName.split(' ').filter(part => part.trim());

  const normalizeCountryCode = (code: string) =>
    countries.find(c => c.code.toLowerCase() === code?.toLowerCase())?.code || code || '';

  const parseRolesFromProfile = (
    roles: string[] | undefined,
  ): { mainRole: ProfileRole | ''; secondaryRole: ProfileRole | '' } => {
    const valid = (roles || []).filter((r): r is ProfileRole => Object.values(ProfileRole).includes(r as ProfileRole));
    return {
      mainRole: valid[0] ?? ('' as const),
      secondaryRole: valid[1] && valid[1] !== valid[0] ? valid[1] : ('' as const),
    };
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      title: String(profileData?.title || ''),
      bio: String(profileData?.bio || ''),
      socials: profileData?.socials || [],
      countryCode: normalizeCountryCode(profileData?.countryCode || ''),
      city: String(profileData?.city || ''),
      ...parseRolesFromProfile(profileData?.ecosystemRoles),
    } as DefaultValues<ProfileFormData>,
    mode: 'onTouched',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'socials',
  });

  const mainRole = watch('mainRole');
  const secondaryRole = watch('secondaryRole');

  // Réinitialiser le rôle secondaire s'il devient identique au principal
  useEffect(() => {
    if (mainRole && secondaryRole && mainRole === secondaryRole) {
      setValue('secondaryRole', '');
    }
  }, [mainRole, secondaryRole, setValue]);

  useEffect(() => {
    const safeName = String(profileData?.name || '');
    const nameParts = safeName.split(' ').filter(part => part.trim());
    reset({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      title: String(profileData?.title || ''),
      bio: String(profileData?.bio || ''),
      socials: profileData?.socials || [],
      countryCode: normalizeCountryCode(profileData?.countryCode || ''),
      city: String(profileData?.city || ''),
      ...parseRolesFromProfile(profileData?.ecosystemRoles),
    } as ProfileFormData);
    // Réinitialiser les fichiers en attente quand le modal s'ouvre/ferme
    setPendingAvatarFile(null);
    setPendingCoverFile(null);
    setAvatarPreview(null);
    setCoverPreview(null);
  }, [profileData, reset, open]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      // Filtrer les liens sociaux vides et ajouter des IDs temporaires si nécessaire
      const filteredSocials = data.socials
        .filter(social => social.title?.trim() && social.url?.trim())
        .map(social => ({
          title: social.title.trim(),
          url: social.url.trim(),
        }));

      // Upload l'avatar si un nouveau fichier a été sélectionné
      if (pendingAvatarFile) {
        await uploadAvatarMutation.mutateAsync(pendingAvatarFile);
      }
      
      // Upload la cover si un nouveau fichier a été sélectionné
      if (pendingCoverFile) {
        await uploadCoverMutation.mutateAsync(pendingCoverFile);
      }

      await updateProfileMutation.mutateAsync({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        title: data.title.trim(),
        bio: data.bio.trim(),
        socials: filteredSocials,
        ...(data.countryCode && { countryCode: data.countryCode }),
        ...(data.city !== undefined && data.city.trim() && { city: data.city.trim() }),
        ecosystemRoles: [
          data.mainRole,
          ...(data.secondaryRole && data.secondaryRole !== data.mainRole ? [data.secondaryRole] : []),
        ],
      });
      onOpenChange(false);
    } catch {
      toast.error('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  const addSocial = () => {
    if (fields.length < 5) {
      append({
        id: `new_${Date.now()}`,
        title: '',
        url: '',
      });
    }
  };

  const handleAvatarUpload = (file: File) => {
    // Stocker le fichier pour l'upload lors de la sauvegarde
    setPendingAvatarFile(file);
    // Créer un preview local
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (file: File) => {
    // Stocker le fichier pour l'upload lors de la sauvegarde
    setPendingCoverFile(file);
    // Créer un preview local
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };


  return (
    <AriaDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      <ModalOverlay isDismissable>
        <Modal>
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-3xl">
              <CloseButton onClick={() => onOpenChange(false)} theme="light" size="lg" className="absolute top-3 right-3" />
              
              <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                <AriaHeading slot="title" className="text-md font-semibold text-primary">
                  Modifier le profil
                </AriaHeading>
                <p className="text-sm text-tertiary">Modifiez vos informations personnelles et vos liens sociaux.</p>
              </div>

              <div className="h-5 w-full" />

              <form
                id="edit-profile-form"
                className="flex flex-col gap-6 px-4 sm:px-6 max-h-[60vh] overflow-y-auto"
                onSubmit={handleSubmit(onSubmit)}
              >
                {/* Photo de profil et couverture */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-4">Photo de couverture</h3>
                    <ImageUpload
                      type="cover"
                      currentImage={profileData.coverImage}
                      onImageSelect={handleCoverUpload}
                      isUploading={false}
                      previewImage={coverPreview}
                      hasPendingFile={!!pendingCoverFile}
                    />
                    <p className="text-sm text-tertiary mt-2">JPG, PNG ou WebP. 5MB maximum. Dimensions recommandées : 1200x400px</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-4">Photo de profil</h3>
                    <div className="flex items-center gap-6">
                      <ImageUpload
                        type="avatar"
                        currentImage={profileData.avatar}
                        onImageSelect={handleAvatarUpload}
                        isUploading={false}
                        previewImage={avatarPreview}
                        hasPendingFile={!!pendingAvatarFile}
                      />
                      <div>
                        <p className="font-medium text-primary">Changer la photo</p>
                        <p className="text-sm text-tertiary">JPG, PNG ou WebP. 2MB maximum.</p>
                        <p className="text-sm text-tertiary">Dimensions recommandées : 400x400px</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations de base */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Informations de base</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="Prénom"
                          placeholder="Votre prénom"
                          maxLength={VALIDATION_LIMITS.PROFILE.FIRST_NAME_MAX}
                          {...field}
                          isInvalid={!!errors.firstName}
                          hint={errors.firstName?.message}
                        />
                      )}
                    />
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="Nom"
                          placeholder="Votre nom"
                          maxLength={VALIDATION_LIMITS.PROFILE.LAST_NAME_MAX}
                          {...field}
                          isInvalid={!!errors.lastName}
                          hint={errors.lastName?.message}
                        />
                      )}
                    />
                  </div>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Titre"
                        placeholder="Votre titre professionnel"
                        maxLength={VALIDATION_LIMITS.PROFILE.TITLE_MAX}
                        {...field}
                        isInvalid={!!errors.title}
                        hint={errors.title?.message}
                      />
                    )}
                  />
                  <Controller
                    name="bio"
                    control={control}
                    render={({ field }) => (
                      <TextArea
                        label="Bio"
                        placeholder="Décrivez-vous en quelques mots..."
                        className="min-h-24"
                        maxLength={VALIDATION_LIMITS.PROFILE.BIO_MAX}
                        {...field}
                        isInvalid={!!errors.bio}
                        hint={errors.bio?.message}
                      />
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                      name="countryCode"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="Pays"
                          placeholder="Sélectionner un pays"
                          selectedKey={field.value || null}
                          onSelectionChange={(key) => field.onChange((key as string) || '')}
                          items={countries.map(country => ({ id: country.code, label: country.name }))}
                        >
                          {(item) => <Select.Item id={item.id} label={item.label} />}
                        </Select>
                      )}
                    />
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="Ville"
                          placeholder="Paris"
                          {...field}
                          onChange={(value) => field.onChange(value)}
                          isInvalid={!!errors.city}
                          hint={errors.city?.message}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Rôles dans l'écosystème */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Rôles dans l'écosystème</h3>
                  <p className="text-sm text-tertiary">Rôle principal obligatoire, secondaire optionnel.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                      name="mainRole"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="Rôle principal"
                          placeholder="Sélectionner un rôle"
                          selectedKey={field.value || null}
                          onSelectionChange={(key) => field.onChange((key as string) || '')}
                          items={ROLE_ITEMS}
                        >
                          {(item) => <Select.Item id={item.id} label={item.label} />}
                        </Select>
                      )}
                    />
                    <Controller
                      name="secondaryRole"
                      control={control}
                      render={({ field }) => {
                        const secondaryItems =
                          mainRole
                            ? [
                                { id: '', label: 'Aucun' },
                                ...ROLE_ITEMS.filter((r) => r.id !== mainRole),
                              ]
                            : ROLE_ITEMS_WITH_EMPTY;
                        return (
                          <Select
                            label="Rôle secondaire (optionnel)"
                            placeholder="Aucun"
                            selectedKey={field.value || null}
                            onSelectionChange={(key) => field.onChange((key as string) || '')}
                            items={secondaryItems}
                          >
                            {(item) => <Select.Item id={item.id} label={item.label} />}
                          </Select>
                        );
                      }}
                    />
                  </div>
                  {errors.mainRole && (
                    <p className="text-sm text-red-500">{errors.mainRole.message}</p>
                  )}
                </div>
                
                {/* Liens sociaux */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-primary">Liens sociaux</h3>
                    <p className="text-sm text-tertiary">Jusqu'à 5 liens</p>
                  </div>
                  
                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-3 p-4 border border-gray-200 rounded-lg">
                      {/* Titre du lien */}
                      <Controller
                        name={`socials.${index}.title`}
                        control={control}
                        render={({ field: titleField }) => (
                          <Input
                            label={`Lien ${index + 1} - Titre`}
                            placeholder="Ex: LinkedIn, GitHub, Portfolio..."
                            maxLength={VALIDATION_LIMITS.PROFILE.SOCIAL_TITLE_MAX}
                            {...titleField}
                            isInvalid={!!errors.socials?.[index]?.title}
                            hint={errors.socials?.[index]?.title?.message || "Nom du réseau social"}
                          />
                        )}
                      />

                      {/* URL avec action de test intégrée */}
                      <Controller
                        name={`socials.${index}.url`}
                        control={control}
                        render={({ field: urlField }) => (
                          <div className="relative">
                            <Input
                              label="URL complète"
                              placeholder="https://linkedin.com/in/votre-profil"
                              {...urlField}
                              isInvalid={!!errors.socials?.[index]?.url}
                              hint={errors.socials?.[index]?.url?.message || "L'URL complète de votre profil"}
                            />
                            {urlField.value && (
                              <Button 
                                color="secondary" 
                                size="sm"
                                iconLeading={ExternalLink}
                                onClick={() => window.open(urlField.value, '_blank')}
                                className="absolute right-2 top-8"
                                title="Tester le lien"
                              >
                                Test
                              </Button>
                            )}
                          </div>
                        )}
                      />

                      {/* Bouton de suppression */}
                      <div className="flex justify-end">
                        <Button 
                          color="secondary" 
                          size="sm"
                          iconLeading={Trash2}
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-600"
                          title="Supprimer ce lien"
                        >
                          Supprimer ce lien
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {fields.length < 5 && (
                    <Button color="secondary" onClick={addSocial} className="w-full">
                      + Ajouter un lien social
                    </Button>
                  )}

                  {errors.socials && typeof errors.socials === 'object' && 'message' in errors.socials && (
                    <p className="text-sm text-red-500">{errors.socials.message}</p>
                  )}
                </div>
              </form>

              <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 sm:flex sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:pt-8 sm:pb-6">
                <Button 
                  color="secondary" 
                  size="lg" 
                  onClick={() => onOpenChange(false)} 
                  disabled={isSaving}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  form="edit-profile-form" 
                  color="primary" 
                  size="lg" 
                  isLoading={isSaving} 
                  isDisabled={!isValid || isSaving}
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

export default EditProfileHeaderModal; 