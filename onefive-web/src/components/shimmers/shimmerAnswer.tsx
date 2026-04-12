import ShimmerAvatar from "./shimmerAvatar";
import ShimmerBar from "./shimmerBar";

const ShimmerAnswer = () => {
  return (
    <div className="flex gap-4">
      <ShimmerAvatar />
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col gap-1">
          <ShimmerBar className="h-2 w-56" />
          <ShimmerBar className="h-2 w-40" />
        </div>
        <ShimmerBar className="h-2 w-full" />
        <div className="flex gap-8 font-medium text-gray-700 text-xs">
          <ShimmerBar className="h-2 w-12" />
          <ShimmerBar className="h-2 w-12" />
          <ShimmerBar className="h-2 w-12" />
          <ShimmerBar className="h-2 w-12" />
          <ShimmerBar className="h-2 w-28" />
        </div>
      </div>
    </div>
  );
};

export default ShimmerAnswer;
