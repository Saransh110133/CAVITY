BEGIN;
CREATE OR REPLACE FUNCTION public.lock_student_section() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF OLD.role='student' AND NEW.role='student' AND OLD.section IS NOT NULL AND NEW.section IS DISTINCT FROM OLD.section THEN
  RAISE EXCEPTION 'Student section is locked after first selection' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS student_section_lock ON public."Users";
CREATE TRIGGER student_section_lock BEFORE UPDATE ON public."Users" FOR EACH ROW EXECUTE FUNCTION public.lock_student_section();
COMMIT;
