"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

// Configuration des rôles avec leurs métadonnées
const PROFILE_ROLES = [
  { emoji: '🚀', color: '#E67E22', shortLabel: 'Fondateur·rice' },
  { emoji: '💰', color: '#2ECC71', shortLabel: 'Business Angel' },
  { emoji: '📊', color: '#3498DB', shortLabel: 'Venture Capitalist' },
  { emoji: '🏢', color: '#A569BD', shortLabel: 'Investisseur Institutionnel' },
  { emoji: '🧑‍🏫', color: '#D35400', shortLabel: 'Mentor' },
  { emoji: '🧐', color: '#B8860B', shortLabel: 'Conseiller Stratégique' },
  { emoji: '📚', color: '#9B59B6', shortLabel: 'Étudiant·e Entrepreneur·e' },
  { emoji: '🔧', color: '#1ABC9C', shortLabel: 'Prestataire' },
  { emoji: '📰', color: '#C0392B', shortLabel: 'Média' },
  { emoji: '🏘️', color: '#7F8C8D', shortLabel: 'Incubateur / Accélérateur' },
  { emoji: '🧑‍💼', color: '#5D6D7E', shortLabel: 'Recruteur / RH' },
  { emoji: '👤', color: '#95A5A6', shortLabel: 'Autre Profil' },
];

function RoleBadge({ emoji, color, shortLabel, index }: { 
  emoji: string; 
  color: string; 
  shortLabel: string;
  index: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.4, 
        delay: 0.05 * index,
        ease: 'easeOut'
      }}
      whileHover={{ scale: 1.08, y: -2 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border cursor-default transition-shadow hover:shadow-md"
      style={{ 
        borderColor: color, 
        backgroundColor: `${color}15`, 
        color: color 
      }}
    >
      <span>{emoji}</span>
      <span>{shortLabel}</span>
    </motion.span>
  );
}

export default function RolesSection() {
  const t = useTranslations("home");

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("rolesSection.title")}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            {t("rolesSection.description")}
          </p>
        </motion.div>

        {/* Grille de badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 sm:gap-4"
        >
          {PROFILE_ROLES.map((role, index) => (
            <RoleBadge
              key={role.shortLabel}
              emoji={role.emoji}
              color={role.color}
              shortLabel={role.shortLabel}
              index={index}
            />
          ))}
        </motion.div>

        {/* Statistique */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-10 text-sm text-gray-500"
        >
          <span className="font-semibold text-gray-700">12 rôles</span>{" "}
          {t("rolesSection.stats")}
        </motion.p>
      </div>
    </section>
  );
}
