-- Run this script in your Supabase SQL editor to set up the subscription system
-- This script only adds new functionality without conflicting with existing policies

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('free', 'explorer', 'adventurer')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_id to existing tables that don't have it (only if they don't exist)
DO $$ 
BEGIN
  -- Add user_id to trips if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trips' AND column_name = 'user_id') THEN
    ALTER TABLE trips ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Add user_id to trip_preferences if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trip_preferences' AND column_name = 'user_id') THEN
    ALTER TABLE trip_preferences ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Add user_id to itineraries if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'itineraries' AND column_name = 'user_id') THEN
    ALTER TABLE itineraries ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Add user_id to ai_requests if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_requests' AND column_name = 'user_id') THEN
    ALTER TABLE ai_requests ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests(user_id);

-- Enable RLS on user_subscriptions (only if not already enabled)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create user_subscriptions policies (only if they don't exist)
DO $$ 
BEGIN
  -- Users can view their own subscriptions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_subscriptions' AND policyname = 'Users can view their own subscriptions') THEN
    CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Users can insert their own subscriptions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_subscriptions' AND policyname = 'Users can insert their own subscriptions') THEN
    CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can update their own subscriptions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_subscriptions' AND policyname = 'Users can update their own subscriptions') THEN
    CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Function to automatically create free subscription for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create free subscription when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create a function to get current usage for a user
CREATE OR REPLACE FUNCTION get_user_usage(user_uuid UUID)
RETURNS TABLE(
  trips_created INTEGER,
  regenerations_used INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(trip_count.count, 0) as trips_created,
    COALESCE(regen_count.count, 0) as regenerations_used
  FROM 
    (SELECT COUNT(*) as count FROM trips WHERE user_id = user_uuid AND created_at >= date_trunc('month', NOW())) as trip_count,
    (SELECT COUNT(*) as count FROM ai_requests WHERE user_id = user_uuid AND created_at >= date_trunc('month', NOW())) as regen_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 