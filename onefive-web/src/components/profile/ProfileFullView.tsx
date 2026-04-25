'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar';
import { getCountryName } from '@/lib/country';

import EditProfileHeaderModal from '@/components/profile/modals/EditProfileHeaderModal';
import EditAboutModal from '@/components/profile/modals/EditAboutModal';
import EditSkillsInterestsModal from '@/components/profile/modals/EditSkillsInterestsModal';
import EditAchievementsModal from '@/components/profile/modals/EditAchievementsModal';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import ProfileAnalyticsCard from '@/components/profile/ProfileAnalyticsCard';
import { AboutCard } from '@/components/profile/AboutCard';
import { SkillsInterestsCard } from '@/components/profile/SkillsInterestsCard';
import { AchievementsCard } from '@/components/profile/AchievementsCard';
import { RewardBadgesCard } from '@/components/profile/RewardBadgesCard';
import { ConnectionsCard } from '@/components/profile/ConnectionsCard';
import { ProfileStartupsCard } from '@/components/profile/ProfileStartupsCard';
import { AllBadgesModal } from '@/components/profile/modals/AllBadgesModal';
import { ProfilePosts } from '@/components/profile/ProfilePosts';
import { ProfileDiscussions } from '@/components/profile/ProfileDiscussions';
import { useMeProfile, useProfile, MeProfile, useBatchUpdateExperiences, useBatchUpdateEducations, useUpdateSkillsInterests, useBatchUpdateAchievements } from '@/queries/profile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/base/tabs/tabs';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5  } }
};

const DEFAULT_COVER_IMAGE = null; // Use CSS gradient instead of default image

const mapProfileToHeaderData = (profile: MeProfile) => {
  // Pour le ProfileHeader, on affiche la plus récente/pertinente
  // Priorité : 1) En cours (endDate = null), 2) Plus récente terminée (par endDate)
  
  // Trier les expériences : en cours d'abord, puis par date de fin décroissante
  const sortedExperiences = [...(profile.experiences || [])].sort((a, b) => {
    // Les expériences en cours (endDate = null) passent en premier
    if (!a.endDate && b.endDate) return -1;
    if (a.endDate && !b.endDate) return 1;
    
    // Si les deux sont en cours, trier par date de début décroissante
    if (!a.endDate && !b.endDate) {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
    
    // Si les deux sont terminées, trier par date de fin décroissante (la plus récemment terminée en premier)
    return new Date(b.endDate!).getTime() - new Date(a.endDate!).getTime();
  });

  const mostRecentExperience = sortedExperiences[0]
    ? [{
        id: sortedExperiences[0].id,
        title: sortedExperiences[0].title,
        company: sortedExperiences[0].company,
        domain: sortedExperiences[0].domain ?? sortedExperiences[0].company,
        logoUrl: sortedExperiences[0].logoUrl,
        startDate: sortedExperiences[0].startDate,
        endDate: sortedExperiences[0].endDate ?? 'Present'
      }]
    : [];

  // Même logique pour les éducations
  const sortedEducations = [...(profile.educations || [])].sort((a, b) => {
    // Les éducations en cours (endDate = null) passent en premier
    if (!a.endDate && b.endDate) return -1;
    if (a.endDate && !b.endDate) return 1;
    
    // Si les deux sont en cours, trier par date de début décroissante
    if (!a.endDate && !b.endDate) {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
    
    // Si les deux sont terminées, trier par date de fin décroissante (la plus récemment terminée en premier)
    return new Date(b.endDate!).getTime() - new Date(a.endDate!).getTime();
  });

  const mostRecentEducation = sortedEducations[0]
    ? [{
        id: sortedEducations[0].id,
        degree: sortedEducations[0].degree,
        school: sortedEducations[0].school,
        domain: sortedEducations[0].domain ?? sortedEducations[0].school,
        logoUrl: sortedEducations[0].logoUrl,
        startDate: sortedEducations[0].startDate,
        endDate: sortedEducations[0].endDate ?? 'Present'
      }]
    : [];
  
  // Pour AboutCard, on garde toutes les expériences/éducations mais triées
  // Même logique de tri : en cours d'abord, puis par date de fin décroissante
  const experienceList = sortedExperiences.map(exp => ({
    id: exp.id,
    title: exp.title,
    company: exp.company,
    domain: exp.domain ?? exp.company,
    logoUrl: exp.logoUrl,
    startDate: exp.startDate,
    endDate: exp.endDate ?? 'Present'
  }));

  const educationList = sortedEducations.map(edu => ({
    id: edu.id,
    degree: edu.degree,
    school: edu.school,
    domain: edu.domain ?? edu.school,
    logoUrl: edu.logoUrl,
    startDate: edu.startDate,
    endDate: edu.endDate ?? 'Present'
  }));

  const normalizedCountryCode = profile.countryCode ? profile.countryCode.toUpperCase() : '';
  const countryName = normalizedCountryCode ? getCountryName(normalizedCountryCode) : '';

  return {
    id: profile.id,
    name: `${profile.firstName} ${profile.lastName}`.trim(),
    title: profile.highlight ?? '',
    avatar: profile.avatar ?? '',
    coverImage: profile.coverImage ?? DEFAULT_COVER_IMAGE,
    location: `${profile.city}${profile.city && countryName ? ', ' : ''}${countryName}`.trim(),
    countryCode: normalizedCountryCode,
    city: profile.city ?? '',
    joined: new Date(profile.createdAt).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long'
    }),
    ecosystemRoles: profile.ecosystemRoles,
    badges: [],
    bio: profile.bio ?? '',
  stats: {
      posts: profile.stats?.posts ?? 0,
      followers: profile.stats?.followers ?? 0,
      following: profile.stats?.following ?? 0,
      connections: profile.stats?.connections ?? 0,
    streak: {
        current: profile.stats?.streak ?? 0,
        longest: profile.stats?.streak ?? 0,
        lastLogin: '',
        recentActivity: []
      }
    },
    // ProfileHeader affiche seulement la plus récente
    experience: mostRecentExperience,
    education: mostRecentEducation,
    // AboutCard affiche toutes les expériences/éducations
    allExperiences: experienceList,
    allEducations: educationList,
    skills: profile.skills ?? [],
    interests: profile.interests ?? [],
    achievements: profile.achievements ?? [],
    rewardBadges: [],
    socials: profile.socials ?? [],
    profileAnalytics: {
      viewsOverTime: [],
      recentVisitors: [],
      totalViews: 0
    },
    connectionsData: [],
    posts: [],
    // Champ important pour le bouton Follow
    isFollowing: profile.isFollowing ?? false,
  };
};

export function ProfileFullView({ profileId }: { profileId: string }) {

  const currentUser = profileId === 'current_user';

  // Use different hooks based on whether we're viewing current user or another user
  const { data: meProfile, isLoading: isMeProfileLoading, error: meProfileError } = useMeProfile({
    enabled: currentUser, // Only fetch when viewing current user profile
  });

  const { data: otherProfile, isLoading: isOtherProfileLoading, error: otherProfileError } = useProfile(
    currentUser ? undefined : profileId // Only fetch when viewing another user's profile
  );

  // Use the appropriate data and loading states
  const rawProfileData = currentUser ? meProfile : otherProfile;
  const isLoading = currentUser ? isMeProfileLoading : isOtherProfileLoading;
  const error = currentUser ? meProfileError : otherProfileError;

  // Hooks pour le batch update des expériences et des éducations
  const batchUpdateExperiencesMutation = useBatchUpdateExperiences();
  const batchUpdateEducationsMutation = useBatchUpdateEducations();
  const updateSkillsInterestsMutation = useUpdateSkillsInterests();
  const batchUpdateAchievementsMutation = useBatchUpdateAchievements();

  // Fonction pour gérer la sauvegarde des expériences et formations
  const handleSaveExperiencesAndEducation = async (data: { experience: any[], education: any[] }) => {
    try {
      const currentExperiences = meProfile?.experiences || [];
      const currentEducations = meProfile?.educations || [];

      // Préparer les données pour le batch update des expériences
      const currentExperienceIds = currentExperiences.map(exp => exp.id);
      const newExperienceIds = data.experience.filter(exp => exp.id && !exp.id.startsWith('new_')).map(exp => exp.id);

      // Déterminer les expériences à supprimer (celles qui existaient mais ne sont plus dans la liste)
      const experiencesToDelete = currentExperienceIds.filter(id => !newExperienceIds.includes(id));

      // Préparer les expériences à créer ou mettre à jour
      const experiencesToUpsert = data.experience.map(exp => ({
        id: exp.id && !exp.id.startsWith('new_') ? exp.id : undefined, // undefined pour les nouvelles
        data: {
          title: exp.title,
          company: exp.company,
          domain: exp.domain || exp.company,
          countryCode: exp.countryCode || 'FR', // Valeur par défaut
          city: exp.city || 'Paris', // Valeur par défaut
          from: exp.startDate,
          to: exp.endDate === 'Present' ? undefined : exp.endDate,
          description: exp.description,
          tags: exp.tags || []
        }
      }));

      // Préparer les données pour le batch update des éducations
      const currentEducationIds = currentEducations.map(edu => edu.id);
      const newEducationIds = data.education.filter(edu => edu.id && !edu.id.startsWith('new_')).map(edu => edu.id);

      // Déterminer les éducations à supprimer (celles qui existaient mais ne sont plus dans la liste)
      const educationsToDelete = currentEducationIds.filter(id => !newEducationIds.includes(id));

      // Préparer les éducations à créer ou mettre à jour
      const educationsToUpsert = data.education.map(edu => ({
        id: edu.id && !edu.id.startsWith('new_') ? edu.id : undefined, // undefined pour les nouvelles
        data: {
          degree: edu.degree,
          school: edu.school,
          domain: edu.domain || edu.school,
          countryCode: edu.countryCode || 'FR', // Valeur par défaut
          city: edu.city || 'Paris', // Valeur par défaut
          from: edu.startDate,
          to: edu.endDate === 'Present' ? undefined : edu.endDate,
          description: edu.description,
          tags: edu.tags || []
        }
      }));

      // Faire les deux requêtes batch en parallèle
      await Promise.all([
        batchUpdateExperiencesMutation.mutateAsync({
          apiData: {
            experiences: experiencesToUpsert,
            deleteIds: experiencesToDelete
          },
          cacheUpdateData: {
            currentExperiences,
            newExperiences: data.experience,
            experiencesToDelete
          }
        }),
        batchUpdateEducationsMutation.mutateAsync({
          apiData: {
            educations: educationsToUpsert,
            deleteIds: educationsToDelete
          },
          cacheUpdateData: {
            currentEducations,
            newEducations: data.education,
            educationsToDelete
          }
        })
      ]);

      setIsEditAboutModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des expériences et formations');
    }
  };

  const [profileTags, setProfileTags] = useState<string[]>([]);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [isEditHeaderModalOpen, setIsEditHeaderModalOpen] = useState(false);
  const [isEditAboutModalOpen, setIsEditAboutModalOpen] = useState(false);
  const [isEditSkillsModalOpen, setIsEditSkillsModalOpen] = useState(false);
  const [isEditAchievementsModalOpen, setIsEditAchievementsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'discussions'>('posts');

  const [animateNumbers, setAnimateNumbers] = useState(false);

  const profileData = rawProfileData ? mapProfileToHeaderData(rawProfileData) : mapProfileToHeaderData({
    id: '',
    firstName: '',
    lastName: '',
    highlight: undefined,
    bio: undefined,
    avatar: undefined,
    coverImage: undefined,
    city: '',
    countryCode: '',
    createdAt: new Date().toISOString(),
    isFollowing: false,
    ecosystemRoles: [],
    skills: [],
    interests: [],
    achievements: [],
    stats: {
      posts: 0,
      followers: 0,
      following: 0,
      connections: 0,
      streak: 0
    },
    experiences: [],
    educations: [],
    socials: []
  } as unknown as MeProfile);

  useEffect(() => {
    if (error) {
      toast.error('Impossible de récupérer le profil');
    }
  }, [error]);

  useEffect(() => {
    if (!isLoading && meProfile) {
      setTimeout(() => setAnimateNumbers(true), 300);
    }
  }, [isLoading, meProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-screen-xl mx-auto">
          <Navbar />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="flex gap-8 items-end -mt-12 ml-8">
            <div className="h-32 w-32 bg-gray-300 rounded-full border-4 border-white"></div>
            <div className="flex-1 space-y-4 py-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFD]">
      <div className="w-full max-w-screen-xl mx-auto">
        <Navbar />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          <motion.div variants={cardVariants}>
            <ProfileHeader
              profileData={profileData}
              currentUser={currentUser}
              onEdit={() => setIsEditHeaderModalOpen(true)}
              profileTags={profileTags}
              setProfileTags={setProfileTags}
              animateNumbers={animateNumbers}
              params={{ id: profileId }}
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {(currentUser ? meProfile?.id : otherProfile?.id) && (
                <motion.div variants={cardVariants}>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'posts' | 'discussions')}>
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="posts">Posts</TabsTrigger>
                        <TabsTrigger value="discussions">Discussions</TabsTrigger>
                      </TabsList>
                      <TabsContent value="posts" className="mt-0">
                        <ProfilePosts profileId={currentUser ? meProfile!.id : otherProfile!.id} />
                      </TabsContent>
                      <TabsContent value="discussions" className="mt-0">
                        <ProfileDiscussions 
                          profileId={currentUser ? meProfile!.id : otherProfile!.id} 
                          isCurrentUser={currentUser}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-8">
              {currentUser && (
                <motion.div variants={cardVariants}>
                  <ProfileAnalyticsCard analytics={profileData.profileAnalytics} profileName={profileData.name} />
                </motion.div>
              )}

              <motion.div variants={cardVariants}>
                <AboutCard
                  profileData={profileData}
                  currentUser={currentUser}
                  onEdit={() => setIsEditAboutModalOpen(true)}
                />
              </motion.div>

              <motion.div variants={cardVariants}>
                <ProfileStartupsCard
                  profileId={currentUser ? meProfile!.id : otherProfile!.id}
                  currentUser={currentUser}
                />
              </motion.div>

              <motion.div variants={cardVariants}>
                <SkillsInterestsCard
                  profileData={profileData}
                  currentUser={currentUser}
                  onEdit={() => setIsEditSkillsModalOpen(true)}
                />
              </motion.div>

              <motion.div variants={cardVariants}>
                <AchievementsCard
                  profileData={profileData}
                  currentUser={currentUser}
                  onEdit={() => setIsEditAchievementsModalOpen(true)}
                />
              </motion.div>

              <motion.div variants={cardVariants}>
                <RewardBadgesCard
                  profileData={profileData}
                  currentUser={currentUser}
                  onShowAll={() => setShowAllBadges(true)}
                />
              </motion.div>

              <motion.div variants={cardVariants}>
                <ConnectionsCard profileData={profileData} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals for editing */}
      {currentUser && (
        <>
          <EditProfileHeaderModal
            open={isEditHeaderModalOpen}
            onOpenChange={setIsEditHeaderModalOpen}
            profileData={profileData}
            onSave={() => {}} // Callback vide car la mutation gère tout
          />
          <EditAboutModal
            open={isEditAboutModalOpen}
            onOpenChange={setIsEditAboutModalOpen}
            experience={profileData.allExperiences || profileData.experience}
            education={profileData.allEducations || profileData.education}
            onSave={handleSaveExperiencesAndEducation}
          />
          <EditSkillsInterestsModal
            open={isEditSkillsModalOpen}
            onOpenChange={setIsEditSkillsModalOpen}
            skills={profileData.skills}
            interests={profileData.interests}
            onSave={async (data) => {
              try {
                await updateSkillsInterestsMutation.mutateAsync({
                  skills: data.skills,
                  interests: data.interests
                });
                setIsEditSkillsModalOpen(false);
              } catch (error) {
                console.error('Erreur lors de la mise à jour des compétences et intérêts:', error);
              }
            }}
          />
          <EditAchievementsModal
            open={isEditAchievementsModalOpen}
            onOpenChange={setIsEditAchievementsModalOpen}
            achievements={profileData.achievements}
            onSave={async (data) => {
              try {
                // Calculer les IDs des réalisations supprimées
                const currentAchievementIds = profileData.achievements.map((ach: any) => ach.id);
                const newAchievementIds = data.filter((ach: any) => ach.id && !ach.id.startsWith('new_')).map((ach: any) => ach.id);
                const deleteIds = currentAchievementIds.filter(id => !newAchievementIds.includes(id));

                // Nettoyer les données : supprimer les IDs temporaires pour les nouvelles réalisations
                const cleanedAchievements = data.map((ach: any) => {
                  const { id, ...rest } = ach;
                  // Si l'ID commence par 'new_', on ne l'inclut pas (création)
                  // Sinon, on l'inclut (mise à jour)
                  return id && !id.startsWith('new_') ? { id, ...rest } : rest;
                });

                await batchUpdateAchievementsMutation.mutateAsync({
                  achievements: cleanedAchievements,
                  deleteIds: deleteIds
                });
                setIsEditAchievementsModalOpen(false);
              } catch (error) {
                console.error('Erreur lors de la mise à jour des réalisations:', error);
              }
            }}
          />
        </>
      )}

      <AllBadgesModal open={showAllBadges} onOpenChange={setShowAllBadges} profileData={profileData} />
    </div>
  );
}
