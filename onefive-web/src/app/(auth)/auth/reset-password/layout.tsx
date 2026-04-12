import WithoutAuth from '@/providers/withoutAuth';
import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata = {
  title: 'Réinitialiser le mot de passe',
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WithoutAuth>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </WithoutAuth>
  );
} 