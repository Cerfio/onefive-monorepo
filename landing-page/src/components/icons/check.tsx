import { type IconProps, SvgIcon } from "@/components/icons/_iconShared";

export default function CheckIcon({ className, ...props }: IconProps) {
  return (
    <SvgIcon className={className} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </SvgIcon>
  );
}
