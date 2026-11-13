export interface SacredVerse {
  id: string;
  text?: string; // original script if applicable or transliteration
  translation: string;
  source: string;
  context: string;
  category: "peace" | "strength" | "worry" | "gratitude";
  origin: "Bhagavad Gita" | "Guru Granth Sahib" | "Holy Bible" | "Holy Quran";
}

export interface DiaryEntry {
  id: string;
  date: string;
  text: string;
  allowAI: boolean;
  mood?: string;
  aiAnalysis?: {
    mood: string;
    empathicResponse: string;
    sacredWisdomPhrase: string;
    sacredQuoteText: string;
    sacredQuoteSource: string;
    dailyAestheticAction: string;
  };
}

export type ActiveSection = "wisdom" | "relaxation" | "music" | "diary" | "supabase" | "personalize" | "about";
