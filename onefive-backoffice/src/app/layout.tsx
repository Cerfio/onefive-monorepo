import '@/styles/globals.css';
import { Toaster } from 'sonner';
import { ConfirmDialogProvider } from '@/components/application/modals/confirm-dialog';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ConfirmDialogProvider>
          {children}
        </ConfirmDialogProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
