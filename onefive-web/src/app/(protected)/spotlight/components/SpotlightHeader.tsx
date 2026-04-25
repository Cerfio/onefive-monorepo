import { Button } from '@/components/base/buttons/button';
import { Star } from 'lucide-react';

interface SpotlightHeaderProps {
  data: any;
  search: string;
  onShare: () => void;
}

export const SpotlightHeader = ({ data, search, onShare }: SpotlightHeaderProps) => {
  return (
    <>
      <div className="flex w-full justify-between mt-28">
        <div className="flex flex-col gap-1">
          <div className="text-gray-700 font-semibold text-3xl">
            {data?.count || 0} stays in {search || 'cette région'}
          </div>
          <div className="text-gray-600 text-base font-normal">
            Retrouver tout l'écosystème entrepreneurial
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={onShare} color="secondary">
            Share
          </Button>
          <Button color="primary" iconLeading={<Star width={20} height={20} data-icon />}>
            Save search
          </Button>
        </div>
      </div>
      <div className="h-px w-full bg-gray-200 mt-6"></div>
    </>
  );
}; 