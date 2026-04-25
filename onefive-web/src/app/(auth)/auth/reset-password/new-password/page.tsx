'use client';
import { useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Label } from '@/components/base/label/label';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '@/queries/auth';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Meteors } from '@/components/meteors';
import { motion } from 'framer-motion';
import Image from 'next/image';
import LetterCercle from '@/icons/LetterCercle.svg';

const NewPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Calcul de la force du mot de passe
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: 'bg-gray-200' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const labels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Très bon'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return {
      score: Math.min(score, 5),
      label: labels[Math.min(score - 1, 4)] || '',
      color: colors[Math.min(score - 1, 4)] || 'bg-gray-200'
    };
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword;
  const isPasswordValid = password.length >= 8;

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: () => {
      return resetPassword({ 
        password,
        confirmPassword,
        token: token || '',
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast.success('Mot de passe mis à jour avec succès !');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasswordValid && passwordsMatch && !isLoading) {
      setError('');
      mutateAsync();
    }
  };

  if (isSuccess) {
    return (
      <>
        <div className="w-full h-screen -z-10 absolute overflow-hidden">
          <Meteors number={10} />
        </div>
        <div className="h-screen w-screen flex flex-col items-center pt-24">
          <motion.div 
            className="flex flex-col items-center z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image src={LetterCercle} alt="" width={56} height={56} />
            <div className="text-gray-900 text-3xl font-semibold mt-6">
              Mot de passe mis à jour !
            </div>
            <div className="text-center text-base font-normal mt-3 max-w-md">
              Votre mot de passe a été réinitialisé avec succès.
            </div>
            <Button
              color="primary"
              className="h-11 w-[380px] mt-8 text-base font-semibold"
              onClick={() => router.push('/signin')}
            >
              Se connecter
            </Button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="w-full h-screen -z-10 absolute overflow-hidden">
        <Meteors number={10} />
      </div>
      <div className="h-screen w-screen flex flex-col items-center pt-24">
        <motion.div 
          className="flex flex-col items-center z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image src={LetterCercle} alt="" width={56} height={56} />
          <div className="text-gray-900 text-3xl font-semibold mt-6">
            Nouveau mot de passe
          </div>
          <div className="text-center text-base font-normal mt-3 max-w-md">
            Choisissez un nouveau mot de passe sécurisé pour votre compte.
          </div>
          
          <form onSubmit={handleSubmit} className="w-full max-w-[380px] mt-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Entrez votre nouveau mot de passe"
                    value={password}
                    onChange={setPassword}
                    className="h-11 pr-10"
                    isRequired
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {/* Indicateur de force du mot de passe */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-600">
                      Force : {passwordStrength.label}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirmez votre nouveau mot de passe"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    className="h-11 pr-10"
                    isRequired
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {confirmPassword && !passwordsMatch && (
                  <div className="text-xs text-red-500">
                    Les mots de passe ne correspondent pas
                  </div>
                )}
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="text-center">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button
                type="submit"
                color="primary"
                className="h-11 w-full text-base font-semibold"
                isDisabled={!isPasswordValid || !passwordsMatch || isLoading}
              >
                {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </Button>
            </div>
          </form>
          
          <div
            className="flex items-center gap-2 text-gray-600 text-sm font-semibold mt-8 hover:underline cursor-pointer"
            onClick={() => router.push('/auth/reset-password')}
          >
            <ArrowLeft width={20} height={20} />
            Retour à la réinitialisation
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default NewPasswordPage; 