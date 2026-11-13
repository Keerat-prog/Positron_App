-- ==============================================================================
-- Positivity and Sacred Reflection Diary - Complete Supabase PostgreSQL Schema
-- Project URL: https://subjdlsbopfsorosnoax.supabase.co
-- Features: Auth, Profiles, Journal Reflections, AI Music, Wisdom Verses, RLS, Indexes, Vector AI readiness
-- ==============================================================================

-- 1. Enable Extensions (UUID generation & Vector embeddings for semantic search)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Enable pgvector if available for future AI semantic search over scripture & diary
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. User Profiles Table (Linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    preferred_tradition TEXT DEFAULT 'universal',
    preferred_theme TEXT DEFAULT 'emerald',
    preferred_language TEXT DEFAULT 'en',
    streak_count INTEGER DEFAULT 0,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Sacred Wisdom Passages & Scripture Corpus
CREATE TABLE IF NOT EXISTS public.sacred_passages (
    id TEXT PRIMARY KEY,
    tradition TEXT NOT NULL, -- 'gita', 'gurbani', 'bible', 'dhammapada', 'quran', 'tao'
    source_scripture TEXT NOT NULL,
    chapter_verse TEXT NOT NULL,
    original_text TEXT,
    translation TEXT NOT NULL,
    interpretation TEXT,
    practical_application TEXT,
    tags TEXT[] DEFAULT '{}',
    embedding vector(768), -- Ready for Gemini text-embedding-004 / future AI vector similarity
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. User Favorite Passages (Bookmarking relationship)
CREATE TABLE IF NOT EXISTS public.favorite_passages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    passage_id TEXT NOT NULL,
    tradition TEXT NOT NULL,
    source TEXT NOT NULL,
    chapter_verse TEXT,
    original_text TEXT,
    translation TEXT NOT NULL,
    practical_application TEXT,
    user_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Empathetic Reflection Diary & Journal Entries
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT NOT NULL,
    emotion_tags TEXT[] DEFAULT '{}',
    sentiment_score NUMERIC(4, 2), -- -1.00 to +1.00
    ai_reflection JSONB DEFAULT '{}'::jsonb, -- structured AI insight, comforting affirmation, recommended verse
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. AI Music Generations (Powered by Gemini Lyria)
CREATE TABLE IF NOT EXISTS public.generated_music_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    model_used TEXT NOT NULL, -- 'lyria-3-clip-preview' or 'lyria-3-pro-preview'
    style TEXT NOT NULL,
    duration TEXT,
    audio_url TEXT,
    audio_data TEXT, -- Base64 data if stored inline
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Mindfulness & Relaxation Sessions
CREATE TABLE IF NOT EXISTS public.meditation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_type TEXT NOT NULL, -- 'breathing', 'neck_rotation', 'ambient_listening', 'solfeggio_audio'
    duration_seconds INTEGER NOT NULL,
    calm_rating_before INTEGER CHECK (calm_rating_before BETWEEN 1 AND 10),
    calm_rating_after INTEGER CHECK (calm_rating_after BETWEEN 1 AND 10),
    notes TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Future AI Conversations & Insights Log
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    response_text TEXT NOT NULL,
    category TEXT DEFAULT 'spiritual_counsel',
    model_version TEXT DEFAULT 'gemini-2.5-flash',
    token_usage JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING & SEARCH
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_journal_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_created_at ON public.journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorite_passages(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_passage_id ON public.favorite_passages(passage_id);
CREATE INDEX IF NOT EXISTS idx_music_user_id ON public.generated_music_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_meditation_user_id ON public.meditation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_passages_tradition ON public.sacred_passages(tradition);

-- GIN Index for rapid search over tags and JSONB AI analysis
CREATE INDEX IF NOT EXISTS idx_journal_ai_reflection ON public.journal_entries USING GIN (ai_reflection);
CREATE INDEX IF NOT EXISTS idx_journal_emotion_tags ON public.journal_entries USING GIN (emotion_tags);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacred_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Journal Entries Policies
CREATE POLICY "Allow public read access for prototype / unauthenticated users"
ON public.journal_entries FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated or guest sessions"
ON public.journal_entries FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update for owners or guest items"
ON public.journal_entries FOR UPDATE USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Allow delete for owners or guest items"
ON public.journal_entries FOR DELETE USING (user_id IS NULL OR auth.uid() = user_id);

-- 3. Favorite Passages Policies
CREATE POLICY "Allow read favorite passages"
ON public.favorite_passages FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Allow insert favorite passages"
ON public.favorite_passages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow delete favorite passages"
ON public.favorite_passages FOR DELETE USING (user_id IS NULL OR auth.uid() = user_id);

-- 4. Generated Music Tracks Policies
CREATE POLICY "Public tracks are viewable by all, private by owner"
ON public.generated_music_tracks FOR SELECT USING (is_public = TRUE OR user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Allow music tracks insert"
ON public.generated_music_tracks FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow music tracks delete"
ON public.generated_music_tracks FOR DELETE USING (user_id IS NULL OR auth.uid() = user_id);

-- 5. Sacred Passages (Public Read)
CREATE POLICY "Sacred scriptures are publicly readable"
ON public.sacred_passages FOR SELECT USING (true);

-- 6. Meditation Sessions Policies
CREATE POLICY "Allow read user meditation sessions"
ON public.meditation_sessions FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Allow insert meditation sessions"
ON public.meditation_sessions FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- AUTOMATIC TIMESTAMP TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER trigger_journal_updated_at
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- ==============================================================================
-- INITIAL SEED DATA (Sacred Wisdom Verses)
-- ==============================================================================
INSERT INTO public.sacred_passages (id, tradition, source_scripture, chapter_verse, original_text, translation, interpretation, practical_application, tags)
VALUES
('gita_2_47', 'gita', 'Bhagavad Gita', 'Chapter 2, Verse 47', 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥', 'You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.', 'Focus wholeheartedly on pure effort and meaningful devotion, relinquishing anxiety over the eventual outcome.', 'Pour 100% of your heart into what is before you today without worrying about outcomes outside your control.', ARRAY['focus', 'peace', 'duty', 'anxiety-relief']),
('gurbani_japji_1', 'gurbani', 'Guru Granth Sahib', 'Japji Sahib, Ang 1', 'ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ ਨਾਨਕ ਲਿਖਿਆ ਨਾਲਿ ॥੧॥', 'Walk in the way of Divine Will and surrender with grace, for this cosmic harmony is written into the soul.', 'Inner serenity blooms when we flow with life rather than waging resistance against cosmic timing.', 'Take a deep breath and accept the present moment with trust and gentle surrender.', ARRAY['surrender', 'peace', 'acceptance', 'grace']),
('bible_philippians_4_6', 'bible', 'Holy Bible', 'Philippians 4:6-7', 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.', 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds.', 'Reframe anxieties into humble gratitude and trust in divine protection.', 'When feeling overwhelmed, list three small blessings and rest in quiet stillness.', ARRAY['anxiety', 'comfort', 'gratitude', 'prayer'])
ON CONFLICT (id) DO NOTHING;
