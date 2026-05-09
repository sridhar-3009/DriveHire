-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '',
  password TEXT NOT NULL,
  role TEXT DEFAULT 'driver' CHECK (role IN ('driver', 'employer', 'admin')),
  avatar TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  login_attempts INTEGER DEFAULT 0,
  lock_until TIMESTAMPTZ,
  license_number TEXT DEFAULT '',
  license_expiry DATE,
  experience INTEGER DEFAULT 0,
  location TEXT DEFAULT '',
  languages TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'immediate',
  bio TEXT DEFAULT '',
  kyc_status TEXT DEFAULT 'not_submitted' CHECK (kyc_status IN ('not_submitted', 'pending', 'verified', 'rejected')),
  company_name TEXT DEFAULT '',
  fleet_size INTEGER DEFAULT 0,
  company_location TEXT DEFAULT '',
  company_website TEXT DEFAULT '',
  company_description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  salary TEXT NOT NULL,
  type TEXT DEFAULT 'Full-time',
  route TEXT DEFAULT 'City' CHECK (route IN ('City', 'Interstate', 'Local', 'School', 'Corporate')),
  experience INTEGER DEFAULT 0,
  description TEXT DEFAULT '',
  requirements TEXT[] DEFAULT '{}',
  openings INTEGER DEFAULT 1,
  deadline TIMESTAMPTZ,
  vehicle_type TEXT DEFAULT 'bus',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Applied' CHECK (status IN ('Applied', 'Shortlisted', 'Selected', 'Rejected')),
  cover_letter TEXT DEFAULT '',
  interview_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'application',
  link TEXT DEFAULT '',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kyc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  aadhaar_number TEXT DEFAULT '',
  aadhaar_front TEXT DEFAULT '',
  aadhaar_back TEXT DEFAULT '',
  dl_number TEXT DEFAULT '',
  dl_front TEXT DEFAULT '',
  selfie TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  rejection_reason TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS — backend uses service role key which bypasses it anyway
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE kyc DISABLE ROW LEVEL SECURITY;
