import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import Image, { StaticImageData } from 'next/image'
import { useTranslations } from "next-intl";

export const StartupCard = ({
    isFollow,
    callback,
    startup,
  }: {
    isFollow: boolean;
    callback: (startupId: string, isFollow: boolean) => void;
    startup: {
      id: string;
      name: string;
      tags: string[];
      logo: string | StaticImageData;
    };
  }) => {
    const t = useTranslations('onboarding.startupCard');
    return (
      <div className="w-[200px] h-[208px] pb-6 rounded-xl border border-gray-200">
        <div className="w-full bg-red-500 h-[60px] rounded-t-xl flex flex-col justify-end items-center relative">
          <div className="aspect-square h-full ring-4 ring-white rounded-sm relative top-[50%]">
            <Image
              className="rounded-sm"
              fill
              style={{ objectFit: 'cover' }}
              src={startup.logo}
              alt={''}
            />
          </div>
        </div>
        <div className="pt-[36px] flex flex-col items-center justify-center">
          <div className="text-sm text-gray-900 font-semibold">
            {startup.name}
          </div>
          <div className="mt-1 flex gap-3">
            {startup.tags.map((tag, index) => (
              <Badge
                key={index}
                type="pill-color" color="brand"
                className="text-xs font-normal flex gap-1 items-center w-fit bg-error-50 text-error-700"
              >
                {tag}
              </Badge>
            ))}
          </div>
          {isFollow ? (
            <div
              className="mt-[10px] cursor-pointer"
              onClick={() => {
                callback(startup.id, false);
              }}
            >
              {/* <ProgressStepDotComplete /> */}
            </div>
          ) : (
            <Button
              className="mt-2 text-sm font-semibold"
              onClick={() => {
                callback(startup.id, true);
              }}
            >
              {t('follow')}
            </Button>
          )}
        </div>
      </div>
    );
  };