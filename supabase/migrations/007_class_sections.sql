BEGIN;
ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE public."Users" ADD COLUMN IF NOT EXISTS teaching_sections text[] NOT NULL DEFAULT '{}';
CREATE OR REPLACE FUNCTION public.valid_teaching_sections(sections text[]) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path=public AS $$
 SELECT cardinality(sections)<=50 AND NOT EXISTS(SELECT 1 FROM unnest(sections) s WHERE s IS NULL OR s !~ '^CS ([1-9]|[1-4][0-9]|50)$') AND cardinality(sections)=(SELECT count(DISTINCT s) FROM unnest(sections) s);
$$;
ALTER TABLE public."Users" DROP CONSTRAINT IF EXISTS user_class_sections;
ALTER TABLE public."Users" ADD CONSTRAINT user_class_sections CHECK (
 (section IS NULL OR section ~ '^CS ([1-9]|[1-4][0-9]|50)$') AND public.valid_teaching_sections(teaching_sections) AND
 ((role='student' AND cardinality(teaching_sections)=0) OR (role='professor' AND section IS NULL))
);
CREATE INDEX IF NOT EXISTS users_section_idx ON public."Users"(section) WHERE role='student';
CREATE INDEX IF NOT EXISTS users_teaching_sections_idx ON public."Users" USING gin(teaching_sections);
CREATE OR REPLACE FUNCTION public.can_guide(professor uuid,student uuid) RETURNS boolean LANGUAGE sql STABLE SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public."Users" p CROSS JOIN public."Users" s WHERE p.id=professor AND p.role='professor' AND s.id=student AND s.role='student' AND s.section IS NOT NULL AND s.section=ANY(p.teaching_sections));
$$;
REVOKE ALL ON FUNCTION public.can_guide(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.can_guide(uuid,uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.validate_shortlist_roles() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NOT public.can_guide(NEW.professor_id,NEW.student_id) THEN RAISE EXCEPTION 'Student is outside teaching sections'; END IF;
 RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.validate_submission_section() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE author_id uuid;
BEGIN
 SELECT professor_id INTO author_id FROM public."Challenges" WHERE id=NEW.challenge_id;
 IF NOT public.can_guide(author_id,NEW.student_id) THEN RAISE EXCEPTION 'Student is outside teaching sections'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS submission_sections ON public."ChallengeSubmissions";
CREATE TRIGGER submission_sections BEFORE INSERT OR UPDATE ON public."ChallengeSubmissions" FOR EACH ROW EXECUTE FUNCTION public.validate_submission_section();
CREATE OR REPLACE FUNCTION public.validate_challenge_sections() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public."Users" WHERE id=NEW.professor_id AND role='professor' AND cardinality(teaching_sections)>0) THEN RAISE EXCEPTION 'Select teaching sections first'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS challenge_sections ON public."Challenges";
CREATE TRIGGER challenge_sections BEFORE INSERT OR UPDATE ON public."Challenges" FOR EACH ROW EXECUTE FUNCTION public.validate_challenge_sections();
COMMIT;
