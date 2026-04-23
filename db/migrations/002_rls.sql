-- ============================================================
-- Migration 002: Row Level Security
-- Run after 001_schema.sql
-- ============================================================

-- Helper functions (SECURITY DEFINER bypasses RLS for these lookups)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.get_client_id()
RETURNS uuid
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT id FROM public.clients WHERE profile_id = auth.uid()
$$;

-- Enable RLS
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

-- ── profiles ──────────────────────────────────────────────
CREATE POLICY "profiles: admin full access"
  ON public.profiles FOR ALL TO authenticated
  USING     (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "profiles: client read own"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles: client update own"
  ON public.profiles FOR UPDATE TO authenticated
  USING     (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── clients ───────────────────────────────────────────────
CREATE POLICY "clients: admin full access"
  ON public.clients FOR ALL TO authenticated
  USING     (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "clients: client read own"
  ON public.clients FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

-- ── projects ──────────────────────────────────────────────
CREATE POLICY "projects: admin full access"
  ON public.projects FOR ALL TO authenticated
  USING     (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "projects: client read own"
  ON public.projects FOR SELECT TO authenticated
  USING (client_id = public.get_client_id());

-- ── project_updates ───────────────────────────────────────
CREATE POLICY "project_updates: admin full access"
  ON public.project_updates FOR ALL TO authenticated
  USING     (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "project_updates: client read own"
  ON public.project_updates FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE client_id = public.get_client_id()
    )
  );

-- ── tickets ───────────────────────────────────────────────
CREATE POLICY "tickets: admin full access"
  ON public.tickets FOR ALL TO authenticated
  USING     (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "tickets: client read own"
  ON public.tickets FOR SELECT TO authenticated
  USING (client_id = public.get_client_id());

CREATE POLICY "tickets: client insert own"
  ON public.tickets FOR INSERT TO authenticated
  WITH CHECK (
    client_id = public.get_client_id()
    AND author_id = auth.uid()
  );

-- ── ticket_messages ───────────────────────────────────────
CREATE POLICY "ticket_messages: admin full access"
  ON public.ticket_messages FOR ALL TO authenticated
  USING     (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "ticket_messages: client read own"
  ON public.ticket_messages FOR SELECT TO authenticated
  USING (
    ticket_id IN (
      SELECT id FROM public.tickets WHERE client_id = public.get_client_id()
    )
  );

CREATE POLICY "ticket_messages: client insert own"
  ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND ticket_id IN (
      SELECT id FROM public.tickets WHERE client_id = public.get_client_id()
    )
  );

-- ── messages ──────────────────────────────────────────────
CREATE POLICY "messages: admin full access"
  ON public.messages FOR ALL TO authenticated
  USING     (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "messages: client read own"
  ON public.messages FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE client_id = public.get_client_id()
    )
  );

CREATE POLICY "messages: client insert own"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND project_id IN (
      SELECT id FROM public.projects WHERE client_id = public.get_client_id()
    )
  );

-- ── onboarding_responses ──────────────────────────────────
CREATE POLICY "onboarding_responses: admin full access"
  ON public.onboarding_responses FOR ALL TO authenticated
  USING     (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "onboarding_responses: client read own"
  ON public.onboarding_responses FOR SELECT TO authenticated
  USING (client_id = public.get_client_id());

CREATE POLICY "onboarding_responses: client insert own"
  ON public.onboarding_responses FOR INSERT TO authenticated
  WITH CHECK (client_id = public.get_client_id());

CREATE POLICY "onboarding_responses: client update own"
  ON public.onboarding_responses FOR UPDATE TO authenticated
  USING     (client_id = public.get_client_id())
  WITH CHECK (client_id = public.get_client_id());
