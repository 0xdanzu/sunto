-- Sunto Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_system BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, is_system) VALUES
  ('Vibe Coding Tutorials', 'vibe-coding-tutorials', true),
  ('Learning', 'learning', true),
  ('Inspiration', 'inspiration', true),
  ('Untagged', 'untagged', true)
ON CONFLICT (slug) DO NOTHING;

-- Main tweets table
CREATE TABLE IF NOT EXISTS tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tweet_id TEXT NOT NULL,
  tweet_url TEXT NOT NULL,
  author_handle TEXT,
  author_name TEXT,
  author_avatar TEXT,
  content_type TEXT CHECK (content_type IN ('single', 'thread', 'video', 'article')),
  raw_text TEXT,
  full_content TEXT,
  has_video BOOLEAN DEFAULT false,
  video_transcript TEXT,
  video_duration_seconds INTEGER,
  article_url TEXT,
  article_content TEXT,
  summary JSONB,
  category_id UUID REFERENCES categories(id),
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tweet_id)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  dark_mode TEXT DEFAULT 'system' CHECK (dark_mode IN ('system', 'light', 'dark')),
  digest_time TEXT DEFAULT '20:00',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tweets_user_id ON tweets(user_id);
CREATE INDEX IF NOT EXISTS idx_tweets_captured_at ON tweets(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_tweets_is_read ON tweets(is_read);
CREATE INDEX IF NOT EXISTS idx_tweets_category_id ON tweets(category_id);
CREATE INDEX IF NOT EXISTS idx_tweets_user_captured ON tweets(user_id, captured_at DESC);

-- Row Level Security (RLS)
ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for tweets
CREATE POLICY "Users can view own tweets"
  ON tweets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tweets"
  ON tweets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tweets"
  ON tweets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tweets"
  ON tweets FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for user_preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Categories are readable by all authenticated users
CREATE POLICY "Categories are viewable by authenticated users"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_tweets_updated_at
  BEFORE UPDATE ON tweets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
