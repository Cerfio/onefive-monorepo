import { useTranslations } from "next-intl";
import Image from 'next/image'
import profile2 from '@/images/profile-yannis-1.jpg';
import { Button } from "@/components/base/buttons/button";
import { DotComplete } from "../dots/dot-complete";

export const ProfileCard = ({
  isFollow,
  callback,
  profile,
}: {
  isFollow: boolean;
  callback: (profileId: string, isFollow: boolean) => void;
  profile: {
    id: string;
    firstname: string;
    lastname: string;
    highlight?: string;
  };
}) => {
  const t = useTranslations('onboarding.profileCard');
  return (
    <div className="w-[200px] h-[208px] pb-6 rounded-xl border border-gray-200">
      <div className="w-full bg-red-500 h-[60px] rounded-t-xl flex flex-col justify-end items-center relative">
        <div className="aspect-square h-full ring-4 ring-white rounded-full absolute top-[50%]">
          <Image
            className="rounded-full"
            style={{ objectFit: 'cover' }}
            fill
            src={profile2}
            alt={''}
          />
        </div>
      </div>
      <div className="pt-[36px] flex flex-col items-center justify-center pl-1 pr-1">
        <div className="text-sm text-gray-900 font-semibold text-center">
          {t('firstnameAndLastname', {
            firstname: profile.firstname,
            lastname: profile.lastname,
          })}
        </div>
        <div className="text-xs text-gray-600 font-semibold mt-1 text-center h-8 w-full truncate">
          {profile.highlight}
        </div>
        {isFollow ? (
          <div
            className="mt-[10px] cursor-pointer"
            onClick={() => {
              callback(profile.id, false);
            }}
          >
            <DotComplete />
          </div>
        ) : (
          <Button
            className="mt-2 text-sm font-semibold"
            onClick={() => {
              callback(profile.id, true);
            }}
          >
            {t('follow')}
          </Button>
        )}
      </div>
    </div>
  );
};
