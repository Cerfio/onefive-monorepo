import type { FormEvent, HTMLAttributes } from "react";
import { Paperclip, Smile, Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/base/textarea/textarea";
import { cn } from "@/lib/utils";
import { VALIDATION_LIMITS } from "@/constants/validation-limits";

type MessageActionTextareaProps = {
  onSendMessage?: (message: string) => void;
  textAreaClassName?: string;
} & HTMLAttributes<HTMLFormElement>;

export const MessageActionTextarea = ({
  onSendMessage,
  className,
  textAreaClassName,
  ...props
}: MessageActionTextareaProps) => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const message = formData.get("message") as string;
    onSendMessage?.(message);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <form
      className={cn("relative flex h-max items-center gap-3", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <TextArea
        aria-label="Message"
        placeholder="Message"
        name="message"
        maxLength={VALIDATION_LIMITS.MESSAGING.MESSAGE_CONTENT_MAX}
        className={cn("h-32 w-full resize-none pr-24", textAreaClassName)}
      />

      <div className="absolute right-3.5 bottom-2 flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Smile className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Mic className="h-4 w-4" />
          </Button>
        </div>

        <Button size="sm" color="link-color">
          Send
          <Send className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}; 