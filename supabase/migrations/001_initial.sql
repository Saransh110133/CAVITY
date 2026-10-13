BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS public."Users" (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, email text NOT NULL UNIQUE,
 role text NOT NULL DEFAULT 'student' CHECK (role IN ('student','professor')),
 department text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public."Profiles" (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL UNIQUE REFERENCES public."Users"(id) ON DELETE CASCADE,
 github_username text UNIQUE, leetcode_username text, linkedin_url text,
 github_stats jsonb, leetcode_stats jsonb,
 completeness_score numeric NOT NULL DEFAULT 0 CHECK (completeness_score BETWEEN 0 AND 100),
 composite_score numeric NOT NULL DEFAULT 0 CHECK (composite_score BETWEEN 0 AND 100), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public."Companies" (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE, domain text NOT NULL,
 required_skills text[] NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public."Shortlists" (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), professor_id uuid NOT NULL REFERENCES public."Users"(id) ON DELETE CASCADE,
 student_id uuid NOT NULL REFERENCES public."Users"(id) ON DELETE CASCADE,
 company_id uuid NOT NULL REFERENCES public."Companies"(id) ON DELETE CASCADE,
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','shortlisted','rejected')),
 notes text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (professor_id,student_id,company_id), CHECK (professor_id <> student_id)
);
CREATE INDEX IF NOT EXISTS users_department_idx ON public."Users"(department);
CREATE INDEX IF NOT EXISTS profile_score_idx ON public."Profiles"(composite_score DESC);
CREATE INDEX IF NOT EXISTS shortlist_student_idx ON public."Shortlists"(student_id);
CREATE INDEX IF NOT EXISTS shortlist_company_idx ON public."Shortlists"(company_id);
-- NextAuth is the identity authority. Only server-side service_role may access these tables.
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Companies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Shortlists" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."Users",public."Profiles",public."Companies",public."Shortlists" FROM anon, authenticated;
GRANT ALL ON public."Users",public."Profiles",public."Companies",public."Shortlists" TO service_role;
CREATE OR REPLACE FUNCTION public.validate_shortlist_roles() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public."Users" WHERE id=NEW.professor_id AND role='professor') OR
 NOT EXISTS (SELECT 1 FROM public."Users" WHERE id=NEW.student_id AND role='student') THEN
 RAISE EXCEPTION 'Invalid shortlist roles'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS shortlist_roles ON public."Shortlists";
CREATE TRIGGER shortlist_roles BEFORE INSERT OR UPDATE ON public."Shortlists" FOR EACH ROW EXECUTE FUNCTION public.validate_shortlist_roles();
-- Save profile data and department atomically; detect conflicting browser updates.
CREATE OR REPLACE FUNCTION public.save_profile(
 p_user_id uuid, p_expected_updated_at timestamptz, p_department text,
 p_leetcode_username text, p_linkedin_url text, p_github_stats jsonb,
 p_leetcode_stats jsonb, p_completeness numeric, p_composite numeric
) RETURNS boolean LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 UPDATE public."Profiles" SET leetcode_username=p_leetcode_username, linkedin_url=p_linkedin_url,
 github_stats=p_github_stats, leetcode_stats=p_leetcode_stats, completeness_score=p_completeness,
 composite_score=p_composite, updated_at=clock_timestamp()
 WHERE user_id=p_user_id AND updated_at=p_expected_updated_at;
 IF NOT FOUND THEN RETURN false; END IF;
 UPDATE public."Users" SET department=NULLIF(p_department,'') WHERE id=p_user_id;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.save_profile(uuid,timestamptz,text,text,text,jsonb,jsonb,numeric,numeric) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_profile(uuid,timestamptz,text,text,text,jsonb,jsonb,numeric,numeric) TO service_role;
COMMIT;
