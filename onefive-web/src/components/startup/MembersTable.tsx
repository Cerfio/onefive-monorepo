'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { User2, Settings, Crown, Wrench } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { resolveAvatarUrl } from '@/utils/avatar';

const ROLE_ICONS: Record<string, React.JSX.Element> = {
  'SUPER_ADMIN': <Settings className="w-3 h-3 mr-1 inline-block" />,
  'ADMIN': <Settings className="w-3 h-3 mr-1 inline-block" />,
  'MEMBER': <User2 className="w-3 h-3 mr-1 inline-block" />,
};

const ROLE_COLORS: Record<string, string> = {
  'SUPER_ADMIN': 'bg-purple-50 text-purple-700 border-purple-200',
  'ADMIN': 'bg-blue-50 text-blue-700 border-blue-200',
  'MEMBER': 'bg-gray-50 text-gray-700 border-gray-200',
};

const ROLE_LABELS: Record<string, string> = {
  'SUPER_ADMIN': 'Créateur',
  'ADMIN': 'Admin',
  'MEMBER': 'Membre',
};

// Largeurs de colonnes partagées avec FoundersTable pour alignement
const COL_WIDTHS = {
  nom: 'w-[40%]',
  poste: 'w-[22%]',
  role: 'w-[18%]',
  capital: 'w-[20%]',
};

// Badges Poste (alignés avec FoundersTable)
const POSITION_ICONS: Record<string, React.JSX.Element> = {
  'CEO': <Crown className="w-3 h-3 mr-1 inline-block" />,
  'CTO': <Wrench className="w-3 h-3 mr-1 inline-block" />,
};
const POSITION_COLORS: Record<string, string> = {
  'CEO': 'bg-red-50 text-red-700 border-red-200',
  'CTO': 'bg-green-50 text-green-700 border-green-200',
  'CMO': 'bg-blue-50 text-blue-700 border-blue-200',
  'CFO': 'bg-amber-50 text-amber-700 border-amber-200',
  'COO': 'bg-purple-50 text-purple-700 border-purple-200',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4 }
  })
};

export interface MemberData {
  id: string;
  profileId: string;
  memberId?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  position: string;
  role?: string;
  equity?: number;
  isFounder?: boolean;
  avatar?: string | null;
  email?: string;
  linkedinUrl?: string;
}

export const MembersTable = ({
  members,
  startupId,
  userRole,
  canEdit,
  isMember,
  hideActions,
  showCapitalColumn,
}: {
  members: MemberData[];
  startupId: string;
  userRole?: string;
  canEdit?: boolean;
  isMember?: boolean;
  hideActions?: boolean;
  showCapitalColumn?: boolean;
}) => {
  const showRoles = isMember === true;

  if (members.length === 0 && !hideActions) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="border-b border-gray-100 last:border-b-0">
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <h4 className="text-sm font-semibold text-gray-700">Membres de l'équipe</h4>
        </div>

        {members.length === 0 ? (
          <div className="px-6 pb-6 text-center text-gray-500 text-sm py-6">
            Aucun membre d'équipe pour le moment.
          </div>
        ) : (
          <>
            {/* Desktop view */}
            <div className="hidden sm:block overflow-x-auto w-full">
              <table className="min-w-full w-full text-sm bg-white rounded-b-2xl table-fixed">
                <thead className="bg-white">
                  <tr className="text-gray-400 text-xs font-normal">
                    <th className={`py-2 px-6 text-left font-normal ${COL_WIDTHS.nom}`}>Nom</th>
                    <th className={`py-2 px-4 text-left font-normal ${COL_WIDTHS.poste}`}>Poste</th>
                    <th className={`py-2 px-4 text-left font-normal ${COL_WIDTHS.role}`}>Rôle</th>
                    {showCapitalColumn && (
                      <th className={`py-2 px-4 text-left font-normal ${COL_WIDTHS.capital}`}>Capital</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, i) => (
                    <motion.tr
                      key={member.id}
                      className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors group"
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={itemVariants}
                    >
                      <td className="py-4 px-6 align-middle">
                        <Link href={`/profile/${member.profileId || member.id}`} className="flex items-center gap-3 group">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-sm font-medium text-indigo-700 overflow-hidden">
                            {member.avatar ? (
                              <img
                                src={resolveAvatarUrl(member.avatar)}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              getInitials(member.name)
                            )}
                          </div>
                          <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {member.name}
                          </span>
                        </Link>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        <Badge
                          className={`font-normal px-2 py-0.5 rounded-full text-xs border flex items-center gap-1 whitespace-nowrap ${POSITION_COLORS[member.position] || 'bg-gray-50 text-gray-500 border-gray-200'}`}
                        >
                          {POSITION_ICONS[member.position]}
                          {member.position || '—'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 align-middle">
                        {showRoles && member.role ? (
                          <Badge
                            className={`${ROLE_COLORS[member.role] || 'bg-gray-50 text-gray-700 border-gray-200'} border text-xs px-2 py-0.5`}
                          >
                            {ROLE_ICONS[member.role]}
                            {ROLE_LABELS[member.role] || member.role}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      {showCapitalColumn && (
                        <td className="py-4 px-4 align-middle">
                          <span className="text-gray-400">—</span>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view */}
            <div className="sm:hidden px-4 pb-4 space-y-3">
              {members.map((member, i) => (
                <motion.div
                  key={member.id}
                  className="bg-gray-50 rounded-xl p-4"
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                >
                  <Link href={`/profile/${member.profileId || member.id}`} className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-sm font-medium text-indigo-700 overflow-hidden">
                      {member.avatar ? (
                        <img
                          src={resolveAvatarUrl(member.avatar)}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(member.name)
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 block">{member.name}</span>
                      <span className="text-sm text-gray-500">{member.position}</span>
                    </div>
                  </Link>
                  {showRoles && member.role && (
                    <div className="flex items-center justify-between">
                      <Badge
                        className={`${ROLE_COLORS[member.role] || 'bg-gray-50 text-gray-700 border-gray-200'} border text-xs px-2 py-0.5`}
                      >
                        {ROLE_ICONS[member.role]}
                        {ROLE_LABELS[member.role] || member.role}
                      </Badge>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}

      </div>
    </TooltipProvider>
  );
};

export default MembersTable;
