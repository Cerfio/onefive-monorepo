import { useState } from 'react';
import { Keyboard } from 'lucide-react';
import { Button } from '@/components/base/buttons/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'Ctrl + K', description: 'Rechercher des conversations' },
    { key: 'Ctrl + Enter', description: 'Envoyer un message' },
    { key: 'Ctrl + N', description: 'Nouveau message' },
    { key: 'Ctrl + F', description: 'Rechercher dans la conversation' },
    { key: 'Escape', description: 'Fermer les modales' },
    { key: '↑/↓', description: 'Navigation dans les conversations' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button color="tertiary" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          Raccourcis
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Raccourcis clavier
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Utilisez ces raccourcis pour naviguer plus rapidement dans l'application.
          </p>
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{shortcut.description}</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Ces raccourcis fonctionnent dans toute l'application de messagerie.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcuts; 