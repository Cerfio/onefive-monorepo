import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Centre d\'aide OneFive - FAQ, guides, contact et ressources pour utiliser au mieux votre plateforme.',
  keywords: ['support', 'aide', 'faq', 'contact', 'onefive'],
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 