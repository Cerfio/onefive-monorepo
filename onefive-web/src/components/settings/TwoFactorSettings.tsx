'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/base/buttons/button';
import {
  getTwoFactorStatus,
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
} from '@/queries/twoFactor';

export const TwoFactorSettings = () => {
  const qc = useQueryClient();
  const { data: status } = useQuery({
    queryKey: ['2fa-status'],
    queryFn: getTwoFactorStatus,
  });

  const [step, setStep] = useState<'idle' | 'enroll' | 'backup'>('idle');
  const [qr, setQr] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const setupMut = useMutation({
    mutationFn: setupTwoFactor,
    onSuccess: async (data) => {
      setSecret(data.secret);
      try {
        setQr(await QRCode.toDataURL(data.otpauthUrl));
      } catch {
        setQr('');
      }
      setStep('enroll');
    },
    onError: () => toast.error('Erreur lors de la configuration'),
  });

  const enableMut = useMutation({
    mutationFn: () => enableTwoFactor(code),
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setCode('');
      setStep('backup');
      qc.invalidateQueries({ queryKey: ['2fa-status'] });
      toast.success('Authentification à deux facteurs activée');
    },
    onError: () => toast.error('Code invalide, réessayez'),
  });

  const disableMut = useMutation({
    mutationFn: disableTwoFactor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['2fa-status'] });
      setStep('idle');
      toast.success('2FA désactivée');
    },
    onError: () => toast.error('Erreur lors de la désactivation'),
  });

  if (status?.enabled && step !== 'backup') {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border border-green-200 bg-green-50 p-4">
        <div>
          <p className="text-sm font-medium text-green-800">2FA activée</p>
          <p className="text-xs text-green-700">Votre compte est protégé par un second facteur.</p>
        </div>
        <Button color="secondary" size="sm" onClick={() => disableMut.mutate()} isDisabled={disableMut.isPending}>
          Désactiver
        </Button>
      </div>
    );
  }

  if (step === 'enroll') {
    return (
      <div className="space-y-4 rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-700">
          1. Scannez ce QR code avec votre app d&apos;authentification (Google Authenticator, 1Password…).
        </p>
        {qr && <img src={qr} alt="QR code 2FA" className="h-40 w-40" />}
        <p className="text-xs text-gray-500">
          Ou saisissez la clé manuellement : <code className="rounded bg-gray-100 px-1">{secret}</code>
        </p>
        <p className="text-sm text-gray-700">2. Entrez le code à 6 chiffres généré :</p>
        <div className="flex items-center gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            inputMode="numeric"
            className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-center text-lg tracking-widest"
          />
          <Button size="sm" onClick={() => enableMut.mutate()} isDisabled={code.length !== 6 || enableMut.isPending}>
            {enableMut.isPending ? 'Vérification…' : 'Activer'}
          </Button>
          <Button size="sm" color="tertiary" onClick={() => setStep('idle')}>Annuler</Button>
        </div>
      </div>
    );
  }

  if (step === 'backup') {
    return (
      <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-900">Codes de secours</p>
        <p className="text-xs text-amber-800">
          Conservez ces codes en lieu sûr : ils permettent de vous connecter si vous perdez votre téléphone. Chaque code est utilisable une fois.
        </p>
        <div className="grid grid-cols-2 gap-2 font-mono text-sm">
          {backupCodes.map((c) => (
            <span key={c} className="rounded bg-white px-2 py-1 text-center">{c}</span>
          ))}
        </div>
        <Button
          size="sm"
          color="secondary"
          onClick={() => {
            navigator.clipboard?.writeText(backupCodes.join('\n')).catch(() => {});
            toast.success('Codes copiés');
          }}
        >
          Copier les codes
        </Button>
        <Button size="sm" onClick={() => setStep('idle')}>J&apos;ai sauvegardé mes codes</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4">
      <div>
        <p className="text-sm font-medium text-gray-900">Authentification à deux facteurs</p>
        <p className="text-xs text-gray-500">Ajoutez une couche de sécurité avec une app d&apos;authentification (TOTP).</p>
      </div>
      <Button color="primary" size="sm" onClick={() => setupMut.mutate()} isDisabled={setupMut.isPending}>
        {setupMut.isPending ? 'Chargement…' : 'Activer'}
      </Button>
    </div>
  );
};
