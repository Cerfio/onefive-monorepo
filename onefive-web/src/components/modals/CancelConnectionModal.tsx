'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CancelConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  personName: string;
  isLoading?: boolean;
}

export function CancelConnectionModal({
  isOpen,
  onClose,
  onConfirm,
  personName,
  isLoading = false,
}: CancelConnectionModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Annuler la demande de connexion ?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir annuler votre demande de connexion avec{' '}
            <span className="font-semibold">{personName}</span> ?
            <br />
            <br />
            Cette action supprimera la notification envoyée et vous pourrez toujours
            renvoyer une demande plus tard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Non, garder la demande</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading ? 'Annulation...' : 'Oui, annuler'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
