import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/base/buttons/button';
import { BadgeSelector, ImageUpload } from '@/components/startup';
import { VALIDATION_LIMITS } from '@/constants/validation-limits';
import { SECTOR_OPTIONS } from '@/shared/constants/sector-colors';

const sectorsSchema = z.object({
  categories: z.array(z.string()).min(VALIDATION_LIMITS.STARTUP.NAME_MIN, 'Au moins un secteur requis').max(VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT, `Maximum ${VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT} secteurs`),
  coverImage: z.string().optional().or(z.literal('')),
});

type SectorsForm = z.infer<typeof sectorsSchema>;

interface SectorsStepProps {
  onNext: (data: SectorsForm) => void;
  onBack: () => void;
  data?: Partial<SectorsForm>;
  onDataChange?: (data: Partial<SectorsForm>) => void;
}

export const SectorsStep = ({ onNext, onBack, data, onDataChange }: SectorsStepProps) => {
  const form = useForm<SectorsForm>({
    resolver: zodResolver(sectorsSchema),
    mode: 'onTouched',
    defaultValues: {
      categories: data?.categories || [],
      coverImage: data?.coverImage || '',
    }
  });

  const onSubmit = async (values: SectorsForm) => {
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }
    onNext(values);
  };

  // Surveiller les valeurs et l'état du formulaire
  const watchedCategories = form.watch('categories');
  const errors = form.formState.errors;
  const touched = form.formState.touchedFields;
  
  // Vérifier la validité du formulaire pour activer le bouton
  const isFormValid = React.useMemo(() => {
    // Vérifier que les champs requis sont remplis et valides
    // On vérifie aussi que les champs ont été touchés OU qu'ils n'ont pas d'erreurs
    const categoriesValid = Array.isArray(watchedCategories) && watchedCategories.length > 0 && (!touched.categories || !errors.categories);
    
    return categoriesValid;
  }, [watchedCategories, errors, touched]);

  // Synchroniser les changements avec le parent
  React.useEffect(() => {
    const subscription = form.watch((data) => {
      const currentData = {
        ...data,
        categories: Array.isArray(data.categories)
          ? data.categories.filter((cat): cat is string => Boolean(cat))
          : [],
      };
      onDataChange?.(currentData);
    });
    return () => subscription.unsubscribe();
  }, [form, onDataChange]);

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Image de couverture */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Image de couverture</h3>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ImageUpload
                value={form.watch('coverImage')}
                onChange={(url: string) => form.setValue('coverImage', url)}
                placeholder="Ajouter une image de couverture"
                aspectRatio="wide"
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                Format recommandé : 1200x400px (optionnel)
              </p>
            </div>
          </div>
        </div>

        {/* Secteurs d'activité */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Secteurs d'activité *
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Sélectionnez jusqu'à {VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT} secteurs qui correspondent à votre startup
            </p>
            
            <BadgeSelector
              selected={form.watch('categories') || []}
              onChange={(categories: string[]) => form.setValue('categories', categories, { shouldValidate: true, shouldTouch: true })}
              max={VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT}
              options={SECTOR_OPTIONS}
            />
            
            {form.formState.errors.categories && (
              <p className="text-red-500 text-sm mt-2">
                {form.formState.errors.categories.message}
              </p>
            )}
            
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {form.watch('categories')?.length || 0}/{VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT} secteurs sélectionnés
              </p>
              {form.watch('categories')?.length === VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT && (
                <p className="text-xs text-amber-600">
                  Maximum atteint
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 gap-3">
          <Button
            type="button"
            size="lg"
            color="secondary"
            onClick={onBack}
          >
            Retour
          </Button>
          <Button
            type="submit"
            size="lg"
            color="primary"
            isDisabled={!isFormValid}
          >
            Continuer vers l'équipe
          </Button>
        </div>
      </form>
    </div>
  );
};
