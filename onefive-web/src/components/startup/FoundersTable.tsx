'use client';

import { Badge } from '@/components/base/badges/badges';
import { Tooltip, TooltipTrigger } from '@/components/base/tooltip/tooltip';
import { Info, Crown, Wrench, Settings, User2 } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { resolveAvatarUrl } from '@/utils/avatar';

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

// Largeurs de colonnes partagées avec MembersTable pour alignement
const COL_WIDTHS = {
  nom: 'w-[40%]',
  poste: 'w-[22%]',
  role: 'w-[18%]',
  capital: 'w-[20%]',
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

export const FoundersTable = ({
  founders,
  startupId,
  userRole,
  canEdit,
  hideActions,
}: {
  founders: any[];
  startupId: string;
  userRole?: string;
  canEdit?: boolean;
  hideActions?: boolean;
}) => {

  if (founders.length === 0) {
    return (
      <div className="border-b border-gray-100 last:border-b-0 px-6 pt-4 pb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Fondateurs</h4>
        <p className="text-sm text-gray-500">Aucun fondateur pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-100 last:border-b-0">
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <h4 className="text-sm font-semibold text-gray-700">Fondateurs</h4>
        </div>
        <div className="hidden sm:block overflow-x-auto w-full">
          <table className="min-w-full w-full text-sm bg-white rounded-b-2xl table-fixed">
            <thead className="bg-white">
              <tr className="text-gray-400 text-xs font-normal">
                <th className={`py-2 px-6 text-left font-normal ${COL_WIDTHS.nom}`}>Nom</th>
                <th className={`py-2 px-4 text-left font-normal ${COL_WIDTHS.poste}`}>Poste</th>
                <th className={`py-2 px-4 text-left font-normal ${COL_WIDTHS.role}`}>Rôle</th>
                <th className={`py-2 px-4 text-left font-normal ${COL_WIDTHS.capital}`}>
                  <div className="flex items-center gap-1">
                    Capital
                    <Tooltip title="Pourcentage du capital détenu par le fondateur">
                      <TooltipTrigger className="inline-flex cursor-pointer">
                        <Info className="w-4 h-4" />
                      </TooltipTrigger>
                    </Tooltip>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {founders.map((founder, idx) => {
                const avatarUrl = resolveAvatarUrl(founder.avatar);
                const position = founder.position || '';
                const equity = founder.capitalStock;

                return (
                  <motion.tr
                    key={founder.id || idx}
                    className={
                      'transition-colors group ' +
                      (idx !== founders.length - 1 ? 'border-b border-gray-50' : '') +
                      ' hover:bg-gray-50'
                    }
                    initial="hidden"
                    animate="visible"
                    custom={idx}
                    variants={itemVariants}
                  >
                    <td className="py-4 px-6 align-middle">
                      <div className="flex items-center gap-3">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={founder.name}
                            className="w-9 h-9 rounded-full object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                            {getInitials(founder.name)}
                          </div>
                        )}
                        <div>
                          {founder.id ? (
                            <Link
                              href={`/profile/${founder.id}`}
                              className="font-semibold text-gray-900 text-sm flex items-center gap-1 cursor-pointer hover:text-violet-600 transition-colors"
                            >
                              {founder.name}
                            </Link>
                          ) : (
                            <span className="font-semibold text-gray-900 text-sm">
                              {founder.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-middle">
                      <Badge
                        type="pill-color"
                        color="gray"
                        size="sm"
                        className={`font-normal px-2 py-0.5 rounded-full border flex items-center gap-1 whitespace-nowrap ${POSITION_COLORS[position] || 'bg-gray-50 text-gray-500 border-gray-200'}`}
                      >
                        {POSITION_ICONS[position]}
                        {position}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 align-middle">
                      {founder.role ? (
                        <Badge
                          type="pill-color"
                          color="gray"
                          size="sm"
                          className={`font-normal px-2 py-0.5 rounded-full border flex items-center gap-1 whitespace-nowrap ${ROLE_COLORS[founder.role] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
                        >
                          {ROLE_ICONS[founder.role]}
                          {ROLE_LABELS[founder.role] || founder.role}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 align-middle font-normal text-gray-900">
                      {equity != null && equity !== 0 && equity !== '0' && equity !== '0%' ? (
                        <div className="flex items-center gap-2">
                          {typeof equity === 'number' ? `${equity}%` : equity}
                          <div className="w-16 h-1 bg-gray-100 rounded overflow-hidden">
                            <div
                              className="h-1 bg-violet-200 rounded"
                              style={{ width: typeof equity === 'number' ? `${equity}%` : equity }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Responsive cards on mobile */}
        <div className="sm:hidden space-y-4 pt-2 pb-6 w-full">
          {founders.map((founder, idx) => {
            const avatarUrl = resolveAvatarUrl(founder.avatar);
            const position = founder.position || '';
            const equity = founder.capitalStock;

            return (
              <motion.div
                key={founder.id || idx}
                className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3 shadow-sm w-full"
                initial="hidden"
                animate="visible"
                custom={idx}
                variants={itemVariants}
              >
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={founder.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                      {getInitials(founder.name)}
                    </div>
                  )}
                  <div className="flex-1">
                    {founder.id ? (
                      <Link
                        href={`/profile/${founder.id}`}
                        className="font-semibold text-gray-900 text-sm flex items-center gap-1 hover:text-violet-600 transition-colors"
                      >
                        {founder.name}
                      </Link>
                    ) : (
                      <div className="font-semibold text-gray-900 text-sm">{founder.name}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    type="pill-color"
                    color="gray"
                    size="sm"
                    className={`font-normal px-2 py-0.5 rounded-full border flex items-center gap-1 whitespace-nowrap ${POSITION_COLORS[position] || 'bg-gray-50 text-gray-500 border-gray-200'}`}
                  >
                    {POSITION_ICONS[position]}
                    {position}
                  </Badge>
                  {equity != null && (
                    <span className="ml-auto text-xs text-gray-900 font-normal">
                      {typeof equity === 'number' ? `${equity}%` : equity}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
    </div>
  );
};
