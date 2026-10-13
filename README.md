## Homepage and local database connection

The public homepage at `/` introduces both workspaces with interactive student/professor previews. `/login` opens authentication and `/demo` opens the sample workspace. The student section badge says Selected; the saved section remains unchangeable.

The local Supabase connection is configured in the ignored `.env.local`; all eight migrations were applied to the connected project. For another deployment, apply all migration files in order and configure its own environment values. GitHub and Google each require their own OAuth credentials.

## Student sections are permanent

Apply **008_lock_student_section.sql** after 001–007. A student's first saved section is locked; existing assigned sections are locked too. The UI confirms the one-time choice, then disables the selector. The server uses an atomic first assignment, rejects changes, and the database rejects changing or clearing a saved student section. Professors can still update their teaching sections. Demo locking persists in the current browser; authenticated locking is enforced by the server and database.

## Class sections: CS 1–CS 50

- Students select **one** section in My profile and save it. Professors select **one or more** teaching sections in My profile. No section is assumed for existing accounts or demos.
- Real student/professor dashboards require a section selection first. Professor lists, direct student URLs, dashboard counts, shortlists, submission lists and review mutations use current section membership on the server. Students without a section are invisible to professors. Database triggers also reject cross-section shortlisting, submissions and reviews.
- Published challenges are visible only to students in the author's current teaching sections. Changing teaching sections changes the challenge audience; old submissions and shortlists remain stored but are hidden from professors whose current sections no longer include that student. Students retain their own previous shortlist records.
- The connected demo applies the same section matching through separate student/professor settings. Use `/demo/profile` for the student's section and `/demo/professor/profile` for teaching sections. Choose them explicitly; matching sections show the student, nonmatching sections hide them. Reload other tabs after changes.
- Membership is self-selected as requested; professor **roles** still require administrator assignment. To promote an existing student, an administrator must also clear `section` when setting `role='professor'`, then the professor can choose teaching sections.
- Apply **007_class_sections.sql** after migrations 001–006, or run `npm run db:migrate`. Live section protection requires this migration. The Jump to control and its keyboard shortcut are no longer mounted.

## Connected professor workspace and profile photos

- Use the **Student / Professor** preview switch on demo pages, or open `/demo/professor`. These are labeled browser-local demos, not authenticated role changes.
- Professor demo reads the same student profile and photo as `/demo/profile`. Create company criteria, shortlist SARANSH, and see the update on `/demo`. Publish a challenge, solve it in the student Community, then review it in the professor Community; feedback appears on that student's challenge page. Reload an already-open tab to see updates from another tab.
- Real accounts share Supabase data: `/dashboard` routes professors to `/professor`; only a trusted administrator can assign the professor role. The dashboard links student browsing, challenge publishing/review, company criteria and shortlists. Students only see their own shortlist notes and submissions. Personal preparation tasks and resume drafts remain private.
- Photo upload accepts JPG/PNG/WebP up to 5 MB, center-crops and converts to a 256×256 PNG, and strips original metadata through canvas re-encoding. Uploads are validated, capped at 360,000 data-URL characters, and stored in the existing protected profile row. No public storage bucket or additional service is needed. Photos do not affect skill scores. Use Remove photo to clear one.
- Apply `006_profile_photo.sql` after migrations 001–005 (or run `npm run db:migrate`). Real OAuth and database actions still need the credentials described in [AUTH_SETUP.md](AUTH_SETUP.md).

## Latest: sign-in gate, resume studio, and Community

Open `/login` for the floating Google/GitHub sign-in gate. `/` is the public CAVITY homepage with sign-in and demo entry points; `/demo` remains an explicit sample workspace. See [AUTH_SETUP.md](AUTH_SETUP.md) to configure credentials. Sign-in is not active until OAuth credentials and Supabase migrations are provided.

- Header sign-in modal, searchable quick navigation (Ctrl/Command + K), resume preview modal, and professor challenge editor modal. Native dialogs support Escape, keyboard focus containment, and focus restoration. Motion respects reduced-motion preferences.
- Student navigation: Preparation → Resume maker → Community.
- Resume maker uses saved profile fields, self-reported skills, saved repository metadata, available public GitHub README excerpts, and saved LeetCode statistics. It generates an editable structure with missing-information prompts, saves a private draft, and exports Markdown. **It is currently a free deterministic builder, not model-generated AI.** No external AI provider is enabled. Demo uses sample repositories and browser storage.
- Community supports professor-created JavaScript and written challenges, fields, difficulty, India-time release dates, drafts, publishing, and reviewing student submissions. Published challenges appear on their scheduled date when students load the feed. There are no automatically generated daily challenges.
- JavaScript `solve(input)` solutions run against visible tests in a network-disabled, opaque-origin iframe worker with a 2-second timeout. No student code executes on the server. Visible test results are practice feedback, not tamper-proof grading. Other languages can be submitted as written code for manual review. This is not a full multi-language LeetCode judge.
- Students can resubmit; this replaces their latest answer and resets feedback. Only the owning professor can review submissions. Challenges with submissions cannot be changed. Feeds and review lists currently show up to 200 records.
- Apply **005_resume_community.sql** along with the prior migrations. All new tables use RLS and server-only service-role access with per-request role/ownership checks.

# Cavity — College Placement Preparation & Tracking Platform

## Current interface

The public leaderboard and company directory have been removed. `/leaderboard` and `/companies` now return 404, and the student dashboard no longer includes company shortlists. Existing professor shortlist data and protected backend endpoints are retained for the future professor workflow; no records were deleted.

The redesigned interface uses self-hosted Space Grotesk and Manrope fonts, a geometric CAVITY logo, desktop sidebar navigation, mobile navigation, and persistent light/dark themes. The signed-out overview displays the editable demo; signed-in users go to their dashboard.

**Personal preparation checklist:** `/demo/preparation` saves tasks in this browser; `/preparation` saves tasks privately for the signed-in student. Students can add tasks, toggle completion, and delete them. Run `004_preparation_tasks.sql` (or `npm run db:migrate`) before using the signed-in checklist. All task mutations are authenticated, validated, and scoped to the current user's ID. This was the only additional feature approved for this redesign.

## GitHub, Google, and LeetCode accounts

The app supports **GitHub OAuth** and **Google OAuth** sign-in with the configured college email domain (`kiit.ac.in` locally). GitHub requires a verified college email from its emails API. Google requires both `email_verified` and a matching Workspace `hd` claim; a personal Google account merely using a college email is not accepted. This follows [Google's authoritative-email guidance](https://developers.google.com/identity/gsi/web/reference/js-reference).

Provider IDs are stored in `OAuthAccounts`, with one identity per provider per user. Verified identities sharing the same college email resolve to the same student. A mismatched provider ID or changed email is rejected rather than silently reassigned. Roles and existing profile data are preserved. GitHub usernames can change when the stable GitHub account ID stays the same.

**Run all migrations in order**, including `003_oauth_accounts.sql`, before using OAuth. `npm run db:migrate` runs all migration files. Existing installations can run `003_oauth_accounts.sql` directly after `002_profile_details.sql`.

For Google, create an OAuth **Web application** client in Google Cloud Console, configure the consent screen (add test users if in testing mode), and set:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- `.env.local`: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

GitHub uses `GITHUB_ID`, `GITHUB_SECRET`, and callback `http://localhost:3000/api/auth/callback/github`. Configure production HTTPS callback URLs separately. Both providers also require `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `ALLOWED_EMAIL_DOMAIN`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`. Each provider is independently enabled when its configuration is complete. Restart after editing environment values.

LeetCode is a **public stats connection**, not an OAuth sign-in provider. After signing in, go to **My profile → LeetCode**, enter a username, and save to fetch solved counts and contest rating. No LeetCode passwords or session cookies are requested or stored. Ownership remains self-reported; this app does not claim LeetCode account authentication.

OAuth tokens are kept only in the encrypted NextAuth session cookie. Google tokens are never used for GitHub API requests. After signing in through Google, use **Continue with GitHub** under Connected accounts to establish a GitHub session for repository refresh; saved GitHub stats remain visible in Google sessions.

Live provider acceptance still requires your actual credentials and a migrated Supabase project. No OAuth credentials are bundled.

A Next.js App Router application with TypeScript, Tailwind CSS, Supabase Postgres, and NextAuth.js v4 GitHub OAuth. The interface is branded Cavity.

## Student demo

### Editable profiles and appearance

Use **My profile** in the header or **Edit my profile** on the demo dashboard. `/demo/profile` lets you edit your name, department, description, strengths, LeetCode username, and LinkedIn URL without signing in. These demo changes persist in this browser and appear on `/demo`; coding statistics remain sample data. `/profile` saves the same details to Supabase for signed-in users, and professors can read descriptions and self-reported strengths on student detail pages. Skills and descriptions do not increase the coding score.

The header's **Dark mode / Light mode** button applies across all pages and remembers your choice in this browser. The first visit follows your system preference. The CAVITY wordmark replaces the letter icon and uses self-hosted Space Grotesk and Manrope fonts with a custom geometric mark.

Existing database installations must also run `supabase/migrations/002_profile_details.sql` to add `bio`, `skills`, and the atomic profile-details function. For a new installation, run **both migration files in numeric order**. `npm run db:migrate` now runs all SQL files in that order. Live database verification still requires configured Supabase credentials.

Open **http://localhost:3000/demo** for the preloaded student dashboard. It includes a fictional student, six featured GitHub repositories, language filters, expandable repository previews, LeetCode solved counts and contest rating, a fictional LinkedIn section, and a sample professor shortlist. Tabs switch between the overview and individual integrations. Demo data stays separate from Supabase and requires no account. The connect buttons lead to the real authenticated integrations. LeetCode stats in the demo are fixtures, not a live fetch; the actual server integration runs from `/profile` after sign-in.

## Quick start

Use Node.js 22.18+ (Node 24 LTS recommended) and npm. Run commands in this directory.

```sh
npm ci
cp .env.example .env.local
# Fill in .env.local as described below.
npm run db:migrate
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env.local`. A local `.env.local` has already been created for this delivery with a random NextAuth secret. Keep that file; do not overwrite it if you have added credentials. Open http://localhost:3000. Without service credentials, public pages display setup/empty states and private pages redirect to sign-in; there is no fake login or demo database.

## 1. Create Supabase and apply the schema

1. Create a **Free** project at https://supabase.com/dashboard. Save the database password securely.
2. Copy the project URL and server-side `service_role` key from project settings to `.env.local`. Never use the service key in browser code or any `NEXT_PUBLIC_*` variable.
3. Open **SQL Editor**, paste `supabase/migrations/001_initial.sql`, and run it. Alternatively, copy the **Session pooler** connection string from the project Connect panel into `DATABASE_URL` and run `npm run db:migrate`. Include the project's recommended SSL settings, normally `sslmode=require`; URL-encode special characters in the password. The migration runner does not disable TLS certificate verification.
4. Confirm the four quoted, case-sensitive tables exist: `Users`, `Profiles`, `Companies`, `Shortlists`.

The migration is repeatable for this initial schema. It creates indexes, foreign keys, status and role constraints, RLS, and an atomic profile-save function. NextAuth handles identity; this app does **not** use Supabase Auth. Anonymous and authenticated Supabase API roles have no table access. All application data flows through server code using the service role, with explicit NextAuth role checks.

## 2. Create a GitHub OAuth app

In GitHub **Settings → Developer settings → OAuth Apps → New OAuth App**:

| Setting | Local value |
| --- | --- |
| Application name | College Placement Platform |
| Homepage URL | `http://localhost:3000` |
| Authorization callback URL | `http://localhost:3000/api/auth/callback/github` |

Set the client ID and client secret in `.env.local`. Set `ALLOWED_EMAIL_DOMAIN` to your college's exact domain, such as `students.example.edu` (without `@`). Students and professors must add and verify an address at that domain in their GitHub account's email settings. Any verified matching address is accepted; it need not be public or primary. Subdomains are not automatically allowed. The server retrieves GitHub's verified email list instead of trusting a submitted address.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXTAUTH_URL` | Yes | Local origin or production HTTPS origin |
| `NEXTAUTH_SECRET` | Yes | Random encryption/signing secret |
| `GITHUB_ID` | Yes | OAuth app client ID |
| `GITHUB_SECRET` | Yes | OAuth app client secret |
| `ALLOWED_EMAIL_DOMAIN` | Yes | Exact college email domain |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only Supabase service role key |
| `DATABASE_URL` | Migration CLI only | Supabase Postgres connection string |

Generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Restart the dev server after changing environment variables. Secrets are ignored by Git and are never exposed in the NextAuth browser session. The OAuth token stays in the encrypted, HTTP-only NextAuth JWT cookie.

## 3. Grant professor access

All new users are students. Have the professor sign in once, then run this in the trusted Supabase SQL editor, replacing the email:

```sql
UPDATE public."Users"
SET role = 'professor'
WHERE email = 'professor@your-college.edu';
```

Refresh the dashboard. Authorization reads the current database role on every protected request, so promotion and revocation take effect immediately. There is no client-accessible role editing endpoint. Professors manage companies and their own shortlists; students see only their own shortlist status and shared notes.

## Features and routes

| Feature | Route / implementation |
| --- | --- |
| Overview | `/` |
| GitHub login with college email restriction | `/login`, `/api/auth/[...nextauth]` |
| Student dashboard and own shortlist status | `/dashboard` |
| Profile, GitHub refresh, LeetCode and LinkedIn | `/profile`, `/api/profile` |
| Weighted server scoring | `lib/scoring.ts` |
| Professor search, department/min-score filters, sorting | `/professor` |
| Student details and shortlist creation/editing | `/professor/students/[id]` |
| Professor's shortlists | `/professor/shortlists` |
| Personal preparation checklist | `/preparation`, `/demo/preparation`, `/api/preparation` |

Public pages display demo data only. The real student directory is professor-only. Emails, repository details, profile links, and shortlist notes are available only on authorized private pages. A user's `id` breaks score ties consistently across pages. Company deletion cascades to its shortlists, and the UI asks for confirmation before deleting.

## Data sources and scoring

GitHub public, non-fork repositories and their primary languages are fetched through REST using the OAuth token. Pagination supports up to 1,000 owned public repositories; reaching that safety cap fails the refresh instead of silently storing an incomplete set. The `contribution_count` is **public commits in the last 365 days from GitHub REST commit search**. It is a documented activity proxy, not GitHub's complete contribution-calendar total (which also includes issues, reviews, and pull requests). GitHub search limitations can affect the count. Language counts mean repositories by primary language, not byte-level proficiency.

LeetCode uses the public `https://leetcode.com/graphql/` endpoint with username variables. It parses accepted easy/medium/hard counts and contest rating. The endpoint can rate-limit, block automated requests, or change without notice. Null contest ranking means unrated. LeetCode and LinkedIn ownership is **self-reported**, while GitHub is OAuth-linked. Fetched stats do not prove ownership of an arbitrary LeetCode username.

`lib/scoring.ts` exposes configurable `SCORE_WEIGHTS` (keep their sum equal to 1). Each component is bounded to 0–100:

```text
GitHub = clamp(70 × annual_public_commits / 365 + 30 × public_nonfork_repos / 20)
LeetCode = clamp(80 × (easy + 2×medium + 3×hard) / 600
                 + 20 × max(0, contest_rating - 1000) / 1500)
Completeness = 100 × completed_fields / 6
Composite = 0.40 × GitHub + 0.40 × LeetCode + 0.20 × Completeness
```

The six completeness fields are department, GitHub username, LeetCode username, LinkedIn URL, fetched GitHub stats, and fetched LeetCode stats. Missing provider stats score zero. First profile visit attempts GitHub sync automatically. Save & refresh updates provider stats when the previous successful fetch is older than five minutes. Failed requests keep previous data for the same username and display a warning. Changing/removing a LeetCode username clears stats belonging to the old account. Scores are computed only on the server and saved with the profile and department in one database transaction. Parallel edits are detected through `updated_at`.

## Validation

```sh
npm test
npm run typecheck
npm run build
# While npm run dev is running:
node scripts/smoke.mjs
```

Tests cover college-domain matching, input validation, scoring boundaries, GitHub/LeetCode success and failure parsing, and migration behavior in an embedded Postgres engine (PGlite, test-only). The database test creates Supabase-like roles and skips `CREATE EXTENSION pgcrypto` because PGlite already provides `gen_random_uuid`. It is not a live Supabase/PostgREST integration test. HTTP smoke tests check public pages, protected redirects, and unauthenticated/cross-origin mutation rejection.

### Live acceptance checklist after configuring accounts

1. Run the migration against Supabase and confirm the four tables.
2. Sign in with an outside-domain GitHub account: access must be denied.
3. Sign in with a verified college account: one student and one profile are created; a repeat login preserves stored stats.
4. Open Profile; confirm GitHub repositories and annual public commits appear. Save department, LeetCode username, and LinkedIn URL.
5. Try an invalid/nonexistent LeetCode username: the page stays usable and shows the refresh warning. Restore the correct username.
6. Confirm computed score and completeness against the formula above.
7. Promote a second account to professor. Confirm a student cannot open professor routes or mutate companies/shortlists.
8. Create a company, edit its skills, filter/sort/search students, and open a student detail page.
9. Shortlist the student, add notes, then change status. Confirm the student sees those changes and another professor cannot edit the first professor's shortlist.
10. Confirm `/companies` and `/leaderboard` return 404.
11. Add, complete, and delete a preparation task. Verify it persists after reload and cannot be accessed by another student.

## Deployment: Vercel + Supabase

1. Push the project to your own Git repository, excluding `.env.local` and `node_modules`.
2. Import into Vercel, choose Next.js and Node 24, and select this project directory as the root. Use the default `npm run build` command.
3. Add the required environment values in Vercel project settings. Set `NEXTAUTH_URL` to the final HTTPS origin. The migration connection string is not needed by the deployed app.
4. Create a separate production GitHub OAuth app whose homepage and callback use that origin (`https://your-app.vercel.app/api/auth/callback/github`). Set its ID/secret in Vercel.
5. Run the migration on the production Supabase project before accepting users, then deploy and repeat the live acceptance checklist.

No paid APIs, background workers, storage buckets, or scheduled jobs are required. This supports a small personal, noncommercial pilot using Vercel Hobby and Supabase Free within their quotas. Vercel Hobby eligibility is restricted to personal/noncommercial use; an institutional deployment must satisfy the provider's terms. Supabase Free currently has a 500 MB database limit, and quotas/availability can change. There is no promise of unlimited free capacity. Provider references: [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Supabase billing](https://supabase.com/docs/guides/platform/billing-on-supabase).

## Structure

```text
app/                 App Router pages and API handlers
components/          Tailwind UI, profile, company and shortlist forms
lib/                 Server auth, Supabase, queries, validation, integrations, scores
types/               Shared types and NextAuth augmentation
supabase/migrations/ SQL schema, privileges, constraints, atomic save function
scripts/             Migration and local HTTP smoke checks
tests/               Logic/provider and Postgres migration tests
```


## Repository evidence and student project notes

Every displayed repository has an evidence card. Students can save up to 3,000 characters describing the problem, their own contribution and outcomes. Professors see these notes on the existing section-protected student detail page. Live notes and evidence are saved in `Profiles.github_stats.repos`; no additional migration is needed. Profile refresh preserves these fields for repositories still present. Demo notes are browser-local and demo metrics are explicitly fictional.

Use **Analyze repository** while signed in with GitHub to fetch stars, forks, actual subscribers/watchers, open issues including pull requests, repository size, license, last push, languages by bytes, and available 14-day traffic. **Connect GitHub traffic** is optional and explicitly requests `public_repo`; this GitHub scope also permits public-repository modification, although CAVITY makes only read requests. Missing permissions, rate limits or unavailable traffic show unavailable rather than zero. Traffic is GitHub repository traffic, not visits to a deployed website, and is not a lifetime total. Refresh is cached for five minutes.

The source scanner pins a commit and reads blobs without executing repository code. It excludes known generated/vendor/build paths and symlinks, scans up to 100 source files, limits each file to 150 KB and the total to 2 MB, and uses a time budget. Physical and nonblank lines include comments. Coverage and partial scans are labeled; these counts never affect the composite score. A line count alone is not evidence of complexity or skill.

Direct dependency extraction supports package.json, composer.json, requirements.txt, go.mod, basic pom.xml dependency declarations, Cargo dependency sections, PEP 621 pyproject.toml dependencies, and Gemfile declarations (up to 20 manifests). Versions are declared constraints, not confirmed installed versions. It does not resolve lockfiles, transitive dependencies, inherited Maven properties, all TOML formats, or every build system. Tool configuration detection is reported separately. Repository notes also feed the resume outline.
