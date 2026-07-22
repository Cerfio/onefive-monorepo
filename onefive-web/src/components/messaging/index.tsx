import {
    AlertCircle,
    Check,
    ClockCheck,
    File01 as File,
    Image01 as Image,
    DotsHorizontal as MoreHorizontal,
    MusicNote01 as Music,
    VideoRecorder as Video,
    Copy01 as Copy,
    Edit01 as Edit,
    Trash02 as Trash2,
    MessageChatSquare as MessageSquare,
    X,
    Check as CheckIcon,
  } from "@untitledui/icons";
  import type { HTMLAttributes, ReactNode } from "react";
  import { useState, useRef, useEffect } from "react";

  import {
    Tooltip,
    TooltipTrigger,
  } from "@/components/base/tooltip/tooltip";
  import { cn } from "@/lib/utils";
import { Avatar } from "../base/avatar/avatar";
import { Button } from "../base/buttons/button";
import { TextArea } from "../base/textarea/textarea";
  
  /* -------------------------------------------------------------------------- */
  /*                                    TYPES                                   */
  /* -------------------------------------------------------------------------- */
  
  const _ATTACHMENT_TYPES = ["pdf", "doc", "xls", "ppt", "zip", "audio", "video"];
  
  type Attachment = {
    type: (typeof _ATTACHMENT_TYPES)[number] | string;
    name: string;
    size: string;
  };
  
  type Image = {
    src: string;
    alt: string;
    name: string;
    size: string;
  };
  
  type UrlPreview = {
    title: string;
    description: string;
  };
  
  export type Message = {
    id: string;
    sentAt?: string;
    readAt?: string;
    status?: "sent" | "read" | "failed";
    text?: ReactNode;
    user: {
      name: string;
      avatarUrl?: string;
      status?: "online" | "offline";
      me?: boolean;
    };
    reactions?: {
      content: ReactNode;
      emoji?: string;
      count: number;
      users?: string[];
      reactedByMe?: boolean;
    }[];
    reply?: {
      text: string;
    };
    attachment?: Attachment;
    image?: Image;
    urlPreview?: UrlPreview;
    typing?: boolean;
    editedAt?: string;
    senderId?: string;
  };
  
  /* -------------------------------------------------------------------------- */
  /*                               MESSAGE STATUS                               */
  /* -------------------------------------------------------------------------- */
  
  type MessageStatusProps = {
    status?: "sent" | "read" | "failed";
    readAt?: string;
  };
  
  export const MessageStatus = ({ status, readAt }: MessageStatusProps) => {
    const content =
      status === "sent"
        ? "Sent"
        : status === "read"
        ? readAt
          ? `Read at ${readAt}`
          : "Read"
        : "Failed to send";
  
    const icon =
      status === "sent" ? (
        <Check className="size-4 text-gray-500" />
      ) : status === "read" ? (
        <ClockCheck className="size-4 text-blue-500" />
      ) : (
        <AlertCircle className="size-4 text-red-500" />
      );
  
    return (
      <Tooltip title={content}>
        <TooltipTrigger>{icon}</TooltipTrigger>
      </Tooltip>
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                             MESSAGE EDIT FORM                             */
  /* -------------------------------------------------------------------------- */

  type MessageEditFormProps = {
    message: Message;
    onSave: (messageId: string, newText: string) => void;
    onCancel: () => void;
  };

  const MessageEditForm = ({ message, onSave, onCancel }: MessageEditFormProps) => {
    const [editText, setEditText] = useState(
      typeof message.text === 'string' ? message.text : ''
    );

    useEffect(() => {
      // Auto-focus the textarea when editing starts
      const textarea = document.querySelector('.message-edit-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(editText.length, editText.length);
      }
    }, [editText.length]);

    const handleSave = () => {
      if (editText.trim() && editText !== message.text) {
        onSave(message.id, editText.trim());
      } else {
        onCancel();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        onCancel();
      }
    };

    return (
      <div className="flex flex-col gap-2">
        <TextArea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[80px] resize-none message-edit-textarea"
          placeholder="Modifiez votre message..."
        />
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            color="secondary"
            onClick={onCancel}
            iconLeading={X}
          >
            Annuler
          </Button>
          <Button
            size="sm"
            color="primary"
            onClick={handleSave}
            iconLeading={CheckIcon}
            isDisabled={!editText.trim() || editText === message.text}
          >
            Sauvegarder
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Appuyez sur Entrée pour sauvegarder, Échap pour annuler
        </p>
      </div>
    );
  };
  
  /* -------------------------------------------------------------------------- */
  /*                                MESSAGE ITEM                                */
  /* -------------------------------------------------------------------------- */
  
  type MessageItemProps = {
    msg: Message;
    isEditing?: boolean;
    onCopy?: (message: Message) => void;
    onEdit?: (message: Message) => void;
    onSaveEdit?: (messageId: string, newText: string) => void;
    onCancelEdit?: () => void;
    onReply?: (message: Message) => void;
    onDelete?: (message: Message) => void;
    onReact?: (emoji: string) => void;
    onToggleReaction?: (emoji: string, reactedByMe: boolean) => void;
    onAvatarClick?: () => void;
  } & HTMLAttributes<HTMLLIElement>;
  
  export const MessageItem = ({
    msg,
    isEditing = false,
    onCopy,
    onEdit,
    onSaveEdit,
    onCancelEdit,
    onReply,
    onDelete,
    onReact,
    onToggleReaction,
    onAvatarClick,
    className,
    ...props
  }: MessageItemProps) => {
    if (msg.user.me) {
      return (
        <MessageFromMe 
          msg={msg} 
          isEditing={isEditing}
          onCopy={onCopy} 
          onEdit={onEdit} 
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onReply={onReply} 
          onDelete={onDelete} 
          onReact={onReact}
          onToggleReaction={onToggleReaction}
          className={className} 
          {...props} 
        />
      );
    }
  
    return (
      <MessageFromOther 
        msg={msg} 
        isEditing={isEditing}
        onCopy={onCopy} 
        onEdit={onEdit} 
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
        onReply={onReply} 
        onDelete={onDelete} 
        onReact={onReact}
        onToggleReaction={onToggleReaction}
        onAvatarClick={onAvatarClick}
        className={className} 
        {...props} 
      />
    );
  };
  
  /* -------------------------------------------------------------------------- */
  /*                                MESSAGE PARTS                               */
  /* -------------------------------------------------------------------------- */
  
  const MessageTyping = ({
    className,
    ...props
  }: HTMLAttributes<HTMLDivElement>) => {
    return (
      <div
        className={cn(
          "flex items-center gap-1 rounded-full bg-gray-200 py-2 px-3",
          className
        )}
        {...props}
      >
        <span className="size-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-gray-500" />
      </div>
    );
  };
  
  const MessageReply = ({
    text,
    className,
    ...props
  }: { text: string } & HTMLAttributes<HTMLQuoteElement>) => {
    return (
      <blockquote
        className={cn(
          "w-full rounded-lg border-l-2 border-blue-500 bg-gray-100 p-2.5 text-sm text-gray-600",
          className
        )}
        {...props}
      >
        {text}
      </blockquote>
    );
  };
  
  const MessageReactions = ({
    reactions,
    onReactionToggle,
    className,
    ...props
  }: {
    reactions: Message["reactions"];
    onReactionToggle?: (emoji: string, reactedByMe: boolean) => void;
  } & HTMLAttributes<HTMLUListElement>) => {
    if (!reactions || reactions.length === 0) {
      return null;
    }
  
    return (
      <ul
        className={cn("flex items-center gap-1.5", className)}
        aria-label="Reactions"
        {...props}
      >
        {reactions.map(({ content, emoji, count, users, reactedByMe }) => {
          // L'emoji brut sert de clé de toggle ; `content` peut être un ReactNode.
          const rawEmoji = emoji ?? (typeof content === "string" ? content : "");
          return (
            <li key={`${rawEmoji}-${count}`}>
              <Tooltip title={users && users.length > 0 ? users.join(', ') : `${count} réaction${count > 1 ? 's' : ''}`}>
                <TooltipTrigger>
                  <button
                    type="button"
                    onClick={
                      onReactionToggle && rawEmoji
                        ? () => onReactionToggle(rawEmoji, Boolean(reactedByMe))
                        : undefined
                    }
                    className={cn(
                      "flex items-center gap-1 rounded-full border py-0.5 px-1.5 text-xs transition-colors",
                      reactedByMe
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    <span>{content}</span>
                    <span className="font-medium">{count}</span>
                  </button>
                </TooltipTrigger>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    );
  };
  
  const MessageAttachment = ({
    attachment,
    isMe,
    className,
    ...props
  }: { attachment: Attachment; isMe?: boolean } & HTMLAttributes<HTMLDivElement>) => {
    const iconColor = isMe ? "text-white" : "text-gray-600";
    const iconMap: Record<string, ReactNode> = {
      pdf: <File className={cn("size-5", iconColor)} />,
      doc: <File className={cn("size-5", iconColor)} />,
      xls: <File className={cn("size-5", iconColor)} />,
      ppt: <File className={cn("size-5", iconColor)} />,
      zip: <File className={cn("size-5", iconColor)} />,
      audio: <Music className={cn("size-5", iconColor)} />,
      video: <Video className={cn("size-5", iconColor)} />,
      jpg: <Image className={cn("size-5", iconColor)} />,
      jpeg: <Image className={cn("size-5", iconColor)} />,
      png: <Image className={cn("size-5", iconColor)} />,
      gif: <Image className={cn("size-5", iconColor)} />,
    };
  
    const icon = iconMap[attachment.type.toLowerCase()] || <File className={cn("size-5", iconColor)} />;
  
    return (
      <div
        className={cn("flex items-start gap-3", className)}
        aria-label="Attachment"
        {...props}
      >
        <div className={cn("rounded-lg border-2 p-2.5", isMe ? "border-blue-500" : "border-gray-200 bg-white")}>
          {icon}
        </div>
  
        <div>
          <p className="font-medium">{attachment.name}</p>
          <p className="text-sm">{attachment.size}</p>
        </div>
      </div>
    );
  };
  
  const MessageImage = ({
    image,
    className,
    ...props
  }: { image: Image } & HTMLAttributes<HTMLDivElement>) => {
    return (
      <div className={cn("relative", className)} {...props}>
        <img
          src={image.src}
          alt={image.alt}
          className="max-h-80 w-auto rounded-lg"
        />
        <div className="absolute right-2 bottom-2 flex items-center gap-2 rounded-full bg-black/50 p-1 backdrop-blur-sm">
          <Image className="size-5 text-white" />
          <div className="text-sm text-white">
            <p className="font-medium">{image.name}</p>
            <p>{image.size}</p>
          </div>
        </div>
      </div>
    );
  };
  
  const MessageUrlPreview = ({
    urlPreview,
    className,
    ...props
  }: { urlPreview: UrlPreview } & HTMLAttributes<HTMLDivElement>) => {
    return (
      <div
        className={cn(
          "flex flex-col gap-1.5 border-l-2 border-gray-300 pl-3",
          className
        )}
        {...props}
      >
        <p className="font-semibold text-gray-900">{urlPreview.title}</p>
        <p className="text-sm text-gray-600">{urlPreview.description}</p>
      </div>
    );
  };
  
  const MessageBubble = ({
    children,
    isMe,
    className,
    ...props
  }: { children: ReactNode; isMe?: boolean } & HTMLAttributes<HTMLDivElement>) => {
    return (
      <div
        className={cn(
          "max-w-max rounded-lg px-3.5 py-2.5 text-sm",
          isMe ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  };
  
  const MessageActions = ({ 
    message, 
    onCopy, 
    onEdit, 
    onReply, 
    onDelete,
    onReact 
  }: { 
    message: Message; 
    onCopy?: (message: Message) => void;
    onEdit?: (message: Message) => void;
    onReply?: (message: Message) => void;
    onDelete?: (message: Message) => void;
    onReact?: (emoji: string) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setShowReactions(false);
        }
      };

      if (isOpen || showReactions) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, showReactions]);

    const handleCopy = () => {
      if (message.text && typeof message.text === 'string') {
        navigator.clipboard.writeText(message.text);
        onCopy?.(message);
      }
      setIsOpen(false);
    };

    const handleEdit = () => {
      onEdit?.(message);
      setIsOpen(false);
    };

    const handleReply = () => {
      onReply?.(message);
      setIsOpen(false);
    };

    const handleDelete = () => {
      onDelete?.(message);
      setIsOpen(false);
    };

    const handleReact = (emoji: string) => {
      onReact?.(emoji);
      setShowReactions(false);
    };

    const commonEmojis = ['👍', '❤️', '😊', '😮', '😢', '😡', '🎉', '👏'];

    return (
      <div className="relative" ref={dropdownRef}>
        <div className="flex gap-1">
          <button
            aria-label="Add reaction"
            className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
            onClick={() => setShowReactions(!showReactions)}
          >
            😊
          </button>
          <button
            aria-label="More options"
            className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            <MoreHorizontal className="size-5" />
          </button>
        </div>
        
        {showReactions && (
          <div className="absolute right-0 top-full z-[100] mt-1 flex gap-1 rounded-md border bg-white p-2 shadow-lg">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                className="text-lg hover:scale-110 transition-transform"
                onClick={() => handleReact(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        
        {isOpen && (
          <div className="absolute right-0 top-full z-[100] mt-1 min-w-[8rem] w-40 overflow-hidden rounded-md border bg-white p-1 shadow-lg">
            <button
              className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100"
              onClick={handleCopy}
              disabled={!message.text || typeof message.text !== 'string'}
            >
              <Copy className="mr-2 size-4" />
              Copier
            </button>
            {message.user.me && (
              <button
                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100"
                onClick={handleEdit}
              >
                <Edit className="mr-2 size-4" />
                Modifier
              </button>
            )}
            <button
              className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100"
              onClick={handleReply}
            >
              <MessageSquare className="mr-2 size-4" />
              Répondre
            </button>
            {message.user.me && (
              <button
                className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-red-500 outline-none transition-colors hover:bg-red-50 focus:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 size-4" />
                Supprimer
              </button>
            )}
          </div>
        )}
      </div>
    );
  };
  
  const MessageFromOtherContent = ({ 
    msg, 
    isEditing,
    onSaveEdit,
    onCancelEdit,
    onToggleReaction,
  }: { 
    msg: Message;
    isEditing?: boolean;
    onSaveEdit?: (messageId: string, newText: string) => void;
    onCancelEdit?: () => void;
    onToggleReaction?: (emoji: string, reactedByMe: boolean) => void;
  }) => {
    if (msg.typing) {
      return <MessageTyping />;
    }

    if (isEditing && onSaveEdit && onCancelEdit) {
      return (
        <div className="w-80">
          <MessageEditForm
            message={msg}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        </div>
      );
    }
  
    return (
      <>
        {msg.reply && <MessageReply text={msg.reply.text} />}
        <div className="flex flex-col gap-2">
          {(msg.text || msg.attachment) && (
            <MessageBubble>
              {msg.text}
              {msg.attachment && <div className={msg.text ? "mt-2" : ""}><MessageAttachment attachment={msg.attachment} /></div>}
            </MessageBubble>
          )}
          {msg.image && <MessageImage image={msg.image} />}
        </div>
        {msg.urlPreview && <MessageUrlPreview urlPreview={msg.urlPreview} />}
        {msg.reactions && <MessageReactions reactions={msg.reactions} onReactionToggle={onToggleReaction} />}
      </>
    );
  };
  
  const MessageFromMeContent = ({ 
    msg,
    isEditing,
    onSaveEdit,
    onCancelEdit,
    onToggleReaction,
  }: { 
    msg: Message;
    isEditing?: boolean;
    onSaveEdit?: (messageId: string, newText: string) => void;
    onCancelEdit?: () => void;
    onToggleReaction?: (emoji: string, reactedByMe: boolean) => void;
  }) => {
    if (isEditing && onSaveEdit && onCancelEdit) {
      return (
        <div className="w-80">
          <MessageEditForm
            message={msg}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        </div>
      );
    }

    return (
      <>
        {msg.reply && <MessageReply text={msg.reply.text} />}
        <div className="flex flex-col gap-2">
          {(msg.text || msg.attachment) && (
            <MessageBubble isMe>
              {msg.text}
              {msg.attachment && <div className={msg.text ? "mt-2" : ""}><MessageAttachment attachment={msg.attachment} isMe /></div>}
            </MessageBubble>
          )}
          {msg.image && <MessageImage image={msg.image} />}
        </div>
        {msg.urlPreview && <MessageUrlPreview urlPreview={msg.urlPreview} />}
        {msg.reactions && <MessageReactions reactions={msg.reactions} onReactionToggle={onToggleReaction} />}
      </>
    );
  };
  
  const MessageTime = ({ sentAt, editedAt }: { sentAt?: string; editedAt?: string }) => {
    if (!sentAt) return null;
    return (
      <span className="text-xs text-gray-500">
        {sentAt}
        {editedAt && <span className="ml-1 italic">(modifié)</span>}
      </span>
    );
  };
  
  const MessageFromOther = ({
    msg,
    isEditing,
    onCopy,
    onEdit,
    onSaveEdit,
    onCancelEdit,
    onReply,
    onDelete,
    onReact,
    onToggleReaction,
    onAvatarClick,
    className,
    ...props
  }: { 
    msg: Message;
    isEditing?: boolean;
    onCopy?: (message: Message) => void;
    onEdit?: (message: Message) => void;
    onSaveEdit?: (messageId: string, newText: string) => void;
    onCancelEdit?: () => void;
    onReply?: (message: Message) => void;
    onDelete?: (message: Message) => void;
    onReact?: (emoji: string) => void;
    onToggleReaction?: (emoji: string, reactedByMe: boolean) => void;
    onAvatarClick?: () => void;
  } & HTMLAttributes<HTMLLIElement>) => {
    const avatarElement = (
      <Avatar src={msg.user.avatarUrl} alt={msg.user.name} size="md" />
    );

    return (
      <li
        className={cn("group flex w-full items-start gap-3", className)}
        {...props}
      >
        {onAvatarClick ? (
          <button type="button" onClick={onAvatarClick} className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity rounded-full">
            {avatarElement}
          </button>
        ) : avatarElement}
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900">{msg.user.name}</p>
            <MessageTime sentAt={msg.sentAt} editedAt={msg.editedAt} />
          </div>
  
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-start gap-2 empty:hidden">
              <MessageFromOtherContent 
                msg={msg} 
                isEditing={isEditing}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                onToggleReaction={onToggleReaction}
              />
            </div>
            {!isEditing && (
              <div className="invisible shrink-0 self-center group-hover:visible">
                <MessageActions message={msg} onCopy={onCopy} onEdit={onEdit} onReply={onReply} onDelete={onDelete} onReact={onReact} />
              </div>
            )}
          </div>
        </div>
      </li>
    );
  };
  
  const MessageFromMe = ({
    msg,
    isEditing,
    onCopy,
    onEdit,
    onSaveEdit,
    onCancelEdit,
    onReply,
    onDelete,
    onReact,
    onToggleReaction,
    className,
    ...props
  }: { 
    msg: Message;
    isEditing?: boolean;
    onCopy?: (message: Message) => void;
    onEdit?: (message: Message) => void;
    onSaveEdit?: (messageId: string, newText: string) => void;
    onCancelEdit?: () => void;
    onReply?: (message: Message) => void;
    onDelete?: (message: Message) => void;
    onReact?: (emoji: string) => void;
    onToggleReaction?: (emoji: string, reactedByMe: boolean) => void;
  } & HTMLAttributes<HTMLLIElement>) => {
    return (
      <li
        className={cn(
          "group flex w-full items-start justify-end gap-3",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            <MessageTime sentAt={msg.sentAt} editedAt={msg.editedAt} />
            <MessageStatus status={msg.status} readAt={msg.readAt} />
            <p className="text-sm font-medium text-gray-900">{msg.user.name}</p>
          </div>
  
          <div className="flex items-center gap-2">
            {!isEditing && (
              <div className="invisible shrink-0 self-center group-hover:visible">
                <MessageActions message={msg} onCopy={onCopy} onEdit={onEdit} onReply={onReply} onDelete={onDelete} onReact={onReact} />
              </div>
            )}
            <div className="flex flex-col items-end gap-2 empty:hidden">
              <MessageFromMeContent 
                msg={msg} 
                isEditing={isEditing}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                onToggleReaction={onToggleReaction}
              />
            </div>
          </div>
        </div>
      </li>
    );
  };
  
  export { MessageFromMe as Message }; 