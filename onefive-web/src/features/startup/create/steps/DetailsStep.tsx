import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';
import { Select } from '@/components/base/select/select';
import { countries } from '@/utils/countries';
import { VALIDATION_LIMITS } from '@/constants/validation-limits';

/** Normalise un site web : accepte "keymoire.com" et le transforme en "https://keymoire.com" */
function normalizeWebsite(val: unknown): string {
  if (val === undefined || val === null) return '';
  const s = String(val).trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

const detailsSchema = z.object({
  website: z.preprocess(
    normalizeWebsite,
    z.union([
      z.literal(''),
      z.string().url('URL invalide').max(VALIDATION_LIMITS.STARTUP.WEBSITE_MAX),
    ]),
  ),
  linkedin: z.string()
    .url('URL LinkedIn invalide')
    .max(VALIDATION_LIMITS.STARTUP.LINKEDIN_MAX)
    .optional()
    .or(z.literal('')),
  foundedDate: z.date({
    required_error: 'La date de fondation est requise',
  }),
  countryCode: z.string().min(VALIDATION_LIMITS.STARTUP.COUNTRY_CODE_LENGTH, 'Pays requis').max(VALIDATION_LIMITS.STARTUP.COUNTRY_CODE_LENGTH, 'Pays requis'),
  city: z.string()
    .min(VALIDATION_LIMITS.STARTUP.CITY_MIN, 'Ville requise')
    .max(VALIDATION_LIMITS.STARTUP.CITY_MAX),
});

type DetailsForm = z.infer<typeof detailsSchema>;

interface DetailsStepProps {
  onNext: (data: DetailsForm) => void;
  onBack: () => void;
  data?: Partial<DetailsForm>;
  onDataChange?: (data: Partial<DetailsForm>) => void;
}

export const DetailsStep = ({ onNext, onBack, data, onDataChange }: DetailsStepProps) => {
  const form = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
    mode: 'onTouched',
    defaultValues: {
      website: data?.website || '',
      linkedin: data?.linkedin || '',
      foundedDate: data?.foundedDate || undefined,
      countryCode: data?.countryCode || '',
      city: data?.city || '',
    }
  });

  const onSubmit = async (values: DetailsForm) => {
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }
    onNext(values);
  };

  // Surveiller les valeurs et l'état du formulaire
  const watchedFoundedDate = form.watch('foundedDate');
  const watchedCountryCode = form.watch('countryCode');
  const watchedCity = form.watch('city');
  const errors = form.formState.errors;
  const touched = form.formState.touchedFields;
  
  // Vérifier la validité du formulaire pour activer le bouton
  const isFormValid = React.useMemo(() => {
    // Vérifier que les champs requis sont remplis et valides
    // On vérifie aussi que les champs ont été touchés OU qu'ils n'ont pas d'erreurs
    const foundedDateValid = watchedFoundedDate && (!touched.foundedDate || !errors.foundedDate);
    const countryCodeValid = watchedCountryCode?.trim() && (!touched.countryCode || !errors.countryCode);
    const cityValid = watchedCity?.trim() && (!touched.city || !errors.city);
    
    return !!(foundedDateValid && countryCodeValid && cityValid);
  }, [watchedFoundedDate, watchedCountryCode, watchedCity, errors, touched]);

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
        {/* Website & LinkedIn */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Informations de contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Site web"
                placeholder="keymoire.com"
                value={form.watch('website')}
                onChange={(value: string) => form.setValue('website', value, { shouldValidate: true, shouldTouch: true })}
                onBlur={() => {
                  form.trigger('website');
                  if (!form.formState.touchedFields.website) {
                    form.setValue('website', form.watch('website'), { shouldTouch: true });
                  }
                }}
                isInvalid={form.formState.errors.website && form.formState.touchedFields.website}
              />
              {form.formState.errors.website && form.formState.touchedFields.website && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.website.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Votre site web principal
              </p>
            </div>
            
            <div>
              <Input
                label="LinkedIn"
                placeholder="https://linkedin.com/company/monstartup"
                value={form.watch('linkedin')}
                onChange={(value: string) => form.setValue('linkedin', value, { shouldValidate: true, shouldTouch: true })}
                onBlur={() => {
                  form.trigger('linkedin');
                  if (!form.formState.touchedFields.linkedin) {
                    form.setValue('linkedin', form.watch('linkedin'), { shouldTouch: true });
                  }
                }}
                isInvalid={form.formState.errors.linkedin && form.formState.touchedFields.linkedin}
              />
              {form.formState.errors.linkedin && form.formState.touchedFields.linkedin && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.linkedin.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Page LinkedIn de l'entreprise
              </p>
            </div>
          </div>
        </div>

        {/* Date de fondation */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Historique</h3>
          <div>
            <label className="block text-sm font-medium mb-2">
              Date de fondation *
            </label>
            <Input
              type="date"
              value={form.watch('foundedDate') ? form.watch('foundedDate').toISOString().split('T')[0] : ''}
              onChange={(value: string) => {
                const date = value ? new Date(value) : undefined;
                form.setValue('foundedDate', date as Date, { shouldValidate: true, shouldTouch: true });
              }}
              onBlur={() => {
                form.trigger('foundedDate');
                if (!form.formState.touchedFields.foundedDate) {
                  form.setValue('foundedDate', form.watch('foundedDate'), { shouldTouch: true });
                }
              }}
              isInvalid={form.formState.errors.foundedDate && form.formState.touchedFields.foundedDate}
            />
            {form.formState.errors.foundedDate && form.formState.touchedFields.foundedDate && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.foundedDate.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Quand avez-vous créé votre startup ?
            </p>
          </div>
        </div>

        {/* Localisation */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Localisation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                label="Pays *"
                placeholder="Sélectionner un pays"
                selectedKey={form.watch('countryCode')}
                onSelectionChange={(key) => {
                  form.setValue('countryCode', key as string, { shouldValidate: true, shouldTouch: true });
                }}
                onBlur={() => {
                  form.trigger('countryCode');
                  if (!form.formState.touchedFields.countryCode) {
                    form.setValue('countryCode', form.watch('countryCode'), { shouldTouch: true });
                  }
                }}
                isInvalid={form.formState.errors.countryCode && form.formState.touchedFields.countryCode}
                items={countries.map(country => ({ id: country.code, label: country.name }))}
              >
                {(item) => <Select.Item id={item.id} label={item.label} />}
              </Select>
              {form.formState.errors.countryCode && form.formState.touchedFields.countryCode && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.countryCode.message}
                </p>
              )}
            </div>
            
            <div>
              <Input
                label="Ville *"
                placeholder="Paris"
                value={form.watch('city')}
                onChange={(value: string) => form.setValue('city', value, { shouldValidate: true, shouldTouch: true })}
                onBlur={() => {
                  form.trigger('city');
                  if (!form.formState.touchedFields.city) {
                    form.setValue('city', form.watch('city'), { shouldTouch: true });
                  }
                }}
                isInvalid={form.formState.errors.city && form.formState.touchedFields.city}
              />
              {form.formState.errors.city && form.formState.touchedFields.city && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.city.message}
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
            Continuer vers les secteurs
          </Button>
        </div>
      </form>
    </div>
  );
};
