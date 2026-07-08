import WithAuth from '@/providers/withAuth';
import { FeedFilterProvider } from '@/contexts/FeedFilterContext';
import ChatWidget from '@/app/(protected)/support/components/ChatWidget';

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WithAuth>
      <FeedFilterProvider>{children}</FeedFilterProvider>
      <ChatWidget />
    </WithAuth>
  );
}
