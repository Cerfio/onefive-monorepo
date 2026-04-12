import ShimmerAvatar from "./shimmerAvatar";
import ShimmerBar from "./shimmerBar";
import ShimmerButton from "./shimmerButton";

const ShimmerCommentInput = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-[1px] w-full bg-gray-200" />
      <div className="flex gap-4 items-start">
        <ShimmerAvatar />
        <ShimmerBar className="h-20 w-[100%] rounded-md" />
      </div>
      <div className="w-full flex justify-end gap-6">
        <ShimmerButton />
        <ShimmerButton />
      </div>
      <div className="h-[1px] w-full bg-gray-200" />
    </div>
  );
};

export default ShimmerCommentInput;
