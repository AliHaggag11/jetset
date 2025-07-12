-- Create profiles table with new settings fields
CREATE TABLE IF NOT EXISTS profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  profile_image_url text,
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  language text default 'en' check (language in ('en', 'es', 'fr', 'de')),
  notification_preferences jsonb default '{"email": true, "product": true, "marketing": false}'::jsonb
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;

-- Create policy
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id); 