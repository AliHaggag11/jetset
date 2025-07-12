-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create trips table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT,
  destination TEXT,
  start_date DATE,
  end_date DATE,
  budget INTEGER,
  persona TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trip_preferences table
CREATE TABLE trip_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips ON DELETE CASCADE,
  interest_culture BOOLEAN,
  interest_food BOOLEAN,
  interest_nature BOOLEAN,
  interest_shopping BOOLEAN,
  interest_nightlife BOOLEAN
);

-- Create itineraries table
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips ON DELETE CASCADE,
  day INTEGER,
  content JSONB,
  cost_estimate INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deal_alerts table
CREATE TABLE deal_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips ON DELETE CASCADE,
  type TEXT,
  description TEXT,
  link TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_requests table
CREATE TABLE ai_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips ON DELETE CASCADE,
  prompt TEXT,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Add user_id to existing tables that don't have it
ALTER TABLE trips ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE trip_preferences ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE itineraries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ai_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests(user_id);

-- Enable Row Level Security
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for trips
CREATE POLICY "Users can only see their own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" ON trips
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for trip_preferences
CREATE POLICY "Users can only see their own trip preferences" ON trip_preferences
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM trips WHERE id = trip_id));

CREATE POLICY "Users can insert their own trip preferences" ON trip_preferences
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM trips WHERE id = trip_id));

CREATE POLICY "Users can update their own trip preferences" ON trip_preferences
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM trips WHERE id = trip_id));

CREATE POLICY "Users can delete their own trip preferences" ON trip_preferences
  FOR DELETE USING (auth.uid() IN (SELECT user_id FROM trips WHERE id = trip_id));

-- Create policies for itineraries
CREATE POLICY "Users can only see their own itineraries" ON itineraries
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM trips WHERE id = trip_id));

CREATE POLICY "Users can insert their own itineraries" ON itineraries
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM trips WHERE id = trip_id));

CREATE POLICY "Users can update their own itineraries" ON itineraries
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM trips WHERE id = trip_id));

CREATE POLICY "Users can delete their own itineraries" ON itineraries
  FOR DELETE USING (auth.uid() IN (SELECT user_id FROM trips WHERE id = trip_id));

-- Create policies for deal_alerts
CREATE POLICY "Users can only see their own deal alerts" ON deal_alerts
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM trips WHERE id = trip_id));

CREATE POLICY "Users can insert their own deal alerts" ON deal_alerts
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM trips WHERE id = trip_id));

CREATE POLICY "Users can update their own deal alerts" ON deal_alerts
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM trips WHERE id = trip_id));

CREATE POLICY "Users can delete their own deal alerts" ON deal_alerts
  FOR DELETE USING (auth.uid() IN (SELECT user_id FROM trips WHERE id = trip_id));

-- Create policies for ai_requests
CREATE POLICY "Users can only see their own AI requests" ON ai_requests
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM trips WHERE id = trip_id));

CREATE POLICY "Users can insert their own AI requests" ON ai_requests
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM trips WHERE id = trip_id));

CREATE POLICY "Users can update their own AI requests" ON ai_requests
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM trips WHERE id = trip_id));

CREATE POLICY "Users can delete their own AI requests" ON ai_requests
  FOR DELETE USING (auth.uid() IN (SELECT user_id FROM trips WHERE id = trip_id));

-- User subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

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