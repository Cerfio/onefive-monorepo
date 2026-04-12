interface AchievementCardProps {
  message: string;
  emoji?: string;
}

export function AchievementCard({ message, emoji = "🧠" }: AchievementCardProps) {
  return (
    <div className="flex p-2 justify-center items-center gap-2 rounded-[0_8px_8px_8px] border-[0.1px] border-[#F2F4F7] bg-white shadow-[0px_4px_24px_8px_#F0F1F1] max-w-fit max-h-fit">
      <div className="text-[#101828] text-xs font-normal leading-[18px]">
        {message} {emoji}
      </div>
    </div>
  );
} 