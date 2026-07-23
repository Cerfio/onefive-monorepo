'use client';

import { useState } from 'react';
import { Button } from '../../base/buttons/button';
import { CloseButton } from '../../base/buttons/close-button';
import { Modal, ModalOverlay, Dialog } from '../../application/modals/modal';
import { Badge } from '../../base/badges/badges';
import { Avatar } from '../../base/avatar/avatar';
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components";
import { Trophy, MapPin, Calendar, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { CompanyIcon } from '../CompanyIcon';
import Link from 'next/link';
import { Flag } from '@/components/ui/flag';
import { getProfileRoleLabel, getGenderedShortLabel, type GenderPreference, ProfileRole } from '@/sharing-enum/profile';
import { BioWithExpand } from '../BioWithExpand';
import { getInterestDisplayLabel } from '@/shared/constants/tags';

// Composant simple pour les icônes des liens sociaux
const _SocialLinkIcon = ({ url }: { url: string }) => {
  if (url.includes('linkedin.com')) return <span className="text-blue-600">💼</span>;
  if (url.includes('twitter.com') || url.includes('x.com')) return <span className="text-blue-400">🐦</span>;
  if (url.includes('github.com')) return <span className="text-gray-800">⚡</span>;
  if (url.includes('instagram.com')) return <span className="text-pink-500">📷</span>;
  return <span className="text-gray-500">🔗</span>;
};

// Composant pour l'aperçu du profil
const ProfilePreviewModal = ({ 
  open, 
  onOpenChange, 
  profileData 
}: { 
  open: boolean; 
  onOpenChange: (isOpen: boolean) => void; 
  profileData: any; 
}) => {
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);

  // Fonction pour extraire le domaine d'une URL
  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return '';
    }
  };

  // Fonction pour obtenir l'icône basée sur l'URL
  const getAutoIcon = (url: string): string => {
    const domain = extractDomain(url);
    if (!domain) return 'external';
    
    if (domain.includes('linkedin.com')) return 'linkedin';
    if (domain.includes('twitter.com') || domain.includes('x.com')) return 'twitter';
    if (domain.includes('github.com')) return 'github';
    if (domain.includes('medium.com')) return 'external';
    if (domain.includes('youtube.com')) return 'external';
    if (domain.includes('instagram.com')) return 'external';
    
    return 'globe';
  };

  // Composant pour l'icône des liens sociaux
  const SocialLinkIcon = ({ url }: { url: string }) => {
    const icon = getAutoIcon(url);
    
    if (icon === 'linkedin') {
      return (
        <div className="w-4 h-4 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.2283 0H1.77167C1.30179 0 0.851161 0.186657 0.518909 0.518909C0.186657 0.851161 0 1.30179 0 1.77167V22.2283C0 22.6982 0.186657 23.1488 0.518909 23.4811C0.851161 23.8133 1.30179 24 1.77167 24H22.2283C22.6982 24 23.1488 23.8133 23.4811 23.4811C23.8133 23.1488 24 22.6982 24 22.2283V1.77167C24 1.30179 23.8133 0.851161 23.4811 0.518909C23.1488 0.186657 22.6982 0 22.2283 0ZM7.15333 20.445H3.545V8.98333H7.15333V20.445ZM5.34667 7.395C4.93736 7.3927 4.53792 7.2692 4.19873 7.04009C3.85955 6.81098 3.59584 6.48653 3.44088 6.10769C3.28591 5.72885 3.24665 5.31259 3.32803 4.91145C3.40941 4.51032 3.6078 4.14228 3.89816 3.85378C4.18851 3.56529 4.55782 3.36927 4.95947 3.29046C5.36112 3.21165 5.77711 3.25359 6.15495 3.41099C6.53279 3.56838 6.85554 3.83417 7.08247 4.17481C7.30939 4.51546 7.43032 4.91569 7.43 5.325C7.43386 5.59903 7.38251 5.87104 7.27901 6.1248C7.17551 6.37857 7.02198 6.6089 6.82757 6.80207C6.63316 6.99523 6.40185 7.14728 6.14742 7.24915C5.893 7.35102 5.62067 7.40062 5.34667 7.395ZM20.4533 20.455H16.8467V14.1933C16.8467 12.3467 16.0617 11.7767 15.0483 11.7767C13.9783 11.7767 12.9283 12.5833 12.9283 14.24V20.455H9.32V8.99167H12.79V10.58H12.8367C13.185 9.875 14.405 8.67 16.2667 8.67C18.28 8.67 20.455 9.865 20.455 13.365L20.4533 20.455Z" fill="#0A66C2"/>
          </svg>
        </div>
      );
    }
    
    if (icon === 'twitter') {
      return (
        <div className="w-4 h-4 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" fill="#1DA1F2"/>
          </svg>
        </div>
      );
    }
    
    if (icon === 'github') {
      return (
        <div className="w-4 h-4 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="#333"/>
          </svg>
        </div>
      );
    }
    
    return <ExternalLink className="h-4 w-4" />;
  };

  return (
    <AriaDialogTrigger isOpen={open} onOpenChange={onOpenChange}>
      <Button style={{ display: 'none' }}>Trigger</Button>
      <ModalOverlay isDismissable>
        <Modal>
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl transition-all sm:max-w-6xl">
              <CloseButton onClick={() => onOpenChange(false)} theme="light" size="lg" className="absolute top-3 right-3" />
              
              <div className="flex flex-col gap-0.5 px-4 pt-5 sm:px-6 sm:pt-6">
                <AriaHeading slot="title" className="text-md font-semibold text-primary">
                  Aperçu du profil public
                </AriaHeading>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-tertiary">Voici comment votre profil apparaît aux autres utilisateurs.</p>
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                    iconLeading={showPrivateInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  >
                    {showPrivateInfo ? 'Masquer les infos privées' : 'Afficher les infos privées'}
                  </Button>
                </div>
              </div>

              <div className="h-5 w-full" />
              
              <div className="flex flex-col gap-6 px-4 sm:px-6 max-h-[70vh] overflow-y-auto">
                {/* Header du profil */}
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <Avatar
                        variant="profile"
                        size="lg"
                        src={profileData.avatar}
                        alt={profileData.name}
                        verified={profileData.badges && profileData.badges.includes('Verified')}
                        initials={profileData.name ? profileData.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : undefined}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-[#101828]">{profileData.name}</h2>
                          <p className="text-lg text-[#475467] mt-1">{profileData.title}</p>
                          
                          {/* Badges de statut */}
                          <div className="flex gap-2 mt-3">
                            {profileData.ecosystemRoles?.map((role: string, index: number) => (
                              <Badge key={`role-${role}-${index}`} color="blue" className="bg-blue-100 text-blue-800">
                                {profileData.genderSalutationPreferenceType 
                                  ? getGenderedShortLabel(role as ProfileRole, profileData.genderSalutationPreferenceType as GenderPreference)
                                  : getProfileRoleLabel(role)}
                              </Badge>
                            ))}
                            {profileData.badges?.map((badge: string, index: number) => (
                              <Badge key={`badge-${badge}-${index}`} color="gray" className="bg-gray-100 text-gray-700">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Informations de localisation et date */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-3">
                        <div className="flex items-center gap-1.5">
                          {profileData.countryCode && (
                            <Flag countryCode={profileData.countryCode} width={20} height={20} />
                          )}
                          <MapPin size={14}/>
                          {profileData.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14}/> 
                          Rejoint en {profileData.joined}
                        </div>
                      </div>
                      
                      {/* Bio */}
                      <BioWithExpand bio={profileData.bio} />
                      
                      {/* Statistiques publiques */}
                      <div className="mt-6 flex items-center gap-8 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#101828]">{profileData.stats.posts}</span>
                          <span className="text-[#475467]">Posts</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#101828]">{profileData.stats.followers}</span>
                          <span className="text-[#475467]">Followers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#101828]">{profileData.stats.following}</span>
                          <span className="text-[#475467]">Following</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#101828]">{profileData.stats.connections}</span>
                          <span className="text-[#475467]">Connections</span>
                        </div>
                      </div>
                      
                      {/* Liens sociaux */}
                      {profileData.socials && profileData.socials.length > 0 && (
                        <div className="mt-6">
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
                </div>

                {/* Informations privées (si activées) */}
                {showPrivateInfo && (
                  <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="text-orange-800 flex items-center gap-2 text-sm font-semibold mb-4">
                      <EyeOff className="h-4 w-4" />
                      Informations privées (visibles uniquement par vous)
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Badge color="success" className="bg-green-100 text-green-800">
                          🔥 {profileData.stats.streak?.current || 0} jours
                        </Badge>
                        {profileData.rewardBadges?.slice(0, 3).map((badge: any) => (
                          <Badge key={badge.id} color="gray" className="bg-gray-100 text-gray-700">
                            {badge.icon} {badge.title}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-3">
                        {profileData.experience && profileData.experience.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-[#475467]">
                            <CompanyIcon domain={profileData.experience[0].domain} companyName={profileData.experience[0].company} logoUrl={profileData.experience[0].logoUrl} size={12} />
                            <span>{profileData.experience[0].company}</span>
                          </div>
                        )}
                        {profileData.education && profileData.education.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-[#475467]">
                            <CompanyIcon domain={profileData.education[0].domain} companyName={profileData.education[0].school} logoUrl={profileData.education[0].logoUrl} size={12} />
                            <span>{profileData.education[0].school}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contenu principal */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* À Propos */}
                    <div className="p-6 bg-white rounded-lg border">
                      <h4 className="text-sm font-semibold text-[#101828] mb-4">À Propos</h4>
                      <div className="space-y-6">
                        <div>
                          <h5 className="font-semibold text-sm mb-3">Expérience</h5>
                          {profileData.experience?.map((exp: any) => (
                            <div key={exp.id} className="flex gap-3 items-center mb-3">
                              <CompanyIcon domain={exp.domain} companyName={exp.company} />
                              <div>
                                <p className="font-semibold text-sm text-[#101828]">{exp.title}</p>
                                <p className="text-xs text-gray-500">{exp.company} • {exp.startDate} - {exp.endDate || 'Présent'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-200 pt-6">
                          <h5 className="font-semibold text-sm mb-3">Formation</h5>
                          {profileData.education?.map((edu: any) => (
                            <div key={edu.id} className="flex gap-3 items-center mb-3">
                              <CompanyIcon domain={edu.domain} companyName={edu.school} />
                              <div>
                                <p className="font-semibold text-sm text-[#101828]">{edu.degree}</p>
                                <p className="text-xs text-gray-500">{edu.school} • {edu.startDate} - {edu.endDate || 'Présent'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Compétences & Intérêts */}
                    <div className="p-6 bg-white rounded-lg border">
                      <h4 className="text-sm font-semibold text-[#101828] mb-4">Compétences & Intérêts</h4>
                      <div>
                        <h5 className="font-semibold text-sm mb-2">Compétences</h5>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {profileData.skills?.map((skill: string, index: number) => (
                            <Badge key={`skill-${skill}-${index}`} color="gray" className="bg-gray-100 text-gray-700">{skill}</Badge>
                          ))}
                        </div>
                        <h5 className="font-semibold text-sm mb-2">Intérêts</h5>
                        <div className="flex flex-wrap gap-2">
                          {profileData.interests?.map((interest: string, index: number) => (
                            <Badge key={`interest-${interest}-${index}`} color="blue" className="bg-blue-50 text-blue-800 border border-blue-200">{getInterestDisplayLabel(interest)}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Réalisations */}
                    <div className="p-6 bg-white rounded-lg border">
                      <h4 className="text-sm font-semibold text-[#101828] mb-4">Réalisations</h4>
                      {profileData.achievements?.map((ach: any) => (
                        <div key={ach.id} className="flex gap-3 items-center mb-3">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="font-semibold text-sm text-[#101828]">{ach.title}</p>
                            <p className="text-xs text-gray-500">{ach.description} • {ach.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Connexions */}
                    <div className="p-6 bg-white rounded-lg border">
                      <h4 className="text-sm font-semibold text-[#101828] mb-4">Connexions</h4>
                      {profileData.connectionsData?.slice(0, 3).map((conn: any) => (
                        <div key={conn.id} className="flex gap-3 items-center mb-4">
                          <Avatar
                            variant="profile"
                            size="sm"
                            src={conn.avatar}
                            alt={conn.name}
                            initials={conn.name ? conn.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : undefined}
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-[#101828]">{conn.name}</p>
                            <p className="text-xs text-gray-500">{conn.mutual} connexions en commun</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="h-6 w-full" />
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </AriaDialogTrigger>
  );
};

export default ProfilePreviewModal; 