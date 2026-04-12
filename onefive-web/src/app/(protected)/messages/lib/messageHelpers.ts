import { Message } from '@/components/messaging';

export const formatMessageTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

export const getMessageStatus = (message: Message): 'sent' | 'delivered' | 'read' | 'failed' => {
  if (message.status) return message.status;
  if (message.readAt) return 'read';
  return 'sent';
};

export const isMessageUnread = (message: Message, _userId: string): boolean => {
  return !message.user.me && message.status !== 'read';
};

export const searchInMessages = (messages: Message[], query: string): Message[] => {
  const lowercaseQuery = query.toLowerCase();
  return messages.filter(message => {
    const textMatch = typeof message.text === 'string' && 
                     message.text.toLowerCase().includes(lowercaseQuery);
    const authorMatch = message.user.name.toLowerCase().includes(lowercaseQuery);
    const attachmentMatch = message.attachment?.name.toLowerCase().includes(lowercaseQuery);
    
    return textMatch || authorMatch || attachmentMatch;
  });
};

export const groupMessagesByDate = (messages: Message[]): { [date: string]: Message[] } => {
  return messages.reduce((groups, message) => {
    const date = new Date(message.sentAt || new Date()).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as { [date: string]: Message[] });
};

export const getUnreadCount = (messages: Message[]): number => {
  return messages.filter(msg => !msg.user.me && msg.status !== 'read').length;
};

export const getLastMessagePreview = (message: Message): string => {
  if (typeof message.text === 'string') {
    return message.text.length > 50 ? message.text.substring(0, 50) + '...' : message.text;
  }
  if (message.attachment) {
    return `📎 ${message.attachment.name}`;
  }
  if (message.image) {
    return `🖼️ ${message.image.name}`;
  }
  return 'Message';
};

export const generateMessageId = (): string => {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const simulateTypingIndicator = (
  setIsTyping: (typing: boolean) => void,
  duration: number = 2000
): void => {
  setIsTyping(true);
  setTimeout(() => {
    setIsTyping(false);
  }, duration);
};

export const markMessagesAsRead = (messages: Message[]): Message[] => {
  return messages.map(msg => ({
    ...msg,
    status: msg.user.me ? msg.status : 'read'
  }));
};

export const getConversationTitle = (participants: string[]): string => {
  if (participants.length === 1) return participants[0];
  if (participants.length === 2) return participants.join(' & ');
  return `${participants[0]} +${participants.length - 1} others`;
};

export const createSystemMessage = (text: string): Message => ({
  id: generateMessageId(),
  text,
  sentAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
  user: {
    name: 'System',
    me: false,
  },
}); 