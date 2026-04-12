import ShimmerBar from '@/components/shimmers/shimmerBar';
import { Triangle } from 'lucide-react';

const SectionMore = () => {
  return (
    <>
      <div className="mt-20">
        <ShimmerBar className="h-2 w-32" />
      </div>
      <section className="w-full">
        <div>
          <div className="mt-6">
            <ShimmerBar className="h-2 w-full" />
          </div>
          <div className="flex w-full justify-start items-center gap-2 text-sm text-gray-700 mt-2 pl-2">
            <Triangle className="w-2 h-2 stroke-gray-200 fill-gray-200" />
            <ShimmerBar className="h-2 w-32" />
          </div>
        </div>
        <div>
          <div className="mt-6">
            <ShimmerBar className="h-2 w-[100%]" />
          </div>
          <div className="flex w-full justify-start items-center gap-2 text-sm text-gray-700 mt-2 pl-2">
            <Triangle className="w-2 h-2 stroke-gray-200 fill-gray-200" />
            <ShimmerBar className="h-2 w-32" />
          </div>
        </div>
        <div>
          <div className="mt-6">
            <ShimmerBar className="h-2 w-[100%]" />
          </div>
          <div className="flex w-full justify-start items-center gap-2 text-sm text-gray-700 mt-2 pl-2">
            <Triangle className="w-2 h-2 stroke-gray-200 fill-gray-200" />
            <ShimmerBar className="h-2 w-32" />
          </div>
        </div>
        <div>
          <div className="mt-6">
            <ShimmerBar className="h-2 w-[100%]" />
          </div>
          <div className="flex w-full justify-start items-center gap-2 mt-2 pl-2">
            <Triangle className="w-2 h-2 stroke-gray-200 fill-gray-200" />
            <ShimmerBar className="h-2 w-32" />
          </div>
        </div>
      </section>
    </>
  );
};

export default SectionMore; 