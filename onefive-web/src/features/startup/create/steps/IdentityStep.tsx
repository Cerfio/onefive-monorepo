import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/base/input/input';
import { TextArea } from '@/components/base/textarea/textarea';
import { Button } from '@/components/base/buttons/button';
import { Button as ShadcnButton } from '@/components/ui/button';
import { ImageUpload } from '@/components/startup';
import { toast } from 'sonner';
import { api } from '@/utils/kyInstance';
import { Loader2 } from 'lucide-react';
import LinkedInSquareIcon from '@/components/shared/LinkedInSquareIcon';
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '@/constants/validation-limits';

const identitySchema = z.object({
  name: z.string()
    .min(VALIDATION_LIMITS.STARTUP.NAME_MIN, VALIDATION_MESSAGES.NAME_REQUIRED)
    .max(VALIDATION_LIMITS.STARTUP.NAME_MAX, 'Maximum 100 caractères'),
  tagline: z.string()
    .max(VALIDATION_LIMITS.STARTUP.TAGLINE_MAX, VALIDATION_MESSAGES.TAGLINE_REQUIRED)
    .optional()
    .or(z.literal('')),
  description: z.string()
    .min(1, 'La description est requise')
    .max(VALIDATION_LIMITS.STARTUP.DESCRIPTION_MAX, VALIDATION_MESSAGES.DESCRIPTION_REQUIRED),
  logo: z.string().optional().or(z.literal('')),
});

type IdentityForm = z.infer<typeof identitySchema>;

interface IdentityStepProps {
  onNext: (data: IdentityForm) => void;
  data?: Partial<IdentityForm>;
  onDataChange?: (data: Partial<IdentityForm>) => void;
  onImport?: (data: any) => void;
}

export const IdentityStep = ({ onNext, data, onDataChange, onImport }: IdentityStepProps) => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  
  const form = useForm<IdentityForm>({
    resolver: zodResolver(identitySchema),
    mode: 'onTouched',
    defaultValues: {
      name: data?.name || '',
      tagline: data?.tagline || '',
      description: data?.description || '',
      logo: data?.logo || '',
    }
  });

  const onSubmit = async (values: IdentityForm) => {
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }
    onNext(values);
  };

  const handleLinkedinImport = async () => {
    if (!linkedinUrl) return;
    
    setIsImporting(true);
    try {
      // Use api instance with correct base URL
      const response = await api.post('linkedin-sync/company/preview', {
        json: { linkedinUrl }
      }).json<any>();

      if (response.success && response.data) {
        const company = response.data;
        
        // Map LinkedIn data to form fields
        form.setValue('name', company.name || '');
        form.setValue('tagline', company.tagline || '');
        form.setValue('description', company.description || '');
        if (company.logo) {
          form.setValue('logo', company.logo);
        }

        // Pass other data to parent
        if (onImport) {
          onImport({
            website: company.website,
            linkedin: company.linkedinUrl || linkedinUrl,
            foundedDate: company.foundedOn ? new Date(company.foundedOn.year, (company.foundedOn.month || 1) - 1, company.foundedOn.day || 1) : undefined,
            countryCode: company.locations?.[0]?.parsed?.countryCode || 'FR',
            city: company.locations?.[0]?.city || '',
            categories: company.industries?.map((i: any) => i.name).slice(0, 5) || [],
            coverImage: company.backgroundCover || '',
          });
        }
        
        toast.success('Données importées avec succès !');
      }
    } catch (error) {
      console.error('Import failed', error);
      toast.error('Échec de l\'importation LinkedIn');
    } finally {
      setIsImporting(false);
    }
  };

  // Surveiller les valeurs et l'état du formulaire
  const watchedName = form.watch('name');
  const watchedDescription = form.watch('description');
  const errors = form.formState.errors;
  const touched = form.formState.touchedFields;
  
  // Vérifier la validité du formulaire pour activer le bouton
  const isFormValid = React.useMemo(() => {
    // Vérifier que les champs requis sont remplis et valides
    // On vérifie aussi que les champs ont été touchés OU qu'ils n'ont pas d'erreurs
    const nameValid = watchedName?.trim() && (!touched.name || !errors.name);
    const descriptionValid = watchedDescription?.trim() && (!touched.description || !errors.description);

    return !!(nameValid && descriptionValid);
  }, [watchedName, watchedDescription, errors, touched]);

  // Synchroniser les changements avec le parent
  React.useEffect(() => {
    const subscription = form.watch((data) => {
      const currentData = {
        ...data,
      };
      onDataChange?.(currentData);
    });
    return () => subscription.unsubscribe();
  }, [form, onDataChange]);

  return (
    <div className="space-y-6">
      {/* LinkedIn Import Section */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            label="Importer depuis LinkedIn"
            placeholder="https://www.linkedin.com/company/..."
            value={linkedinUrl}
            onChange={setLinkedinUrl}
            icon={(props: Record<string, unknown>) => <LinkedInSquareIcon size={20} {...props} />}
            hint="Collez l'URL de votre page entreprise pour pré-remplir les informations"
          />
        </div>
        <ShadcnButton 
          type="button" 
          onClick={handleLinkedinImport}
          disabled={!linkedinUrl || isImporting}
          variant="secondary"
          className="mb-[22px]"
        >
          {isImporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Importer'
          )}
        </ShadcnButton>
      </div>

      {/* Résumé des erreurs */}
      {Object.keys(form.formState.errors).length > 0 && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-red-900">Erreurs à corriger</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {Object.entries(form.formState.errors).map(([field, error]) => (
              <li key={field}>
                • {error?.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-48">
            <label className="block text-sm font-medium mb-2 text-center">
              Logo de la startup
            </label>
            <ImageUpload
              value={form.watch('logo')}
              onChange={(url: string) => form.setValue('logo', url)}
              placeholder="Ajouter un logo"
              aspectRatio="square"
            />
            <p className="text-xs text-gray-500 text-center mt-2">
              Format recommandé : 400x400px
            </p>
          </div>
        </div>

        {/* Nom & Tagline */}
        <div className="space-y-4">
          <div>
            <Input
              label="Nom de la startup *"
              placeholder="Ex: OneFive"
              value={form.watch('name')}
              onChange={(value: string) => form.setValue('name', value, { shouldValidate: true, shouldTouch: true })}
              onBlur={() => {
                form.trigger('name');
                if (!form.formState.touchedFields.name) {
                  form.setValue('name', form.watch('name'), { shouldTouch: true });
                }
              }}
              isInvalid={form.formState.errors.name && form.formState.touchedFields.name}
            />
            {form.formState.errors.name && form.formState.touchedFields.name && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          
          <div>
            <Input
              label="Slogan (tagline)"
              placeholder="Ex: La plateforme qui connecte les entrepreneurs"
              value={form.watch('tagline')}
              onChange={(value: string) => form.setValue('tagline', value, { shouldValidate: true, shouldTouch: true })}
              onBlur={() => {
                form.trigger('tagline');
                if (!form.formState.touchedFields.tagline) {
                  form.setValue('tagline', form.watch('tagline'), { shouldTouch: true });
                }
              }}
              isInvalid={form.formState.errors.tagline && form.formState.touchedFields.tagline}
            />
            {form.formState.errors.tagline && form.formState.touchedFields.tagline && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.tagline.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Une phrase courte qui décrit votre startup
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description de votre startup *
          </label>
          <TextArea
            placeholder="Décrivez votre startup, sa mission, son marché, ce qui la rend unique..."
            value={form.watch('description')}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => form.setValue('description', event.target.value, { shouldValidate: true, shouldTouch: true })}
            onBlur={() => {
              form.trigger('description');
              if (!form.formState.touchedFields.description) {
                form.setValue('description', form.watch('description'), { shouldTouch: true });
              }
            }}
            rows={4}
          />
          {form.formState.errors.description && form.formState.touchedFields.description && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.description.message}
            </p>
          )}
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">
              Soyez précis et engageant
            </p>
            <p className="text-xs text-gray-400">
              {form.watch('description')?.length || 0}/2000 caractères
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-end pt-6 gap-3">
          <Button
            type="submit"
            size="lg"
            color="primary"
            isDisabled={!isFormValid}
          >
            Continuer vers les détails
          </Button>
        </div>
      </form>
    </div>
  );
};
