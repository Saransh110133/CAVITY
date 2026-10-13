BEGIN;
CREATE TABLE IF NOT EXISTS public."OAuthAccounts" (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public."Users"(id) ON DELETE CASCADE,
 provider text NOT NULL CHECK (provider IN ('github','google')),
 provider_account_id text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(provider,provider_account_id), UNIQUE(user_id,provider)
);
ALTER TABLE public."OAuthAccounts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."OAuthAccounts" FROM anon,authenticated;
GRANT ALL ON public."OAuthAccounts" TO service_role;
-- Only trusted OAuth callbacks may call this function with provider-verified email.
CREATE OR REPLACE FUNCTION public.provision_oauth_user(
 p_provider text,p_account_id text,p_email text,p_name text,p_github_username text
) RETURNS uuid LANGUAGE plpgsql SET search_path=public AS $$
DECLARE uid uuid; linked_email text; old_username text; known_account boolean;
BEGIN
 IF p_provider NOT IN ('github','google') OR length(p_account_id)=0 OR p_email<>lower(p_email) THEN RAISE EXCEPTION 'Invalid OAuth identity'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_email,0));
 SELECT user_id INTO uid FROM public."OAuthAccounts" WHERE provider=p_provider AND provider_account_id=p_account_id;
 known_account:=FOUND;
 IF known_account THEN
  SELECT email INTO linked_email FROM public."Users" WHERE id=uid;
  IF linked_email<>p_email THEN RAISE EXCEPTION 'AccountMismatch'; END IF;
 ELSE
  INSERT INTO public."Users"(name,email) VALUES(p_name,p_email) ON CONFLICT(email) DO NOTHING;
  SELECT id INTO uid FROM public."Users" WHERE email=p_email FOR UPDATE;
  IF EXISTS(SELECT 1 FROM public."OAuthAccounts" WHERE user_id=uid AND provider=p_provider) THEN RAISE EXCEPTION 'AccountMismatch'; END IF;
 END IF;
 INSERT INTO public."Profiles"(user_id) VALUES(uid) ON CONFLICT(user_id) DO NOTHING;
 IF p_provider='github' THEN
  IF p_github_username IS NULL OR p_github_username='' THEN RAISE EXCEPTION 'Missing GitHub username'; END IF;
  SELECT github_username INTO old_username FROM public."Profiles" WHERE user_id=uid;
  IF NOT known_account AND old_username IS NOT NULL AND lower(old_username)<>lower(p_github_username) THEN RAISE EXCEPTION 'AccountMismatch'; END IF;
  UPDATE public."Profiles" SET github_username=p_github_username WHERE user_id=uid;
 END IF;
 IF NOT known_account THEN
  INSERT INTO public."OAuthAccounts"(user_id,provider,provider_account_id) VALUES(uid,p_provider,p_account_id);
 END IF;
 RETURN uid;
END $$;
REVOKE ALL ON FUNCTION public.provision_oauth_user(text,text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.provision_oauth_user(text,text,text,text,text) TO service_role;
COMMIT;
