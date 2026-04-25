import { Button } from '@/components/base/buttons/button';
import Image from 'next/image';
import profile2 from '@/images/profile-yannis-1.jpg';
import linkedin from '@/images/linkedin.png';
import facebook from '@/images/facebook.webp';

const roles = ['Entrepreneur', 'Business Angel', 'Marketing', 'Commercial'];

export const SectionHeader = ({ currentUser }: { currentUser?: boolean }) => {
  return (
    <div className="grid grid-rows-13 gap-y-6 md:gap-y-0 md:grid-rows-3 grid-cols-8 md:px-4">
      {/* 1. ROW */}
      <div className="row-start-4 md:row-start-1 col-start-2 col-end-8 md:col-start-7 md:col-end-9 h-10 md:mt-5 mb-3 md:pb-14 ">
        <div className="flex ml-10 justify-center md:justify-end">
          {currentUser ? (
            <div>
              <div className="flex flex-col gap-4">
                {/* <Button label="Edit Profile" size="medium" /> */}
                <Button color="primary">Edit profile</Button>
              </div>
            </div>
          ) : (
            <div className="flex md:flex-row gap-3">
              <div className="hidden md:block">
                <Button color="secondary">...</Button>
              </div>
              <div>
                <Button className="w-max" color="secondary">
                  Send message
                </Button>
              </div>
              <div>
                <Button color="primary">Connect</Button>
              </div>
              <div className="md:hidden">
                <Button color="secondary">...</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* 2. ROW */}
      <div className="row-start-1 md:row-start-2 col-start-2 col-end-8 place-self-center mt-16 md:mt-6 flex flex-col gap-1">
        <div className="text-xl text-center text-gray-900 text-display-sm font-semibold">
          Yannis Coulibaly
        </div>
        <div className="text-center text-gray-600 text-md font-semibold">
          Founder of Maneo
        </div>
      </div>
      {/* 3. ROW */}
      <div className="row-start-3 col-start-2 col-end-8 md:col-start-1 md:col-end-3 flex justify-center items-center">
        <div className="flex flex-col-reverse md:flex-col items-center md:items-start md:gap-4">
          <div className="text-base mt-2 md:mt-0 font-semibold text-gray-500">
            🔥 8 day streak
          </div>
          <div className="flex gap-2">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 relative ring-2 ring-white rounded-full">
                <Image className="rounded-full" fill src={profile2} alt={''} />
              </div>
              <div className="w-6 h-6 relative ring-2 ring-white rounded-full">
                <Image className="rounded-full" fill src={profile2} alt={''} />
              </div>
              <div className="w-6 h-6 relative ring-2 ring-white rounded-full">
                <Image className="rounded-full" fill src={profile2} alt={''} />
              </div>
            </div>
            <div className="text-base md:text-lg font-semibold text-gray-500 line-clamp-1">
              162 relations en commun
            </div>
          </div>
        </div>
      </div>
      {/* 4. ROW */}
      <div className="row-start-2 md:row-start-3 col-start-2 col-end-8 md:col-start-7 md:col-end-9 flex justify-center items-center gap-1">
        <div className="flex flex-col">
          <div className="flex justify-center w-full md:justify-end">
            <div className="flex md:flex-col gap-3 justify-end">
              <div className="flex gap-1.5 justify-start items-center">
                <div className="relative w-7 h-7">
                  <Image fill src={linkedin} alt={''} />
                </div>
                <div className="font-medium text-gray-500">Linkedin</div>
              </div>
              <div className="flex gap-1.5 justify-start items-center">
                <div className="relative w-7 h-7">
                  <Image fill src={facebook} alt={''} />
                </div>
                <div className="font-medium text-gray-500">Facebook Campus</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 5. Row */}
      <div className="row-start-5 md:row-start-3 col-start-2 col-end-8 md:col-start-3 md:col-end-7 flex justify-center items-center gap-1">
        <div className="flex flex-row gap-3 flex-wrap justify-center">
          {roles.map((role, index) => (
            <div key={index} className="h-10">
              <Button color="secondary" className="line-clamp-1">
                {role}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
