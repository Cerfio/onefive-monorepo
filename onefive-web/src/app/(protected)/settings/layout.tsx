import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paramètres',
  description: 'Gérez votre profil et vos préférences sur OneFive',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 