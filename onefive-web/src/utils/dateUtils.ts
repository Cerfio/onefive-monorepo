import { parseDate, CalendarDate } from "@internationalized/date";
import type { DateValue } from "react-aria-components";

/**
 * Convertit un DateValue en string ISO (YYYY-MM-DD)
 * @param date DateValue de React Aria
 * @returns String ISO date ou undefined si null
 */
export function dateValueToISOString(date: DateValue | null | undefined): string | undefined {
  if (!date) return undefined;
  
  // Format: YYYY-MM-DD (premier jour du mois pour les dates mois/année)
  const year = date.year;
  const month = String(date.month).padStart(2, '0');
  const day = String(date.day).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Convertit une string ISO en DateValue
 * @param isoString String au format ISO (YYYY-MM-DD) ou date complète
 * @returns DateValue pour React Aria ou null si invalide
 */
export function isoStringToDateValue(isoString: string | null | undefined): DateValue | null {
  if (!isoString) return null;
  
  try {
    // Extraire juste la partie date si c'est un ISO complet avec heure
    const datePart = isoString.split('T')[0];
    return parseDate(datePart);
  } catch (error) {
    console.error('Error parsing date:', isoString, error);
    return null;
  }
}

/**
 * Formate une date pour l'affichage (Mois Année)
 * @param isoString String ISO
 * @returns String formatée "Jan 2023" ou "Présent"
 */
export function formatExperienceDate(isoString: string | null | undefined): string {
  if (!isoString) return 'Présent';
  
  try {
    const date = new Date(isoString);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', isoString);
      return 'Présent';
    }
    
    return new Intl.DateTimeFormat('fr-FR', {
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', isoString, error);
    return 'Présent';
  }
}

/**
 * Crée un DateValue pour le premier jour d'un mois/année donné
 * @param year Année
 * @param month Mois (1-12)
 * @returns DateValue
 */
export function createMonthYearDate(year: number, month: number): DateValue {
  return new CalendarDate(year, month, 1);
}

/**
 * Obtient la date du jour comme DateValue
 * @returns DateValue pour aujourd'hui
 */
export function getTodayDateValue(): DateValue {
  const today = new Date();
  return new CalendarDate(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );
}

