-- Create contact submissions table
CREATE TABLE public.contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  client_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Only service role can access submissions (for backend/admin use)
CREATE POLICY "Service role can manage submissions" ON public.contact_submissions
  FOR ALL USING (auth.role() = 'service_role');