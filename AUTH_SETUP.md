# Activate Google and GitHub sign-in

The application code is configured for **kiit.ac.in**. Provider credentials and a migrated Supabase project are required to finish real sign-in. Never put secrets in chat or commit `.env.local`.

## 1. Create a free Supabase project

Create a project at https://supabase.com/dashboard. Keep the database password safely.

- Copy the project URL into `SUPABASE_URL`.
- Copy the server-side service role API key into `SUPABASE_SERVICE_ROLE_KEY`. This key must never have a `NEXT_PUBLIC_` prefix.
- Use the project's **Connect** dialog to get the **Session pooler** Postgres connection string. Enter the database password and save it as `DATABASE_URL`. URL-encode special characters in the password.
- Run `npm run db:migrate` from this project. This applies all eight SQL migration files. Alternatively, run the files in `supabase/migrations` in filename order in the Supabase SQL editor. OAuth user provisioning requires migration 003; resume and community require 005; photos require 006; class sections require 007 and permanent student section locking requires 008.

This project uses NextAuth for OAuth and Supabase for Postgres storage. You do not need to enable Supabase Auth providers.

[Supabase connection instructions](https://supabase.com/docs/guides/database/connecting-to-postgres)

## 2. Create a GitHub OAuth app

Open https://github.com/settings/developers, select **OAuth Apps**, then **New OAuth App**.

- Application name: CAVITY Local
- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

Set `GITHUB_ID` to the client ID and `GITHUB_SECRET` to the generated client secret in `.env.local`.

For your student account, add and verify `2505495@kiit.ac.in` in GitHub **Settings → Emails**. It does not need to be your public or primary email. The app requires a verified college address.

[GitHub OAuth app instructions](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)

## 3. Create a Google OAuth client

Open https://console.cloud.google.com/ and select or create a project. Configure Google Auth Platform branding and audience (OAuth consent screen). Use **External** if you do not administer the college's Workspace organization; while in Testing, add your college account as a test user. An Internal app is only available within the Workspace organization that owns the Cloud project.

Create an OAuth client of type **Web application**:

- Name: CAVITY Local
- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`.

Use your actual college-managed Google account. A personal Gmail account or an ordinary Google account with a college recovery email is not accepted. A college administrator may need to allow this app under the institution's OAuth policy. GitHub remains an option if your college account does not use Google Workspace.

[Google web application OAuth instructions](https://developers.google.com/identity/protocols/oauth2/web-server)

## 4. Check your local configuration

Keep the existing generated `NEXTAUTH_SECRET`. Your `.env.local` should contain:

```dotenv
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-existing-generated-secret
ALLOWED_EMAIL_DOMAIN=kiit.ac.in
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

Restart `npm run dev` after filling these in. Open http://localhost:3000/login. Buttons become available when configuration is present; only a complete provider sign-in confirms that credentials and migrations work.

## 5. Validate both providers

1. Sign in using your college Google account. Confirm a student dashboard appears.
2. Sign out, then sign in with GitHub with the same verified college email. Confirm the same profile is used.
3. Sign in with a non-college account: access should be denied.
4. Professor roles must be assigned by a trusted database administrator. There is no client-side professor signup switch.

For Vercel, set these environment variables in the project's environment settings, change `NEXTAUTH_URL` to the HTTPS production origin, and register its exact provider callback URLs. Keep development and production credentials separate where practical.

After signing in, select your class or teaching sections in My profile. Student visibility is based on current section membership.

## Role-based sign-in

`/login` and workspace sign-in popups first ask Student or Professor. Students may use GitHub or Google; professors use Google only. Both paths require a verified college email. The selected role is a short-lived HTTP-only intent cookie, not an authorization grant. The server looks up the stored role before provisioning: professor access requires an administrator-assigned professor account, and GitHub cannot sign in to a professor account. Existing `/dashboard` routing sends authenticated users to the correct workspace.

Google buttons remain unavailable until `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are configured. Selecting Professor does not create or promote a professor account. Existing administrator provisioning and section access rules remain required.
