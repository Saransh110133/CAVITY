BEGIN;
ALTER TABLE public."Profiles" ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '' CHECK (length(bio)<=1200);
ALTER TABLE public."Profiles" ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}' CHECK (cardinality(skills)<=30);
CREATE OR REPLACE FUNCTION public.save_profile_details(
 p_user_id uuid, p_expected_updated_at timestamptz, p_name text, p_department text,
 p_bio text, p_skills text[], p_leetcode_username text, p_linkedin_url text,
 p_github_stats jsonb, p_leetcode_stats jsonb, p_completeness numeric, p_composite numeric
) RETURNS boolean LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF length(trim(p_name)) NOT BETWEEN 1 AND 120 OR length(p_department)>100 THEN RAISE EXCEPTION 'Invalid profile fields'; END IF;
 UPDATE public."Profiles" SET bio=p_bio,skills=p_skills,leetcode_username=p_leetcode_username,linkedin_url=p_linkedin_url,
 github_stats=p_github_stats,leetcode_stats=p_leetcode_stats,completeness_score=p_completeness,
 composite_score=p_composite,updated_at=clock_timestamp()
 WHERE user_id=p_user_id AND updated_at=p_expected_updated_at;
 IF NOT FOUND THEN RETURN false; END IF;
 UPDATE public."Users" SET name=trim(p_name),department=NULLIF(p_department,'') WHERE id=p_user_id;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.save_profile_details(uuid,timestamptz,text,text,text,text[],text,text,jsonb,jsonb,numeric,numeric) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_profile_details(uuid,timestamptz,text,text,text,text[],text,text,jsonb,jsonb,numeric,numeric) TO service_role;
COMMIT;
