import Image from "next/image";

interface MessageCardProps {
  avatarSrc: string;
  avatarAlt: string;
  name: string;
  timestamp: string;
  message: string;
}

export function MessageCard({
  avatarSrc,
  avatarAlt,
  name,
  timestamp,
  message,
}: MessageCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex w-[339px] px-[16px] pr-[22px] py-[16px] items-start gap-4">
      <div className="flex w-[40px] h-[40px] justify-end items-center relative">
        <Image
          src={avatarSrc}
          alt={avatarAlt}
          className="rounded-full"
          width={40}
          height={40}
        />
        <div className="absolute border-[1.5px] border-white bottom-[0.1rem] right-[0.1rem] bg-[#12B76A] rounded-full w-3 h-3"></div>
      </div>
      <div className="flex flex-col pt-0.5 items-start gap-1 w-full">
        <div className="flex items-center gap-2 self-stretch">
          <div className="flex items-center gap-2 self-stretch">
            <div className="text-[#101828] text-sm font-semibold leading-5">{name}</div>
            <div className="text-[#667085] text-sm font-normal leading-5">{timestamp}</div>
          </div>
        </div>
        <div className="text-[#475467] text-sm font-normal leading-5">
          {message}
        </div>
      </div>
    </div>
  );
} 