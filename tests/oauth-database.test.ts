import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('OAuth provisioning links trusted identities atomically without losing profile data',async()=>{
 const db=new PGlite();try{
 await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
 for(const name of ['001_initial.sql','002_profile_details.sql','003_oauth_accounts.sql'])await db.exec((await readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8')).replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;',''));
 const login=async(provider:string,id:string,email:string,username:string|null)=>(await db.query<{uid:string}>('SELECT provision_oauth_user($1,$2,$3,$4,$5) AS uid',[provider,id,email,'Student',username])).rows[0].uid;
 const uid=await login('google','google-1','student@kiit.ac.in',null);
 await db.query('UPDATE "Profiles" SET bio=$1,composite_score=50 WHERE user_id=$2',['Existing bio',uid]);
 assert.equal(await login('github','github-1','student@kiit.ac.in','student-gh'),uid);
 assert.equal(await login('google','google-1','student@kiit.ac.in',null),uid);
 assert.equal(await login('github','github-1','student@kiit.ac.in','renamed-gh'),uid);
 const profile=(await db.query<{bio:string;github_username:string}>('SELECT * FROM "Profiles" WHERE user_id=$1',[uid])).rows[0];
 assert.equal(profile.bio,'Existing bio');assert.equal(profile.github_username,'renamed-gh');
 assert.equal((await db.query('SELECT * FROM "Users"')).rows.length,1);
 await assert.rejects(login('github','github-2','student@kiit.ac.in','imposter'));
 await assert.rejects(login('google','google-1','different@kiit.ac.in',null));
 await db.exec('SET ROLE anon');await assert.rejects(login('google','new','new@kiit.ac.in',null));await db.exec('RESET ROLE');
 assert.equal((await db.query('SELECT * FROM "OAuthAccounts"')).rows.length,2);
 }finally{await db.close()}
});
