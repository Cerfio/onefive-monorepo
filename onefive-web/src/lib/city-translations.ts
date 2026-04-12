/**
 * City name translations for common cities
 * Maps city names in English to their localized names in various languages
 * This is a fallback when alternateNames are not available in cities.json
 */

type CityTranslations = Record<string, Record<string, string>>;

const cityTranslations: CityTranslations = {
  // Format: "English Name": { "language": "Localized Name" }
  "London": {
    "fr": "Londres",
    "es": "Londres",
    "de": "London",
    "it": "Londra",
    "pt": "Londres",
    "ru": "Лондон",
    "ja": "ロンドン",
    "zh": "伦敦",
    "ko": "런던",
    "ar": "لندن",
  },
  "Paris": {
    "en": "Paris",
    "fr": "Paris",
    "es": "París",
    "de": "Paris",
    "it": "Parigi",
    "pt": "Paris",
    "ru": "Париж",
    "ja": "パリ",
    "zh": "巴黎",
    "ko": "파리",
    "ar": "باريس",
  },
  "New York": {
    "fr": "New York",
    "es": "Nueva York",
    "de": "New York",
    "it": "New York",
    "pt": "Nova York",
    "ru": "Нью-Йорк",
    "ja": "ニューヨーク",
    "zh": "纽约",
    "ko": "뉴욕",
    "ar": "نيويورك",
  },
  "Tokyo": {
    "fr": "Tokyo",
    "es": "Tokio",
    "de": "Tokio",
    "it": "Tokyo",
    "pt": "Tóquio",
    "ru": "Токио",
    "ja": "東京",
    "zh": "东京",
    "ko": "도쿄",
    "ar": "طوكيو",
  },
  "Berlin": {
    "fr": "Berlin",
    "es": "Berlín",
    "de": "Berlin",
    "it": "Berlino",
    "pt": "Berlim",
    "ru": "Берлин",
    "ja": "ベルリン",
    "zh": "柏林",
    "ko": "베를린",
    "ar": "برلين",
  },
  "Madrid": {
    "fr": "Madrid",
    "es": "Madrid",
    "de": "Madrid",
    "it": "Madrid",
    "pt": "Madrid",
    "ru": "Мадрид",
    "ja": "マドリード",
    "zh": "马德里",
    "ko": "마드리드",
    "ar": "مدريد",
  },
  "Rome": {
    "fr": "Rome",
    "es": "Roma",
    "de": "Rom",
    "it": "Roma",
    "pt": "Roma",
    "ru": "Рим",
    "ja": "ローマ",
    "zh": "罗马",
    "ko": "로마",
    "ar": "روما",
  },
  "Moscow": {
    "fr": "Moscou",
    "es": "Moscú",
    "de": "Moskau",
    "it": "Mosca",
    "pt": "Moscou",
    "ru": "Москва",
    "ja": "モスクワ",
    "zh": "莫斯科",
    "ko": "모스크바",
    "ar": "موسكو",
  },
  "Beijing": {
    "fr": "Pékin",
    "es": "Pekín",
    "de": "Peking",
    "it": "Pechino",
    "pt": "Pequim",
    "ru": "Пекин",
    "ja": "北京",
    "zh": "北京",
    "ko": "베이징",
    "ar": "بكين",
  },
  "Cairo": {
    "fr": "Le Caire",
    "es": "El Cairo",
    "de": "Kairo",
    "it": "Il Cairo",
    "pt": "Cairo",
    "ru": "Каир",
    "ja": "カイロ",
    "zh": "开罗",
    "ko": "카이로",
    "ar": "القاهرة",
  },
  "Barcelona": {
    "fr": "Barcelone",
    "es": "Barcelona",
    "de": "Barcelona",
    "it": "Barcellona",
    "pt": "Barcelona",
    "ru": "Барселона",
    "ja": "バルセロナ",
    "zh": "巴塞罗那",
    "ko": "바르셀로나",
    "ar": "برشلونة",
  },
  "Vienna": {
    "fr": "Vienne",
    "es": "Viena",
    "de": "Wien",
    "it": "Vienna",
    "pt": "Viena",
    "ru": "Вена",
    "ja": "ウィーン",
    "zh": "维也纳",
    "ko": "빈",
    "ar": "فيينا",
  },
  "Amsterdam": {
    "fr": "Amsterdam",
    "es": "Ámsterdam",
    "de": "Amsterdam",
    "it": "Amsterdam",
    "pt": "Amesterdã",
    "ru": "Амстердам",
    "ja": "アムステルダム",
    "zh": "阿姆斯特丹",
    "ko": "암스테르담",
    "ar": "أمستردام",
  },
  "Brussels": {
    "fr": "Bruxelles",
    "es": "Bruselas",
    "de": "Brüssel",
    "it": "Bruxelles",
    "pt": "Bruxelas",
    "ru": "Брюссель",
    "ja": "ブリュッセル",
    "zh": "布鲁塞尔",
    "ko": "브뤼셀",
    "ar": "بروكسل",
  },
  "Warsaw": {
    "fr": "Varsovie",
    "es": "Varsovia",
    "de": "Warschau",
    "it": "Varsavia",
    "pt": "Varsóvia",
    "ru": "Варшава",
    "ja": "ワルシャワ",
    "zh": "华沙",
    "ko": "바르샤바",
    "ar": "وارسو",
  },
  "Prague": {
    "fr": "Prague",
    "es": "Praga",
    "de": "Prag",
    "it": "Praga",
    "pt": "Praga",
    "ru": "Прага",
    "ja": "プラハ",
    "zh": "布拉格",
    "ko": "프라하",
    "ar": "براغ",
  },
  "Stockholm": {
    "fr": "Stockholm",
    "es": "Estocolmo",
    "de": "Stockholm",
    "it": "Stoccolma",
    "pt": "Estocolmo",
    "ru": "Стокгольм",
    "ja": "ストックホルム",
    "zh": "斯德哥尔摩",
    "ko": "스톡홀름",
    "ar": "ستوكهولم",
  },
  "Copenhagen": {
    "fr": "Copenhague",
    "es": "Copenhague",
    "de": "Kopenhagen",
    "it": "Copenaghen",
    "pt": "Copenhague",
    "ru": "Копенгаген",
    "ja": "コペンハーゲン",
    "zh": "哥本哈根",
    "ko": "코펜하겐",
    "ar": "كوبنهاغن",
  },
  "Athens": {
    "fr": "Athènes",
    "es": "Atenas",
    "de": "Athen",
    "it": "Atene",
    "pt": "Atenas",
    "ru": "Афины",
    "ja": "アテネ",
    "zh": "雅典",
    "ko": "아테네",
    "ar": "أثينا",
  },
  "Lisbon": {
    "fr": "Lisbonne",
    "es": "Lisboa",
    "de": "Lissabon",
    "it": "Lisbona",
    "pt": "Lisboa",
    "ru": "Лиссабон",
    "ja": "リスボン",
    "zh": "里斯本",
    "ko": "리스본",
    "ar": "لشبونة",
  },
};

/**
 * Get translated city name if available
 * @param cityName Original city name (usually in English)
 * @param language Target language code
 * @returns Translated name or original name if no translation available
 */
export function getTranslatedCityName(cityName: string, language: string): string {
  if (!cityName) return '';
  
  // Normalize language code (e.g., 'fr-FR' -> 'fr')
  const langCode = language.split('-')[0].toLowerCase();
  
  // Check if we have a translation for this city
  const translations = cityTranslations[cityName];
  if (translations && translations[langCode]) {
    return translations[langCode];
  }
  
  // Return original name if no translation found
  return cityName;
}

/**
 * Check if a city has translations available
 */
export function hasCityTranslation(cityName: string): boolean {
  return cityName in cityTranslations;
}

