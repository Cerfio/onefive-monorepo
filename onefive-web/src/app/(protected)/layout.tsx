import WithAuth from '@/providers/withAuth';
import { FeedFilterProvider } from '@/contexts/FeedFilterContext';
import ChatWidget from '@/app/(protected)/support/components/ChatWidget';
import { CommandPalette } from '@/components/CommandPalette';
import { NotificationsRealtime } from '@/components/NotificationsRealtime';

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WithAuth>
      <FeedFilterProvider>{children}</FeedFilterProvider>
      <CommandPalette />
      <ChatWidget />
      <NotificationsRealtime />
    </WithAuth>
  );
}
