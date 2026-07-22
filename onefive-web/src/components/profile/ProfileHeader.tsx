'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Globe, ExternalLink, Edit3, Share2, Eye } from 'lucide-react';
import LinkedInSquareIcon from '@/components/shared/LinkedInSquareIcon';
import { Card } from '@/components/base/card/card';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge } from '../base/badges/badges';
import { Button } from '../base/buttons/button';
import { Dropdown } from '../base/dropdown/dropdown';
import ProfileActions from '@/components/profile/ProfileActions';
import NumberFlow from '@number-flow/react';
import { CompanyIcon } from './CompanyIcon';
import { toast } from 'sonner';
import ProfilePreviewModal from './modals/ProfilePreviewModal';
import { BioWithExpand } from './BioWithExpand';
import { LinkedInComparisonModal } from './modals/LinkedInComparisonModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Flag } from '@/components/ui/flag';
import { getProfileRoleLabel, PROFILE_ROLE_METADATA, ProfileRole, getGenderedShortLabel, type GenderPreference } from '@/sharing-enum/profile';

const INTENTION_LABELS: Record<string, string> = {
  RAISING: 'Je lève',
  INVESTING: "J'investis",
  HIRING: 'Je recrute',
  JOB_SEEKING: 'Je cherche un poste',
  COFOUNDER: 'Je cherche un associé',
  MENTORING: 'Je mentore',
};

// Fonction pour obtenir les couleurs des badges de rôles depuis la configuration
const getRoleBadgeColors = (roleValue: string) => {
  // Chercher d'abord dans les métadonnées
  for (const [role, metadata] of Object.entries(PROFILE_ROLE_METADATA)) {
    if (role === roleValue) {
      // Convertir la couleur hex en classes Tailwind
      const color = metadata.color;
      switch (color) {
        case '#FFD700': return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Founder
        case '#2ECC71': return 'bg-green-100 text-green-800 border-green-200';   // Business Angel
        case '#3498DB': return 'bg-blue-100 text-blue-800 border-blue-200';     // VC
        case '#8E44AD': return 'bg-purple-100 text-purple-800 border-purple-200'; // Institutional Investor
        case '#E67E22': return 'bg-orange-100 text-orange-800 border-orange-200'; // Mentor
        case '#F1C40F': return 'bg-yellow-200 text-yellow-900 border-yellow-300'; // Strategic Advisor
        case '#9B59B6': return 'bg-purple-200 text-purple-900 border-purple-300'; // Student Entrepreneur
        case '#1ABC9C': return 'bg-teal-100 text-teal-800 border-teal-200';       // Service Provider
        case '#C0392B': return 'bg-red-100 text-red-800 border-red-200';          // Media
        case '#7F8C8D': return 'bg-gray-100 text-gray-800 border-gray-200';       // Incubator/Accelerator
        case '#34495E': return 'bg-gray-200 text-gray-900 border-gray-300';       // Recruiter HR
        case '#BDC3C7': return 'bg-gray-100 text-gray-700 border-gray-200';       // Other
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    }
  }

  // Fallback
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

// Generate a deterministic gradient with 2 colors based on profile ID
const generateProfileGradient = (profileId: string): { background: string } => {
  if (!profileId) {
    return {
      background: 'linear-gradient(90deg, hsl(248, 84%, 53%), hsl(325, 84%, 60%))'
    };
  }

  // Use profile ID to generate deterministic colors
  const hash = profileId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Generate 2 hues for left and right
  const hueLeft = (hash * 137) % 360;
  const hueRight = (hash * 271) % 360; // Different multiplier for variety

  // Deterministic saturation and lightness
  const saturationLeft = 75 + (hash % 15); // 75-89%
  const saturationRight = 75 + ((hash * 3) % 15); // 75-89%

  const lightnessLeft = 50 + (hash % 15); // 50-64%
  const lightnessRight = 50 + ((hash * 2) % 15); // 50-64%

  return {
    background: `linear-gradient(90deg, hsl(${hueLeft}, ${saturationLeft}%, ${lightnessLeft}%), hsl(${hueRight}, ${saturationRight}%, ${lightnessRight}%))`
  };
};

const extractDomain = (url: string): string => {
  if (!url) return '';
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return '';
  }
};

const getCompanyIconUrl = (domain: string): string => {
  if (!domain) return '';
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
};

const SocialLinkIcon = ({ url }: { url: string }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [url]);

  const domain = extractDomain(url);

  if (error || !domain) {
    return <Globe size={14} />;
  }

  return (
    <Image
      src={getCompanyIconUrl(domain)}
      alt={`${domain} logo`}
      width={14}
      height={14}
      className="rounded-sm"
      onError={() => setError(true)}
    />
  );
};

export const ProfileHeader = ({
  profileData,
  currentUser,
  onEdit,
  profileTags,
  setProfileTags,
  animateNumbers,
  params,
}: {
  profileData: any;
  currentUser: boolean;
  onEdit: () => void;
  profileTags: string[];
  setProfileTags: (tags: string[]) => void;
  animateNumbers: boolean;
  params: { id: string };
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isLinkedInSyncModalOpen, setIsLinkedInSyncModalOpen] = useState(false);
  const [linkedInSyncData, setLinkedInSyncData] = useState<any>(null);

  // Détecter le paramètre URL pour ouvrir automatiquement le modal LinkedIn
  useEffect(() => {
    const linkedinSync = searchParams.get('linkedin_sync');
    if (linkedinSync === 'ready' && currentUser) {
      // Charger les données depuis sessionStorage
      const storedData = sessionStorage.getItem('linkedin_sync_data');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          setLinkedInSyncData(parsed);
          setIsLinkedInSyncModalOpen(true);
        } catch {
          toast.error('Erreur lors du chargement des données LinkedIn');
        }
      } else {
        // Ouvrir le modal quand même (les données seront chargées via API)
        setIsLinkedInSyncModalOpen(true);
      }
      
      // Nettoyer l'URL
      const url = new URL(window.location.href);
      url.searchParams.delete('linkedin_sync');
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, currentUser, router]);

  const handleLinkedInSyncComplete = () => {
    // Invalider les queries pour recharger les données du profil
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    queryClient.invalidateQueries({ queryKey: ['self-profile'] });
    // Reset les données
    setLinkedInSyncData(null);
  };

  const handleLinkedInModalClose = (open: boolean) => {
    setIsLinkedInSyncModalOpen(open);
    if (!open) {
      // Nettoyer les données au fermeture
      setLinkedInSyncData(null);
      localStorage.removeItem('linkedin_sync_data');
    }
  };

  const handleShareProfile = async () => {
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/profile/${profileData.id}`;
    const shareData = {
      title: profileData.name,
      text: profileData.title ? `${profileData.name} - ${profileData.title}` : profileData.name,
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Profil partagé avec succès');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await copyToClipboard(shareUrl);
        }
      }
    } else {
      await copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Lien copié dans le presse-papiers');
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-lg">
        <div
          className="relative h-48 md:h-56 animate-gradient-x"
          style={generateProfileGradient(profileData.id)}
        >
          {profileData.coverImage && (
            <Image src={profileData.coverImage} alt="Cover" fill className="object-cover" />
          )}
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar 
                variant="profile"
                size="md" 
                alt={profileData.name}
                src={profileData.avatar}
                initials={profileData.name ? profileData.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : undefined}
              />
            </div>
            {/* Profile Info & Actions */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 mb-4 sm:mb-0">
                  <h1 className="text-2xl font-bold text-[#101828]">{profileData.name}</h1>
                  <p className="text-md text-[#475467]">{profileData.title}</p>
                  {profileData.ecosystemRoles && profileData.ecosystemRoles.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {profileData.ecosystemRoles.slice(0, 2).map((role: string, index: number) => (
                        <Badge
                          key={index}
                          color="gray"
                          className={`text-xs font-medium ${getRoleBadgeColors(role)}`}
                        >
                          {profileData.genderSalutationPreferenceType 
                            ? getGenderedShortLabel(role as ProfileRole, profileData.genderSalutationPreferenceType as GenderPreference)
                            : getProfileRoleLabel(role)}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {profileData.intentions && profileData.intentions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profileData.intentions.map((intention: string) => (
                        <span
                          key={intention}
                          className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          {INTENTION_LABELS[intention] ?? intention}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!currentUser && (
                    <ProfileActions
                      profileId={params.id}
                      profileName={profileData.name}
                      isCurrentUser={currentUser}
                      currentTags={profileTags}
                      onTagChange={setProfileTags}
                      linkedinUrl={profileData.socials.find((s: any) => s.icon === 'linkedin')?.url}
                      profileData={profileData}
                    />
                  )}
                  {currentUser && (
                    <>
                      <Button color="secondary" iconLeading={<Edit3 />} onClick={onEdit}>
                        Modifier le profil
                      </Button>
                      <Dropdown.Root>
                        <Dropdown.DotsButton />
                        <Dropdown.Popover className="w-64">
                          <Dropdown.Menu>
                            <Dropdown.Section>
                              <Dropdown.Item 
                                icon={({ className }) => <LinkedInSquareIcon size={16} className={className} />}
                                onAction={() => setIsLinkedInSyncModalOpen(true)}
                              >
                                Synchroniser avec LinkedIn
                              </Dropdown.Item>
                              <Dropdown.Item 
                                icon={Share2}
                                onAction={handleShareProfile}
                              >
                                Partager le profil
                              </Dropdown.Item>
                            </Dropdown.Section>
                            <Dropdown.Separator />
                            <Dropdown.Section>
                              <Dropdown.Item 
                                icon={Eye}
                                onAction={() => setIsPreviewModalOpen(true)}
                              >
                                Aperçu public
                              </Dropdown.Item>
                            </Dropdown.Section>
                          </Dropdown.Menu>
                        </Dropdown.Popover>
                      </Dropdown.Root>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-3">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {profileData.location}
                  {profileData.countryCode && (
                    <Flag
                      countryCode={profileData.countryCode}
                      width={16}
                      height={12}
                      className="rounded"
                    />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} /> Rejoint en {profileData.joined}
                </div>
              </div>
            </div>
          </div>
          <BioWithExpand bio={profileData.bio} />

          {/* Stats Section - Style Onefive */}
          <div className="mt-6 flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#101828]">
                <NumberFlow
                  value={animateNumbers ? profileData.stats.posts : 0}
                  format={{ notation: 'standard' }}
                  trend={1}
                  animated
                />
              </span>
              <span className="text-[#475467]">Posts</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#101828]">
                <NumberFlow
                  value={animateNumbers ? profileData.stats.followers : 0}
                  format={{ notation: 'standard' }}
                  trend={1}
                  animated
                />
              </span>
              <span className="text-[#475467]">Followers</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#101828]">
                <NumberFlow
                  value={animateNumbers ? profileData.stats.following : 0}
                  format={{ notation: 'standard' }}
                  trend={1}
                  animated
                />
              </span>
              <span className="text-[#475467]">Following</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#101828]">
                <NumberFlow
                  value={animateNumbers ? profileData.stats.connections : 0}
                  format={{ notation: 'standard' }}
                  trend={1}
                  animated
                />
              </span>
              <span className="text-[#475467]">Connections</span>
            </div>
          </div>

          {/* Footer de la card - Streak, badges, logos et liens */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            {/* Première ligne : Streak et badges */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge
                  color="success"
                  className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors flex items-center gap-1"
                >
                  <span>🔥</span>
                  <NumberFlow value={animateNumbers ? profileData.stats.streak.current : 0} animated trend={1} />
                  <span>jours</span>
                </Badge>

              </div>

              {/* Logos des dernières expériences et formations */}
              <div className="flex gap-3">
                {profileData.experience.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-[#475467]">
                    <CompanyIcon
                      domain={profileData.experience[0].domain}
                      companyName={profileData.experience[0].company}
                      logoUrl={profileData.experience[0].logoUrl}
                      size={24}
                    />
                    <span>{profileData.experience[0].company}</span>
                  </div>
                )}
                {profileData.education.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-[#475467]">
                    <CompanyIcon
                      domain={profileData.education[0].domain}
                      companyName={profileData.education[0].school}
                      logoUrl={profileData.education[0].logoUrl}
                      size={24}
                    />
                    <span>{profileData.education[0].school}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Deuxième ligne : Liens sociaux */}
            {profileData.socials && profileData.socials.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[#101828] mb-3">Liens</h4>
                <div className="flex flex-wrap gap-3">
                  {profileData.socials.slice(0, 5).map((social: any) => (
                    <Link
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <SocialLinkIcon url={social.url} />
                      <span className="font-medium">{social.title}</span>
                      <ExternalLink size={12} className="opacity-50" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
      <ProfilePreviewModal open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen} profileData={profileData} />
      <LinkedInComparisonModal
        open={isLinkedInSyncModalOpen}
        onOpenChange={handleLinkedInModalClose}
        onSyncComplete={handleLinkedInSyncComplete}
        profileId={profileData.id}
        initialData={linkedInSyncData}
      />
    </>
  );
};
