import { type IconProps, SvgIcon } from "@/components/icons/_iconShared";

export default function ChevronDown({ className, ...props }: IconProps) {
  return (
    <SvgIcon className={className} {...props}>
      <path d="m6 9 6 6 6-6" />
    </SvgIcon>
  );
}
