import WithoutAuth from '@/providers/withoutAuth';

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
      {children}
    </WithoutAuth>
  );
}