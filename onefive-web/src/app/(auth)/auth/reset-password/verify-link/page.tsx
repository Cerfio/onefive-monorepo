'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Meteors } from '@/components/meteors';
import { motion } from 'framer-motion';
import Image from 'next/image';
import LetterCercle from '@/icons/LetterCercle.svg';
import { Button } from '@/components/ui/button';

const VerifyLinkPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // Rediriger vers la page de vérification du code avec le token
      router.push(`/auth/reset-password/verify?token=${token}`);
    } else {
      // Si pas de token, rediriger vers la page de réinitialisation
      router.push('/auth/reset-password');
    }
  }, [token, router]);

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
            Redirection en cours...
          </div>
          <div className="text-center text-base font-normal mt-3 max-w-md">
            Nous vous redirigeons vers la page de vérification.
          </div>
          <Button
            className="h-11 w-[380px] mt-8 text-base font-semibold"
            onClick={() => router.push('/auth/reset-password')}
          >
            Retour à la réinitialisation
          </Button>
        </motion.div>
      </div>
    </>
  );
};

export default VerifyLinkPage; 