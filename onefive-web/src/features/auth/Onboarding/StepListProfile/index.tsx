"use client";
import { useOnboardingContext } from "../OnboardingContext";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import ProfileCard from "./ProfileCard";
import { enhancedCardVariants, enhancedContainerVariants } from "../constant";
import { useProfileSuggestions } from "@/hooks/useFeedExtra";

const StepListProfile = () => {
  const { data: suggestedProfiles, isLoading } = useProfileSuggestions(8, 0);

  // Map API data to the shape expected by ProfileCard
  const profiles = (suggestedProfiles ?? []).map((p) => ({
    id: p.id,
    firstname: p.firstName,
    lastname: p.lastName,
    job: p.ecosystemRoles?.[0] ?? "",
    enterprise: p.highlight ?? "",
    avatar: p.avatar,
    intention: mapRoleToIntention(p.ecosystemRoles),
    location: "",
    countryCode: p.countryCode ?? "",
  }));

  const { setProfileFollowed, profileFollowed, setButtonDisabled } =
    useOnboardingContext();

  useEffect(() => {
    // Toujours permettre de continuer, même sans suivre de profils (skip optionnel)
    setButtonDisabled(false);
  }, [setButtonDisabled]);

  const callback = useCallback(
    (profileId: string, isFollow: boolean) => {
      // Pendant l'onboarding, pas de profil encore — on met à jour uniquement le state local.
      // Les follows seront créés à la création du profil via followProfileIds.
      if (isFollow) {
        toast.success("Profil ajouté à votre feed !");
        setProfileFollowed((prev) => [...prev, profileId]);
      } else {
        toast.info("Profil retiré de votre feed");
        setProfileFollowed((prev) => prev.filter((id) => id !== profileId));
      }
    },
    [setProfileFollowed]
  );

  const totalProfiles = profiles.length || 8;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8"
      >
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#101828] mb-2">
          Découvrez des entrepreneurs inspirants
        </h2>
        <p className="text-sm sm:text-base text-[#475467] px-2">
          Suivez au moins 3 profils qui vous intéressent pour voir leurs
          actualités dans votre feed
        </p>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#475467]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-[#5E6AD2] rounded-full"></div>
            <span>Suivi</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>
            {profileFollowed.length}/{totalProfiles} profil
            {profileFollowed.length > 1 ? "s" : ""} sélectionné
            {profileFollowed.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 max-w-md mx-auto px-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-[#5E6AD2] h-2 rounded-full transition-all duration-300"
              initial={{ width: 0 }}
              animate={{ width: `${(profileFollowed.length / Math.max(totalProfiles, 1)) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            {profileFollowed.length < 3 ? (
              <span className="text-orange-600">
                Il vous faut encore {3 - profileFollowed.length} profil
                {3 - profileFollowed.length > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-green-600">
                Parfait ! Vous pouvez continuer
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Cards Grid */}
      <motion.div
        variants={enhancedContainerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6"
      >
        <AnimatePresence mode="wait">
          {isLoading
            ? // Skeleton loading
              Array.from({ length: totalProfiles }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  variants={enhancedCardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <ProfileCardSkeleton />
                </motion.div>
              ))
            : // Actual profiles
              profiles.map((profile, _index) => (
                <motion.div
                  key={profile.id}
                  variants={enhancedCardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <ProfileCard
                    isFollow={profileFollowed.includes(profile.id)}
                    profile={profile}
                    callback={callback}
                  />
                </motion.div>
              ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default StepListProfile;

/**
 * Maps ecosystem roles to an intention category for display.
 */
function mapRoleToIntention(roles: string[] = []): string {
  const lower = roles.map((r) => r.toLowerCase());
  if (lower.some((r) => r.includes("mentor") || r.includes("advisor"))) return "mentor";
  if (lower.some((r) => r.includes("founder") || r.includes("cofounder") || r.includes("ceo"))) return "cofounder";
  return "opportunities";
}

const ProfileCardSkeleton = () => (
  <div className="animate-pulse">
    <Card className="h-full">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
        <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
        <div className="w-32 h-3 bg-gray-200 rounded mb-4"></div>
        <div className="w-20 h-3 bg-gray-200 rounded mb-4"></div>
        <div className="w-16 h-3 bg-gray-200 rounded mb-3"></div>
        <div className="w-full h-8 bg-gray-200 rounded"></div>
      </CardContent>
    </Card>
  </div>
);
