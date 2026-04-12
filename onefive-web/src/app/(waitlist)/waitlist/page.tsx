'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Users, Trophy, Share2, Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWaitlistStatus,
  getWaitlistLeaderboard,
  toggleLeaderboardOptIn,
  selfActivateWaitlist,
  WaitlistStatus,
  LeaderboardEntry,
} from '@/queries/waitlist';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#FCFCFD] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto rounded-full bg-gray-200 animate-pulse" style={{ width: 64, height: 64 }} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto mb-6 animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReferralLink({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://onefive.app'}/signup?ref=${referralCode}`;

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, [shareUrl]);

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      '_blank',
    );
  };

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent('Join me on OneFive, the social network for entrepreneurs! 🚀')}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
    );
  };

  const shareOnWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`Join me on OneFive! 🚀 ${shareUrl}`)}`,
      '_blank',
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-[#F9FAFB] rounded-lg p-3 border border-gray-200">
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="flex-1 bg-transparent text-sm text-[#475467] outline-none truncate"
        />
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#111827] text-white rounded-md text-sm font-medium hover:bg-[#1f2937] transition-colors"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={shareOnLinkedIn}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-lg text-sm font-medium hover:bg-[#004182] transition-colors"
        >
          LinkedIn
        </button>
        <button
          onClick={shareOnTwitter}
          className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg text-sm font-medium hover:bg-[#0c85d0] transition-colors"
        >
          Twitter
        </button>
        <button
          onClick={shareOnWhatsApp}
          className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium hover:bg-[#1da851] transition-colors"
        >
          WhatsApp
        </button>
      </div>
    </div>
  );
}

function FoundingMemberProgress({ progress, threshold }: { progress: number; threshold: number }) {
  const percentage = Math.round((progress / threshold) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#475467] font-medium">Founding Member Progress</span>
        <span className="text-[#5E6AD2] font-semibold">
          {progress}/{threshold} referrals
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <motion.div
          className="bg-gradient-to-r from-[#5E6AD2] to-[#8B5CF6] h-3 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      {progress >= threshold ? (
        <p className="text-sm text-[#5E6AD2] font-semibold flex items-center gap-1">
          <Sparkles className="h-4 w-4" />
          🎉 Founding Member unlocked! Your account will be activated soon.
        </p>
      ) : (
        <p className="text-xs text-[#9CA3AF]">
          Invite {threshold - progress} more people to unlock Founding Member status and get instant access.
        </p>
      )}
    </div>
  );
}

function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  if (!entries?.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#101828] flex items-center gap-2">
        <Trophy className="h-4 w-4 text-[#F59E0B]" />
        Top Referrers
      </h3>
      <div className="space-y-2">
        {entries.slice(0, 5).map((entry) => (
          <div
            key={entry.profileId}
            className="flex items-center justify-between py-2 px-3 bg-[#F9FAFB] rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                  entry.rank === 1
                    ? 'bg-[#F59E0B] text-white'
                    : entry.rank === 2
                      ? 'bg-[#94A3B8] text-white'
                      : entry.rank === 3
                        ? 'bg-[#CD7F32] text-white'
                        : 'bg-gray-200 text-[#475467]'
                }`}
              >
                {entry.rank}
              </span>
              <span className="text-sm text-[#101828] font-medium">
                {entry.firstName} {entry.lastName?.charAt(0)}.
              </span>
            </div>
            <span className="text-sm text-[#5E6AD2] font-semibold">
              {entry.acceptedCount} referrals
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WaitlistPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const statusQuery = useQuery({
    queryKey: ['waitlistStatus'],
    queryFn: getWaitlistStatus,
    refetchInterval: 30000, // Refresh every 30s
  });

  // Redirect to feed if user is approved (ACTIVE) - waitlist page is for WAITING users only
  useEffect(() => {
    if (statusQuery.data?.status === 'ACTIVE') {
      router.replace('/feed');
    }
  }, [statusQuery.data?.status, router]);

  const leaderboardQuery = useQuery({
    queryKey: ['waitlistLeaderboard'],
    queryFn: () => getWaitlistLeaderboard(10),
    refetchInterval: 60000, // Refresh every 60s
  });

  const toggleOptInMutation = useMutation({
    mutationFn: toggleLeaderboardOptIn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['waitlistStatus'] });
      toast.success(data.showInLeaderboard ? 'You will appear in the leaderboard' : 'You will not appear in the leaderboard');
    },
    onError: () => {
      toast.error('Failed to update preference');
    },
  });

  const selfActivateMutation = useMutation({
    mutationFn: selfActivateWaitlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlistStatus'] });
      toast.success('Account activated! Redirecting to feed...');
      window.location.href = '/feed';
    },
    onError: () => {
      toast.error('Self-activation failed (ensure backend is in development mode)');
    },
  });

  const isDev = process.env.NEXT_PUBLIC_DEV === 'true';

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  if (statusQuery.isLoading) return <Skeleton />;

  const status = statusQuery.data;

  // Approved users are redirected to feed - show skeleton while redirecting
  if (status?.status === 'ACTIVE') return <Skeleton />;

  return (
    <div className="min-h-screen bg-[#FCFCFD] flex flex-col items-center py-12 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg space-y-6"
      >
        {/* Header */}
        <motion.div variants={cardVariants} className="text-center">
          <Image
            src="/onefive-logo-square.png"
            alt="OneFive logo"
            width={64}
            height={64}
            quality={100}
            className="mx-auto"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mt-2 text-[#475467] text-base"
          >
            {getGreeting()}{status?.firstName ? `, ${status.firstName}` : ''} 👋
          </motion.div>
        </motion.div>

        {/* Position Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EEF2FF] mb-4">
              <Users className="h-8 w-8 text-[#5E6AD2]" />
            </div>
            <h1 className="text-2xl font-bold text-[#101828]">
              {"You're on the waitlist!"}
            </h1>
            {status?.position ? (
              <p className="text-[#475467] mt-2">
                Your position: <span className="font-bold text-[#5E6AD2] text-lg">#{status.position}</span>
              </p>
            ) : null}
          </div>

          <div className="bg-[#F9FAFB] rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-[#475467]">
              Your referral stats
            </p>
            <div className="flex justify-center mt-3">
              <div>
                <p className="text-2xl font-bold text-[#101828]">{status?.referrals?.accepted ?? 0}</p>
                <p className="text-xs text-[#9CA3AF]">Accepted</p>
              </div>
            </div>
          </div>

          {/* Founding Member Progress */}
          {status?.foundingMember && (
            <div className="mb-6">
              <FoundingMemberProgress
                progress={status.foundingMember.progress}
                threshold={status.foundingMember.threshold}
              />
            </div>
          )}

          {/* Badges */}
          {status?.badges && status.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {status.badges.map((badge) => (
                <span
                  key={badge.type}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#EEF2FF] text-[#5E6AD2] rounded-full text-xs font-medium"
                >
                  <Sparkles className="h-3 w-3" />
                  {badge.name}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Dev: Self-activate button (only when NEXT_PUBLIC_DEV=true and status=WAITING) */}
        {isDev && status?.status === 'WAITING' && (
          <motion.div
            variants={cardVariants}
            className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-6"
          >
            <h2 className="text-lg font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Dev: Self-activate
            </h2>
            <p className="text-sm text-amber-700 mb-4">
              Validate your waitlist entry and unlock the feed (backend must be in NODE_ENV=development).
            </p>
            <button
              onClick={() => selfActivateMutation.mutate()}
              disabled={selfActivateMutation.isPending}
              className="w-full px-4 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {selfActivateMutation.isPending ? 'Activating...' : 'Validate & unlock feed'}
            </button>
          </motion.div>
        )}

        {/* Share Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-[#101828] mb-2 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-[#5E6AD2]" />
            Skip the line
          </h2>
          <p className="text-sm text-[#475467] mb-4">
            Invite 10 friends to get <strong>Founding Member</strong> status and instant access.
          </p>
          {status?.referralCode && (
            <ReferralLink referralCode={status.referralCode} />
          )}
        </motion.div>

        {/* Leaderboard Card */}
        {leaderboardQuery.data && leaderboardQuery.data.length > 0 && (
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <Leaderboard entries={leaderboardQuery.data} />
            
            {/* Opt-in Toggle */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#101828] group-hover:text-[#5E6AD2] transition-colors">
                    Appear in the public leaderboard
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Show your name in the Top 50 referrers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleOptInMutation.mutate()}
                  disabled={toggleOptInMutation.isPending}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] focus:ring-offset-2 ${
                    status?.showInLeaderboard ? 'bg-[#5E6AD2]' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={status?.showInLeaderboard || false}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      status?.showInLeaderboard ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>
          </motion.div>
        )}

        {/* Social Links */}
        <motion.div variants={cardVariants} className="text-center">
          <p className="text-sm font-medium text-[#475467] mb-4">
            Follow us on social media
          </p>
          <div className="flex justify-center items-center gap-4">
            <a href="https://www.linkedin.com/company/onefive-social-network" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
              <img src="/assets/images/linkedin.png" alt="LinkedIn" className="w-6 h-6" />
            </a>
            <a href="https://twitter.com/onefive_app" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
              <img src="/assets/images/x.png" alt="X" className="w-6 h-6" />
            </a>
            <a href="https://www.instagram.com/onefive.app/" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
              <img src="/assets/images/instagram.png" alt="Instagram" className="w-6 h-6 rounded" />
            </a>
            <a href="https://www.facebook.com/onefiveapp" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
              <img src="/assets/images/facebook.webp" alt="Facebook" className="w-6 h-6 rounded" />
            </a>
            <a href="https://discord.gg/onefive" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
              <img src="/assets/images/discordLogo.jpeg" alt="Discord" className="w-6 h-6 rounded" />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
