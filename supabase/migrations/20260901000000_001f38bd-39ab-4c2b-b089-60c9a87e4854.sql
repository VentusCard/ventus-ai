-- Landing page "Request Access" submissions (docs/finnovate-landing-goal.md §7).
-- Insert-only from the public anon key: the landing page writes a row and
-- never reads them back. Anyone who can review these needs the service role
-- or an authenticated staff policy added separately — none is granted here.

CREATE TABLE public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  institution TEXT NOT NULL,
  role TEXT NOT NULL,
  decision_focus TEXT,
  source_path TEXT NOT NULL DEFAULT '/',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Public (anon) can insert a request but can never select, update, or delete
-- one back out. No SELECT/UPDATE/DELETE policy is created for anon or
-- authenticated roles, so those stay denied by RLS's default-closed posture.
CREATE POLICY "Anyone can submit an access request"
  ON public.access_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

COMMENT ON TABLE public.access_requests IS
  'Landing page Request Access form submissions. Insert-only from the client; review via the Supabase dashboard or service role, not the app.';
