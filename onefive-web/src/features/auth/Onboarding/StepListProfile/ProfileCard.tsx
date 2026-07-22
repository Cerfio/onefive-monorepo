"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/base/card/card";
import Image from "next/image";
import { UserCheck, Users } from "lucide-react";
import { Flag } from "@/components/ui/flag";
import { Tooltip } from "@/components/base/tooltip/tooltip";
import { Button } from "@/components/base/buttons/button";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4  }
  },
  selected: {
    scale: 1.02,
    boxShadow: "0 20px 25px -5px rgba(94, 106, 210, 0.1)",
    transition: { duration: 0.2 }
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const ProfileCard = ({
  isFollow,
  callback,
  profile
}: {
  isFollow: boolean;
  callback: (profileId: string, isFollow: boolean) => void;
  profile: {
    id: string;
    firstname: string;
    lastname: string;
    job: string;
    enterprise: string;
    avatar?: string;
    intention: string;
    location: string;
    countryCode: string;
  };
}) => {
  const t = useTranslations("onboarding.profileCard");
  const fullName = `${profile.firstname} ${profile.lastname}`;

  // Mapper les intentions aux configurations
  const getIntentionConfig = (intention: string) => {
    const configs = {
      cofounder: { text: t("intention.cofounder"), color: "text-blue-600" },
      mentor: { text: t("intention.mentor"), color: "text-yellow-600" },
      opportunities: { text: t("intention.opportunities"), color: "text-purple-600" }
    };
    return configs[intention as keyof typeof configs] || configs.cofounder;
  };

  const intentionConfig = getIntentionConfig(profile.intention);

  return (
    <motion.div
      variants={cardVariants}
      layout="position"
      animate={isFollow ? "selected" : "visible"}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="h-full group hover:border-[#5E6AD2] transition-all duration-300 hover:shadow-xl hover:shadow-[#5E6AD2]/10 cursor-pointer relative overflow-hidden flex flex-col">
        <CardContent className="p-6 flex flex-col items-center text-center relative z-10 flex-1">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={fullName}
                width={64}
                height={64}
                className="rounded-full mb-4 ring-2 ring-transparent group-hover:ring-[#5E6AD2]/20 transition-all duration-300 object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full mb-4 ring-2 ring-transparent group-hover:ring-[#5E6AD2]/20 transition-all duration-300 bg-[#5E6AD2]/10 flex items-center justify-center text-[#5E6AD2] font-semibold text-lg">
                {profile.firstname?.[0]}{profile.lastname?.[0]}
              </div>
            )}
          </motion.div>

          <div className="mb-3">
            <h3 className="font-semibold text-lg text-[#101828] mb-1 group-hover:text-[#5E6AD2] transition-colors">
              {fullName}
            </h3>
            <p className="text-sm text-[#475467] truncate">
              {profile.job}{profile.enterprise ? ` @ ${profile.enterprise}` : ""}
            </p>
          </div>

          {/* Social Context Section */}
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-xs text-gray-500 mb-4 h-8">
            <button
              className={`flex items-center gap-1.5 hover:underline ${intentionConfig.color}`}
            >
              <Users className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{intentionConfig.text}</span>
            </button>
          </div>

          <div className="flex-1" />

          {/* Logos des dernières expériences et formations */}
          <div className="flex gap-2 mb-3 justify-center">
            <div className="flex items-center gap-1.5 text-xs text-[#475467]">
              <div className="h-5 w-5 rounded-md flex items-center justify-center bg-gray-100">
                <div className="w-3 h-3 bg-gray-300 rounded-sm flex items-center justify-center text-xs text-gray-600">
                  {profile.enterprise.charAt(0).toUpperCase()}
                </div>
              </div>
              <span className="text-xs text-[#475467] truncate max-w-[80px]">
                {profile.enterprise}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#475467] mb-3">
            <Flag countryCode={profile.countryCode} width={16} height={12} />
            <span>{profile.location}</span>
          </div>

          <div className="w-full">
            <Tooltip
              delay={200}
              title={t("followTooltip")}
            >
              <Button
                size="sm"
                color={isFollow ? "primary" : "tertiary"}
                className="text-xs gap-1 py-1 px-2 w-full"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  callback(profile.id, !isFollow);
                }}
                aria-label={t("followAria", { name: fullName })}
                aria-pressed={isFollow}
              >
                <UserCheck className="h-3 w-3" />
                {isFollow ? t("following") : t("follow")}
              </Button>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileCard;
