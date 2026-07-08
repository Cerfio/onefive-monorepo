'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import Navbar from '@/components/navbar';
import { motion } from 'framer-motion';
import {
  Trophy, Star, Crown, Gem, Medal,
  Award, TrendingUp, Check, Lock, Loader2, UserCheck, Link2
} from 'lucide-react';
import { Avatar } from '@/components/base/avatar/avatar';
import { UserMiniProfile } from '@/components/base/avatar/user-mini-profile';
import { useNavigateToConversation } from '@/hooks/useNavigateToConversation';
import {
  useReferralStats,
  useLeaderboard,
  useMyReferrals,
  ReferralTier
} from '@/hooks/useReferral';
import { getWaitlistStatus } from '@/queries/waitlist';
import { selfProfileType } from '@/queries/profile';
import { toast } from 'sonner';

// Tier definitions
const tiers = [
  { id: 'starter' as ReferralTier, name: 'Starter', icon: Star, requirement: 0, color: 'gray', description: 'Bienvenue !' },
  { id: 'bronze' as ReferralTier, name: 'Bronze', icon: Medal, requirement: 3, color: 'amber', description: '3 parrainages acceptés' },
  { id: 'silver' as ReferralTier, name: 'Silver', icon: Award, requirement: 10, color: 'slate', description: '10 parrainages acceptés' },
  { id: 'gold' as ReferralTier, name: 'Gold', icon: Trophy, requirement: 25, color: 'yellow', description: '25 parrainages acceptés' },
  { id: 'platinum' as ReferralTier, name: 'Platinum', icon: Crown, requirement: 50, color: 'purple', description: '50 parrainages acceptés' },
  { id: 'diamond' as ReferralTier, name: 'Diamond', icon: Gem, requirement: 100, color: 'cyan', description: '100 parrainages acceptés' },
];

const getAvatarUrl = (avatarId?: string | null): string | undefined => {
  if (!avatarId) return undefined;
  return `${process.env.NEXT_PUBLIC_API_URL}/file/${avatarId}`;
};

function InviteLink({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://onefive.app'}/signup?ref=${referralCode}`;

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Échec de la copie');
    }
  }, [shareUrl]);

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Votre lien de parrainage</p>
        <p className="text-sm text-gray-700 truncate font-mono">{shareUrl}</p>
      </div>
      <button
        type="button"
        onClick={copyToClipboard}
        className="shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
      >
        <Link2 className="h-4 w-4" />
        {copied ? 'Copié !' : 'Copier'}
      </button>
    </div>
  );
}

export default function InvitePage() {
  const queryClient = useQueryClient();
  const selfProfile = queryClient.getQueryData(['selfProfile']) as selfProfileType | undefined;
  const { navigateToConversation } = useNavigateToConversation();

  const { data: stats, isLoading: statsLoading } = useReferralStats();
  const { data: leaderboardData, isLoading: leaderboardLoading } = useLeaderboard(5);
  const { data: myReferrals, isLoading: referralsLoading } = useMyReferrals();
  // Referral code is served by the (now inert) status endpoint; keep it for the invite link.
  const { data: referralInfo } = useQuery(['referralCode'], getWaitlistStatus);
  const referralCode = referralInfo?.referralCode;

  const acceptedCount = stats?.totalAccepted ?? 0;
  const myRank = stats?.rank ?? 0;

  const currentTierIndex = useMemo(() => {
    let index = 0;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (acceptedCount >= tiers[i].requirement) {
        index = i;
        break;
      }
    }
    return index;
  }, [acceptedCount]);

  const currentTier = tiers[currentTierIndex];
  const nextTier = tiers[currentTierIndex + 1];
  const progressToNext = useMemo(() => {
    if (!nextTier) return 100;
    const current = acceptedCount - currentTier.requirement;
    const needed = nextTier.requirement - currentTier.requirement;
    return Math.min(100, (current / needed) * 100);
  }, [acceptedCount, currentTier, nextTier]);

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="w-full max-w-screen-xl mx-auto"><Navbar /></div>
        <main className="max-w-2xl mx-auto px-4 pt-8 pb-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-screen-xl mx-auto"><Navbar /></div>
      <main className="max-w-2xl mx-auto px-4 pt-8 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
              Invitez vos contacts
            </h1>
            <p className="mt-2 text-gray-500">
              Construisez votre réseau et débloquez des avantages.
            </p>
          </div>

          {/* Lien à copier */}
          {referralCode && (
            <div className="mb-12">
              <InviteLink referralCode={referralCode} />
            </div>
          )}

          {/* Stat Acceptées */}
          <div className="mb-12">
            <div className="text-center p-6 border border-gray-100 rounded-xl bg-gray-50/50">
              <p className="text-4xl font-semibold text-green-600">{acceptedCount}</p>
              <p className="text-sm text-gray-500 mt-1">Parrainages acceptés</p>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Top Ambassadeurs
              </h2>
              <span className="text-xs text-gray-400">Parrainages acceptés</span>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-hidden">
              {leaderboardLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : leaderboardData && leaderboardData.length > 0 ? (
                leaderboardData.map((user, index) => {
                  const tierData = tiers.find(t => t.id === user.currentTier);
                  const TierIcon = tierData?.icon || Star;
                  return (
                    <motion.div
                      key={user.rank}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-4 p-4 ${index !== leaderboardData.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-colors`}
                    >
                      <span className={`w-6 text-center font-semibold ${
                        user.rank === 1 ? 'text-amber-500' :
                        user.rank === 2 ? 'text-gray-400' :
                        user.rank === 3 ? 'text-amber-600' : 'text-gray-300'
                      }`}>{user.rank}</span>
                      <Avatar
                        src={getAvatarUrl(user.avatarId)}
                        alt={`${user.firstName} ${user.lastName}`}
                        firstName={user.firstName}
                        lastName={user.lastName}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user.firstName} {user.lastName.charAt(0)}.</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <TierIcon className="h-3 w-3" />
                          <span>{tierData?.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">{user.totalAccepted}</span>
                        <p className="text-xs text-gray-400">acceptées</p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Aucun ambassadeur pour le moment. Soyez le premier !
                </div>
              )}
            </div>

            {myRank > 0 && (
              <div className="mt-3 flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm text-gray-400">#{myRank}</span>
                  <Avatar
                    src={getAvatarUrl(selfProfile?.avatar)}
                    alt="Vous"
                    firstName={selfProfile?.firstName}
                    lastName={selfProfile?.lastName}
                    size="sm"
                  />
                  <span className="text-sm text-gray-600">{acceptedCount} acceptées</span>
                </div>
                {leaderboardData && leaderboardData.length > 0 && leaderboardData[leaderboardData.length - 1].totalAccepted > acceptedCount && (
                  <span className="text-xs text-gray-400">
                    +{leaderboardData[leaderboardData.length - 1].totalAccepted - acceptedCount} pour le top 5
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Progress Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl bg-${currentTier.color}-100 flex items-center justify-center`}>
                  <currentTier.icon className={`h-5 w-5 text-${currentTier.color}-600`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{currentTier.name}</p>
                  <p className="text-sm text-gray-500">{acceptedCount} parrainage{acceptedCount > 1 ? 's' : ''} accepté{acceptedCount > 1 ? 's' : ''}</p>
                </div>
              </div>
              {nextTier && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Prochain palier</p>
                  <p className="font-medium text-gray-900">{nextTier.name} ({nextTier.requirement})</p>
                </div>
              )}
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gray-900 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            {nextTier && (
              <p className="mt-2 text-sm text-gray-500">
                {nextTier.requirement - acceptedCount} de plus pour {nextTier.name}
              </p>
            )}
          </div>

          {/* Liste des parrainages acceptés */}
          {myReferrals && myReferrals.length > 0 && (
            <div className="mb-12">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Parrainages acceptés
              </h2>
              <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
                {referralsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  myReferrals.map((referral) => (
                    <div key={referral.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                      {referral.invitedUser ? (
                        <UserMiniProfile
                          profileId={referral.invitedUser.profileId}
                          firstName={referral.invitedUser.firstName}
                          lastName={referral.invitedUser.lastName}
                          avatar={getAvatarUrl(referral.invitedUser.avatarId)}
                          highlight={referral.invitedUser.highlight || undefined}
                          bio={referral.invitedUser.bio || undefined}
                          ecosystemRoles={referral.invitedUser.ecosystemRoles}
                          countryCode={referral.invitedUser.countryCode || undefined}
                          isFollowing={referral.invitedUser.isFollowing}
                          stats={referral.invitedUser.stats}
                          size="sm"
                          onMessage={referral.invitedUser.profileId ? () => navigateToConversation(referral.invitedUser!.profileId) : undefined}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {referral.invitedUser ? (
                          <p className="font-medium text-gray-900 truncate">
                            {referral.invitedUser.firstName} {referral.invitedUser.lastName}
                          </p>
                        ) : null}
                        <p className={`truncate ${referral.invitedUser ? 'text-xs text-gray-500' : 'font-medium text-gray-900'}`}>
                          {referral.invitedEmail}
                        </p>
                        <p className="text-xs text-gray-400">
                          Rejoint le {new Date(referral.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Paliers */}
          <div className="mb-12">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Paliers</h2>
            <div className="space-y-3">
              {tiers.map((tier, index) => {
                const isUnlocked = index <= currentTierIndex;
                const isCurrent = index === currentTierIndex;
                const isNext = index === currentTierIndex + 1;
                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative p-4 rounded-xl border transition-all ${
                      isCurrent ? 'border-gray-900 bg-gray-50 shadow-sm' :
                      isUnlocked ? 'border-gray-200 bg-white' :
                      isNext ? 'border-dashed border-gray-300 bg-gray-50/50' :
                      'border-gray-100 bg-gray-50/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`relative shrink-0 h-12 w-12 rounded-xl flex items-center justify-center ${
                        isCurrent ? 'bg-gray-900 text-white' :
                        isUnlocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isUnlocked && !isCurrent ? <Check className="h-6 w-6" /> :
                         !isUnlocked ? <Lock className="h-5 w-5" /> : <tier.icon className="h-6 w-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold ${isCurrent ? 'text-gray-900' : isUnlocked ? 'text-gray-700' : 'text-gray-400'}`}>
                            {tier.name}
                          </span>
                          {isCurrent && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-900 text-white">Actuel</span>}
                          {isNext && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">Prochain</span>}
                        </div>
                        <p className="text-sm text-gray-400">
                          {tier.requirement === 0 ? 'Dès inscription' : tier.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {isUnlocked ? (
                          <span className="text-green-600 text-sm font-medium">✓ Débloqué</span>
                        ) : (
                          <>
                            <span className="text-lg font-semibold text-gray-900">{tier.requirement}</span>
                            <p className="text-xs text-gray-400">requis</p>
                          </>
                        )}
                      </div>
                    </div>
                    {isCurrent && nextTier && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{acceptedCount} / {nextTier.requirement}</span>
                          <span>{nextTier.requirement - acceptedCount} restants</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-gray-900 rounded-full" animate={{ width: `${progressToNext}%` }} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
