/**
 * Génère des initiales à partir d'un prénom et nom comme Google
 * @param firstName - Le prénom
 * @param lastName - Le nom de famille
 * @returns Les initiales (ex: "JD" pour "John Doe")
 */
export function generateInitials(firstName?: string | null, lastName?: string | null): string {
  // Si aucun nom n'est fourni, retourner une chaîne vide
  if (!firstName && !lastName) {
    return '';
  }
  
  // Fonction pour nettoyer et obtenir la première lettre
  const getFirstLetter = (name: string) => {
    return name.trim().charAt(0).toUpperCase();
  };
  
  let initials = '';
  
  // Ajouter la première lettre du prénom si disponible
  if (firstName && firstName.trim()) {
    initials += getFirstLetter(firstName);
  }
  
  // Ajouter la première lettre du nom si disponible
  if (lastName && lastName.trim()) {
    initials += getFirstLetter(lastName);
  }
  
  // Si on a qu'un seul nom, prendre les deux premières lettres
  if (initials.length === 1) {
    const singleName = firstName || lastName || '';
    if (singleName.length > 1) {
      initials += singleName.trim().charAt(1).toUpperCase();
    }
  }
  
  return initials;
}

/**
 * Génère des initiales à partir d'un nom complet
 * @param fullName - Le nom complet (ex: "John Doe")
 * @returns Les initiales (ex: "JD")
 */
export function generateInitialsFromFullName(fullName?: string | null): string {
  if (!fullName || !fullName.trim()) {
    return '';
  }
  
  const nameParts = fullName.trim().split(/\s+/);
  
  if (nameParts.length >= 2) {
    // Prendre la première lettre du premier et dernier mot
    return generateInitials(nameParts[0], nameParts[nameParts.length - 1]);
  } else {
    // Un seul mot - prendre les deux premières lettres
    return generateInitials(nameParts[0], null);
  }
}

/**
 * Génère une couleur de fond basée sur les initiales pour un avatar style Google
 * @param initials - Les initiales
 * @returns Un objet de style avec la couleur de fond
 */
export function generateAvatarBackgroundColor(initials: string): { backgroundColor: string } | null {
  // Liste de couleurs vives similaires à Google
  const colors = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#eab308', // yellow-500
    '#84cc16', // lime-500
    '#22c55e', // green-500
    '#10b981', // emerald-500
    '#14b8a6', // teal-500
    '#06b6d4', // cyan-500
    '#0ea5e9', // sky-500
    '#3b82f6', // blue-500
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#a855f7', // purple-500
    '#d946ef', // fuchsia-500
    '#ec4899', // pink-500
    '#f43f5e', // rose-500
  ];
  
  if (!initials) {
    return { backgroundColor: '#6b7280' }; // gray-500
  }
  
  // Utiliser un hash simple basé sur les initiales pour déterminer la couleur
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return { backgroundColor: colors[index] };
}