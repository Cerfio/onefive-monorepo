'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import StationFPlace from '@/assets/images/StationFPlace.png';
import { useTranslations } from 'next-intl';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations('auth.common');
  return (
    <div className="bg-gradient-to-br from-gray-25 via-gray-50 to-gray-100 flex justify-center min-h-screen overflow-hidden">
      <div className="flex w-full">
        <motion.div
          className="h-full max-w-[580px] w-full hidden lg:block relative overflow-hidden"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative w-full h-full">
            <Image fill src={StationFPlace} alt="Station F building" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight drop-shadow-lg">{t('image-title')}</h2>
                <p className="text-lg font-medium drop-shadow-lg">{t('image-description')}</p>
              </div>
              <div className="space-y-3 text-sm drop-shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                  <span>{t('description-1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                  <span>{t('description-2')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                  <span>{t('description-3')}</span>
                </div>
              </div>
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 shadow-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm" />
                  <span className="text-sm font-medium text-white drop-shadow-sm">{t('onefive-ecosystem')}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
