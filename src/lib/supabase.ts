import { createClient } from "@supabase/supabase-js";

// Supabase Configuration from provided project credentials
export const SUPABASE_URL = 
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL) || 
  "https://subjdlsbopfsorosnoax.supabase.co";

export const SUPABASE_ANON_KEY = 
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 
  "sb_publishable_-6AFeOppcweD0vt25m1wpA_PNp-bzxD";

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: "public",
  },
});

// Database Schema Interfaces for TypeScript
export interface DbProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  preferred_tradition?: string;
  preferred_theme?: string;
  preferred_language?: string;
  created_at: string;
  updated_at: string;
}

export interface DbJournalEntry {
  id: string;
  user_id?: string;
  title: string;
  content: string;
  mood: string;
  emotion_tags?: string[];
  sentiment_score?: number;
  ai_reflection?: {
    perspective?: string;
    actionableStep?: string;
    comfortingAffirmation?: string;
    sacredVerse?: {
      source?: string;
      text?: string;
      meaning?: string;
    };
  };
  created_at: string;
  updated_at?: string;
}

export interface DbGeneratedMusicTrack {
  id: string;
  user_id?: string;
  title: string;
  prompt: string;
  audio_url?: string;
  audio_data?: string;
  model_used: string;
  style: string;
  duration?: string;
  tags?: string[];
  created_at: string;
}

export interface DbFavoritePassage {
  id: string;
  user_id?: string;
  passage_id: string;
  tradition: string;
  source: string;
  chapter_verse?: string;
  original_text?: string;
  translation: string;
  practical_application?: string;
  user_notes?: string;
  created_at: string;
}

export interface DbMeditationSession {
  id: string;
  user_id?: string;
  exercise_type: "breathing" | "neck_rotation" | "ambient_listening" | "solfeggio_audio";
  duration_seconds: number;
  calm_rating_before?: number;
  calm_rating_after?: number;
  notes?: string;
  completed_at: string;
}

// Database helper functions for easy full-stack persistence

/**
 * Journal entries Supabase operations
 */
export async function fetchSupabaseJournalEntries(userId?: string): Promise<DbJournalEntry[]> {
  try {
    let query = supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("Supabase fetch journal entries warning:", error.message);
      return [];
    }
    return (data as DbJournalEntry[]) || [];
  } catch (err) {
    console.warn("Supabase fetch journal error:", err);
    return [];
  }
}

export async function saveSupabaseJournalEntry(entry: Partial<DbJournalEntry>): Promise<DbJournalEntry | null> {
  try {
    const payload = {
      ...entry,
      updated_at: new Date().toISOString(),
      created_at: entry.created_at || new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("journal_entries")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.warn("Supabase save journal error:", error.message);
      return null;
    }
    return data as DbJournalEntry;
  } catch (err) {
    console.warn("Supabase save journal exception:", err);
    return null;
  }
}

export async function deleteSupabaseJournalEntry(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id);
    return !error;
  } catch (err) {
    console.warn("Supabase delete journal error:", err);
    return false;
  }
}

/**
 * Generated AI Music Tracks Supabase operations
 */
export async function fetchSupabaseMusicTracks(userId?: string): Promise<DbGeneratedMusicTrack[]> {
  try {
    let query = supabase
      .from("generated_music_tracks")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("Supabase fetch music tracks warning:", error.message);
      return [];
    }
    return (data as DbGeneratedMusicTrack[]) || [];
  } catch (err) {
    console.warn("Supabase fetch music error:", err);
    return [];
  }
}

export async function saveSupabaseMusicTrack(track: Partial<DbGeneratedMusicTrack>): Promise<DbGeneratedMusicTrack | null> {
  try {
    const payload = {
      ...track,
      created_at: track.created_at || new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("generated_music_tracks")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn("Supabase save music track error:", error.message);
      return null;
    }
    return data as DbGeneratedMusicTrack;
  } catch (err) {
    console.warn("Supabase save music track exception:", err);
    return null;
  }
}

export async function deleteSupabaseMusicTrack(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("generated_music_tracks")
      .delete()
      .eq("id", id);
    return !error;
  } catch (err) {
    console.warn("Supabase delete music track error:", err);
    return false;
  }
}

/**
 * Favorite Verses Supabase operations
 */
export async function fetchSupabaseFavorites(userId?: string): Promise<DbFavoritePassage[]> {
  try {
    let query = supabase
      .from("favorite_passages")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("Supabase fetch favorites error:", error.message);
      return [];
    }
    return (data as DbFavoritePassage[]) || [];
  } catch (err) {
    console.warn("Supabase fetch favorites exception:", err);
    return [];
  }
}

export async function saveSupabaseFavorite(favorite: Partial<DbFavoritePassage>): Promise<DbFavoritePassage | null> {
  try {
    const { data, error } = await supabase
      .from("favorite_passages")
      .insert({
        ...favorite,
        created_at: favorite.created_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.warn("Supabase save favorite error:", error.message);
      return null;
    }
    return data as DbFavoritePassage;
  } catch (err) {
    console.warn("Supabase save favorite exception:", err);
    return null;
  }
}

export async function deleteSupabaseFavorite(passageId: string, userId?: string): Promise<boolean> {
  try {
    let query = supabase
      .from("favorite_passages")
      .delete();

    if (userId) {
      query = query.eq("user_id", userId).eq("passage_id", passageId);
    } else {
      query = query.eq("passage_id", passageId);
    }

    const { error } = await query;
    return !error;
  } catch (err) {
    console.warn("Supabase delete favorite error:", err);
    return false;
  }
}

/**
 * Check Supabase Connection Health
 */
export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string; latencyMs: number }> {
  const start = performance.now();
  try {
    const { data, error } = await supabase.from("journal_entries").select("id").limit(1);
    const latency = Math.round(performance.now() - start);
    if (error && error.code !== "PGRST116") {
      // Table might not exist yet before running migrations, but connection is alive if returned PostgREST response
      return { 
        connected: true, 
        message: error.message.includes("does not exist") ? "Connected to Supabase (Schema ready to provision)" : `Connected: ${error.message}`, 
        latencyMs: latency 
      };
    }
    return { connected: true, message: "Successfully connected to Supabase PostgreSQL cluster", latencyMs: latency };
  } catch (err: any) {
    return { connected: false, message: err.message || "Failed to reach Supabase endpoint", latencyMs: 0 };
  }
}
