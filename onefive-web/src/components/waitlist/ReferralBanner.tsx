'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export interface AmbassadorReferrer {
  type: 'AMBASSADOR';
  data: {
    name: string;
    title: string | null;
    bio: string | null;
    interviewUrl: string | null;
    avatarUrl: string | null;
  };
}

export interface UserReferrer {
  type: 'USER';
  data: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    bio: string | null;
  };
}

export type Referrer = AmbassadorReferrer | UserReferrer;

interface ReferralBannerProps {
  referrer: Referrer;
}

export function ReferralBanner({ referrer }: ReferralBannerProps) {
  if (referrer.type === 'AMBASSADOR') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 shadow-sm"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            {referrer.data.avatarUrl ? (
              <Image
                src={referrer.data.avatarUrl}
                alt={referrer.data.name}
                width={64}
                height={64}
                className="rounded-full ring-2 ring-purple-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center ring-2 ring-purple-200">
                <span className="text-white text-2xl font-bold">
                  {referrer.data.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full p-1">
              <span className="text-sm">👑</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">{referrer.data.name}</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                Ambassador
              </span>
            </div>
            {referrer.data.title && (
              <p className="text-sm text-gray-600 mb-2">{referrer.data.title}</p>
            )}
            {referrer.data.bio && (
              <p className="text-sm text-gray-500 line-clamp-2">{referrer.data.bio}</p>
            )}
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-100">
          <p className="text-base font-semibold text-gray-900 mb-1">
            🎉 Welcome! {referrer.data.name} is opening the doors of OneFive for you
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Your immediate access is unlocked ✨
          </p>
        </div>

        {referrer.data.interviewUrl && (
          <a
            href={referrer.data.interviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Watch their interview
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </motion.div>
    );
  }

  // User normal
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        {referrer.data.avatarUrl ? (
          <Image
            src={referrer.data.avatarUrl}
            alt={`${referrer.data.firstName} ${referrer.data.lastName}`}
            width={48}
            height={48}
            className="rounded-full ring-2 ring-blue-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center ring-2 ring-blue-200">
            <span className="text-white text-lg font-bold">
              {referrer.data.firstName.charAt(0)}
            </span>
          </div>
        )}
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-0.5">You were referred by</p>
          <p className="text-sm font-semibold text-gray-900">
            {referrer.data.firstName} {referrer.data.lastName}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
