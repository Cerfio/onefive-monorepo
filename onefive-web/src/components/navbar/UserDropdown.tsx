import React, { useState } from 'react';
import {
  LogOut01,
  Settings01,
  User01,
  Users01,
  Activity,
  LayersTwo01,
  Star04,
  MessageCircle01,
  HelpCircle,
  Plus,
} from '@untitledui/icons';
import { Flame } from 'lucide-react';
import { Discord as DiscordIconSvg } from '@/components/foundations/social-icons';
import { Avatar } from '@/components/base/avatar/avatar';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { Badge } from '@/components/base/badges/badges';
import { FeedbackModal } from './FeedbackModal';
import { logout } from '@/queries/auth';
import { deleteCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import posthog from 'posthog-js';
import { cx } from '@/utils/cx';
import { useMe } from '@/hooks/useUser';
import { useMeProfile } from '@/queries/profile';
import { useUserStartups, type UserStartup } from '@/queries/startup';
import { CreateStartupModal } from '@/features/startup/create/CreateStartupModal';
import { PROFILE_ROLE_METADATA, ProfileRole } from '@/sharing-enum/profile';

/** Icône Discord pour le dropdown, taille 16px pour s’aligner sur les autres items */
const DiscordDropdownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <DiscordIconSvg size={16} className={className} />
);

const _roleLabels: Record<UserStartup['role'], string> = {
  SUPER_ADMIN: 'Admin',
  ADMIN: 'Admin',
  MEMBER: 'Membre',
};

const StartupIcon = ({ className, src, name, size = 'md' }: { className?: string; src?: string | null; name: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'size-6',
    md: 'size-10',
    lg: 'size-12',
  };

  if (src) {
    return <img src={src} alt={name} className={cx(sizeClasses[size], 'rounded-lg object-cover', className)} />;
  }

  // Fallback avec initiales colorées
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Génère une couleur basée sur le nom
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-indigo-500',
  ];
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  return (
    <div className={cx(sizeClasses[size], 'rounded-lg flex items-center justify-center text-white font-semibold', colors[colorIndex], className)}>
      {initials}
    </div>
  );
};

const UserDropdown: React.FC = () => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const { data: user, isLoading: _isLoading, refetch: _refetch } = useMe();
  const { data: meProfile } = useMeProfile();
  const { data: userStartups, isLoading: _startupsLoading } = useUserStartups();
  
  const navigateTo = (path: string) => () => router.push(path);
  const openExternal = (url: string) => () => window.open(url, '_blank', 'noopener,noreferrer');
  const handleStartupNavigate = (startupId: string) => () => router.push(`/startup/${startupId}`);
  
  // À remplacer par: const displayStartups = userStartups;
  const displayStartups = userStartups;
  
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      deleteCookie('is_authenticated');
      localStorage.clear();
      posthog.reset();
      toast.success('Déconnexion réussie');
      router.push('/signin');
    },
    onError: () => {
      deleteCookie('is_authenticated');
      localStorage.clear();
      posthog.reset();
      toast.success('Déconnexion réussie');
      router.push('/signin');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      <Dropdown.Root isOpen={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <Dropdown.Trigger
          className={({ isPressed, isFocusVisible }) =>
            cx(
              'group relative inline-flex cursor-pointer rounded-full outline-focus-ring',
              (isPressed || isFocusVisible) && 'outline-2 outline-offset-2',
            )
          }
        >
          <Avatar
            alt={user ? `${user.firstName} ${user.lastName}` : 'User'}
            src={user?.avatar}
            size="md"
            firstName={user?.firstName}
            lastName={user?.lastName}
            className="ring-2 ring-gray-200 group-hover:ring-primary-300 transition-all duration-200"
          />
        </Dropdown.Trigger>

        <Dropdown.Popover className="min-w-72">
          {/* Header style LinkedIn + Streak */}
          <div className="border-b border-gray-100 p-3">
            <div className="flex gap-3">
              <Avatar
                size="lg"
                src={user?.avatar}
                alt={user ? `${user.firstName} ${user.lastName}` : 'User'}
                firstName={user?.firstName}
                lastName={user?.lastName}
                className="shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-gray-900 leading-tight truncate">
                    {user ? `${user.firstName} ${user.lastName}` : 'Chargement...'}
                  </h3>
                  {/* Streak */}
                  {(user?.streak !== undefined && user.streak > 0) && (
                    <div className="flex items-center gap-0.5 text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full shrink-0">
                      <Flame className="w-3 h-3" />
                      <span className="text-[10px] font-semibold">{user.streak}j</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-tight mt-0.5 line-clamp-2">
                  {user?.highlight || meProfile?.highlight || 'Membre OneFive'}
                </p>
                {/* Badges des rôles */}
                {meProfile?.ecosystemRoles && meProfile.ecosystemRoles.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {meProfile.ecosystemRoles.slice(0, 2).map((role) => {
                      const metadata = PROFILE_ROLE_METADATA[role as ProfileRole];
                      if (!metadata) return null;
                      return (
                        <Badge 
                          key={role} 
                          type="pill-color"
                          color="gray"
                          size="sm"
                          className="text-[10px] px-1.5 py-0 h-5 ring-0"
                          style={{
                            backgroundColor: `${metadata.color}15`,
                            color: metadata.color,
                          }}
                        >
                          {metadata.emoji} {metadata.shortLabelMale.split(' ')[0]}
                        </Badge>
                      );
                    })}
                    {meProfile.ecosystemRoles.length > 2 && (
                      <span className="text-[10px] text-gray-400">+{meProfile.ecosystemRoles.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Dropdown.Menu>
            <Dropdown.Section>
              <Dropdown.Item icon={User01} onAction={navigateTo('/profile/current_user')}>
                Voir le profil
              </Dropdown.Item>
              <Dropdown.Item icon={Settings01} onAction={navigateTo('/settings')}>
                Paramètres
              </Dropdown.Item>
            </Dropdown.Section>

            <Dropdown.Separator />

            <Dropdown.Section>
              <Dropdown.Item icon={Activity} onAction={navigateTo('/analytics')}>
                Analytics
              </Dropdown.Item>
              <Dropdown.Item icon={Users01} onAction={navigateTo('/relationships')}>
                Mes relations
              </Dropdown.Item>
            </Dropdown.Section>

            {displayStartups && displayStartups.length > 0 ? (
              <>
                <Dropdown.Separator />
                <Dropdown.Section className="space-y-0.5 px-1 py-1 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                  {displayStartups.map((startup) => (
                    <Dropdown.Item
                      key={startup.id}
                      onAction={handleStartupNavigate(startup.id)}
                      textValue={startup.name}
                      unstyled
                      className={({ isFocused, isHovered }) =>
                        cx(
                          'w-full px-3 py-2.5 rounded-md text-left transition-all duration-200 flex items-center gap-3 group cursor-pointer',
                          (isFocused || isHovered) && 'bg-primary_hover',
                        )
                      }
                    >
                      <StartupIcon src={startup.logo} name={startup.name} size="md" className="shrink-0" />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {startup.name}
                        </h4>
                      </div>

                      {/* Badge de notification à droite - Placeholder pour futures notifications */}
                      {/* Décommenter quand le système de notifications sera prêt
                      {startup.hasActivity && (
                        <Badge className="shrink-0 bg-brand-600 text-white border-0 px-2 py-0.5 text-xs font-bold">
                          {startup.unreadCount}
                        </Badge>
                      )}
                      */}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Section>
                <Dropdown.Separator />
              </>
            ) : (
              <Dropdown.Separator />
            )}

            <Dropdown.Section>
              <Dropdown.Item icon={Plus} onAction={() => setIsCreateModalOpen(true)}>
                {displayStartups && displayStartups.length > 0 ? 'Créer une startup' : 'Créer ma première startup'}
              </Dropdown.Item>

              <Dropdown.Item icon={LayersTwo01} onAction={navigateTo('/dataroom')}>
                Mes datarooms
              </Dropdown.Item>
            </Dropdown.Section>

            <Dropdown.Separator />

            <Dropdown.Section>
              <Dropdown.Item icon={Star04} onAction={openExternal('https://www.onefive.app/fr/changelog')}>
                Nouveautés
              </Dropdown.Item>

              <Dropdown.Item icon={MessageCircle01} onAction={() => setIsFeedbackModalOpen(true)}>
                Feedback
              </Dropdown.Item>

              <Dropdown.Item icon={DiscordDropdownIcon} onAction={openExternal('https://discord.gg/GeDqWr4jvr')}>
                Discord
              </Dropdown.Item>

              <Dropdown.Item icon={HelpCircle} onAction={navigateTo('/support')}>
                Support
              </Dropdown.Item>
            </Dropdown.Section>

            <Dropdown.Separator />

            <Dropdown.Item icon={Plus} onAction={navigateTo('/invite')}>
              Inviter un fondateur
            </Dropdown.Item>

            <Dropdown.Separator />

            <Dropdown.Item icon={LogOut01} onAction={handleLogout} className="text-red-600 hover:text-red-700">
              {logoutMutation.isPending ? 'Déconnexion...' : 'Déconnexion'}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown.Root>

      <FeedbackModal isOpen={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen} />
      <CreateStartupModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </>
  );
};

export default UserDropdown;
