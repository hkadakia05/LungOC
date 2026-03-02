# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Create a new project"
3. Fill in:
   - **Project name**: `lungoc`
   - **Database password**: Create a strong password
   - **Region**: Select closest to you
4. Click "Create new project" and wait for setup (2-3 min)

## 2. Enable Google OAuth

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Click on **Google** to enable it
3. Go to [Google Cloud Console](https://console.cloud.google.com)
4. Create a new project or select existing one
5. Enable "Google+ API"
6. Create OAuth 2.0 credentials (OAuth consent screen):
   - **User Type**: External
   - **App name**: LungOC
   - **User support email**: hkadakia@ucsc.edu
   - Add scopes: `email`, `profile`
7. Create OAuth 2.0 Client ID (Desktop/Web Application):
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173` (for local dev)
     - `https://your-vercel-domain.vercel.app` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:5173/auth/callback`
     - `https://your-vercel-domain.vercel.app/auth/callback`
8. Copy **Client ID**
9. In Supabase, add the Client ID under Google provider settings

## 3. Create Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste this SQL:

```sql
-- Create users table (Supabase manages this automatically, but we can extend it)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create scans table to store prediction history
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  prediction TEXT NOT NULL,
  risk_score NUMERIC(3,2) NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high')),
  age INTEGER NOT NULL,
  smoking_pack_years INTEGER NOT NULL,
  family_history BOOLEAN NOT NULL,
  image_probability NUMERIC(3,3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX scans_user_id_idx ON scans(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own scans" ON scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans" ON scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- Create trigger for new users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

4. Click **Run**

## 4. Get Your Credentials

1. Go to **Settings** → **API** in Supabase
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

## 5. Update Frontend Environment Variables

In `frontend/.env.local`:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=https://lungoc.onrender.com
```

## 6. Install Dependencies

```bash
cd frontend
npm install @supabase/supabase-js
npm install lucide-react  # For icons
```

## 7. Features Added

✅ Google OAuth sign-in  
✅ User authentication context  
✅ Scan history storage in database  
✅ Row-level security (users only see their own data)  
✅ Auto user profile creation  

## 8. Testing Locally

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` and click "Sign in with Google"

## 9. Production Deployment

- Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel environment variables
- Update Google OAuth redirect URIs with your Vercel domain

## Security Notes

- Never expose `VITE_SUPABASE_ANON_KEY` in frontend - it's designed to be public but has RLS
- All data access is protected by Row Level Security policies
- Users can only access their own scan data
- Passwords are securely hashed by Supabase
