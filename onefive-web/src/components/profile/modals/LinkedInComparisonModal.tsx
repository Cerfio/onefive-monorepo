'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '../../base/buttons/button';
import { CloseButton } from '../../base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '../../application/modals/modal';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from 'react-aria-components';
import { CheckCircle, AlertCircle, Briefcase, GraduationCap, User, Loader2, ExternalLink } from 'lucide-react';
import { Avatar } from '../../base/avatar/avatar';
import { Checkbox } from '../../base/checkbox/checkbox';
import { toast } from 'sonner';
import { api } from '@/utils/kyInstance';
import LinkedInSquareIcon from '@/components/shared/LinkedInSquareIcon';

interface LinkedInComparisonData {
  linkedin: {
    headline?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    bio?: string | null;
    linkedinUrl?: string | null;
    experiences: Array<{
      title: string;
      company: string;
      city: string;
      from: string;
      to?: string;
      description?: string;
      urlLinkedin?: string;
      tags: string[];
    }>;
    education: Array<{
      degree: string;
      school: string;
      city: string;
      from: string;
      to?: string;
      description?: string;
      urlLinkedin?: string;
      tags: string[];
    }>;
    skills: string[];
  };
  current: {
    headline?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    bio?: string | null;
    experiences: Array<{
      id: string;
      title: string;
      company: string;
      city: string;
      from: string;
      to?: string;
      description?: string;
      urlLinkedin?: string;
      tags: string[];
    }>;
    education: Array<{
      id: string;
      degree: string;
      school: string;
      city: string;
      from: string;
      to?: string;
      description?: string;
      urlLinkedin?: string;
      tags: string[];
    }>;
    skills: string[];
  };
  canSync: boolean;
  nextSyncAvailableAt?: Date;
  hoursRemaining?: number;
}

interface LinkedInComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSyncComplete?: () => void;
  profileId?: string;
  initialData?: LinkedInComparisonData | null;
}

type Step = 'initial' | 'loading' | 'comparison' | 'applying' | 'dev-choice';

// Détecter si on est en développement
const isDevelopment = process.env.NODE_ENV === 'development';

interface SyncStatusResponse {
  canSync: boolean;
  hoursRemaining?: number;
  nextSyncAvailableAt?: string;
  syncCount?: number;
  syncLimit?: number;
  periodResetsAt?: string;
  hasPreviousSync: boolean;
  previousSyncData?: LinkedInComparisonData;
}

export const LinkedInComparisonModal = ({ 
  open, 
  onOpenChange, 
  onSyncComplete, 
  profileId: _profileId,
  initialData 
}: LinkedInComparisonModalProps) => {
  const [step, setStep] = useState<Step>('initial');
  const [comparisonData, setComparisonData] = useState<LinkedInComparisonData | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [devChoiceMade, setDevChoiceMade] = useState(false);
  
  // Sélections (tout coché par défaut à l'étape comparaison)
  const [syncHeadline, setSyncHeadline] = useState(false);
  const [syncBio, setSyncBio] = useState(false);
  const [syncAvatar, setSyncAvatar] = useState(false);
  const [syncCover, setSyncCover] = useState(false);
  const [selectedExperiences, setSelectedExperiences] = useState<number[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<number[]>([]);

  // Vérifier le statut de synchronisation
  const { data: syncStatus, isLoading: isLoadingSyncStatus } = useQuery({
    queryKey: ['linkedin-sync-status'],
    queryFn: async () => {
      const response = await api.get('linkedin-sync/status');
      return response.json() as Promise<{ success: boolean; data: SyncStatusResponse }>;
    },
    enabled: open,
  });

  // Charger les données initiales si présentes
  useEffect(() => {
    if (open) {
      // Réinitialiser les sélections
      setSyncHeadline(false);
      setSyncBio(false);
      setSyncAvatar(false);
      setSyncCover(false);
      setSelectedExperiences([]);
      setSelectedEducation([]);
      setLinkedinUrl('');
      setUrlError(null);

      // Vérifier si on a des données initiales (depuis OAuth callback)
      setDevChoiceMade(false);

      if (initialData) {
        setComparisonData(initialData);
        setStep('comparison');
        setComparisonDefaults(initialData);
        // Nettoyer le sessionStorage
        sessionStorage.removeItem('linkedin_sync_data');
      } else {
        // Vérifier si on a des données dans sessionStorage (fallback)
        const storedData = sessionStorage.getItem('linkedin_sync_data');
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            setComparisonData(parsed);
            setStep('comparison');
            setComparisonDefaults(parsed);
            sessionStorage.removeItem('linkedin_sync_data');
          } catch {
            setStep('initial');
          }
        } else {
          // Pas de données initiales - on attend le syncStatus
          setStep('initial');
        }
      }
    }
  }, [open, initialData]);

  // Gérer les données du précédent sync quand le syncStatus est chargé
  useEffect(() => {
    if (!open || step !== 'initial' || isLoadingSyncStatus || !syncStatus?.data || devChoiceMade) return;

    const { canSync, hasPreviousSync, previousSyncData } = syncStatus.data;

    // Si on ne peut pas sync mais on a des données précédentes
    if (!canSync && hasPreviousSync && previousSyncData) {
      // Charger directement les données pour permettre de reselectionner
      setComparisonData(previousSyncData);
      setComparisonDefaults(previousSyncData);
      setStep('comparison');
    }
    // En mode dev, si on a des données précédentes et qu'on peut sync, proposer le choix
    else if (isDevelopment && hasPreviousSync && canSync && previousSyncData) {
      setComparisonData(previousSyncData); // Pré-charger pour le cas où on choisit "réutiliser"
      setStep('dev-choice');
    }
  }, [open, step, isLoadingSyncStatus, syncStatus, devChoiceMade]);

  // Mutation pour initier le scraping LinkedIn
  const initiateMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await api.post(
        'linkedin-sync/initiate',
        { 
          json: { linkedinUrl: url }, 
          timeout: 150000, // 2 minutes 30 secondes pour le scraping LinkedIn
        }
      );
      return response.json() as Promise<{ success: boolean; data: LinkedInComparisonData }>;
    },
    onSuccess: (data) => {
      setComparisonData(data.data);
      setStep('comparison');
      setComparisonDefaults(data.data);
    },
    onError: (error: any) => {
      setStep('initial');
      if (error?.response?.status === 429) {
        toast.error('Vous ne pouvez synchroniser qu\'une fois toutes les 24 heures.');
      } else {
        toast.error('Erreur lors de la récupération du profil LinkedIn. Vérifiez l\'URL.');
      }
    },
  });

  // Mutation pour appliquer les changements
  const applyMutation = useMutation({
    mutationFn: async (syncFields: any) => {
      const response = await api.post(
        'linkedin-sync/apply',
        { json: syncFields }
      );
      return response.json() as Promise<{ success: boolean; data: { message: string; updatedFields: string[] } }>;
    },
    onSuccess: (data) => {
      toast.success(data.data.message);
      onOpenChange(false);
      onSyncComplete?.();
    },
    onError: (_error: any) => {
      toast.error('Erreur lors de l\'application des changements');
      setStep('comparison');
    },
  });

  // Valider l'URL LinkedIn
  const validateLinkedInUrl = (url: string): boolean => {
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
    return linkedinRegex.test(url.trim());
  };

  /** Coche tout par défaut quand on arrive sur l’étape comparaison */
  const setComparisonDefaults = (data: LinkedInComparisonData) => {
    setSyncHeadline(!!data.linkedin.headline);
    setSyncBio(!!data.linkedin.bio);
    setSyncAvatar(!!data.linkedin.avatarUrl);
    setSyncCover(!!data.linkedin.coverUrl);
    setSelectedExperiences(data.linkedin.experiences.map((_, i) => i));
    setSelectedEducation(data.linkedin.education.map((_, i) => i));
  };

  const handleStartSync = () => {
    const trimmedUrl = linkedinUrl.trim();
    
    if (!trimmedUrl) {
      setUrlError('Veuillez entrer votre URL LinkedIn');
      return;
    }
    
    if (!validateLinkedInUrl(trimmedUrl)) {
      setUrlError('URL invalide. Format attendu : https://www.linkedin.com/in/votre-profil');
      return;
    }
    
    setUrlError(null);
    setStep('loading');
    initiateMutation.mutate(trimmedUrl);
  };

  const handleApply = () => {
    if (!comparisonData) return;

    setStep('applying');

    const syncFields = {
      syncHeadline,
      syncBio,
      syncAvatar,
      syncCover,
      syncSkills: false,
      syncExperiences: selectedExperiences.length > 0,
      selectedExperiences: selectedExperiences.map(i => comparisonData.linkedin.experiences[i]),
      syncEducation: selectedEducation.length > 0,
      selectedEducation: selectedEducation.map(i => comparisonData.linkedin.education[i]),
    };

    applyMutation.mutate(syncFields);
  };

  const toggleExperience = (index: number) => {
    setSelectedExperiences(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleEducation = (index: number) => {
    setSelectedEducation(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Présent';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const hasAnySelection = syncHeadline || syncBio || syncAvatar || syncCover || 
    selectedExperiences.length > 0 || selectedEducation.length > 0;

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
                  {step === 'initial' && 'Entrez votre URL LinkedIn pour synchroniser votre profil'}
                  {step === 'dev-choice' && 'Choisissez entre un nouveau sync ou réutiliser les données précédentes'}
                  {step === 'loading' && 'Nous analysons votre profil LinkedIn, veuillez patienter...'}
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
                        Entrez l'URL de votre profil LinkedIn pour récupérer automatiquement vos expériences et formations.
                      </p>
                    </div>

                    {/* Input URL LinkedIn */}
                    <div className="space-y-2">
                      <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700">
                        URL de votre profil LinkedIn
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
                          placeholder="https://www.linkedin.com/in/votre-profil"
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
                      <a
                        href="https://www.linkedin.com/in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#0A66C2] hover:underline"
                      >
                        Know your LinkedIn profile URL
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <Button
                      color="primary"
                      size="md"
                      iconLeading={<LinkedInSquareIcon size={20} className="text-white" />}
                      onClick={handleStartSync}
                      className="w-full bg-[#0A66C2] hover:bg-[#004182]"
                      isDisabled={!linkedinUrl.trim() || (syncStatus?.data?.canSync === false)}
                    >
                      Synchroniser mon profil
                    </Button>

                    {syncStatus?.data?.canSync === false ? (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-800 font-medium mb-1">
                          Limite atteinte
                        </p>
                        {syncStatus.data.hoursRemaining ? (
                          <p className="text-sm text-red-700">
                            Vous pourrez synchroniser à nouveau dans {Math.ceil(syncStatus.data.hoursRemaining)} heures.
                          </p>
                        ) : syncStatus.data.periodResetsAt ? (
                          <p className="text-sm text-red-700">
                            Vous avez utilisé vos {syncStatus.data.syncLimit ?? 5} imports ce trimestre. Prochain reset le{' '}
                            {new Date(syncStatus.data.periodResetsAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
                        <p className="text-sm font-medium text-gray-800">Please note:</p>
                        <ul className="space-y-1">
                          <li className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                            After importing, your existing data in your resume will be overridden.
                          </li>
                          <li className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                            You can import up to {syncStatus?.data?.syncLimit ?? 5} times per quarter
                            {syncStatus?.data?.syncCount != null && (
                              <span className="text-gray-500">
                                {' '}({syncStatus.data.syncCount}/{syncStatus.data.syncLimit ?? 5} used)
                              </span>
                            )}.
                          </li>
                        </ul>
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
                        Aucune publication sur votre compte LinkedIn
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
                        onClick={() => {
                          setDevChoiceMade(true);
                          if (comparisonData) setComparisonDefaults(comparisonData);
                          setStep('comparison');
                        }}
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
                        onClick={() => {
                          setDevChoiceMade(true);
                          setStep('initial');
                        }}
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

                    {/* Basic Info Section */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Informations de base
                      </h3>
                      
                      {/* Headline */}
                      {comparisonData.linkedin.headline && (
                        <div 
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setSyncHeadline(!syncHeadline)}
                        >
                          <Checkbox
                            isSelected={syncHeadline}
                            onChange={() => {}}
                          />
                          <div className="flex-1 grid grid-cols-[1fr_1fr] gap-8">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Actuel</p>
                              <p className="text-sm text-gray-600">{comparisonData.current.headline || '(vide)'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">LinkedIn (nouveau)</p>
                              <p className="text-sm font-medium text-blue-600">{comparisonData.linkedin.headline}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bio */}
                      {comparisonData.linkedin.bio && (
                        <div 
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setSyncBio(!syncBio)}
                        >
                          <Checkbox
                            isSelected={syncBio}
                            onChange={() => {}}
                          />
                          <div className="flex-1 grid grid-cols-[1fr_1fr] gap-8">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Bio actuelle</p>
                              <p className="text-sm text-gray-600 line-clamp-3">{comparisonData.current.bio || '(vide)'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Bio LinkedIn (nouveau)</p>
                              <p className="text-sm text-blue-600 line-clamp-3">{comparisonData.linkedin.bio}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Avatar */}
                      {comparisonData.linkedin.avatarUrl && (
                        <div 
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setSyncAvatar(!syncAvatar)}
                        >
                          <Checkbox
                            isSelected={syncAvatar}
                            onChange={() => {}}
                          />
                          <div className="flex-1 grid grid-cols-[1fr_1fr] gap-8">
                            <div>
                              <p className="text-xs text-gray-500 mb-2">Actuel</p>
                              <Avatar src={comparisonData.current.avatarUrl || undefined} size="md" alt="Current" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-2">LinkedIn (nouveau)</p>
                              <Avatar src={comparisonData.linkedin.avatarUrl} size="md" alt="LinkedIn" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cover */}
                      {comparisonData.linkedin.coverUrl && (
                        <div 
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setSyncCover(!syncCover)}
                        >
                          <Checkbox
                            isSelected={syncCover}
                            onChange={() => {}}
                          />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-2">Bannière LinkedIn disponible</p>
                            <div className="h-16 rounded-lg overflow-hidden bg-cover bg-center" 
                              style={{ backgroundImage: `url(${comparisonData.linkedin.coverUrl})` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Experiences Section */}
                    {comparisonData.linkedin.experiences.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Briefcase className="w-5 h-5" />
                            Expériences ({comparisonData.linkedin.experiences.length})
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              const allSelected = selectedExperiences.length === comparisonData.linkedin.experiences.length;
                              setSelectedExperiences(
                                allSelected ? [] : comparisonData.linkedin.experiences.map((_, i) => i)
                              );
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {selectedExperiences.length === comparisonData.linkedin.experiences.length 
                              ? 'Tout désélectionner' 
                              : 'Tout sélectionner'}
                          </button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {comparisonData.linkedin.experiences.map((exp, index) => (
                            <div 
                              key={index}
                              className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                                selectedExperiences.includes(index) 
                                  ? 'bg-blue-50 border-blue-300' 
                                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => toggleExperience(index)}
                            >
                              <Checkbox
                                isSelected={selectedExperiences.includes(index)}
                                onChange={() => {}}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{exp.title}</p>
                                <p className="text-sm text-gray-600">{exp.company}</p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(exp.from)} - {formatDate(exp.to)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education Section */}
                    {comparisonData.linkedin.education.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" />
                            Formation ({comparisonData.linkedin.education.length})
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              const allSelected = selectedEducation.length === comparisonData.linkedin.education.length;
                              setSelectedEducation(
                                allSelected ? [] : comparisonData.linkedin.education.map((_, i) => i)
                              );
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {selectedEducation.length === comparisonData.linkedin.education.length 
                              ? 'Tout désélectionner' 
                              : 'Tout sélectionner'}
                          </button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {comparisonData.linkedin.education.map((edu, index) => (
                            <div 
                              key={index}
                              className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                                selectedEducation.includes(index) 
                                  ? 'bg-blue-50 border-blue-300' 
                                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => toggleEducation(index)}
                            >
                              <Checkbox
                                isSelected={selectedEducation.includes(index)}
                                onChange={() => {}}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{edu.school}</p>
                                <p className="text-sm text-gray-600">{edu.degree}</p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(edu.from)} - {formatDate(edu.to)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Step 4: Applying */}
                {step === 'applying' && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
                    <p className="text-gray-600">Application de vos sélections...</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center shrink-0">
                <div className="text-sm text-gray-500">
                  {step === 'comparison' && hasAnySelection && (
                    <span className="text-green-600 font-medium">
                      ✓ {[
                        syncHeadline && 'Titre',
                        syncBio && 'Bio',
                        syncAvatar && 'Avatar',
                        syncCover && 'Bannière',
                        selectedExperiences.length > 0 && `${selectedExperiences.length} exp.`,
                        selectedEducation.length > 0 && `${selectedEducation.length} form.`,
                      ].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    color="secondary"
                    onClick={() => onOpenChange(false)}
                    disabled={step === 'loading' || step === 'applying'}
                  >
                    {step === 'initial' || step === 'dev-choice' ? 'Annuler' : step === 'comparison' ? 'Annuler' : 'Fermer'}
                  </Button>
                  {step === 'comparison' && (
                    <Button
                      color="primary"
                      onClick={handleApply}
                      isDisabled={!hasAnySelection}
                    >
                      Appliquer les changements
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </AriaDialogTrigger>
  );
};

