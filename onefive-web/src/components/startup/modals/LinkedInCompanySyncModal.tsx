'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../base/buttons/button';
import { CloseButton } from '../../base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '../../application/modals/modal';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from 'react-aria-components';
import { Check, CheckCircle, AlertCircle, Loader2, ExternalLink, MapPin, Building2, Briefcase } from 'lucide-react';
import { Checkbox } from '../../base/checkbox/checkbox';
import { Avatar } from '../../base/avatar/avatar';
import {
  useCompanySyncStatus,
  useInitiateCompanySync,
  useCompanyComparison,
  useApplyCompanySync,
  CompanyComparisonData,
} from '@/queries/startup';

import LinkedInSquareIcon from '@/components/shared/LinkedInSquareIcon';

interface LinkedInCompanySyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSyncComplete?: () => void;
  startupId: string;
  currentLinkedinUrl?: string | null;
}

type Step = 'initial' | 'loading' | 'comparison' | 'applying' | 'dev-choice';

// Détecter si on est en développement
const isDevelopment = process.env.NODE_ENV === 'development';

export const LinkedInCompanySyncModal = ({ 
  open, 
  onOpenChange, 
  onSyncComplete, 
  startupId,
  currentLinkedinUrl,
}: LinkedInCompanySyncModalProps) => {
  const [step, setStep] = useState<Step>('initial');
  const [comparisonData, setComparisonData] = useState<CompanyComparisonData | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState(currentLinkedinUrl || '');
  const [urlError, setUrlError] = useState<string | null>(null);
  
  // Sélections
  const [syncName, setSyncName] = useState(false);
  const [syncTagline, setSyncTagline] = useState(false);
  const [syncDescription, setSyncDescription] = useState(false);
  const [syncWebsite, setSyncWebsite] = useState(false);
  const [syncLogo, setSyncLogo] = useState(false);
  const [syncCover, setSyncCover] = useState(false);
  const [syncCity, setSyncCity] = useState(false);
  const [syncCountry, setSyncCountry] = useState(false);
  const [syncFoundedDate, setSyncFoundedDate] = useState(false);

  // Queries
  const { data: syncStatus, isLoading: isLoadingSyncStatus } = useCompanySyncStatus(startupId);
  const { data: _comparisonFromApi, refetch: refetchComparison } = useCompanyComparison(startupId, false);
  const initiateSync = useInitiateCompanySync();
  const applySync = useApplyCompanySync();

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSyncName(false);
      setSyncTagline(false);
      setSyncDescription(false);
      setSyncWebsite(false);
      setSyncLogo(false);
      setSyncCover(false);
      setSyncCity(false);
      setSyncCountry(false);
      setSyncFoundedDate(false);
      setLinkedinUrl(currentLinkedinUrl || '');
      setUrlError(null);
      setStep('initial');
      setComparisonData(null);
    }
  }, [open, currentLinkedinUrl]);

  // Par défaut, cocher toutes les cases quand on arrive sur l'étape comparaison
  useEffect(() => {
    if (comparisonData) {
      setSyncName(true);
      setSyncTagline(true);
      setSyncDescription(true);
      setSyncWebsite(true);
      setSyncLogo(true);
      setSyncCover(true);
      setSyncCity(true);
      setSyncCountry(true);
      setSyncFoundedDate(true);
    }
  }, [comparisonData]);

  // Gérer le statut de sync
  useEffect(() => {
    if (!open || step !== 'initial' || isLoadingSyncStatus || !syncStatus) return;

    const { canSync, hasPreviousSync } = syncStatus;

    // Si on ne peut pas sync mais on a des données précédentes
    if (!canSync && hasPreviousSync) {
      // Charger les données de comparaison
      refetchComparison().then(({ data }) => {
        if (data) {
          setComparisonData(data);
          setStep('comparison');
        }
      });
    }
    // En mode dev, si on a des données précédentes et qu'on peut sync, proposer le choix
    else if (isDevelopment && hasPreviousSync && canSync) {
      setStep('dev-choice');
    }
  }, [open, step, isLoadingSyncStatus, syncStatus, refetchComparison]);

  // Valider l'URL LinkedIn company
  const validateLinkedInUrl = (url: string): boolean => {
    // Accepte : linkedin.com/company/nom ou linkedin.com/company/id
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/company\/[\w-]+\/?/;
    return linkedinRegex.test(url.trim());
  };

  const handleStartSync = () => {
    const trimmedUrl = linkedinUrl.trim();
    
    if (!trimmedUrl) {
      setUrlError('Veuillez entrer l\'URL LinkedIn de la startup');
      return;
    }
    
    if (!validateLinkedInUrl(trimmedUrl)) {
      setUrlError('URL invalide. Format attendu : https://www.linkedin.com/company/nom-startup');
      return;
    }
    
    setUrlError(null);
    setStep('loading');
    
    initiateSync.mutate(
      { startupId, linkedinUrl: trimmedUrl },
      {
        onSuccess: () => {
          // Après le scraping, charger les données de comparaison
          refetchComparison().then(({ data }) => {
            if (data) {
              setComparisonData(data);
              setStep('comparison');
            }
          });
        },
        onError: () => {
          setStep('initial');
        },
      }
    );
  };

  const handleUsePreviousData = () => {
    refetchComparison().then(({ data }) => {
      if (data) {
        setComparisonData(data);
        setStep('comparison');
      }
    });
  };

  const handleApply = () => {
    if (!comparisonData) return;

    setStep('applying');

    const syncFields = {
      syncName,
      syncTagline,
      syncDescription,
      syncWebsite,
      syncLogo,
      syncCover,
      // Pour la localisation, on envoie syncLocation si ville OU pays est sélectionné
      syncLocation: syncCity || syncCountry,
      syncFoundedDate,
    };

    applySync.mutate(
      { startupId, syncFields },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSyncComplete?.();
        },
        onError: () => {
          setStep('comparison');
        },
      }
    );
  };

  const hasAnySelection = syncName || syncTagline || syncDescription || syncWebsite || 
    syncLogo || syncCover || syncCity || syncCountry || syncFoundedDate;

  const selectionCount = [syncName, syncTagline, syncDescription, syncWebsite, syncLogo, syncCover, syncCity, syncCountry, syncFoundedDate].filter(Boolean).length;

  return (
    <AriaDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      <Button style={{ display: 'none' }}>Trigger</Button>
      <ModalOverlay isDismissable={step !== 'loading' && step !== 'applying'}>
        <Modal className={step === 'comparison' ? 'max-w-5xl' : 'max-w-lg'}>
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all flex flex-col max-h-[90vh]">
              <CloseButton 
                onClick={() => onOpenChange(false)} 
                theme="light" 
                size="lg" 
                className="absolute top-3 right-3 z-10"
                isDisabled={step === 'loading' || step === 'applying'}
              />

              {/* Header */}
              <div className="flex flex-col gap-0.5 px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
                <AriaHeading slot="title" className="text-lg font-semibold text-primary flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl overflow-hidden">
                    <LinkedInSquareIcon size={40} />
                  </div>
                  {step === 'initial' && 'Synchroniser avec LinkedIn'}
                  {step === 'dev-choice' && '🔧 Mode Dev - Choix sync'}
                  {step === 'loading' && 'Analyse en cours...'}
                  {step === 'comparison' && 'Comparer et sélectionner'}
                  {step === 'applying' && 'Application en cours...'}
                </AriaHeading>
                <p className="text-sm text-tertiary">
                  {step === 'initial' && 'Entrez l\'URL de votre page entreprise LinkedIn'}
                  {step === 'dev-choice' && 'Choisissez entre un nouveau sync ou réutiliser les données précédentes'}
                  {step === 'loading' && 'Nous analysons votre page entreprise LinkedIn, veuillez patienter...'}
                  {step === 'comparison' && 'Sélectionnez les éléments à synchroniser'}
                  {step === 'applying' && 'Application de vos sélections...'}
                </p>
              </div>

              {/* Content */}
              <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">
                {/* Step 1: Initial - URL Input */}
                {step === 'initial' && (
                  <div className="space-y-6 py-4">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden flex items-center justify-center">
                        <LinkedInSquareIcon size={80} />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Importez vos données LinkedIn
                      </h3>
                      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                        Entrez l'URL de votre page entreprise LinkedIn pour récupérer automatiquement les informations de votre startup.
                      </p>
                    </div>

                    {/* Input URL LinkedIn */}
                    <div className="space-y-2">
                      <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700">
                        URL de votre page entreprise LinkedIn
                      </label>
                      <div className="relative">
                        <input
                          id="linkedin-url"
                          type="url"
                          value={linkedinUrl}
                          onChange={(e) => {
                            setLinkedinUrl(e.target.value);
                            setUrlError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleStartSync();
                            }
                          }}
                          placeholder="https://www.linkedin.com/company/ma-startup"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                            urlError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                      {urlError && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {urlError}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        💡 Trouvez votre URL sur LinkedIn → Page entreprise → Copiez l'URL de la barre d'adresse
                      </p>
                    </div>

                    <Button
                      color="primary"
                      size="md"
                      iconLeading={<LinkedInSquareIcon size={20} className="text-white" />}
                      onClick={handleStartSync}
                      className="w-full bg-[#0A66C2] hover:bg-[#004182]"
                      isDisabled={!linkedinUrl.trim() || (syncStatus?.canSync === false)}
                    >
                      Synchroniser ma startup
                    </Button>

                    {syncStatus?.canSync === false ? (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          <strong>Limite atteinte :</strong> Vous pourrez synchroniser à nouveau dans {Math.ceil(syncStatus.hoursRemaining ?? 24)} heures.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-800">
                          <strong>⚡ Note :</strong> Vous ne pouvez synchroniser qu'une fois toutes les 24 heures.
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 text-sm text-gray-500">
                      <p className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Vos données restent privées et sécurisées
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Choisissez ce que vous souhaitez synchroniser
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Aucune publication sur votre page LinkedIn
                      </p>
                    </div>
                  </div>
                )}

                {/* Step Dev Choice (dev only) - Choose between new sync or reuse */}
                {step === 'dev-choice' && (
                  <div className="space-y-6 py-4">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-orange-50 rounded-full flex items-center justify-center">
                        <span className="text-4xl">🔧</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Mode Développement
                      </h3>
                      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                        Vous avez des données de synchronisation précédentes. Que souhaitez-vous faire ?
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Option 1: Réutiliser les données */}
                      <button
                        type="button"
                        onClick={handleUsePreviousData}
                        className="w-full p-4 text-left border-2 border-blue-200 bg-blue-50 rounded-lg hover:border-blue-400 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg shrink-0">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Réutiliser les données précédentes</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Accéder directement à la sélection avec les données du dernier sync (rapide)
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Option 2: Nouveau sync */}
                      <button
                        type="button"
                        onClick={() => setStep('initial')}
                        className="w-full p-4 text-left border-2 border-gray-200 bg-white rounded-lg hover:border-gray-400 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg shrink-0">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Faire un nouveau sync</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Récupérer les dernières données de LinkedIn (prend ~2 min)
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-xs text-orange-700">
                        ℹ️ Cette option n'apparaît qu'en mode développement. En production, la limite de 24h s'applique automatiquement.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2: Loading */}
                {step === 'loading' && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600">Récupération de vos données LinkedIn...</p>
                    <p className="text-sm text-gray-400 mt-2">Cela peut prendre jusqu'à 2 minutes</p>
                  </div>
                )}

                {/* Step 3: Comparison */}
                {step === 'comparison' && comparisonData && (
                  <div className="space-y-6">
                    {/* Lien Voir sur LinkedIn */}
                    {comparisonData.linkedin.linkedinUrl && (
                      <div className="flex justify-end">
                        <a
                          href={comparisonData.linkedin.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-[#0A66C2] hover:underline"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Voir sur LinkedIn
                        </a>
                      </div>
                    )}

                    {/* Informations de base */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Informations de base
                      </h3>
                      
                      {/* Nom */}
                      {comparisonData.linkedin.name && comparisonData.linkedin.name !== comparisonData.current.name && (
                        <div 
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setSyncName(!syncName)}
                        >
                          <Checkbox
                            isSelected={syncName}
                            onChange={() => {}}
                          />
                          <div className="flex-1 grid grid-cols-[1fr_1fr] gap-8">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Actuel</p>
                              <p className="text-sm text-gray-600">{comparisonData.current.name || '(vide)'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">LinkedIn (nouveau)</p>
                              <p className="text-sm font-medium text-blue-600">{comparisonData.linkedin.name}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tagline */}
                      {comparisonData.linkedin.tagline && (
                        <div 
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setSyncTagline(!syncTagline)}
                        >
                          <Checkbox
                            isSelected={syncTagline}
                            onChange={() => {}}
                          />
                          <div className="flex-1 grid grid-cols-[1fr_1fr] gap-8">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Tagline actuelle</p>
                              <p className="text-sm text-gray-600">{comparisonData.current.tagline || '(vide)'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Tagline LinkedIn (nouveau)</p>
                              <p className="text-sm font-medium text-blue-600">{comparisonData.linkedin.tagline}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Description (description LinkedIn -> description pour À propos) */}
                      {comparisonData.linkedin.description && (
                        <div 
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setSyncDescription(!syncDescription)}
                        >
                          <Checkbox
                            isSelected={syncDescription}
                            onChange={() => {}}
                          />
                          <div className="flex-1 grid grid-cols-[1fr_1fr] gap-8">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Description actuelle (à propos)</p>
                              <p className="text-sm text-gray-600 line-clamp-3">{comparisonData.current.description || '(vide)'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Description LinkedIn (nouveau)</p>
                              <p className="text-sm font-medium text-blue-600 line-clamp-3">{comparisonData.linkedin.description}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Logo */}
                      {comparisonData.linkedin.logo && (
                        <div 
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setSyncLogo(!syncLogo)}
                        >
                          <Checkbox
                            isSelected={syncLogo}
                            onChange={() => {}}
                          />
                          <div className="flex-1 grid grid-cols-[1fr_1fr] gap-8">
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Logo actuel</p>
                              <Avatar src={comparisonData.current.logo || undefined} size="md" alt="Current" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Logo LinkedIn (nouveau)</p>
                              <Avatar src={comparisonData.linkedin.logo} size="md" alt="LinkedIn" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cover */}
                      {comparisonData.linkedin.backgroundCover && (
                        <div 
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setSyncCover(!syncCover)}
                        >
                          <Checkbox
                            isSelected={syncCover}
                            onChange={() => {}}
                          />
                          <div className="flex-1 grid grid-cols-[1fr_1fr] gap-8">
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Image de couverture actuelle</p>
                              {comparisonData.current.coverImage ? (
                                <div className="h-16 rounded-lg overflow-hidden bg-cover bg-center" 
                                  style={{ backgroundImage: `url(${comparisonData.current.coverImage})` }}
                                />
                              ) : (
                                <div className="h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs text-gray-400">(vide)</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Bannière LinkedIn (nouveau)</p>
                              <div className="h-16 rounded-lg overflow-hidden bg-cover bg-center" 
                                style={{ backgroundImage: `url(${comparisonData.linkedin.backgroundCover})` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Localisation */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Localisation
                      </h3>

                      {/* Ville (séparée) */}
                      {comparisonData.linkedin.city && (
                        <div 
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setSyncCity(!syncCity)}
                        >
                          <Checkbox
                            isSelected={syncCity}
                            onChange={() => {}}
                          />
                          <div className="flex-1 grid grid-cols-[1fr_1fr] gap-8">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Ville actuelle</p>
                              <p className="text-sm text-gray-600">{comparisonData.current.city || '(vide)'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Ville LinkedIn (nouveau)</p>
                              <p className="text-sm font-medium text-blue-600">{comparisonData.linkedin.city}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pays (séparé) */}
                      {comparisonData.linkedin.countryCode && (
                        <div 
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setSyncCountry(!syncCountry)}
                        >
                          <Checkbox
                            isSelected={syncCountry}
                            onChange={() => {}}
                          />
                          <div className="flex-1 grid grid-cols-[1fr_1fr] gap-8">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Pays actuel</p>
                              <p className="text-sm text-gray-600">{comparisonData.current.countryCode || '(vide)'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Pays LinkedIn (nouveau)</p>
                              <p className="text-sm font-medium text-blue-600">{comparisonData.linkedin.countryCode}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Autres informations */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Autres informations
                      </h3>

                      {/* Website */}
                      {comparisonData.linkedin.website && comparisonData.linkedin.website !== comparisonData.current.website && (
                        <div 
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setSyncWebsite(!syncWebsite)}
                        >
                          <Checkbox
                            isSelected={syncWebsite}
                            onChange={() => {}}
                          />
                          <div className="flex-1 grid grid-cols-[1fr_1fr] gap-8">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Site web actuel</p>
                              <p className="text-sm text-gray-600">{comparisonData.current.website || '(vide)'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Site web LinkedIn (nouveau)</p>
                              <p className="text-sm font-medium text-blue-600">{comparisonData.linkedin.website}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Founded Year */}
                      {comparisonData.linkedin.foundedYear && (
                        <div 
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setSyncFoundedDate(!syncFoundedDate)}
                        >
                          <Checkbox
                            isSelected={syncFoundedDate}
                            onChange={() => {}}
                          />
                          <div className="flex-1 grid grid-cols-[1fr_1fr] gap-8">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Date de création actuelle</p>
                              <p className="text-sm text-gray-600">
                                {comparisonData.current.foundedDate 
                                  ? new Date(comparisonData.current.foundedDate).getFullYear() 
                                  : '(vide)'
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Année de création LinkedIn (nouveau)</p>
                              <p className="text-sm font-medium text-blue-600">{comparisonData.linkedin.foundedYear}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Applying */}
                {step === 'applying' && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600">Application de vos sélections...</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {step === 'comparison' && (
                <div className="border-t px-6 py-4 bg-gray-50 flex justify-between items-center shrink-0">
                  <p className="text-sm text-gray-500">
                    {hasAnySelection 
                      ? `${selectionCount} champ(s) sélectionné(s)`
                      : 'Sélectionnez les champs à synchroniser'
                    }
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => onOpenChange(false)}
                      color="secondary"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleApply}
                      color="primary"
                      isDisabled={!hasAnySelection}
                      iconLeading={<Check data-icon />}
                      className="bg-[#0A66C2] hover:bg-[#004182]"
                    >
                      Appliquer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </AriaDialogTrigger>
  );
};
