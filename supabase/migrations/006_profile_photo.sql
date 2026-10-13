BEGIN;
ALTER TABLE public."Profiles" ADD COLUMN IF NOT EXISTS avatar_data text;
ALTER TABLE public."Profiles" DROP CONSTRAINT IF EXISTS profile_avatar_size;
ALTER TABLE public."Profiles" ADD CONSTRAINT profile_avatar_size CHECK(avatar_data IS NULL OR (length(avatar_data)<=360000 AND avatar_data LIKE 'data:image/png;base64,%'));
COMMIT;
