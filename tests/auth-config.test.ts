import {test} from 'node:test';
import assert from 'node:assert/strict';
import {authConfiguration,signInError} from '../lib/auth-config.ts';
import {allowedEmail} from '../lib/validation.ts';
const env={NEXTAUTH_URL:'http://localhost:3000',NEXTAUTH_SECRET:'test-only',GITHUB_ID:'test-id',GITHUB_SECRET:'test-secret',ALLOWED_EMAIL_DOMAIN:'kiit.ac.in',SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-key'};
test('OAuth cannot start with missing configuration',()=>{assert.equal(authConfiguration({}).ready,false);assert(authConfiguration({...env,GITHUB_ID:'  '}).missing.includes('GITHUB_ID'));assert.equal(authConfiguration(env).ready,true)});
test('OAuth configuration rejects malformed origins and college domains',()=>{assert.equal(authConfiguration({...env,NEXTAUTH_URL:'not a URL'}).ready,false);assert.equal(authConfiguration({...env,ALLOWED_EMAIL_DOMAIN:'@kiit.ac.in'}).ready,false)});
test('KIIT college accounts match only the exact email domain',()=>{assert(allowedEmail('2505495@kiit.ac.in','kiit.ac.in'));assert(!allowedEmail('2505495@kiit.ac.in.evil.com','kiit.ac.in'));assert(!allowedEmail('student@gmail.com','kiit.ac.in'))});
test('sign-in errors distinguish email and account conflicts',()=>{assert.match(signInError('AccountMismatch')!,/different provider account/);assert.match(signInError('CollegeEmailRequired')!,/verify/);assert.match(signInError('OAuthCallback')!,/callback URL/);assert.equal(signInError(),null)});
