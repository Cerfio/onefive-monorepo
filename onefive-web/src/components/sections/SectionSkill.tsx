import { ChevronsUpDown, Pencil, Plus } from 'lucide-react';
import { CardSkill } from '../cards/CardSkill';

export const SectionSkill = ({ currentUser }: { currentUser?: boolean }) => {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-72 text-gray-900 font-medium mb-2 md:mb-0">Skills</div>
      <div className="flex w-full flex-col items-center">
        {currentUser && (
          <div className="flex w-full justify-end gap-3 items-center text-gray-600">
            <div className="cursor-pointer hover:scale-105 transform transition-transform">
              {/* Check color */}
              <Plus width={24} height={24} />
            </div>
            <div className="cursor-pointer hover:scale-105 transform transition-transform">
              <Pencil width={24} height={24} />
            </div>
            <div className="cursor-pointer hover:scale-105 transform transition-transform">
              {/* <ChevronSelectorVerticalIcon title="" /> */}
              <ChevronsUpDown width={24} height={24} />
            </div>
          </div>
        )}
        <div
          className={`flex w-full flex-col gap-8 ${currentUser ? 'mt-6' : ''}`}
        >
          {/* Card */}
          <CardSkill />
          <CardSkill />
          <CardSkill />
        </div>
      </div>
    </div>
  );
};
