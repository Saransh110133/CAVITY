import {test} from 'node:test';
import assert from 'node:assert/strict';
import {googleCollegeEmail,githubCollegeEmail} from '../lib/oauth-identity.ts';
import {authConfiguration} from '../lib/auth-config.ts';
test('Google requires verified email and authoritative college Workspace domain',()=>{
 const p={email:'2505495@kiit.ac.in',email_verified:true,hd:'kiit.ac.in'};
 assert.equal(googleCollegeEmail(p,'kiit.ac.in'),p.email);
 for(const input of [{...p,email_verified:false},{...p,hd:undefined},{...p,hd:'evil.com'},{...p,email:'x@gmail.com'}])assert.equal(googleCollegeEmail(input,'kiit.ac.in'),null);
});
test('GitHub requires a verified college email even when the primary email is personal',()=>{
 assert.equal(githubCollegeEmail([{email:'x@gmail.com',verified:true,primary:true},{email:'2505495@kiit.ac.in',verified:true,primary:false}],'kiit.ac.in'),'2505495@kiit.ac.in');
 assert.equal(githubCollegeEmail([{email:'x@kiit.ac.in',verified:false,primary:true}],'kiit.ac.in'),null);
});
test('Google setup does not require GitHub credentials',()=>{
 const env={NEXTAUTH_URL:'http://localhost:3000',NEXTAUTH_SECRET:'test',ALLOWED_EMAIL_DOMAIN:'kiit.ac.in',SUPABASE_URL:'https://test.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test',GOOGLE_CLIENT_ID:'test',GOOGLE_CLIENT_SECRET:'test'};
 assert.equal(authConfiguration(env,'google').ready,true);assert.equal(authConfiguration(env,'github').ready,false);
});
