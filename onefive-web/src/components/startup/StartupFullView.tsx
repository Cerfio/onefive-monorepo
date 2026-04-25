'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar';
import { useStartup, useUpdateStartup, useFunding, useFundingHistory, useCreateFundingHistory, useUpdateFundingHistory, useDeleteFundingHistory } from '@/queries/startup';
import { resolveAvatarUrl } from '@/utils/avatar';
import { getCountryName } from '@/lib/country';

import { StartupHeader } from '@/components/startup/StartupHeader';
import { TeamSection } from '@/components/startup/TeamSection';
import { FundingCard } from '@/components/startup/FundingCard';
import { AchievementsCard } from '@/components/startup/AchievementsCard';
import { EditStartupHeaderModal } from '@/components/startup/modals/EditStartupHeaderModal';
import { EditAchievementsModal } from '@/components/startup/modals/EditAchievementsModal';
import { EditFundingHistoryModal } from '@/components/startup/modals/EditFundingHistoryModal';
import { LinkedInCompanySyncModal } from '@/components/startup/modals/LinkedInCompanySyncModal';

// Animation variants
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

export function StartupFullView({ startupId }: { startupId: string }) {
  
  const { data: startup, isLoading, isError, error, refetch: refetchStartup } = useStartup(startupId);
  const { data: funding, isLoading: isLoadingFunding } = useFunding(startupId);
  const { data: fundingHistory = [], isLoading: isLoadingHistory } = useFundingHistory(startupId);
  const updateStartupMutation = useUpdateStartup();
  const createFundingHistoryMutation = useCreateFundingHistory();
  const updateFundingHistoryMutation = useUpdateFundingHistory();
  const deleteFundingHistoryMutation = useDeleteFundingHistory();
  const [isEditHeaderModalOpen, setIsEditHeaderModalOpen] = useState(false);
  const [isEditAchievementsModalOpen, setIsEditAchievementsModalOpen] = useState(false);
  const [isEditFundingHistoryModalOpen, setIsEditFundingHistoryModalOpen] = useState(false);
  const [isLinkedInSyncModalOpen, setIsLinkedInSyncModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [animateNumbers, setAnimateNumbers] = useState(false);

  useEffect(() => {
    if (startup) {
      setTimeout(() => setAnimateNumbers(true), 300);
    }
  }, [startup]);

  // Mapper les données backend vers le format attendu par les composants
  const startupData = startup ? {
    id: startup.id,
    name: startup.name,
    tagline: startup.tagline || '',
    description: startup.description || '',
    logo: startup.logo || undefined,
    coverImage: startup.coverImage || undefined,
    location: startup.city && startup.countryCode
      ? `${startup.city}, ${getCountryName(startup.countryCode)}`
      : startup.location,
    countryCode: startup.countryCode,
    city: startup.city,
    founded: startup.foundedDate ? new Date(startup.foundedDate).getFullYear().toString() : '',
    sectors: startup.categories || [],
    website: startup.website || undefined,
    employees: `${startup.stats.members}-${startup.stats.members + 5}`, // Estimation basée sur les membres
    funding: funding ? {
      totalRaised: funding.totalRaised,
      lastRound: funding.lastRound || undefined,
      investors: funding.investors || [],
      fundraisingType: funding.fundraisingType,
      structuredRound: funding.structuredRound,
      rollingInvestment: funding.rollingInvestment,
    } : {
      totalRaised: '0',
      lastRound: undefined,
      investors: [],
      fundraisingType: 'none' as const,
    },
    stats: {
      followers: startup.stats.followers,
      views: startup.stats.views || 0,
      posts: 0, // TODO: Ajouter ce champ dans le backend
      mentions: 0 // TODO: Ajouter ce champ dans le backend
    },
    founders: startup.founders.map((founder: any) => ({
      id: founder.id,
      memberId: founder.memberId,
      name: founder.name,
      avatar: resolveAvatarUrl(founder.avatar),
      position: founder.position,
      capitalStock: founder.capitalStock != null ? founder.capitalStock : null,
      role: founder.role,
    })),
    teamMembers: (startup.teamMembers || []).map((member: any) => ({
      id: member.id,
      profileId: member.id,
      memberId: member.memberId,
      name: member.name,
      avatar: resolveAvatarUrl(member.avatar),
      position: member.position,
      role: member.role,
    })),
    technologies: [], // TODO: Ajouter ce champ dans le backend
    achievements: [], // TODO: Ajouter ce champ dans le backend
    socialLinks: [
      ...(startup.website ? [{ id: '1', platform: 'Website', url: startup.website, icon: 'globe' }] : []),
      ...(startup.linkedin ? [{ id: '2', platform: 'LinkedIn', url: startup.linkedin, icon: 'linkedin' }] : [])
    ],
    posts: [], // TODO: Ajouter ce champ dans le backend
    analytics: {
      viewsOverTime: [],
      totalViews: startup.stats.views || 0,
      engagement: 0
    }
  } : null;

  const currentUser = startup?.canEdit || false;

  const handleUpdateHeader = async (data: {
    name: string;
    tagline: string;
    description: string;
    logo: string;
    coverImage: string;
    website: string;
    countryCode: string;
    city: string;
    sectors: string[];
  }) => {
    await updateStartupMutation.mutateAsync({
      startupId,
      data: {
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        logo: data.logo || undefined,
        coverImage: data.coverImage || undefined,
        website: data.website || undefined,
        city: data.city,
        countryCode: data.countryCode,
        categories: data.sectors,
      },
    });
  };


  if (isLoading || !startupData || isLoadingFunding || isLoadingHistory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-screen-xl mx-auto"><Navbar /></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="flex gap-8 items-end -mt-12 ml-8">
            <div className="h-24 w-24 bg-gray-300 rounded-xl border-4 border-white"></div>
            <div className="flex-1 space-y-4 py-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-screen-xl mx-auto"><Navbar /></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
            <p className="text-gray-600">
              {error instanceof Error ? error.message : 'Impossible de charger la startup'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFD]">
        <div className="w-full max-w-screen-xl mx-auto"><Navbar /></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* HEADER STARTUP */}
            <motion.div variants={cardVariants}>
              <StartupHeader
                startupData={startupData}
                currentUser={currentUser}
                onEdit={() => setIsEditHeaderModalOpen(true)}
                onLinkedInSync={() => setIsLinkedInSyncModalOpen(true)}
                animateNumbers={animateNumbers}
                params={{ id: startupId }}
                isCreator={startup?.role === 'SUPER_ADMIN'}
                isMember={startup?.isMember}
                onTransferOwnership={() => setIsTransferModalOpen(true)}
                onDeleteStartup={() => setIsDeleteModalOpen(true)}
                onLeaveStartup={() => setIsLeaveModalOpen(true)}
              />
            </motion.div>

            {/* LAYOUT 2 COLONNES ÉQUILIBRÉES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Colonne principale - 2/3 */}
              <motion.div variants={cardVariants} className="lg:col-span-2 space-y-8">
                <TeamSection
                  founders={startupData.founders}
                  teamMembers={startupData.teamMembers}
                  startupId={startupId}
                  startupName={startupData.name}
                  userRole={startup?.role}
                  currentProfileId={startup?.currentProfileId}
                  canEdit={startup?.canEdit}
                  isMember={startup?.isMember}
                  onUpdate={() => refetchStartup()}
                  transferModalOpen={isTransferModalOpen}
                  onTransferModalOpenChange={setIsTransferModalOpen}
                  deleteModalOpen={isDeleteModalOpen}
                  onDeleteModalOpenChange={setIsDeleteModalOpen}
                  leaveModalOpen={isLeaveModalOpen}
                  onLeaveModalOpenChange={setIsLeaveModalOpen}
                />
              </motion.div>

              {/* Sidebar sticky - 1/3 */}
              <motion.div variants={cardVariants} className="lg:col-span-1">
                <div className="sticky top-8 space-y-8">
                  <FundingCard 
                    funding={funding || {
                      totalRaised: '0',
                      lastRound: null,
                      investors: [],
                      fundraisingType: 'none',
                    }} 
                    history={fundingHistory}
                    currentUser={currentUser} 
                    onAddHistory={() => {
                      setEditingHistoryId(null);
                      setIsEditFundingHistoryModalOpen(true);
                    }}
                    onEditHistory={(entry) => {
                      setEditingHistoryId(entry.id);
                      setIsEditFundingHistoryModalOpen(true);
                    }}
                    onDeleteHistory={async (entryId) => {
                      await deleteFundingHistoryMutation.mutateAsync({ startupId, historyId: entryId });
                    }}
                  />
                  <AchievementsCard
                    achievements={startupData.achievements}
                    currentUser={false}
                    onEdit={() => {}}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Modales d'édition */}
        <EditStartupHeaderModal
          open={isEditHeaderModalOpen}
          onOpenChange={setIsEditHeaderModalOpen}
          startupId={startupId}
          startupData={{
            name: startupData.name,
            tagline: startupData.tagline,
            description: startupData.description,
            logo: startupData.logo || '',
            coverImage: startupData.coverImage || '',
            website: startupData.website || '',
            countryCode: startupData.countryCode || '',
            city: startupData.city || '',
            sectors: startupData.sectors,
          }}
          onSave={handleUpdateHeader}
        />
        <EditAchievementsModal
          open={isEditAchievementsModalOpen}
          onOpenChange={setIsEditAchievementsModalOpen}
          achievements={startupData.achievements}
          onSave={() => {
            // TODO: Implémenter la sauvegarde des réalisations quand le backend sera prêt
          }}
        />
        <EditFundingHistoryModal
          open={isEditFundingHistoryModalOpen}
          onOpenChange={(open) => {
            setIsEditFundingHistoryModalOpen(open);
            if (!open) {
              setEditingHistoryId(null);
            }
          }}
          history={fundingHistory}
          startupId={startupId}
          initialEntryId={editingHistoryId || undefined}
          onCreate={async (data) => {
            await createFundingHistoryMutation.mutateAsync({ startupId, data });
          }}
          onUpdate={async (historyId, data) => {
            await updateFundingHistoryMutation.mutateAsync({ startupId, historyId, data });
          }}
          onDelete={async (historyId) => {
            await deleteFundingHistoryMutation.mutateAsync({ startupId, historyId });
          }}
        />
        <LinkedInCompanySyncModal
          open={isLinkedInSyncModalOpen}
          onOpenChange={setIsLinkedInSyncModalOpen}
          startupId={startupId}
          currentLinkedinUrl={startup?.linkedin}
        />
    </div>
  );
}