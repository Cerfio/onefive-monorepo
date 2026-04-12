import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import linkedin from '@/images/linkedin.png';
import FlagAUIcon from '@/flags/AU.svg';

export const CardExperience = () => (
  <div className="flex border border-gray-200 drop-shadow-sm flex-col bg-white rounded-xl gap-4">
    <div className="flex flex-col p-6 border">
      <div className="grid grid-cols-12 grid-rows-2 lg:grid-rows-1 w-full items-center mb-3 md:mb-6">
        <div className="col-start-1 col-end-13 md:col-end-13 row-start-1">
          <div className="flex space-x-2">
            <div className="relative w-12 h-12 shrink-0">
              <Image src={linkedin} alt={''} fill />
            </div>
            <div className="flex flex-col w-full">
              <div className="text-gray-900 font-medium">
                Lead Product Designer
              </div>
              <div className="text-gray-600 font-normal text-sm">
                Linkedin · Permanent
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="row-start-2 lg:row-start-1 col-start-1 col-end-13 lg:col-start-13 flex justify-evenly md:space-x-4">
          <div className="h-7 ">
            <Badge>Network</Badge>
          </div>
          <div className="h-7">
            <Badge>Fintech</Badge>
          </div>
          <div className="h-7">
            <Badge>Rhtech</Badge>
          </div>
          <div className="h-7">
            <Badge>Edutech</Badge>
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-3 w-full">
          <div className="text-gray-600 font-normal text-sm">
            May 2020 - Present · 2 ans 2 mois
          </div>
          <div className="flex gap-2 items-center">
            <Image
              src={FlagAUIcon}
              alt={'Canada Flag'}
              width={20}
              height={20}
            />
            <div className="text-gray-700 font-medium text-md">
              Montréal, Canada
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-gray-900 font-normal text-xs">
            e.g. I joined Stripe's Customer Success team to help them scale
            their checkout product. I focused mainly on onboarding new customers
            and resolving complaints.e.g. I joined Stripe's Customer Success
            team to help them scale their checkout product. I focused mainly on
            onboarding new customers a...
          </div>
          <div className="w-fit transition-all ease duration-500 cursor-pointer hover:text-primary-500 text-primary-700 text-sm font-semibold">
            Read more
          </div>
        </div>
      </div>
    </div>
  </div>
);
