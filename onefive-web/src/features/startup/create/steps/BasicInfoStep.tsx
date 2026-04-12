import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/base/input/input';
import { TextArea } from '@/components/base/textarea/textarea';
import { Button } from '@/components/base/buttons/button';
import { Select } from '@/components/base/select/select';
import { BadgeSelector, ImageUpload } from '@/components/startup';
import { SECTOR_OPTIONS } from '@/shared/constants/sector-colors';
import { countries } from '@/utils/countries';
import { VALIDATION_LIMITS } from '@/constants/validation-limits';

const basicInfoSchema = z.object({
  name: z.string().min(VALIDATION_LIMITS.STARTUP.NAME_MIN, 'Le nom est requis').max(VALIDATION_LIMITS.STARTUP.NAME_MAX, `Maximum ${VALIDATION_LIMITS.STARTUP.NAME_MAX} caractères`),
  tagline: z.string().max(VALIDATION_LIMITS.STARTUP.TAGLINE_MAX, `Maximum ${VALIDATION_LIMITS.STARTUP.TAGLINE_MAX} caractères`).optional().or(z.literal('')),
  description: z.string().min(VALIDATION_LIMITS.STARTUP.NAME_MIN, 'La description est requise').max(VALIDATION_LIMITS.STARTUP.DESCRIPTION_MAX, `Maximum ${VALIDATION_LIMITS.STARTUP.DESCRIPTION_MAX} caractères`),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  linkedin: z.string().url('URL LinkedIn invalide').optional().or(z.literal('')),
  foundedDate: z.date({
    required_error: 'La date de fondation est requise',
  }),
  countryCode: z.string().min(VALIDATION_LIMITS.STARTUP.COUNTRY_CODE_LENGTH, 'Pays requis').max(VALIDATION_LIMITS.STARTUP.COUNTRY_CODE_LENGTH, 'Pays requis'),
  city: z.string().min(VALIDATION_LIMITS.STARTUP.CITY_MIN, 'Ville requise').max(VALIDATION_LIMITS.STARTUP.CITY_MAX, `Maximum ${VALIDATION_LIMITS.STARTUP.CITY_MAX} caractères`),
  logo: z.string().optional().or(z.literal('')),
  coverImage: z.string().optional().or(z.literal('')),
  categories: z.array(z.string()).min(VALIDATION_LIMITS.STARTUP.NAME_MIN, 'Au moins un secteur requis').max(VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT, `Maximum ${VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT} secteurs`),
});

type BasicInfoForm = z.infer<typeof basicInfoSchema>;

interface BasicInfoStepProps {
  onNext: (data: BasicInfoForm) => void;
  data?: Partial<BasicInfoForm>;
  onDataChange?: (data: Partial<BasicInfoForm>) => void;
}

export const BasicInfoStep = ({ onNext, data, onDataChange }: BasicInfoStepProps) => {
  const form = useForm<BasicInfoForm>({
    resolver: zodResolver(basicInfoSchema),
    mode: 'onBlur', // Changé de 'onChange' à 'onBlur' pour éviter les problèmes
    defaultValues: {
      name: data?.name || '',
      tagline: data?.tagline || '',
      description: data?.description || '',
      website: data?.website || '',
      linkedin: data?.linkedin || '',
      foundedDate: data?.foundedDate || undefined,
      countryCode: data?.countryCode || '',
      city: data?.city || '',
      categories: data?.categories || [],
      logo: data?.logo || '',
      coverImage: data?.coverImage || '',
    }
  });

  const onSubmit = async (values: BasicInfoForm) => {
    // Validation finale avant soumission
    const isValid = await form.trigger();
    if (!isValid) {
      console.error('Form validation failed');
      return;
    }

    onNext(values);
  };

  // Synchroniser les changements avec le parent en temps réel (optimisé)
  React.useEffect(() => {
    const subscription = form.watch((data) => {
      // Vérifier si les données ont vraiment changé pour éviter les boucles infinies
      const currentData = {
        ...data,
        categories: Array.isArray(data.categories)
          ? data.categories.filter((cat): cat is string => Boolean(cat))
          : [],
      };
      
      // Appeler onDataChange seulement si les données ont changé
      onDataChange?.(currentData);
    });
    return () => subscription.unsubscribe();
  }, [form]); // Retirer onDataChange des dépendances pour éviter les boucles

  // Calcul du progrès du formulaire (simplifié pour éviter les re-renders)
  const progressPercentage = form.formState.isValid ? 100 : 50;

  return (
    <div className="space-y-6">

      {/* Indicateur de progrès simple */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">Progression du formulaire</span>
          <span className="text-sm text-blue-700">
            {form.formState.isValid ? 'Complété' : 'En cours'}
          </span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Debug simple */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-xs text-gray-600">
            Valid: {form.formState.isValid ? 'true' : 'false'} |
            Errors: {Object.keys(form.formState.errors).length}
          </div>
        )}
      </div>


      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo & Cover */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Logo</label>
            <ImageUpload
              value={form.watch('logo')}
              onChange={(url: string) => form.setValue('logo', url)}
              placeholder="Logo de la startup"
              aspectRatio="square"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Image de couverture</label>
            <ImageUpload
              value={form.watch('coverImage')}
              onChange={(url: string) => form.setValue('coverImage', url)}
              placeholder="Bannière de la startup"
              aspectRatio="wide"
            />
          </div>
        </div>

        {/* Nom & Tagline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom de la startup *"
            placeholder="Ex: OneFive"
            value={form.watch('name')}
            onChange={(value: string) => form.setValue('name', value)}
          />
          {form.formState.errors.name && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.name.message}
            </p>
          )}
          <Input
            label="Slogan (tagline)"
            placeholder="Ex: La plateforme qui connecte les entrepreneurs"
            value={form.watch('tagline')}
            onChange={(value: string) => form.setValue('tagline', value)}
          />
          {form.formState.errors.tagline && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.tagline.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description *
          </label>
          <TextArea
            placeholder="Décrivez votre startup, sa mission, son marché..."
            value={form.watch('description')}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => form.setValue('description', event.target.value)}
          />
          {form.formState.errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        {/* Website & LinkedIn */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Site web"
            placeholder="https://monstartup.com"
            value={form.watch('website')}
            onChange={(value: string) => form.setValue('website', value)}
          />
          {form.formState.errors.website && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.website.message}
            </p>
          )}
          <Input
            label="LinkedIn"
            placeholder="https://linkedin.com/company/monstartup"
            value={form.watch('linkedin')}
            onChange={(value: string) => form.setValue('linkedin', value)}
          />
          {form.formState.errors.linkedin && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.linkedin.message}
            </p>
          )}
        </div>

        {/* Date de fondation */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Date de fondation *
          </label>
          <Input
            type="date"
            value={form.watch('foundedDate') ? form.watch('foundedDate').toISOString().split('T')[0] : ''}
            onChange={(value: string) => {
              const date = value ? new Date(value) : undefined;
              form.setValue('foundedDate', date as Date);
            }}
          />
          {form.formState.errors.foundedDate && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.foundedDate.message}
            </p>
          )}
        </div>

        {/* Localisation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Select
              label="Pays *"
              placeholder="Sélectionner un pays"
              selectedKey={form.watch('countryCode')}
              onSelectionChange={(key) => form.setValue('countryCode', key as string)}
              items={countries.map(country => ({ id: country.code, label: country.name }))}
            >
              {(item) => <Select.Item id={item.id} label={item.label} />}
            </Select>
            {form.formState.errors.countryCode && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.countryCode.message}
              </p>
            )}
          </div>
          <Input
            label="Ville *"
            placeholder="Paris"
            value={form.watch('city')}
            onChange={(value: string) => form.setValue('city', value)}
          />
          {form.formState.errors.city && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.city.message}
            </p>
          )}
        </div>

        {/* Secteurs */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Secteurs d'activité *
          </label>
          <BadgeSelector
            selected={form.watch('categories') || []}
            onChange={(categories: string[]) => form.setValue('categories', categories)}
            max={5}
            options={SECTOR_OPTIONS}
          />
          {form.formState.errors.categories && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.categories.message}
            </p>
          )}
        </div>

        <div className="flex justify-end pt-6 gap-3">
          {process.env.NODE_ENV === 'development' && (
            <Button
              type="button"
              size="lg"
              color="secondary"
              onClick={() => form.trigger()}
            >
              Valider
            </Button>
          )}
          <Button
            type="submit"
            size="lg"
            color="primary"
            isDisabled={!form.formState.isValid}
          >
            Continuer vers l'équipe
            {process.env.NODE_ENV === 'development' && (
              <span className="ml-2 text-xs">
                ({form.formState.isValid ? 'Valid' : 'Invalid'})
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
