import { type IconProps, SvgIcon } from "@/components/icons/_iconShared";

export default function ChevronUp({ className, ...props }: IconProps) {
  return (
    <SvgIcon className={className} {...props}>
      <path d="m18 15-6-6-6 6" />
    </SvgIcon>
  );
}
