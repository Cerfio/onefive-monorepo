// Fonction de validation des dates
export const validateDates = (startDate: string, endDate:string): string | null => {
  if (!startDate) return "L'année de début est obligatoire";
  
  const start = parseInt(startDate);
  
  if (isNaN(start)) {
    return "L'année de début doit être une année valide";
  }
  
  const currentYear = new Date().getFullYear();
  if (start > currentYear) {
    return "L'année de début ne peut pas être dans le futur";
  }
  
  // Si pas de date de fin (Présent, En cours, etc.), c'est valide
  if (!endDate || endDate.toLowerCase().includes('présent') || endDate.toLowerCase().includes('present') || endDate.toLowerCase().includes('en cours')) {
    return null;
  }
  
  const end = parseInt(endDate);
  
  if (isNaN(end)) {
    return "L'année de fin doit être une année valide";
  }
  
  if (start > end) {
    return "L'année de début ne peut pas être postérieure à l'année de fin";
  }
  
  if (end > currentYear) {
    return "L'année de fin ne peut pas être dans le futur";
  }
  
  return null;
};

// Fonction de validation des champs obligatoires
export const validateRequiredFields = (data: any, type: 'experience' | 'education' | 'achievement'): string[] => {
  const errors: string[] = [];
  
  if (type === 'experience') {
    if (!data.title?.trim()) errors.push("Le titre est obligatoire");
    if (!data.company?.trim()) errors.push("L'entreprise est obligatoire");
    // Le domaine n'est plus obligatoire
  } else if (type === 'education') {
    if (!data.degree?.trim()) errors.push("Le diplôme est obligatoire");
    if (!data.school?.trim()) errors.push("L'école est obligatoire");
    // Le domaine n'est plus obligatoire
  } else if (type === 'achievement') {
    if (!data.title?.trim()) errors.push("Le titre est obligatoire");
    if (!data.description?.trim()) errors.push("La description est obligatoire");
  }
  
  return errors;
}; 