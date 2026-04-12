'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/navbar';
import { Users, Clock } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5  } }
};

export default function RelationshipsPage() {
  return (
    <div className="min-h-screen bg-[#FCFCFD]">
      <div className="w-full max-w-screen-xl mx-auto">
        <Navbar />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={cardVariants}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-[#5E6AD2]/10 rounded-full">
                  <Users className="h-12 w-12 text-[#5E6AD2]" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-[#101828] mb-3">
                Gestion des relations
              </h1>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-[#5E6AD2]" />
                <span className="text-sm font-medium text-[#5E6AD2]">Coming Soon</span>
              </div>
              <p className="text-[#475467] max-w-md mx-auto mb-6">
                Un outil complet pour gérer vos relations professionnelles, ajouter des notes, 
                définir des rappels et suivre vos interactions arrive bientôt.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto">
                {[
                  { emoji: '🤝', label: 'Tags personnalisés' },
                  { emoji: '📝', label: 'Notes privées' },
                  { emoji: '⏰', label: 'Rappels' },
                  { emoji: '📊', label: 'Suivi interactions' },
                ].map((feature) => (
                  <div key={feature.label} className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl mb-1">{feature.emoji}</div>
                    <p className="text-xs text-gray-600">{feature.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 