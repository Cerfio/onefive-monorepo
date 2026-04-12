import WithAuth from '@/providers/withAuth';
import { FeedFilterProvider } from '@/contexts/FeedFilterContext';

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WithAuth>
      <FeedFilterProvider>{children}</FeedFilterProvider>
    </WithAuth>
  );
}
