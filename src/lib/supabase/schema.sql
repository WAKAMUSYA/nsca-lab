-- ==========================================================
-- STRENGTH ARTS ECOSYSTEM - UNIFIED DATABASE SCHEMA
-- ==========================================================
-- Safe to execute on a fresh or reset Supabase database.
-- Paste this script directly into Supabase's "SQL Editor" and click Run.

-- ----------------------------------------------------------
-- 1. CENTRAL AUTHENTICATION PROFILE & USER ACCESS
-- ----------------------------------------------------------

-- Shared profiles table across all PWAs
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nickname TEXT NOT NULL DEFAULT 'メンバー', -- Maps to "こんにちは ○○さん"
  is_sa_member BOOLEAN DEFAULT FALSE, -- SA Monthly Member flag (500 JPY/month)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- ----------------------------------------------------------
-- 2. SUBSCRIPTION ENGINE (MULTI-SERVICE READY)
-- ----------------------------------------------------------

-- Central Products Table (SA Membership, NSCA Pass, etc.)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY, -- e.g. 'prod_sa_monthly', 'prod_nsca_annual'
  name TEXT NOT NULL,
  price INTEGER NOT NULL, -- e.g. 500, 2000 JPY
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Ecosystem Products
INSERT INTO public.products (id, name, price, description) VALUES
  ('prod_sa_monthly', 'Strength Arts 月額会員', 500, 'SA配下のすべてのPWAサービスが使い放題になるプラン'),
  ('prod_nsca_annual', 'NSCA LAB 年間パス', 2000, 'NSCA LABサービスを1年間利用できる専用プラン')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  price = EXCLUDED.price, 
  description = EXCLUDED.description;

-- Unified Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'canceled' | 'expired'
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriptions Policies
CREATE POLICY "Users can view their own subscriptions" 
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
  ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ----------------------------------------------------------
-- 3. NSCA LAB MODULAR LEARNING METRICS (ISOLATED)
-- ----------------------------------------------------------

-- NSCA candidate metrics
CREATE TABLE IF NOT EXISTS public.nsca_user_stats (
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

-- Enable RLS
ALTER TABLE public.nsca_user_stats ENABLE ROW LEVEL SECURITY;

-- Stats Policies
CREATE POLICY "Users can view their own nsca stats" 
  ON public.nsca_user_stats FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own nsca stats" 
  ON public.nsca_user_stats FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nsca stats" 
  ON public.nsca_user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);


-- NSCA mistakes book
CREATE TABLE IF NOT EXISTS public.nsca_mistakes (
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

-- Enable RLS
ALTER TABLE public.nsca_mistakes ENABLE ROW LEVEL SECURITY;

-- Mistakes Policies
CREATE POLICY "Users can view their own mistakes" 
  ON public.nsca_mistakes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mistakes" 
  ON public.nsca_mistakes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mistakes" 
  ON public.nsca_mistakes FOR DELETE USING (auth.uid() = user_id);


-- NSCA study completion dates
CREATE TABLE IF NOT EXISTS public.nsca_study_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  completed_date TEXT NOT NULL,
  UNIQUE (user_id, completed_date)
);

-- Enable RLS
ALTER TABLE public.nsca_study_history ENABLE ROW LEVEL SECURITY;

-- History Policies
CREATE POLICY "Users can view their own history" 
  ON public.nsca_study_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history" 
  ON public.nsca_study_history FOR INSERT WITH CHECK (auth.uid() = user_id);


-- NSCA roadmap checklist checkpoints
CREATE TABLE IF NOT EXISTS public.nsca_roadmap_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subtopic_id TEXT NOT NULL,
  UNIQUE (user_id, subtopic_id)
);

-- Enable RLS
ALTER TABLE public.nsca_roadmap_progress ENABLE ROW LEVEL SECURITY;

-- Roadmap Policies
CREATE POLICY "Users can view their own roadmap" 
  ON public.nsca_roadmap_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roadmap" 
  ON public.nsca_roadmap_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmap" 
  ON public.nsca_roadmap_progress FOR DELETE USING (auth.uid() = user_id);


-- ----------------------------------------------------------
-- 4. AUTOMATIC SIGNUP TRIGGERS (ECOSYSTEM AUTOMATION)
-- ----------------------------------------------------------

-- Trigger to automatically create profiles & NSCA stats on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_nickname TEXT;
BEGIN
  -- Extract email prefix to set as default nickname (e.g. taro@example.com -> taro)
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

-- Recreate trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
