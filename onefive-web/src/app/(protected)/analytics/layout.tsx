import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Suivez vos performances et l\'engagement de votre réseau sur OneFive',
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 