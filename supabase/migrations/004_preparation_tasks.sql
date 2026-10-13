BEGIN;
CREATE TABLE IF NOT EXISTS public."PreparationTasks" (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public."Users"(id) ON DELETE CASCADE,
 title text NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 160),
 completed boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS preparation_user_idx ON public."PreparationTasks"(user_id,created_at);
ALTER TABLE public."PreparationTasks" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."PreparationTasks" FROM anon,authenticated;
GRANT ALL ON public."PreparationTasks" TO service_role;
COMMIT;
