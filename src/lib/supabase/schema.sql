-- ==========================================================
-- STRENGTH ARTS ECOSYSTEM - CLEAN & SIMPLE RESET SCHEMA
-- ==========================================================
-- This script completely drops existing tables to prevent policy/constraint conflicts,
-- and recreates a clean, simple SA Monthly Plan integrated schema.
-- Paste this script directly into Supabase's "SQL Editor" and click Run.

-- ----------------------------------------------------------
-- 0. CLEAN RESET (DROPS ALL EXISTING TABLES)
-- ----------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.nsca_roadmap_progress CASCADE;
DROP TABLE IF EXISTS public.nsca_study_history CASCADE;
DROP TABLE IF EXISTS public.nsca_mistakes CASCADE;
DROP TABLE IF EXISTS public.nsca_user_stats CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;


-- ----------------------------------------------------------
-- 1. CENTRAL AUTHENTICATION PROFILE & USER ACCESS
-- ----------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nickname TEXT NOT NULL DEFAULT 'メンバー', -- Maps to "こんにちは ○○さん"
  is_sa_member BOOLEAN DEFAULT FALSE, -- SA Monthly Member flag (500 JPY/month)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Simple Policies
CREATE POLICY "Allow individual read" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow individual update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow individual insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- ----------------------------------------------------------
-- 2. SUBSCRIPTION ENGINE (SA MONTHLY ONLY)
-- ----------------------------------------------------------
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_key TEXT NOT NULL DEFAULT 'strength_arts_member',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'canceled' | 'expired'
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, product_key)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow individual sub read" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow individual sub update" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);


-- ----------------------------------------------------------
-- 3. NSCA LAB MODULAR LEARNING METRICS
-- ----------------------------------------------------------
CREATE TABLE public.nsca_user_stats (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  exam_type TEXT DEFAULT 'CSCS',
  exam_date TEXT,
  streak INTEGER DEFAULT 3,
  last_daily_completed TEXT,
  total_solved INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.nsca_user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow individual stats read" ON public.nsca_user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow individual stats update" ON public.nsca_user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow individual stats insert" ON public.nsca_user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- NSCA Mistakes Book
CREATE TABLE public.nsca_mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  answer_index INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  ai_insights JSONB,
  date_failed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, question_id)
);

ALTER TABLE public.nsca_mistakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow individual mistakes read" ON public.nsca_mistakes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow individual mistakes insert" ON public.nsca_mistakes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow individual mistakes delete" ON public.nsca_mistakes FOR DELETE USING (auth.uid() = user_id);

-- NSCA Study History Completion Dates
CREATE TABLE public.nsca_study_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  completed_date TEXT NOT NULL,
  UNIQUE (user_id, completed_date)
);

ALTER TABLE public.nsca_study_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow individual history read" ON public.nsca_study_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow individual history insert" ON public.nsca_study_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- NSCA Roadmap Progress Checkpoints
CREATE TABLE public.nsca_roadmap_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subtopic_id TEXT NOT NULL,
  UNIQUE (user_id, subtopic_id)
);

ALTER TABLE public.nsca_roadmap_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow individual roadmap read" ON public.nsca_roadmap_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow individual roadmap insert" ON public.nsca_roadmap_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow individual roadmap delete" ON public.nsca_roadmap_progress FOR DELETE USING (auth.uid() = user_id);


-- ----------------------------------------------------------
-- 4. AUTOMATIC SIGNUP TRIGGERS
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_nickname TEXT;
BEGIN
  -- Extract email prefix as default nickname (e.g. taro@example.com -> taro)
  default_nickname := COALESCE(split_part(new.email, '@', 1), 'メンバー');

  -- 1. Create central profile
  INSERT INTO public.profiles (id, nickname, is_sa_member)
  VALUES (new.id, default_nickname, FALSE)
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create local NSCA stats profile
  INSERT INTO public.nsca_user_stats (user_id, exam_type, streak, xp)
  VALUES (new.id, 'CSCS', 3, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
