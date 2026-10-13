BEGIN;
CREATE TABLE IF NOT EXISTS public."ResumeDrafts" (
 user_id uuid PRIMARY KEY REFERENCES public."Users"(id) ON DELETE CASCADE,
 outline jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public."Challenges" (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), professor_id uuid NOT NULL REFERENCES public."Users"(id),
 title text NOT NULL CHECK(length(title) BETWEEN 4 AND 120), field text NOT NULL,
 difficulty text NOT NULL CHECK(difficulty IN ('easy','medium','hard')),
 kind text NOT NULL CHECK(kind IN ('javascript','written')),description text NOT NULL,
 starter_code text NOT NULL DEFAULT '',test_cases jsonb NOT NULL DEFAULT '[]',
 release_date date NOT NULL,published boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public."ChallengeSubmissions" (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),challenge_id uuid NOT NULL REFERENCES public."Challenges"(id) ON DELETE CASCADE,
 student_id uuid NOT NULL REFERENCES public."Users"(id) ON DELETE CASCADE,
 answer text NOT NULL CHECK(length(answer) BETWEEN 1 AND 20000),
 status text NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','reviewed')),
 feedback text NOT NULL DEFAULT '',reviewed_by uuid REFERENCES public."Users"(id),
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(challenge_id,student_id)
);
CREATE INDEX IF NOT EXISTS challenges_feed_idx ON public."Challenges"(published,release_date DESC);
CREATE INDEX IF NOT EXISTS challenges_professor_idx ON public."Challenges"(professor_id);
CREATE INDEX IF NOT EXISTS submissions_student_idx ON public."ChallengeSubmissions"(student_id);
ALTER TABLE public."ResumeDrafts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Challenges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ChallengeSubmissions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ResumeDrafts",public."Challenges",public."ChallengeSubmissions" FROM anon,authenticated;
GRANT ALL ON public."ResumeDrafts",public."Challenges",public."ChallengeSubmissions" TO service_role;
CREATE OR REPLACE FUNCTION public.validate_challenge_author() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public."Users" WHERE id=NEW.professor_id AND role='professor') THEN RAISE EXCEPTION 'Professor required'; END IF;
 IF TG_OP='UPDATE' AND EXISTS(SELECT 1 FROM public."ChallengeSubmissions" WHERE challenge_id=OLD.id) THEN RAISE EXCEPTION 'Challenge has submissions and cannot be edited'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS challenge_author ON public."Challenges";
CREATE TRIGGER challenge_author BEFORE INSERT OR UPDATE ON public."Challenges" FOR EACH ROW EXECUTE FUNCTION public.validate_challenge_author();
CREATE OR REPLACE FUNCTION public.validate_challenge_submission() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE author_id uuid;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public."Users" WHERE id=NEW.student_id AND role='student') THEN RAISE EXCEPTION 'Student required'; END IF;
 PERFORM 1 FROM public."Challenges" WHERE id=NEW.challenge_id FOR UPDATE;
 SELECT professor_id INTO author_id FROM public."Challenges" WHERE id=NEW.challenge_id AND published AND release_date<=(now() AT TIME ZONE 'Asia/Kolkata')::date;
 IF NOT FOUND THEN RAISE EXCEPTION 'Challenge unavailable'; END IF;
 IF NEW.status='reviewed' AND (NEW.reviewed_by IS DISTINCT FROM author_id OR NOT EXISTS(SELECT 1 FROM public."Users" WHERE id=NEW.reviewed_by AND role='professor')) THEN RAISE EXCEPTION 'Challenge author required'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS submission_rules ON public."ChallengeSubmissions";
CREATE TRIGGER submission_rules BEFORE INSERT OR UPDATE ON public."ChallengeSubmissions" FOR EACH ROW EXECUTE FUNCTION public.validate_challenge_submission();
COMMIT;
