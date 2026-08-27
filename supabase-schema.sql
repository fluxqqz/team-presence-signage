-- =========================================================
-- PRESENCE STATUS ENUM
-- =========================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'presence_status'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.presence_status AS ENUM (
      'hadir',
      'sakit',
      'izin_terlambat',
      'cuti',
      'lapangan',
      'wfh'
    );
  END IF;
END
$$;


-- =========================================================
-- TEAM MEMBERS TABLE
-- =========================================================

CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  department text NOT NULL,
  avatar_url text,
  status public.presence_status NOT NULL DEFAULT 'hadir',
  status_note text,
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- =========================================================
-- UPDATED_AT FUNCTION
-- =========================================================

CREATE OR REPLACE FUNCTION public.set_team_members_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================

DROP TRIGGER IF EXISTS team_members_updated_at
ON public.team_members;

CREATE TRIGGER team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.set_team_members_updated_at();


-- =========================================================
-- TEAM MEMBERS RLS
-- =========================================================

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;


-- Remove existing policies first
DROP POLICY IF EXISTS "Public read team members"
ON public.team_members;

DROP POLICY IF EXISTS "Public insert team members"
ON public.team_members;

DROP POLICY IF EXISTS "Public update team members"
ON public.team_members;

DROP POLICY IF EXISTS "Public delete team members"
ON public.team_members;


-- Recreate policies
CREATE POLICY "Public read team members"
ON public.team_members
FOR SELECT
USING (true);

CREATE POLICY "Public insert team members"
ON public.team_members
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update team members"
ON public.team_members
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Public delete team members"
ON public.team_members
FOR DELETE
USING (true);


-- =========================================================
-- SUPABASE REALTIME
-- =========================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'team_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime
    ADD TABLE public.team_members;
  END IF;
END
$$;


-- =========================================================
-- APP SETTINGS TABLE
-- =========================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- Default admin PIN
INSERT INTO public.app_settings (key, value)
VALUES ('admin_pin', '1234')
ON CONFLICT (key) DO NOTHING;


-- =========================================================
-- APP SETTINGS RLS
-- =========================================================

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;


-- Remove existing policies first
DROP POLICY IF EXISTS "Public read app settings"
ON public.app_settings;

DROP POLICY IF EXISTS "Public insert app settings"
ON public.app_settings;

DROP POLICY IF EXISTS "Public update app settings"
ON public.app_settings;


-- Recreate policies
CREATE POLICY "Public read app settings"
ON public.app_settings
FOR SELECT
USING (true);

CREATE POLICY "Public insert app settings"
ON public.app_settings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update app settings"
ON public.app_settings
FOR UPDATE
USING (true)
WITH CHECK (true);
