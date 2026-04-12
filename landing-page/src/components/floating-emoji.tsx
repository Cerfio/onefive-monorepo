"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import notifications from "@/data/notifications";
import formatNotification from "@/utils/formatNotification";
import { AvailableLanguage } from "@/types/languages";

// Déplacer la variable globale dans le fichier du composant
const lastUsedNotifications = new Set<string>();

interface FloatingEmojiProps {
  position: "top-left" | "bottom-right";
  language: AvailableLanguage;
}

export function FloatingEmoji({ position, language }: FloatingEmojiProps) {
  const [notification, setNotification] = useState("");
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const getRandomNotification = () => {
      const availableNotifications = notifications.filter(
        (n) => !lastUsedNotifications.has(n.id)
      );

      if (availableNotifications.length === 0) {
        lastUsedNotifications.clear();
        const randomNotif =
          notifications[Math.floor(Math.random() * notifications.length)];
        return formatNotification(randomNotif.content[language as keyof typeof randomNotif.content]);
      }

      const randomIndex = Math.floor(
        Math.random() * availableNotifications.length
      );
      const newNotification = availableNotifications[randomIndex];
      lastUsedNotifications.add(newNotification.id);

      if (lastUsedNotifications.size > 3) {
        const firstItem = Array.from(lastUsedNotifications)[0];
        lastUsedNotifications.delete(firstItem);
      }

      // Utiliser la langue spécifiée pour obtenir le texte de la notification
      return formatNotification(newNotification.content[language as keyof typeof newNotification.content]);
    };

    setNotification(getRandomNotification());

    const changeNotification = async () => {
      setOpacity(0);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setNotification(getRandomNotification());
      setOpacity(1);
    };

    const interval = setInterval(changeNotification, 12000);
    return () => clearInterval(interval);
  }, [language]);

  // Positions différentes selon l'écran
  const positionClasses =
    position === "top-left"
      ? "sm:top-12 sm:-left-12"
      : "sm:bottom-10 sm:-right-10";

  return (
    <motion.div
      className={`flex gap-2 absolute ${positionClasses} max-w-[300px] sm:max-w-[300px] max-w-[250px]`}
      animate={{
        y: position === "top-left" ? [-20, -4] : [48, 32],
      }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      <motion.div
        className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200 text-xs sm:text-sm"
        animate={{ opacity }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-[auto_1fr] gap-1">
          <span>{notification.split(" ")[0]}</span>
          <span
            dangerouslySetInnerHTML={{
              __html: notification.split(" ").slice(1).join(" "),
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
