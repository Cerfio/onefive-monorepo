import ShimmerBar from '@/components/shimmers/shimmerBar';
import ShimmerCommentInput from '@/components/shimmers/shimmerCommentInput';
import ShimmerAnswer from '@/components/shimmers/shimmerAnswer';
import ShimmerAvatar from '@/components/shimmers/shimmerAvatar';
import ShimmerButton from '@/components/shimmers/shimmerButton';
import SectionMore from '@/components/discussions/SectionMore';

const LoadingPage = () => {
  return (
    <div className="flex gap-8 animate-pulse">
      {/* Main content */}
      <div className="flex-1">
        {/* Discussion content card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex gap-12">
            <div className="cursor-pointer flex flex-col items-center gap-2 pt-8">
              <div className={'w-8 h-8 bg-gray-200 rounded-full'} />
              <div className="w-2 h-2 bg-gray-200 rounded-full" />
            </div>
            <div className="flex flex-col w-full gap-3">
              <ShimmerBar className="h-5 w-[100%]" />
              <div className="flex gap-3 mt-2">
                <ShimmerBar className="h-4 w-20" />
                <ShimmerBar className="h-4 w-20" />
              </div>
              <div className="flex gap-6 text-gray-900 text-sm font-medium text-muted-foreground mt-2">
                <ShimmerBar className="h-2 w-24" />
                <ShimmerBar className="h-2 w-14" />
                <ShimmerBar className="h-2 w-10" />
                <ShimmerBar className="h-2 w-14" />
              </div>
              <div className="pt-3 flex flex-col gap-2">
                <ShimmerBar className="h-2 w-[55%]" />
                <ShimmerBar className="h-2 w-[95%]" />
                <ShimmerBar className="h-2 w-[60%]" />
                <ShimmerBar className="h-2 w-[90%]" />
                <ShimmerBar className="h-2 w-[80%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Comment input card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <ShimmerCommentInput />
        </div>

        {/* Answers section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex gap-5 mb-6">
            <ShimmerBar className="h-2 w-48" />
            <ShimmerBar className="h-2 w-8" />
          </div>
          <div className="flex flex-col gap-6">
            <ShimmerAnswer />
            <ShimmerAnswer />
            <ShimmerAnswer />
            <ShimmerAnswer />
            <ShimmerAnswer />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 hidden lg:block">
        {/* Author card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col gap-2 items-center">
            <ShimmerAvatar />
            <ShimmerBar className="h-2 w-20" />
            <ShimmerBar className="h-2 w-32" />
          </div>
          <div className="flex gap-6 mt-3">
            <ShimmerButton />
            <ShimmerButton />
          </div>
        </div>

        {/* Share section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <ShimmerBar className="h-2 w-32 mb-4" />
          <div className="flex gap-2">
            <ShimmerButton className="w-24 h-8" />
            <ShimmerButton className="w-24 h-8" />
            <ShimmerButton className="w-24 h-8" />
          </div>
        </div>

        {/* More by author section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <ShimmerBar className="h-2 w-32 mb-4" />
          <SectionMore />
          <SectionMore />
        </div>
      </div>
    </div>
  );
};

export default LoadingPage; 