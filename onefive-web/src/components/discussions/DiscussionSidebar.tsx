import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/base/buttons/button';
import { cardVariants } from './animations';
import DiscussionMiniProfile from './DiscussionMiniProfile';
import Image from 'next/image';
import linkedin from '@/images/linkedin.png';
import x from '@/images/x.png';
import { Users, Edit, MessageCircle, UserPlus, UserCheck } from 'lucide-react';
import { SpecificDiscussionInfer } from '@/queries/discussion';
import { selfProfileType } from '@/queries/profile';
import Link from 'next/link';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useToggleProfileFollow } from '@/hooks/useFollow';
import { useNavigateToConversation } from '@/hooks/useNavigateToConversation';

interface DiscussionSidebarProps {
  data: SpecificDiscussionInfer;
}

const DiscussionSidebar = ({ data }: DiscussionSidebarProps) => {
  const queryClient = useQueryClient();
  const profile = data.profile;
  const followProfile = useToggleProfileFollow();
  const { navigateToConversation, isLoading: isStartingConversation } =
    useNavigateToConversation();
  
  // État local pour le suivi - initialisé avec la valeur du backend
  const [isFollowing, setIsFollowing] = useState(profile?.isFollowing ?? false);
  
  // Synchroniser l'état local avec les données du cache (si modifié depuis une answer)
  useEffect(() => {
    setIsFollowing(profile?.isFollowing ?? false);
  }, [profile?.isFollowing]);
  
  // Récupérer le profil de l'utilisateur connecté
  const currentUser = queryClient.getQueryData(['selfProfile']) as selfProfileType | undefined;
  
  // Vérifier si l'utilisateur connecté est l'auteur de la discussion
  const isOwnProfile = currentUser && profile && currentUser.id === profile.id;

  // Fonction pour mettre à jour le cache de la discussion
  const updateDiscussionCache = (profileId: string, newFollowingState: boolean) => {
    const queryCache = queryClient.getQueryCache();
    const discussionQueries = queryCache.findAll({ queryKey: ['discussion'] });
    
    // Calculer le delta pour followedBy (+1 si follow, -1 si unfollow)
    const followedByDelta = newFollowingState ? 1 : -1;
    
    discussionQueries.forEach((query) => {
      queryClient.setQueryData(query.queryKey, (oldData: SpecificDiscussionInfer | undefined) => {
        if (!oldData) return oldData;
        
        const updateProfile = (p: typeof oldData.profile) => {
          if (!p || p.id !== profileId) return p;
          return {
            ...p,
            isFollowing: newFollowingState,
            followedBy: Math.max(0, p.followedBy + followedByDelta),
          };
        };
        
        return {
          ...oldData,
          profile: updateProfile(oldData.profile),
          answers: oldData.answers.map((answer) => ({
            ...answer,
            profile: updateProfile(answer.profile),
            replies: answer.replies.map((reply) => ({
              ...reply,
              profile: updateProfile(reply.profile),
            })),
          })),
        };
      });
    });
  };

  // Fonction pour gérer le suivi
  const handleFollow = () => {
    if (!profile) return;
    
    const newFollowingState = !isFollowing;
    followProfile.toggle(profile.id, isFollowing);
    setIsFollowing(newFollowingState);
    
    // Mettre à jour le cache pour synchroniser tous les profils
    updateDiscussionCache(profile.id, newFollowingState);
  };

  // Fonction pour copier le lien
  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL_PUBLIC}/discussions/${data.id}`,
    );
    toast.success('Lien copié !');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ delay: 0.3, duration: 0.6 }}
      className="w-80 hidden lg:block space-y-6"
    >
      {/* Author card */}
      {profile && (
        <motion.div 
          variants={cardVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex flex-col items-center">
            <DiscussionMiniProfile
              profileId={profile.id}
              firstName={profile.firstName}
              lastName={profile.lastName}
              avatar={profile.avatar || ''}
              highlight={profile.highlight}
              bio={profile.bio}
              isFollowing={isFollowing}
              countryCode={profile.countryCode ?? undefined}
              ecosystemRoles={profile.ecosystemRoles}
              streak={profile.streak}
              stats={{ followers: profile.followedBy, following: profile.following ?? 0, posts: profile.postsCount ?? 0 }}
              size="xl"
            />
            <Link 
              href={`/profile/${profile.id}`}
              className="font-bold mt-2 cursor-pointer hover:text-blue-600 transition-colors"
            >
              {`${profile.firstName} ${profile.lastName}`}
            </Link>
            {/* Bio / Highlight */}
            {profile.highlight && (
              <div className="text-sm text-gray-500 text-center mt-1">
                {profile.highlight}
              </div>
            )}
            {/* Statistiques - abonnés uniquement (les autres stats ne sont pas disponibles via l'API) */}
            <div className="flex justify-center mt-3 w-full">
              <div className="text-center p-2 rounded bg-gray-50 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <div className="text-sm font-bold text-gray-900">{profile.followedBy}</div>
                <div className="text-xs text-gray-600">abonnés</div>
              </div>
            </div>
            {/* Actions - différentes si c'est son propre profil */}
            {isOwnProfile ? (
              <div className="flex flex-col gap-2 mt-4 w-full">
                <div className="text-center text-xs text-gray-500 mb-1">
                  C&apos;est votre discussion
                </div>
                <Link href={`/profile/${profile.id}`} className="w-full">
                  <Button className="w-full" color="secondary" iconLeading={<Edit className="w-4 h-4" data-icon />}>
                    Modifier mon profil
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex gap-3 mt-4 w-full">
                  <Button 
                    className="flex-1" 
                    color={isFollowing ? "secondary" : "primary"}
                    onClick={handleFollow}
                    isDisabled={followProfile.isLoading}
                    iconLeading={isFollowing ? <UserCheck className="w-4 h-4" data-icon /> : <UserPlus className="w-4 h-4" data-icon />}
                  >
                    {followProfile.isLoading ? '...' : (isFollowing ? 'Suivi' : 'Suivre')}
                  </Button>
                  <Button
                    className="flex-1"
                    color="secondary"
                    iconLeading={<MessageCircle className="w-4 h-4" data-icon />}
                    onClick={() => profile?.id && navigateToConversation(profile.id)}
                    isDisabled={isStartingConversation || !profile?.id}
                  >
                    {isStartingConversation ? '...' : 'Message'}
                  </Button>
                </div>
                <Link href={`/profile/${profile.id}`} className="w-full">
                  <Button className="w-full mt-2" color="tertiary">
                    Voir le profil
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Message si pas de profil */}
      {!profile && (
        <motion.div 
          variants={cardVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="text-center text-gray-500 text-sm">
            Auteur inconnu
          </div>
        </motion.div>
      )}

      {/* Share section */}
      <motion.div 
        variants={cardVariants}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="text-xs font-semibold text-gray-700 mb-4">
          PARTAGER CETTE DISCUSSION
        </div>
        <div className="flex gap-2">
          <a 
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_URL_PUBLIC}/discussions/${data.id}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <div className="relative w-4 h-4">
              <Image fill src={linkedin} alt="LinkedIn" />
            </div>
            <div className="text-sm text-blue-700 font-medium">LinkedIn</div>
          </a>
          <a 
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_URL_PUBLIC}/discussions/${data.id}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <div className="relative w-4 h-4">
              <Image fill src={x} alt="Twitter" />
            </div>
            <div className="text-sm text-gray-700 font-medium">Twitter</div>
          </a>
          <button
            onClick={handleCopyLink}
            className="bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          >
            <div className="text-sm text-gray-700 font-medium">Copier le lien</div>
          </button>
        </div>
      </motion.div>

      {/* Section "Plus de cet auteur" - masquée en attendant l'API dédiée
      {profile && (
        <motion.div 
          variants={cardVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="text-xs font-semibold text-gray-700 mb-4">
            {isOwnProfile 
              ? 'MES AUTRES DISCUSSIONS' 
              : `PLUS DE ${profile.firstName.toUpperCase()} ${profile.lastName.toUpperCase()}`
            }
          </div>
          <section className="space-y-4">
            // TODO: Afficher les autres discussions de l'auteur quand l'API sera disponible
          </section>
        </motion.div>
      )}
      */}
    </motion.div>
  );
};

export default DiscussionSidebar; 